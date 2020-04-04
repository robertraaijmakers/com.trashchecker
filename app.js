/*globals Homey, module, require, setInterval*/
"use strict";

const Homey = require('homey');
const DateTimeHelper = require('./lib/datetime.js');

var http = require('http');
var apiArray = require('./trashapis.js');
var supportedTypes = ["GFT","PLASTIC","PAPIER","PMD","REST","TEXTIEL","GROF","KERSTBOOM"];

class TrashcanReminder extends Homey.App
{
	onInit()
	{
		this.gdates = '';
		this.trashToken = null;
		this.intervalRefreshToken = null;
		this.collectingDaysSet = false;
				
		// Update manual input dates when settings change.
		Homey.ManagerSettings.on('set', this.onSettingsChanged.bind(this));
		
		// Register flow card
		let daysToCollect = new Homey.FlowCardCondition('days_to_collect');
		daysToCollect
			.register()
			.registerRunListener(this.flowDaysToCollect.bind(this));
		
		// Register speech events
		Homey.ManagerSpeechInput.on('speechEval', this.speechEvalExecute.bind(this));
		Homey.ManagerSpeechInput.on('speechMatch', this.parseSpeechExecute.bind(this));
	
		// Manually kick off data retrieval
		this.onUpdateData(true, false);
		
		// Every 24 hours update API or manual dates
		let msTillUpdateApi = this.millisecondsTillSaturdayNight();
		setTimeout(this.onUpdateData.bind(this), msTillUpdateApi, true, true); // Every Saturday night (and on refresh), but this prevents data from getting lost when it is retrieved through the week.
		setInterval(this.onUpdateLabel.bind(this), 10*60*1000); // Update label every 10 minutes.
		
		// Make sure the label is updated every 10 minutes
		let trashCollectionToken = new Homey.FlowToken( 'trash_collection_token', {
			type: 'string',
			title: Homey.__('tokens.trashcollection')
		});
		
		trashCollectionToken
			.register()
			.then(() => {
				this.trashToken = trashCollectionToken;
				return this.onUpdateLabel ( );
			})
			.catch( err => {
				this.error( err );
			});
		
		this.log("App initialized");
	}
	
	/* ******************
		SPEECH FUNCTIONS
	********************/
	speechEvalExecute(speech, callback)
	{
		callback ( null, true)
		return;
	}
	
	parseSpeechExecute(speech, onSpeechEvalData)
	{		
		var result = this.parseSpeech(speech, Homey.ManagerSettings.get("collectingDays"));
		if(result != null && result != "")
		{
			speech.say( result );
			return true;
		}

        // Only execute 1 trigger
        return false;
	}
	
	parseSpeech(speech, gdates)
	{       
		// TYPE OF QUESTIONS
		// WHAT type of trash is collected << TODAY | TOMORROW | DAY AFTER TOMORROW >>
		// WHEN is <<TYPE>> collected?
		// IS <<TYn38PE>> collected << TODAY | TOMORROW | DAY AFTER TOMORROW >>
		// WHICH type will be collected << TODAY | TOMORROW | DAY AFTER TOMORROW >>

		var regexReplace = new RegExp("(" + Homey.__('speech.replacequestion') + ")", 'gi');
		var newTranscript = speech.transcript.replace(regexReplace, "");
		
		console.log(speech);
		
		/* ******************
			FIND TRASH TYPE INDICATOR
		********************/
		var foundType = null;
		var differenceInDaysForType = null;
		for (var i = 0, len = supportedTypes.length; i < len; i++) {
			if (newTranscript.indexOf(Homey.__('speech.type.' + supportedTypes[i])) > -1)
			{
				foundType = supportedTypes[i];
				break; // stop loop after first match.
			}
			
			// Other words for types (search via regex)
			var regex = new RegExp("(" +Homey.__('speech.type_multipleother.' + supportedTypes[i])+ ")", 'gi');
			if (newTranscript.match(regex) !== null)
			{
				foundType = supportedTypes[i];
				break; // stop loop after first match.
			}
		}
			
		// Find first collection date for this type of trash
		if(foundType != null && gdates != null && typeof gdates !== 'undefined' && typeof gdates[ foundType ] !== 'undefined')
		{
			var today = new Date();
			for (var i = 0, len = gdates[foundType].length; i < len; i++)
			{				
				var date = new Date(gdates[foundType][i].substring(6,10), (parseInt(gdates[foundType][i].substring(3,5))-1), gdates[foundType][i].substring(0,2));
								
				if(DateTimeHelper.daysBetween(today, date) >= 0)
				{
					differenceInDaysForType = DateTimeHelper.daysBetween(today, date);
					break;
				}				
			}
		}
		
		//console.log("type and difference in days");
		//console.log(foundType);
		//console.log(differenceInDaysForType);
		
		/* ******************
			FIND TIME INDICATOR
		********************/
		var checkDate = null;
		var typeCollectedOnThisDay = [];
		var matchesWithGivenType = false;
		// If bigger then one, someone probably asked something like 'is the container picked up tomorrow or the day after tomorrow'
		if(speech.times != null && speech.times !== false && speech.times.length == 1) 
		{
			var dateInput = null;
			try {
				dateInput = new Date(speech.times[0].time.year, speech.times[0].time.month, speech.times[0].time.day);
			} catch(e) { console.log(e); }
			
			//console.log("given date via speech");
			//console.log(dateInput);
			checkDate = dateInput;
		}
		
		if(checkDate != null)
		{
			// Go through types
			for (var i = 0, len = supportedTypes.length; i < len; i++) {
				if( typeof gdates[ supportedTypes[i] ] !== 'undefined' )
				{
					if(gdates[ supportedTypes[i] ].indexOf(this.dateToString(checkDate)) > -1 && typeCollectedOnThisDay.indexOf(Homey.__('speech.type.' + supportedTypes[i])) <= -1)
					{
						typeCollectedOnThisDay.push(Homey.__('speech.output.type.' + supportedTypes[i]));
						if(!matchesWithGivenType)
						{
							matchesWithGivenType = supportedTypes[i] == foundType;
						}
					}
				}
			}
		}
		
		/* ******************
			FIND TYPE OF QUESTION (sentence starting with WHAT, IS, WHEN)
		********************/
		var questionType = 0;
		if(newTranscript.toLowerCase().startsWith(Homey.__('speech.questiontype.what')) || 
			newTranscript.toLowerCase().startsWith(Homey.__('speech.questiontype.which')))
		{
			questionType = 1;
		}
		else if(newTranscript.toLowerCase().startsWith(Homey.__('speech.questiontype.when')))
		{
			questionType = 2;
		}
		else if(newTranscript.toLowerCase().startsWith(Homey.__('speech.questiontype.is')))
		{
			questionType = 3;
		}
		
		//console.log("defined question type");
		//console.log(questionType);

		var responseText = "";
		try {
			// which, what type of trash is collected <<time>>
			if(questionType == 1 && checkDate != null)
			{
				if(typeCollectedOnThisDay.length == 0)
				{
					responseText = Homey.__('speech.output.notrashcollectedonx', { time: speech.times[0].transcript });
				}
				else if(typeCollectedOnThisDay.length > 1)
				{
					var multiTypeString = "";				
					for (var i = 0, len = typeCollectedOnThisDay.length; i < len; i++) {
						multiTypeString += typeCollectedOnThisDay[i] + (i < (len-2) ? ", " : (i == (len-2) ? " " + Homey.__('speech.output.and') + " " : ""));
					}
					
					responseText = Homey.__('speech.output.trashtypesycollectedonx', { time: speech.times[0].transcript, types: multiTypeString.toLowerCase() });
				}
				else
				{
					responseText = Homey.__('speech.output.trashtypeycollectedonx', { time: speech.times[0].transcript, type: typeCollectedOnThisDay[0] });
				}
			}
			// when is <<type>> collected?
			else if(questionType == 2 && foundType != null)
			{
				if(differenceInDaysForType === null)
				{
					responseText = Homey.__('speech.output.notrashcollectionforx', { type: Homey.__('speech.output.type.' + foundType) });
				}
				else
				{
					responseText = Homey.__('speech.output.trashtypexcollectedony', { type: Homey.__('speech.output.type.' + foundType), time: TrashcanReminder.toDateOutputString(differenceInDaysForType).toLowerCase() });
				}
			}
			// is <<type>> collected on <<date>>
			else if(questionType == 3 && foundType != null && checkDate != null)
			{
				if(differenceInDaysForType === null)
				{
					responseText = Homey.__('speech.output.notrashcollectionforx', { type: Homey.__('speech.output.type.' + foundType) });
				}
				else if(matchesWithGivenType)
				{
					responseText = Homey.__('speech.output.yesyiscollectedonx', { time: speech.times[0].transcript.toLowerCase(), type: Homey.__('speech.output.type.' + foundType).toLowerCase() });
				}
				else 
				{
					responseText = Homey.__('speech.output.noyiscollectedonxbutonz', { time: speech.times[0].transcript.toLowerCase(), type: Homey.__('speech.output.type.' + foundType).toLowerCase(), time2: TrashcanReminder.toDateOutputString(differenceInDaysForType).toLowerCase() });
				}
			}
			else if(questionType == 1) // what|which type is collected next?
			{
				// Find the container that is picked up next
				var nextContainerNotBefore = new Date();
				var containerDateNext = new Date();
				containerDateNext.setDate(containerDateNext.getDate() + 366);
				var containerTypesNext = [];
				
				for (var i = 0, len = supportedTypes.length; i < len; i++) {
					if( typeof gdates[ supportedTypes[i] ] !== 'undefined' )
					{						
						for (var y = 0, len = gdates[supportedTypes[i]].length; y < len; y++)
						{				
							var date = new Date(gdates[supportedTypes[i]][y].substring(6,10), (parseInt(gdates[supportedTypes[i]][y].substring(3,5))-1), gdates[supportedTypes[i]][y].substring(0,2));
							
							if(DateTimeHelper.daysBetween(nextContainerNotBefore, date) >= 0 && DateTimeHelper.daysBetween(containerDateNext, date) <= 0)
							{
								var diff = DateTimeHelper.daysBetween(containerDateNext, date);
								if(diff === 0)
								{
									containerTypesNext.push(Homey.__('speech.output.type.' + supportedTypes[i]));
								}
								else
								{
									containerDateNext = date;
									containerTypesNext = [];
									containerTypesNext.push(Homey.__('speech.output.type.' + supportedTypes[i]));
								}
							}			
						}
					}
				}
				
				var differenceInDaysForNextCollection = DateTimeHelper.daysBetween(nextContainerNotBefore, containerDateNext);
				
				if(containerTypesNext.length == 0)
				{
					responseText = Homey.__('speech.output.noknowntrashcollected');
				}
				else if(containerTypesNext.length > 1)
				{
					var multiTypeString = "";				
					for (var i = 0, len = multiTypeString.length; i < len; i++) {
						multiTypeString += containerTypesNext[i] + (i < (len-2) ? ", " : (i == (len-2) ? " " + Homey.__('speech.output.and') + " " : ""));
					}
					
					responseText = Homey.__('speech.output.trashtypesycollectedonx', { time: TrashcanReminder.toDateOutputString(differenceInDaysForNextCollection), types: multiTypeString.toLowerCase() });
				}
				else
				{
					responseText = Homey.__('speech.output.trashtypeycollectedonx', { time: TrashcanReminder.toDateOutputString(differenceInDaysForNextCollection), type: containerTypesNext[0].toLowerCase() });
				}				
			}
		}
		catch(e)
		{
			console.log(e);
		}
		
		console.log(responseText);
		return responseText;
	}
	
	/* ******************
		FLOW FUNCTIONS
	********************/
	flowDaysToCollect(args, state)
	{
		// For testing use these variables, will become pulled from settings
		//Homey.log(Object.keys(gdates));
		if( typeof this.gdates[ args.trash_type.toUpperCase() ] === 'undefined' && args.trash_type.toUpperCase() !== "ANY")
		{
			var message = Homey.__('error.typenotsupported.addviasettings');
			console.log(message);
			return Promise.resolve(false);
		}
	
		var now = new Date();
		if(args.when == 'tomorrow') {
			now.setDate(now.getDate() + 1);
		} else if(args.when == 'datomorrow') {
			now.setDate(now.getDate() + 2);
		}
		
		var dateString = this.dateToString(now);
		if(args.trash_type.toUpperCase() == "ANY") {
			var result = false;
			
			for(var i=0; i<supportedTypes.length; i++)
			{
				if(result === false && typeof(this.gdates[supportedTypes[i].toUpperCase()]) !== 'undefined') {
					result = this.gdates[ supportedTypes[i].toUpperCase() ].indexOf(dateString) > -1;
				}
			}
			
			return Promise.resolve( result );
		}
	
		//Homey.log(dateString);
		return Promise.resolve( this.gdates[ args.trash_type.toUpperCase() ].indexOf(dateString) > -1 );
	}
	
	/* ******************
		EVENT HANDLERS
	********************/
	onSettingsChanged(parameterName)
	{
		console.log("Updating settings for: " + parameterName);
		
		if(parameterName === "manualEntryData")
		{
			this.GenerateNewDaysBasedOnManualInput();
		}
		
		if(parameterName === "collectingDays")
		{
			this.collectingDaysSet = true;
			
			console.log("Updating label because collecting days changed.");
			this.onUpdateLabel( );
		}
		
		if(parameterName === "labelSettings" && this.collectingDaysSet == true)
		{
			console.log("Updating label because label settings changed.");
			this.onUpdateLabel( );
		}
	}
	
	onUpdateData(shouldExecute, shouldSetTimeout)
	{
		if (Homey.ManagerSettings.get('postcode') &&
			Homey.ManagerSettings.get('hnumber') &&
			Homey.ManagerSettings.get('country') &&
			shouldExecute === true)
		{
			var apiId = Homey.ManagerSettings.get('apiId');
			
			this.updateAPI(
				Homey.ManagerSettings.get('postcode'),
				Homey.ManagerSettings.get('hnumber'),
				Homey.ManagerSettings.get('country'),
				apiId,
				function(success, that, newApiId)
				{
					if(success)
					{
						console.log('retrieved house information');
						
						// Update label
						that.onUpdateLabel();
					} 
					else 
					{
						console.log('house information has not been set');
					}
				}
			);
		}
		
		if (shouldExecute === true)
		{
			// Generate new days based on manual input
			this.GenerateNewDaysBasedOnManualInput();
		}
		
		// Make sure it is executed every saturday around midnight (+1 sec)	
		if(shouldSetTimeout === true)
		{
			let msTillSaturday = this.millisecondsTillSaturdayNight();	
			setTimeout(this.onUpdateData.bind(this), msTillSaturday, true, true);
		}
	}
	
	onUpdateLabel( )
	{
		// Retrieve label settings
		console.log("Updating label");
		var labelSettings = Homey.ManagerSettings.get('labelSettings');
		var dates = Homey.ManagerSettings.get('collectingDays');
				
		if(labelSettings === 'undefined' || labelSettings == null)
		{
			console.log("Updating label with default values");
			
			labelSettings = {
				timeindicator: 0,
				generic: Homey.__('speech.output.trashtypeycollectedonx'),
				type: {
					gft: Homey.__('speech.output.type.GFT'),
					rest: Homey.__('speech.output.type.REST'),
					pmd: Homey.__('speech.output.type.PMD'),
					plastic: Homey.__('speech.output.type.PLASTIC'),
					papier: Homey.__('speech.output.type.PAPIER'),
					textiel: Homey.__('speech.output.type.TEXTIEL'),
					grof: Homey.__('speech.output.type.GROF'),
					kerstboom: Homey.__('speech.output.type.KERSTBOOM'),
					none: Homey.__('speech.output.type.NONE')
				}
			};
			
			// Fill default label settings
			Homey.ManagerSettings.set('labelSettings', labelSettings);
		}
		
		// For backwards compatibility, add the two new waste types default values when they don't exist in the settings yet.
		if(typeof labelSettings.type["kerstboom"] === 'undefined' || typeof labelSettings.type["grof"] === 'undefined')
		{
			console.log("Updating label with additional values for backwards compatibility");
			
			labelSettings.type["kerstboom"] = Homey.__('speech.output.type.KERSTBOOM');
			labelSettings.type["grof"] = Homey.__('speech.output.type.GROF');
			
			// Update default label settings
			Homey.ManagerSettings.set('labelSettings', labelSettings);
		}
		
		var checkDate = new Date();
		if(labelSettings.timeindicator == 1) {
			checkDate.setDate(checkDate.getDate() + 1);
		} else if(labelSettings.timeindicator == 2) {
			checkDate.setDate(checkDate.getDate() + 2);
		}
		
		// Check trash type that is collected on x-day
		var typesCollected = [];
		var textLabel = "";
		if(typeof dates !== 'undefined' && dates !== null)
		{
			for (var i = 0, len = supportedTypes.length; i < len; i++) {
				if( typeof dates[ supportedTypes[i] ] !== 'undefined' )
				{
					if(dates[ supportedTypes[i] ].indexOf(this.dateToString(checkDate)) > -1)
					{
						typesCollected.push(supportedTypes[i]);
					}
				}
			}
		}
		
		var timeReplacement = Homey.__('speech.output.timeindicator.t' + labelSettings.timeindicator);
		var alternativeTextLabel = labelSettings.generic;

		if(typesCollected.length == 0)
		{
			textLabel = labelSettings.type["none"];

			if(typeof alternativeTextLabel !== 'undefined' && alternativeTextLabel !== null && alternativeTextLabel != "")
			{
				textLabel = alternativeTextLabel.replace("__time__",timeReplacement).replace("__type__",textLabel).replace("__plural__",Homey.__('speech.output.replacementsingle'));
			}
		}
		else if(typesCollected.length == 1)
		{
			textLabel = labelSettings.type[typesCollected[0].toLowerCase()];

			if(typeof alternativeTextLabel !== 'undefined' && alternativeTextLabel !== null && alternativeTextLabel != "")
			{
				textLabel = alternativeTextLabel.replace("__time__",timeReplacement).replace("__type__",textLabel).replace("__plural__",Homey.__('speech.output.replacementsingle'));
			}
		}
		else
		{
			// When more then one type of trash is collected
			var multiTypeString = "";				
			for (var i = 0, len = typesCollected.length; i < len; i++) {
				multiTypeString += labelSettings.type[typesCollected[i].toLowerCase()] + (i < (len-2) ? ", " : (i == (len-2) ? " " + Homey.__('speech.output.and') + " " : ""));
			}

			textLabel = multiTypeString;

			if(typeof alternativeTextLabel !== 'undefined' && alternativeTextLabel !== null && alternativeTextLabel != "")
			{
				textLabel = alternativeTextLabel.replace("__time__",timeReplacement).replace("__type__",multiTypeString).replace("__plural__",Homey.__('speech.output.replacementplural'));
			}
		}
				
		// Set global token with value found.
		if(this.trashToken !== null)
		{	
			console.log("Label is updated: " + textLabel);
			return this.trashToken.setValue(textLabel);
		}
		else
		{
			console.log("Trash token is empty");
		}
	}
	
	/* ******************
		COMMON FUNCTIONS
	******************* */	
	// Exctualy calculates MS till 5 O clock
	millisecondsTillMidnight()
	{
		var now = new Date();
		var currentHour = now.getHours();

		var night = new Date(
			now.getFullYear(),
			now.getMonth(),
			currentHour < 5 ? (now.getDate()) : (now.getDate() + 1),
			5, 0, 1
		);
		
		let msTillMidnight = night.getTime() - now.getTime();
		console.log(msTillMidnight);
		return msTillMidnight <= 0 ? 1000 : msTillMidnight;
	}
	
	millisecondsTillSaturdayNight()
	{
		var now = new Date();
		var currentDay = now.getDay()%6 == 0 ? 6 : now.getDay()%6;
		
		var msTillMidnight = this.millisecondsTillMidnight();
		var msTillSaturday = ((currentDay * 24 * 60 * 60 * 1000) + msTillMidnight);
		console.log("ms till Saturday night");
		console.log(msTillSaturday);
		return msTillSaturday <= 0 ? 1000 : msTillSaturday;
	}
	
	pad(n, width, z)
	{
	  z = z || '0';
	  n = n + '';
	  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}
	
	updateAPI(postcode, homenumber, country, apiId, callback)
	{
		let newDates = null;
		
		if(typeof postcode !== 'undefined' && postcode !== null && postcode !== '')
		{
			postcode = postcode.toUpperCase();
		}
		
		// check if we already know which API is chosen
		if(typeof apiId !== 'undefined' && apiId !== null && apiId != "" && isNaN(apiId))
		{
			console.log("API ID Known: " + apiId);
			var result = apiArray.find(o => o.id === apiId);
			if(result == null || typeof result === 'undefined')
			{
				return;
			}
			
			// only load that API, this is so that we won't send requests to all data providers all the time.
			result['execute'](postcode,homenumber,country,
			(err,result) => {
				if(err) {
					console.log('Error in API', err);
					
					callback(false, this, null);
					return;
				}
				else if(Object.keys(result).length > 0)
				{
					Homey.ManagerSettings.set('collectingDays', null);
					
					newDates = result;
					this.gdates = newDates;
					this.GenerateNewDaysBasedOnManualInput(); // Can add additional dates
					
					Homey.ManagerSettings.set('apiId', apiId);					
					callback(true, this, apiId);
					return;
				}
				else if(Object.keys(result).length === 0) {
					console.log('No information found, go to settings to reset your API settings.');
					
					callback(false, this, null);
					return;
				}
			});
			
			return;
		}

		this.GenerateNewDaysBasedOnManualInput(); // When no API dates are known
		
		if(typeof postcode === 'undefined' || postcode === null || postcode === '')
		{
			return;
		}

		function asyncLoop(iterations, that, func, callback)
		{
			var index = 0;
			var done = false;
			var loop = {
				next: function() {
					if (done) {
						return;
					}
	
					if (index < iterations) {
						index++;
						func(loop, that);
	
					} else {
						done = true;
						callback();
					}
				},
	
				iteration: function() {
					return index - 1;
				},
	
				break: function() {
					done = true;
					callback();
				}
			};
			loop.next();
			return loop;
		}
	
		asyncLoop(apiArray.length, this, function(loop, that)
		{
			console.log(loop.iteration());
			console.log(apiArray[loop.iteration()]);
			
			apiArray[loop.iteration()]['execute'](postcode,homenumber,country,
			(err,result) => {
				if(err) {
					console.log('error while looping', err);
					loop.next();
				} else if(Object.keys(result).length > 0) {
					newDates = result;
					that.gdates = newDates;
					
					Homey.ManagerSettings.set('apiId', apiArray[loop.iteration()]['id']);
					Homey.ManagerSettings.set('collectingDays', newDates);
					
					callback(true, that, apiArray[loop.iteration()]['id']);
				} else if(Object.keys(result).length === 0) {
					loop.next();
				}
			});
		},
		() => {
			console.log('Checked all APIs');
			return callback(false);
		});
	}
	
	dateToString(inputDate)
	{
		var dateString = this.pad( inputDate.getDate(), 2);
		dateString += '-';
		dateString += this.pad( inputDate.getMonth()+1, 2);
		dateString += '-';
		dateString += inputDate.getFullYear();
		return dateString;
	}
	
	GenerateNewDaysBasedOnManualInput()
	{
		// Retrieve settings
		var manualSettings = Homey.ManagerSettings.get('manualEntryData');
		var dates = this.gdates === '' ? [] : this.gdates;
		
		if(typeof manualSettings === 'undefined' || manualSettings == null)
		{
			Homey.ManagerSettings.set('collectingDays', dates);
			return;
		}
		
		// Parse dates per type
		if(typeof manualSettings.gft !== 'undefined' && manualSettings.gft && this.ParseManualOptionValue(manualSettings.gft) != 0)
		{
			dates.GFT = this.CalculatePickupDates(manualSettings.gft);
		}
		
		if(typeof manualSettings.paper !== 'undefined' && manualSettings.paper && this.ParseManualOptionValue(manualSettings.paper) != 0)
		{
			dates.PAPIER = this.CalculatePickupDates(manualSettings.paper);
		}
		
		if(typeof manualSettings.rest !== 'undefined' && manualSettings.rest && this.ParseManualOptionValue(manualSettings.rest) != 0)
		{
			dates.REST = this.CalculatePickupDates(manualSettings.rest);
		}
		
		if(typeof manualSettings.pmd !== 'undefined' && manualSettings.pmd && this.ParseManualOptionValue(manualSettings.pmd) != 0)
		{
			dates.PMD = this.CalculatePickupDates(manualSettings.pmd);
		}
		
		if(typeof manualSettings.plastic !== 'undefined' && manualSettings.plastic && this.ParseManualOptionValue(manualSettings.plastic) != 0)
		{
			dates.PLASTIC = this.CalculatePickupDates(manualSettings.plastic);
		}
		
		if(typeof manualSettings.textile !== 'undefined' && manualSettings.textile && this.ParseManualOptionValue(manualSettings.textile) != 0)
		{
			dates.TEXTIEL = this.CalculatePickupDates(manualSettings.textile);
		}
		
		if(typeof manualSettings.bulky !== 'undefined' && manualSettings.bulky && this.ParseManualOptionValue(manualSettings.bulky) != 0)
		{
			dates.GROF = this.CalculatePickupDates(manualSettings.bulky);
		}
		
		if(typeof manualSettings.christmas !== 'undefined' && manualSettings.christmas && this.ParseManualOptionValue(manualSettings.christmas) != 0)
		{
			dates.KERSTBOOM = this.CalculatePickupDates(manualSettings.christmas);
		}
		
		// Push to gdates
		Homey.ManagerSettings.set('collectingDays', dates);
		this.gdates = dates;
	}

	ParseManualOptionValue(settings)
	{
		var interval = -1;
		try { 
			interval = parseInt(settings.option);
		} catch(e) { console.log(e); }
		return interval;
	}
	
	CalculatePickupDates(settings)
	{
		var result = [];
	
		var interval = -1;
		try { 
			interval = parseInt(settings.option);
		} catch(e) { console.log(e); }

		if(interval <= 0)
		{
			return result;
		}
		
		var intervalExtended = -1;
		try { 
			intervalExtended = parseInt(settings.option_extension);
		} catch(e) { console.log(e); }
		
		var startDate = new Date(Date.now());
		try { 
			startDate = settings.startdate;
		} catch(e) { console.log(e); }
		
		var dayOfWeek = null;
		try { 
			dayOfWeek = parseInt(settings.day);
		} catch(e) { console.log(e); }
		
		var currentDate = new Date(Date.now());
		var startDate = new Date(startDate);
		
		var firstDayInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		var previousMonth = new Date(new Date(firstDayInCurrentMonth).setMonth(firstDayInCurrentMonth.getMonth()-1));
		var nextMonth = new Date(new Date(firstDayInCurrentMonth).setMonth(firstDayInCurrentMonth.getMonth()+1));
		var afterNextMonth = new Date(new Date(firstDayInCurrentMonth).setMonth(firstDayInCurrentMonth.getMonth()+2));
		
		if(interval >= 11 && interval <= 14) // every x-th week of month/quarter/year
		{
			var nThWeek = interval-10;
			var date1 = new Date();
			var date2 = new Date();
			var date3 = new Date();
			
			if(intervalExtended == 12) // every x-th week of the year
			{
				date1 = DateTimeHelper.nthDayInMonth(nThWeek, dayOfWeek, 0, currentDate.getFullYear()-1);
				date2 = DateTimeHelper.nthDayInMonth(nThWeek, dayOfWeek, 0, currentDate.getFullYear());
				date3 = DateTimeHelper.nthDayInMonth(nThWeek, dayOfWeek, 0, currentDate.getFullYear()+1);
			}
			else if(intervalExtended == 3) // every x-th week of the quarter
			{
				var currentQuarter = ((currentDate.getMonth()-((currentDate.getMonth()+3)%3))/3);
				var currentQuarterStart = new Date(currentDate.getFullYear(), currentQuarter*3, 1);
				var previousQuarterStart = new Date(new Date(currentQuarterStart).setMonth(currentQuarterStart.getMonth()-3));
				var nextQuarterStart = new Date(new Date(currentQuarterStart).setMonth(currentQuarterStart.getMonth()+3));
				
				date1 = DateTimeHelper.nthDayInMonth(nThWeek, dayOfWeek, previousQuarterStart.getMonth(), previousQuarterStart.getFullYear());
				date2 = DateTimeHelper.nthDayInMonth(nThWeek, dayOfWeek, currentQuarterStart.getMonth(), currentQuarterStart.getFullYear());
				date3 = DateTimeHelper.nthDayInMonth(nThWeek, dayOfWeek, nextQuarterStart.getMonth(), nextQuarterStart.getFullYear());
			}
			else if(intervalExtended == 2) // every x-th week of the other month
			{
				// We need to know the start date (if it's in an even or uneven month)
				var oddOrEvenMonth = startDate.getMonth() % 2;
				
				// Then we calculate up to 6 months ahead
				for (var i = -2, weekCounter = 6; i < weekCounter; i++) {
					var monthToCalculateWith = new Date(new Date(firstDayInCurrentMonth).setMonth(firstDayInCurrentMonth.getMonth()+i));
					var calculatedDate = DateTimeHelper.nthDayInMonth(nThWeek, dayOfWeek, monthToCalculateWith.getMonth(), monthToCalculateWith.getFullYear());
					if(calculatedDate.getMonth() % 2 === oddOrEvenMonth)
					{
						result.push(this.dateToString(calculatedDate));
					}
				}
				
				return result;
			}
			else // every x-th week of the month
			{		
				date1 = DateTimeHelper.nthDayInMonth(nThWeek, dayOfWeek, previousMonth.getMonth(), previousMonth.getFullYear());
				date2 = DateTimeHelper.nthDayInMonth(nThWeek, dayOfWeek, firstDayInCurrentMonth.getMonth(), firstDayInCurrentMonth.getFullYear());
				date3 = DateTimeHelper.nthDayInMonth(nThWeek, dayOfWeek, nextMonth.getMonth(), nextMonth.getFullYear());
			}
			
			result.push(this.dateToString(date1));
			result.push(this.dateToString(date2));
			result.push(this.dateToString(date3));
		}
		else if(interval <= 8) // per week
		{
			var date0 = DateTimeHelper.everyNthWeek(interval, dayOfWeek, startDate, currentDate, -2);
			var date1 = DateTimeHelper.everyNthWeek(interval, dayOfWeek, startDate, currentDate, -1);
			var date2 = DateTimeHelper.everyNthWeek(interval, dayOfWeek, startDate, currentDate, 0);
			var date3 = DateTimeHelper.everyNthWeek(interval, dayOfWeek, startDate, currentDate, 1);
			var date4 = DateTimeHelper.everyNthWeek(interval, dayOfWeek, startDate, currentDate, 2);
			
			result.push(this.dateToString(date0));
			result.push(this.dateToString(date1));
			result.push(this.dateToString(date2));
			result.push(this.dateToString(date3));
			result.push(this.dateToString(date4));
		}
		else if(interval >= 19 && interval <= 20) // every last, every second last
		{
			var nthLastWeekOf = interval-18;
			
			var date1 = new Date();
			var date2 = new Date();
			var date3 = new Date();
			var date4 = new Date();
			
			if(intervalExtended == 12) // every x-th last week of the year
			{
				date1 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, dayOfWeek, 0, currentDate.getFullYear()-1);
				date2 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, dayOfWeek, 0, currentDate.getFullYear());
				date3 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, dayOfWeek, 0, currentDate.getFullYear()+1);
				date4 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, dayOfWeek, 0, currentDate.getFullYear()+2);
			}
			else if(intervalExtended == 3) // every x-th last week of the quarter
			{
				var currentQuarter = ((currentDate.getMonth()-((currentDate.getMonth()+3)%3))/3);
				var currentQuarterStart = new Date(currentDate.getFullYear(), currentQuarter*3, 1);
				var previousQuarterStart = new Date(new Date(currentQuarterStart).setMonth(currentQuarterStart.getMonth()-3));
				var nextQuarterStart = new Date(new Date(currentQuarterStart).setMonth(currentQuarterStart.getMonth()+3));
				var overNextQuarterStart = new Date(new Date(currentQuarterStart).setMonth(currentQuarterStart.getMonth()+6));
				
				date1 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, dayOfWeek, previousQuarterStart.getMonth(), previousQuarterStart.getFullYear());
				date2 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, dayOfWeek, currentQuarterStart.getMonth(), currentQuarterStart.getFullYear());
				date3 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, dayOfWeek, nextQuarterStart.getMonth(), nextQuarterStart.getFullYear());
				date4 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, dayOfWeek, overNextQuarterStart.getMonth(), overNextQuarterStart.getFullYear());
			}
			else // every x-th last week of the month
			{		
				date1 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, dayOfWeek, previousMonth.getMonth(), previousMonth.getFullYear());
				date2 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, dayOfWeek, firstDayInCurrentMonth.getMonth(), firstDayInCurrentMonth.getFullYear());
				date3 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, dayOfWeek, nextMonth.getMonth(), nextMonth.getFullYear());
				date4 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, dayOfWeek, afterNextMonth.getMonth(), afterNextMonth.getFullYear());
			}
			
			result.push(this.dateToString(date1));
			result.push(this.dateToString(date2));
			result.push(this.dateToString(date3));
			result.push(this.dateToString(date4));
		}
		
		return result;
	}
	
	static toDateOutputString(differenceInDaysForType)
	{
		if(differenceInDaysForType >= 0 && differenceInDaysForType <= 2)
		{
			return Homey.__('speech.output.timeindicator.t'+Math.ceil(differenceInDaysForType)); // Need ceil for rounding to int
		}
		else if(differenceInDaysForType <= 7)
		{
			var today = new Date();
			var dayOfWeek = Math.floor((today.getDay() + differenceInDaysForType) % 7); // I don't know why, but modulo won't work without Floor...
			return Homey.__('speech.output.next') + " " + Homey.__('speech.output.weekdays.d'+ dayOfWeek);
		}
		else
		{
			return Homey.__('speech.output.in') + " " + differenceInDaysForType + " " + Homey.__('speech.output.days');
		}
	}
}

module.exports = TrashcanReminder;
