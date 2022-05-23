/*globals Homey, module, require, setInterval*/
"use strict";

const Homey = require('homey');
const DateTimeHelper = require('./lib/datetime.js');
var apiArray = require('./trashapis.js');

var supportedTypes = ["GFT","PLASTIC","PAPIER","PMD","REST","TEXTIEL","GROF","KERSTBOOM","GLAS"];

class TrashcanReminder extends Homey.App
{
	async onInit()
	{
		this.gdates = '';
		this.trashTokenToday = null;
		this.trashTokenTomorrow = null;
		this.trashTokenDayAfterTomorrow = null;
		this.intervalRefreshToken = null;
		this.collectingDaysSet = false;

		// Update manual input dates when settings change.
		this.homey.settings.on('set', this.onSettingsChanged.bind(this));

		// Register flow card
		let daysToCollect = this.homey.flow.getConditionCard('days_to_collect');
		daysToCollect.registerRunListener(this.flowDaysToCollect.bind(this));
		
		// Create trash collection tokens (labels)
		let trashCollectionTokenToday = await this.homey.flow.createToken( 'trash_collection_token_today', {
			type: 'string',
			title: this.homey.__('tokens.trashcollection.today')
		});

		let trashCollectionTokenTomorrow = await this.homey.flow.createToken( 'trash_collection_token_tomorrow', {
			type: 'string',
			title: this.homey.__('tokens.trashcollection.tomorrow')
		});

		let trashCollectionTokenDayAfterTomorrow = await this.homey.flow.createToken( 'trash_collection_token_dayaftertomorrow', {
			type: 'string',
			title: this.homey.__('tokens.trashcollection.dayaftertomorrow')
		});

		this.trashTokenToday = trashCollectionTokenToday;
		this.trashTokenTomorrow = trashCollectionTokenTomorrow;
		this.trashTokenDayAfterTomorrow = trashCollectionTokenDayAfterTomorrow;

		// Manually kick off data retrieval
		this.onUpdateData(true, false);
		
		// Every 24 hours update API or manual dates
		this.homey.setTimeout(this.onUpdateData.bind(this), 172800000, true, true); // Retrieves it every 48 hours
		this.homey.setInterval(this.onUpdateLabel.bind(this), 10*60*1000); // Update label every 10 minutes.
		
		this.log("App initialized");
	}

	/* ******************
		FLOW FUNCTIONS
	********************/
	async flowDaysToCollect(args, state)
	{
		if( typeof this.gdates[ args.trash_type.toUpperCase() ] === 'undefined' && args.trash_type.toUpperCase() !== "ANY")
		{
			var message = this.homey.__('error.typenotsupported.addviasettings');
			console.log(message);
			return Promise.resolve(false);
		}
	
		var now = this.getLocalDate();
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
		// For backwards compatibility and to support BE suppliers, add an empty the streetname to everyones settings.
		if(!this.homey.settings.get('streetName'))
		{
			this.homey.settings.set('streetName', null);
		}

		if (this.homey.settings.get('postcode') &&
			this.homey.settings.get('hnumber') &&
			this.homey.settings.get('country') &&
			shouldExecute === true)
		{
			var apiId = this.homey.settings.get('apiId');
			
			this.updateAPI(
				this.homey.settings.get('postcode'),
				this.homey.settings.get('hnumber'),
				this.homey.settings.get('streetName'),
				this.homey.settings.get('country'),
				apiId,
				function(success, that, newApiId)
				{
					if(success)
					{
						console.log('retrieved house information');
					}
					else 
					{
						console.log('house information has not been set');
					}
				}
			);

			// Make sure we are not updating everything to often.
			shouldExecute = false;
		}
		
		if (shouldExecute === true)
		{
			// Generate new days based on manual input
			this.GenerateNewDaysBasedOnManualInput();
		}
		
		// Make sure it is executed every saturday around midnight (+1 sec)	
		if(shouldSetTimeout === true)
		{
			this.homey.setTimeout(this.onUpdateData.bind(this), 172800000, true, true);
		}
	}
	
	onUpdateLabel()
	{
		// Retrieve label settings
		console.log("Updating label");
		var labelSettings = this.homey.settings.get('labelSettings');
		var dates = this.homey.settings.get('collectingDays');
		
		// Validate label settings (and set them for first time use)
		if(labelSettings === 'undefined' || labelSettings == null)
		{
			console.log("Updating label with default values");
			
			labelSettings = {
				timeindicator: 0,
				generic: this.homey.__('speech.output.trashtypeycollectedonx'),
				type: {
					gft: this.homey.__('speech.output.type.GFT'),
					rest: this.homey.__('speech.output.type.REST'),
					pmd: this.homey.__('speech.output.type.PMD'),
					plastic: this.homey.__('speech.output.type.PLASTIC'),
					papier: this.homey.__('speech.output.type.PAPIER'),
					textiel: this.homey.__('speech.output.type.TEXTIEL'),
					grof: this.homey.__('speech.output.type.GROF'),
					glas: this.homey.__('speech.output.type.GLAS'),
					kerstboom: this.homey.__('speech.output.type.KERSTBOOM'),
					none: this.homey.__('speech.output.type.NONE')
				}
			};
			
			// Fill default label settings
			this.homey.settings.set('labelSettings', labelSettings);
		}
		
		// For backwards compatibility, add the two new waste types default values when they don't exist in the settings yet.
		if(typeof labelSettings.type["kerstboom"] === 'undefined' || typeof labelSettings.type["grof"] === 'undefined')
		{
			console.log("Updating label with additional values for backwards compatibility");
			
			labelSettings.type["kerstboom"] = this.homey.__('speech.output.type.KERSTBOOM');
			labelSettings.type["grof"] = this.homey.__('speech.output.type.GROF');
			labelSettings.type["glas"] = this.homey.__('speech.output.type.GLAS');
			
			// Update default label settings
			this.homey.settings.set('labelSettings', labelSettings);
		}

		// For backwards compatibility, add the glas waste types default values when they don't exist in the settings yet.
		if(typeof labelSettings.type["glas"] === 'undefined')
		{
			console.log("Updating label with additional values for backwards compatibility");
			
			labelSettings.type["glas"] = this.homey.__('speech.output.type.GLAS');
			
			// Update default label settings
			this.homey.settings.set('labelSettings', labelSettings);
		}

		// Set global token with value found.
		var result = null;
		if(this.trashTokenToday !== null)
		{	
			var textLabel = this.getTextLabel(labelSettings, dates, 0);
			console.log("Label today is updated: " + textLabel);
			result = this.trashTokenToday.setValue(textLabel);
		}
		else
		{
			console.log("Trash token today is empty");
		}

		if(this.trashTokenTomorrow !== null)
		{	
			var textLabel = this.getTextLabel(labelSettings, dates, 1);
			console.log("Label tomorrow is updated: " + textLabel);
			result = this.trashTokenTomorrow.setValue(textLabel);
		}
		else
		{
			console.log("Trash token tomorrow is empty");
		}

		if(this.trashTokenDayAfterTomorrow !== null)
		{	
			var textLabel = this.getTextLabel(labelSettings, dates, 2);
			console.log("Label day after tomorrow is updated: " + textLabel);
			result = this.trashTokenDayAfterTomorrow.setValue(textLabel);
		}
		else
		{
			console.log("Trash token day after tomorrow is empty");
		}

		return result;
	}

	getTextLabel(labelSettings, dates, timeIndicator)
	{
		var checkDate = this.getLocalDate();
		if(timeIndicator == 1) {
			checkDate.setDate(checkDate.getDate() + 1);
		} else if(timeIndicator == 2) {
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
		
		var timeReplacement = this.homey.__('speech.output.timeindicator.t' + timeIndicator);
		var alternativeTextLabel = labelSettings.generic;

		if(typesCollected.length == 0)
		{
			textLabel = labelSettings.type["none"];

			if(typeof alternativeTextLabel !== 'undefined' && alternativeTextLabel !== null && alternativeTextLabel != "")
			{
				textLabel = alternativeTextLabel.replace("__time__",timeReplacement).replace("__type__",textLabel).replace("__plural__",this.homey.__('speech.output.replacementsingle'));
			}
		}
		else if(typesCollected.length == 1)
		{
			textLabel = labelSettings.type[typesCollected[0].toLowerCase()];

			if(typeof alternativeTextLabel !== 'undefined' && alternativeTextLabel !== null && alternativeTextLabel != "")
			{
				textLabel = alternativeTextLabel.replace("__time__",timeReplacement).replace("__type__",textLabel).replace("__plural__",this.homey.__('speech.output.replacementsingle'));
			}
		}
		else
		{
			// When more then one type of trash is collected
			var multiTypeString = "";				
			for (var i = 0, len = typesCollected.length; i < len; i++) {
				multiTypeString += labelSettings.type[typesCollected[i].toLowerCase()] + (i < (len-2) ? ", " : (i == (len-2) ? " " + this.homey.__('speech.output.and') + " " : ""));
			}

			textLabel = multiTypeString;

			if(typeof alternativeTextLabel !== 'undefined' && alternativeTextLabel !== null && alternativeTextLabel != "")
			{
				textLabel = alternativeTextLabel.replace("__time__",timeReplacement).replace("__type__",multiTypeString).replace("__plural__",this.homey.__('speech.output.replacementplural'));
			}
		}

		return textLabel;
	}
	
	/* ******************
		COMMON FUNCTIONS
	******************* */
	// Gets the local date
	getLocalDate()
	{
		var date = new Date(new Date().toLocaleString('en-US', { timeZone: this.homey.clock.getTimezone() }));
		console.log(`Local date: ${date}`);
		return date;
	}
	
	pad(n, width, z)
	{
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}
	
	updateAPI(postcode, homenumber, streetName, country, apiId, callback)
	{
		let newDates = null;
		let newThis = this;
		
		if(typeof postcode !== 'undefined' && postcode !== null && postcode !== '')
		{
			postcode = postcode.toUpperCase();
		} 
		else 
		{
			postcode = '';
		}
		
		if(typeof homenumber !== 'undefined' && homenumber !== null && homenumber !== '')
		{
			homenumber = homenumber.toUpperCase();
		} 
		else 
		{
			homenumber = '';
		}

		if(typeof streetName !== 'undefined' && streetName !== null && streetName !== '')
		{
			streetName = streetName.toLowerCase();
		} 
		else 
		{
			streetName = '';
		}
		
		if(typeof apiId !== 'undefined' && apiId !== null && apiId !== '' && isNaN(apiId))
		{
			apiId = apiId.toLowerCase();
		} 
		else 
		{
			apiId = '';
		}
		
		// check if we already know which API is chosen
		if(apiId != '' && postcode != '' && homenumber != '')
		{
			console.log("API ID Known: " + apiId);
			var result = apiArray.find(o => o.id === apiId);
			if(result == null || typeof result === 'undefined')
			{
				return Promise.error("API cannot be found.");
			}
			
			// only load that API, this is so that we won't send requests to all data providers all the time.
			result['execute'](postcode,homenumber,streetName,country)
			.then(function(result)
			{
				if(Object.keys(result).length > 0)
				{
					newThis.homey.settings.set('collectingDays', null);
					
					newDates = result;
					newThis.gdates = newDates;
					newThis.GenerateNewDaysBasedOnManualInput(); // Can add additional dates
					
					newThis.homey.settings.set('apiId', apiId);					
					callback(true, newThis, apiId);
				}
				else if(Object.keys(result).length === 0) {
					console.log('No information found, go to settings to reset your API settings.');
					
					callback(false, this, null);
				}
			})
			.catch(function(error)
			{
				console.log(error);
				callback(false, this, null);
			});
			
			return;
		}
		
		if(postcode === '' || homenumber === '')
		{
			this.GenerateNewDaysBasedOnManualInput(); // When postal code is not set, and no API retrieval
			callback(false, this, null);
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
			var executable = apiArray[loop.iteration()];
			executable['execute'](postcode,homenumber,streetName,country)
			.then(function(result)
			{
				if(Object.keys(result).length > 0)
				{
					newDates = result;
					that.gdates = newDates;
					
					that.homey.settings.set('apiId', apiArray[loop.iteration()]['id']);
					that.homey.settings.set('collectingDays', newDates);
					that.GenerateNewDaysBasedOnManualInput();
					return callback(true, that, apiArray[loop.iteration()]['id']);
				}
				else if(Object.keys(result).length === 0)
				{
					console.log('starting next iteration');
					loop.next();
					return;
				}

				loop.next();
			}).catch(function(err)
			{
				console.log('error while looping', err);
				loop.next();
			});
		},
		() => {
			console.log('Checked all APIs');
			return callback(false, this, null);
		});
	}
	
	dateToString(inputDate)
	{
		var dateString = inputDate.getFullYear();
		dateString += '-';
		dateString += this.pad( inputDate.getMonth()+1, 2);
		dateString += '-';
		dateString += this.pad( inputDate.getDate(), 2);
		return dateString;
	}
	
	GenerateNewDaysBasedOnManualInput()
	{
		console.log("Entering GenerateNewDaysBasedOnManualInput");

		// Retrieve settings
		var manualSettings = this.homey.settings.get('manualEntryData');
		var manualAdditions = this.homey.settings.get('manualAdditions');

		var dates = this.gdates === '' ? {} : this.gdates;

		if(typeof manualSettings === 'undefined' || manualSettings == null)
		{
			dates = this.ParseManualAdditions(dates, manualAdditions);

			console.log("Pushing new dates without manual settings, with manual additions.");
			console.log(dates);
			this.gdates = dates;
			this.homey.settings.set('collectingDays', dates);
			return;
		}

		console.log("Retrieving new days based on manual input");
		
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
		
		if(typeof manualSettings.glas !== 'undefined' && manualSettings.glas && this.ParseManualOptionValue(manualSettings.glas) != 0)
		{
			dates.GLAS = this.CalculatePickupDates(manualSettings.glas);
		}
		
		if(typeof manualSettings.christmas !== 'undefined' && manualSettings.christmas && this.ParseManualOptionValue(manualSettings.christmas) != 0)
		{
			dates.KERSTBOOM = this.CalculatePickupDates(manualSettings.christmas);
		}
		
		// Parse manual additions
		dates = this.ParseManualAdditions(dates, manualAdditions);

		// Push to gdates
		console.log("Pushing new dates, with manual settings and manual additions.");
		console.log(dates);
		this.gdates = dates;
		this.homey.settings.set('collectingDays', dates);
	}

	ParseManualOptionValue(settings)
	{
		var interval = -1;
		try { 
			interval = parseInt(settings.option);
		} catch(e) { console.log(e); }
		return interval;
	}

	ParseManualAdditions(dates, manualAdditions)
	{
		if(typeof manualAdditions === 'undefined' || manualAdditions == null)
		{
			return dates;
		}

		if(typeof manualAdditions.GFT !== 'undefined' && manualAdditions.GFT !== null && manualAdditions.GFT.length > 0)
		{
			if(typeof dates.GFT === 'undefined' || dates.GFT === null || dates.GFT.length <= 0)
			{
				dates.GFT = [];
			}

			for(var i=0; i<manualAdditions.GFT.length; i++)
			{
				dates.GFT.push(manualAdditions.GFT[i]);
			}
		}

		if(typeof manualAdditions.PAPIER !== 'undefined' && manualAdditions.PAPIER !== null && manualAdditions.PAPIER.length > 0)
		{
			if(typeof dates.PAPIER === 'undefined' || dates.PAPIER === null || dates.PAPIER.length <= 0)
			{
				dates.PAPIER = [];
			}

			for(var i=0; i<manualAdditions.PAPIER.length; i++)
			{
				dates.PAPIER.push(manualAdditions.PAPIER[i]);
			}
		}

		if(typeof manualAdditions.GROF !== 'undefined' && manualAdditions.GROF !== null && manualAdditions.GROF.length > 0)
		{
			if(typeof dates.GROF === 'undefined' || dates.GROF === null || dates.GROF.length <= 0)
			{
				dates.GROF = [];
			}

			for(var i=0; i<manualAdditions.GROF.length; i++)
			{
				dates.GROF.push(manualAdditions.GROF[i]);
			}
		}

		if(typeof manualAdditions.GLAS !== 'undefined' && manualAdditions.GLAS !== null && manualAdditions.GLAS.length > 0)
		{
			if(typeof dates.GLAS === 'undefined' || dates.GLAS === null || dates.GLAS.length <= 0)
			{
				dates.GLAS = [];
			}

			for(var i=0; i<manualAdditions.GLAS.length; i++)
			{
				dates.GLAS.push(manualAdditions.GLAS[i]);
			}
		}

		if(typeof manualAdditions.REST !== 'undefined' && manualAdditions.REST !== null && manualAdditions.REST.length > 0)
		{
			if(typeof dates.REST === 'undefined' || dates.REST === null || dates.REST.length <= 0)
			{
				dates.REST = [];
			}

			for(var i=0; i<manualAdditions.REST.length; i++)
			{
				dates.REST.push(manualAdditions.REST[i]);
			}
		}

		if(typeof manualAdditions.PLASTIC !== 'undefined' && manualAdditions.PLASTIC !== null && manualAdditions.PLASTIC.length > 0)
		{
			if(typeof dates.PLASTIC === 'undefined' || dates.PLASTIC === null || dates.PLASTIC.length <= 0)
			{
				dates.PLASTIC = [];
			}

			for(var i=0; i<manualAdditions.PLASTIC.length; i++)
			{
				dates.PLASTIC.push(manualAdditions.PLASTIC[i]);
			}
		}

		if(typeof manualAdditions.PMD !== 'undefined' && manualAdditions.PMD !== null && manualAdditions.PMD.length > 0)
		{
			if(typeof dates.PMD === 'undefined' || dates.PMD === null || dates.PMD.length <= 0)
			{
				dates.PMD = [];
			}

			for(var i=0; i<manualAdditions.PMD.length; i++)
			{
				dates.PMD.push(manualAdditions.PMD[i]);
			}
		}

		if(typeof manualAdditions.KERSTBOOM !== 'undefined' && manualAdditions.KERSTBOOM !== null && manualAdditions.KERSTBOOM.length > 0)
		{
			if(typeof dates.KERSTBOOM === 'undefined' || dates.KERSTBOOM === null || dates.KERSTBOOM.length <= 0)
			{
				dates.KERSTBOOM = [];
			}

			for(var i=0; i<manualAdditions.KERSTBOOM.length; i++)
			{
				dates.KERSTBOOM.push(manualAdditions.KERSTBOOM[i]);
			}
		}

		if(typeof manualAdditions.TEXTIEL !== 'undefined' && manualAdditions.TEXTIEL !== null && manualAdditions.TEXTIEL.length > 0)
		{
			if(typeof dates.TEXTIEL === 'undefined' || dates.TEXTIEL === null || dates.TEXTIEL.length <= 0)
			{
				dates.TEXTIEL = [];
			}

			for(var i=0; i<manualAdditions.TEXTIEL.length; i++)
			{
				dates.TEXTIEL.push(manualAdditions.TEXTIEL[i]);
			}
		}

		return dates;
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
		
		var startDate = this.getLocalDate();
		try { 
			startDate = settings.startdate;
		} catch(e) { console.log(e); }
		
		var dayOfWeek = null;
		try { 
			dayOfWeek = parseInt(settings.day);
		} catch(e) { console.log(e); }
		
		var currentDate = this.getLocalDate();
		var startDate = new Date(startDate);
		
		var firstDayInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		var previousMonth = new Date(new Date(firstDayInCurrentMonth).setMonth(firstDayInCurrentMonth.getMonth()-1));
		var nextMonth = new Date(new Date(firstDayInCurrentMonth).setMonth(firstDayInCurrentMonth.getMonth()+1));
		var afterNextMonth = new Date(new Date(firstDayInCurrentMonth).setMonth(firstDayInCurrentMonth.getMonth()+2));
		
		if(interval >= 11 && interval <= 14) // every x-th week of month/quarter/year
		{
			var nThWeek = interval-10;
			var date1 = this.getLocalDate();
			var date2 = this.getLocalDate();
			var date3 = this.getLocalDate();
			
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
			
			var date1 = this.getLocalDate();
			var date2 = this.getLocalDate();
			var date3 = this.getLocalDate();
			var date4 = this.getLocalDate();
			
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
			return this.homey.__('speech.output.timeindicator.t'+Math.ceil(differenceInDaysForType)); // Need ceil for rounding to int
		}
		else if(differenceInDaysForType <= 7)
		{
			var today = this.getLocalDate();
			var dayOfWeek = Math.floor((today.getDay() + differenceInDaysForType) % 7); // I don't know why, but modulo won't work without Floor...
			return this.homey.__('speech.output.next') + " " + this.homey.__('speech.output.weekdays.d'+ dayOfWeek);
		}
		else
		{
			return this.homey.__('speech.output.in') + " " + differenceInDaysForType + " " + this.homey.__('speech.output.days');
		}
	}
}

module.exports = TrashcanReminder;
