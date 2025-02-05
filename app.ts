'use strict';

import Homey from 'homey';
import { ActivityDates, ActivityItem, FlowCardType, TrashFlowCardArgument, When } from './types/localTypes';
import { TrashApis } from './lib/trashapis';
import { CleanApis } from './lib/cleanapis';
import { addDate } from './lib/helpers';
import { ApiSettings, LabelSettings, ManualSetting, ManualSettings, TrashType } from './assets/publicTypes';
import { DateTimeHelper } from './lib/datetimehelper';

// TODO: find solution to import this from the .mts file
const AllTrashTypes: string[] = ['GFT', 'PLASTIC', 'PAPIER', 'PMD', 'REST', 'TEXTIEL', 'GROF', 'KERSTBOOM', 'GLAS'];

module.exports = class TrashCollectionReminder extends Homey.App {
  collectionDates: ActivityDates[] = [];
  cleanDates: ActivityDates[] = [];
  trashApis: TrashApis = new TrashApis(this.log);
  cleanApis: CleanApis = new CleanApis(this.log);

  trashTokenToday!: Homey.FlowToken;
  trashTokenTomorrow!: Homey.FlowToken;
  trashTokenDayAfterTomorrow!: Homey.FlowToken;
  trashTokenAdvancedCollectionDates!: Homey.FlowToken;

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    // Update manual input dates when settings change.
    this.homey.settings.on('set', (settingName) => {
      this.onSettingsChanged(settingName);
    });

    this.homey.settings.on('set', () => {
      this.homey.api.realtime('settings_changed', '{}');
    });

    // Register flow card
    this.homey.flow.getConditionCard('days_to_collect').registerRunListener(async (args) => {
      return this.flowTrashIsCollectedCondition(args);
    });

    this.homey.flow.getActionCard('days_to_collect').registerRunListener(async (args) => {
      return this.flowTrashIsCollectedAction(args);
    });

    this.homey.flow.getConditionCard('days_to_clean').registerRunListener(async (args) => {
      return this.flowTrashIsCleanedCondition(args);
    });

    this.homey.flow.getActionCard('days_to_clean').registerRunListener(async (args) => {
      return this.flowTrashIsCleanedAction(args);
    });

    // Create trash collection tokens (labels)
    this.trashTokenToday = await this.homey.flow.createToken('trash_collection_token_today', {
      type: 'string',
      title: this.homey.__('tokens.trashcollection.today'),
      value: undefined,
    });

    this.trashTokenTomorrow = await this.homey.flow.createToken('trash_collection_token_tomorrow', {
      type: 'string',
      title: this.homey.__('tokens.trashcollection.tomorrow'),
      value: undefined,
    });

    this.trashTokenDayAfterTomorrow = await this.homey.flow.createToken('trash_collection_token_dayaftertomorrow', {
      type: 'string',
      title: this.homey.__('tokens.trashcollection.dayaftertomorrow'),
      value: undefined,
    });

    this.trashTokenAdvancedCollectionDates = await this.homey.flow.createToken('trash_collection_token_advancedcollectiondates', {
      type: 'string',
      title: this.homey.__('tokens.trashcollection.advancedcollectiondates'),
      value: undefined,
    });

    await this.migrateSettings();

    // Update API data every 48 hours
    this.homey.setInterval(() => {
      this.onUpdateData();
    }, 48 * 60 * 60 * 1000);

    // Manually kick off data retrieval
    await this.onUpdateData();
    await this.dailyRefresh();

    this.log('App initialized');
  }

  /* ******************
		FLOW FUNCTIONS
	********************/
  async flowTrashIsCollectedAction(args: TrashFlowCardArgument) {
    args.trash_type = 'ANY';
    return this.flowDaysToCollect(args, FlowCardType.ACTION);
  }

  async flowTrashIsCollectedCondition(args: TrashFlowCardArgument) {
    return this.flowDaysToCollect(args, FlowCardType.CONDITION);
  }

  async flowDaysToCollect(args: TrashFlowCardArgument, type: FlowCardType) {
    let result = false;
    let trashTypeCollected = '';
    let trashTypeCollectedLocalized = '';

    if (!this.collectionDates || this.collectionDates.length === 0) {
      return this.handleResultTrashCollection(type, result, trashTypeCollected, trashTypeCollectedLocalized);
    }

    if (args.trash_type !== 'ANY' && !this.collectionDates.some((x) => x.type === args.trash_type)) {
      var message = this.homey.__('error.typenotsupported.addviasettings');
      this.log(message);
      return this.handleResultTrashCollection(type, result, trashTypeCollected, trashTypeCollectedLocalized);
    }

    var now = await this.getLocalDate();
    if (args.when == When.tomorrow) {
      now.setDate(now.getDate() + 1);
    } else if (args.when == When.datomorrow) {
      now.setDate(now.getDate() + 2);
    }

    const labelSettings = this.homey.settings.get('labelSettings');
    const itemsCollectedToday = await this.findTrashResultsByDate(now);

    if (args.trash_type == 'ANY') {
      if (itemsCollectedToday.length > 0) {
        const firstItem = itemsCollectedToday[0];
        result = true;
        trashTypeCollected = this.homey.__(`widgets.trashType.${firstItem.type}`);
        trashTypeCollectedLocalized = labelSettings?.type?.[firstItem.type] || this.homey.__(`tokens.output.type.${firstItem.type}`);
      }

      return this.handleResultTrashCollection(type, result, trashTypeCollected, trashTypeCollectedLocalized);
    }

    result = itemsCollectedToday.some((x) => x.type === args.trash_type);
    if (result === true) {
      trashTypeCollected = this.homey.__(`widgets.trashType.${args.trash_type}`);
      trashTypeCollectedLocalized = labelSettings?.type?.[args.trash_type] || this.homey.__(`tokens.output.type.${args.trash_type}`);
    }

    return this.handleResultTrashCollection(type, result, trashTypeCollected, trashTypeCollectedLocalized);
  }

  async flowTrashIsCleanedAction(args: TrashFlowCardArgument) {
    args.trash_type = 'ANY';
    return this.flowTrashIsCleaned(args, FlowCardType.ACTION);
  }

  async flowTrashIsCleanedCondition(args: TrashFlowCardArgument) {
    return this.flowTrashIsCleaned(args, FlowCardType.CONDITION);
  }

  async flowTrashIsCleaned(args: TrashFlowCardArgument, type: FlowCardType) {
    let result = false;
    let trashTypeCleaned = '';
    let trashTypeCleanedLocalized = '';

    if (!this.cleanDates || this.cleanDates.length === 0) {
      return this.handleResultTrashCleaning(type, result, trashTypeCleaned, trashTypeCleanedLocalized);
    }

    if (args.trash_type !== 'ANY' && !this.cleanDates.some((x) => x.type === args.trash_type.toUpperCase())) {
      var message = this.homey.__('error.typenotsupported.addviasettings');
      this.log(message);
      return this.handleResultTrashCleaning(type, result, trashTypeCleaned, trashTypeCleanedLocalized);
    }

    var now = await this.getLocalDate();
    if (args.when == When.tomorrow) {
      now.setDate(now.getDate() + 1);
    } else if (args.when == When.datomorrow) {
      now.setDate(now.getDate() + 2);
    }

    const labelSettings = this.homey.settings.get('labelSettings');
    const itemsCleanedToday = await this.findCleanResultsByDate(now);

    if (args.trash_type == 'ANY') {
      if (itemsCleanedToday.length > 0) {
        const firstItem = itemsCleanedToday[0];
        result = true;
        trashTypeCleaned = this.homey.__(`widgets.trashType.${firstItem.type}`);
        trashTypeCleanedLocalized = labelSettings?.type?.[firstItem.type] || this.homey.__(`tokens.output.type.${firstItem.type}`);
      }

      return this.handleResultTrashCleaning(type, result, trashTypeCleaned, trashTypeCleanedLocalized);
    }

    result = itemsCleanedToday.some((x) => x.type === args.trash_type);
    if (result === true) {
      trashTypeCleaned = this.homey.__(`widgets.trashType.${args.trash_type}`);
      trashTypeCleanedLocalized = labelSettings?.type?.[args.trash_type] || this.homey.__(`tokens.output.type.${args.trash_type}`);
    }

    return this.handleResultTrashCleaning(type, result, trashTypeCleaned, trashTypeCleanedLocalized);
  }

  /* ******************
		EVENT HANDLERS
  ********************/
  async onSettingsChanged(settingName: string): Promise<string | void> {
    this.log('App setings where changed: ', settingName);

    // Do something with the fact that the settings where changed
    if (settingName === 'labelSettings') {
      await this.onUpdateLabel();
    }
  }

  async onUpdateData() {
    this.log(`Start refreshing data`);

    let settingsUpdated = false;
    let collectionDays: ActivityDates[] = [];
    let cleaningDays: ActivityDates[] = [];
    const apiSettings = <ApiSettings>this.homey.settings.get('apiSettings');

    if (!apiSettings?.housenumber && !apiSettings?.zipcode && !apiSettings?.zipcode) {
      this.cleanDates = cleaningDays;
      this.collectionDates = collectionDays;

      await this.calculateManualDays();
      return false;
    }

    if (!apiSettings?.apiId) {
      const apiResult = await this.trashApis.FindApi(apiSettings);
      if (apiResult.id !== '') {
        apiSettings.apiId = apiResult.id;
        collectionDays = apiResult.days;
        settingsUpdated = true;
      } else {
        apiSettings.apiId = 'not-applicable';
        settingsUpdated = true;
      }
    } else if (apiSettings?.apiId !== 'not-applicable') {
      try {
        collectionDays = await this.trashApis.ExecuteApi(apiSettings);
      } catch (error) {
        this.log(error);
      }
    }

    if (!apiSettings?.cleanApiId && apiSettings?.cleanApiId !== 'not-applicable') {
      const apiResult = await this.cleanApis.FindApi(apiSettings);
      if (apiResult.id !== '') {
        apiSettings.cleanApiId = apiResult.id;
        cleaningDays = apiResult.days;
        settingsUpdated = true;
      } else {
        apiSettings.cleanApiId = 'not-applicable';
        settingsUpdated = true;
      }
    } else if (apiSettings?.cleanApiId !== 'not-applicable') {
      try {
        cleaningDays = await this.cleanApis.ExecuteApi(apiSettings);
      } catch (error) {
        this.log(error);
      }
    }

    this.cleanDates = cleaningDays;
    this.collectionDates = collectionDays;

    await this.calculateManualDays();

    if (settingsUpdated) {
      this.homey.settings.set('apiSettings', apiSettings);
    }

    return true;
  }

  async onUpdateLabel() {
    var labelSettings = <LabelSettings>this.homey.settings.get('labelSettings');

    const todayLabel = await this.getLabel(labelSettings, 0);
    const tomorrowLabel = await this.getLabel(labelSettings, 1);
    const dayAfterTomorrowLabel = await this.getLabel(labelSettings, 2);

    await this.trashTokenToday.setValue(todayLabel);
    await this.trashTokenTomorrow.setValue(tomorrowLabel);
    await this.trashTokenDayAfterTomorrow.setValue(dayAfterTomorrowLabel);
    await this.trashTokenAdvancedCollectionDates.setValue(JSON.stringify(this.collectionDates));

    this.log('Labels updated');
    return true;
  }

  async calculateManualDays() {
    // Parse manual settings
    const manualSettings = <ManualSettings>this.homey.settings.get('manualEntryData');

    if (manualSettings !== null) {
      for (let type in AllTrashTypes) {
        const trashType = AllTrashTypes[type] as keyof ManualSettings;
        if (!(trashType in manualSettings)) continue;

        const manualSetting = manualSettings[trashType];
        await this.calculateManualDay(manualSetting, trashType as TrashType);
      }
    }

    // Parse manual additions
    const manualAdditions = this.homey.settings.get('manualAdditions');
    for (let type in AllTrashTypes) {
      const trashType = <TrashType>AllTrashTypes[type];
      if (!manualAdditions?.[trashType]) continue;

      for (let index in manualAdditions[trashType]) {
        addDate(this.collectionDates, trashType, new Date(manualAdditions[trashType][index]));
      }
    }

    // After everything, force an update of the label
    await this.onUpdateLabel();
  }

  async dailyRefresh() {
    await this.onUpdateLabel(); // Update labels on daily interval
    this.homey.api.realtime('settings_changed', '{}'); // Trigger daily widget refresh

    // Set new timeout to midnight
    const localDate = await this.getLocalDate();
    const msToMidnight = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate() + 1, 0, 0, 0, 0).getTime() - localDate.getTime();

    this.homey.setTimeout(() => {
      this.dailyRefresh();
    }, msToMidnight + 1000);
  }

  // Recalculates the whole set of dates based on the latest settings
  async recalculate() {
    await this.onUpdateData();
  }

  /*******************
		GENERAL FUNCTIONS
	********************/
  // Retrieves the local Homey date
  async getLocalDate(): Promise<Date> {
    const timezone = this.homey.clock.getTimezone();
    var date = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    return date;
  }

  // Function to find all trash events on a specified date
  async findTrashResultsByDate(targetDate: Date): Promise<ActivityItem[]> {
    return this.findResultsByDate(this.collectionDates, targetDate);
  }

  // Function to find all clean events on a specified date
  async findCleanResultsByDate(targetDate: Date): Promise<ActivityItem[]> {
    return this.findResultsByDate(this.cleanDates, targetDate);
  }

  // Function to find all events on a specified date
  async findResultsByDate(dates: ActivityDates[], targetDate: Date): Promise<ActivityItem[]> {
    // Normalize the target date to avoid time mismatches
    const normalizedTargetDate = new Date(targetDate.toDateString()).getTime();

    // Filter and map the dates array to get matching collection items
    const collectionItems = dates.flatMap((collectionDate) =>
      collectionDate.dates
        .filter((date) => new Date(date).setHours(0, 0, 0, 0) === normalizedTargetDate)
        .map((date) => ({
          type: collectionDate.type,
          icon: collectionDate.icon,
          color: collectionDate.color,
          localText: collectionDate.localText,
          activityDate: new Date(date),
        })),
    );

    return collectionItems;
  }

  // Function to get the label for a specific date
  async getLabel(labelSettings: LabelSettings, timeIndicator: number) {
    const checkDate = await this.getLocalDate();
    checkDate.setDate(checkDate.getDate() + timeIndicator);

    const items = await this.findTrashResultsByDate(checkDate);

    const timeReplacement = this.homey.__('tokens.output.timeindicator.t' + timeIndicator);
    let alternativeTextLabel = labelSettings?.generic;
    let outputText = '';

    if (!alternativeTextLabel || alternativeTextLabel === '') {
      alternativeTextLabel = this.homey.__('tokens.output.trashtypeycollectedonx');
    }

    if (items.length > 1) {
      let multiTypeString = '';
      for (var i = 0, len = items.length; i < len; i++) {
        multiTypeString +=
          (labelSettings?.[items[i]?.type]?.trashLong || this.homey.__(`tokens.output.type.${items[0].type}`)) +
          (i < len - 2 ? ', ' : i == len - 2 ? ' ' + this.homey.__('tokens.output.and') + ' ' : '');
      }

      outputText = alternativeTextLabel.replace('__time__', timeReplacement).replace('__type__', multiTypeString).replace('__plural__', this.homey.__('tokens.output.replacementplural'));
    } else {
      let textLabel = labelSettings?.['NONE']?.trashLong || this.homey.__('tokens.output.type.NONE');
      if (items.length === 1) {
        textLabel = labelSettings?.[items[0]?.type]?.trashLong || this.homey.__(`tokens.output.type.${items[0].type}`);
      }

      outputText = alternativeTextLabel.replace('__time__', timeReplacement).replace('__type__', textLabel).replace('__plural__', this.homey.__('tokens.output.replacementsingle'));
    }

    return outputText;
  }

  // Generic function to give proper result back to the flow
  async handleResultTrashCollection(type: FlowCardType, result: boolean, trashType: string, trashTypeLocalized: string) {
    if (type === FlowCardType.CONDITION) {
      return result;
    }

    return {
      isCollected: result,
      trashType,
      trashTypeLocalized,
    };
  }

  // Generic function to give proper result back to the flow
  async handleResultTrashCleaning(type: FlowCardType, result: boolean, trashType: string, trashTypeLocalized: string) {
    if (type === FlowCardType.CONDITION) {
      return result;
    }

    return {
      isCleaned: result,
      trashType,
      trashTypeLocalized,
    };
  }

  async calculateManualDay(manualSetting: ManualSetting, trashType: TrashType) {
    if (!manualSetting || manualSetting.option === 0) {
      return;
    }

    // When user set option to not applicable, clear any dates that we already automatically found, to prevent faulty manual setting data
    const currentDates = this.collectionDates.find((x) => x.type === trashType);
    if (currentDates !== undefined && currentDates !== null) {
      currentDates.color = undefined;
      currentDates.localText = undefined;
      currentDates.icon = undefined;
      currentDates.dates = [];
    }

    // Skip settings when N/A or Automatic
    if (manualSetting.option <= 0) {
      return;
    }

    const currentDate = await this.getLocalDate();
    const startDate = manualSetting.startdate !== null && manualSetting.startdate !== '' ? new Date(manualSetting.startdate ?? '') : new Date();

    const firstDayInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const previousMonth = new Date(new Date(firstDayInCurrentMonth).setMonth(firstDayInCurrentMonth.getMonth() - 1));
    const nextMonth = new Date(new Date(firstDayInCurrentMonth).setMonth(firstDayInCurrentMonth.getMonth() + 1));
    const afterNextMonth = new Date(new Date(firstDayInCurrentMonth).setMonth(firstDayInCurrentMonth.getMonth() + 2));

    if (manualSetting.option >= 11 && manualSetting.option <= 14) {
      // every x-th week of month/quarter/year
      var nThWeek = manualSetting.option - 10;
      var date1 = await this.getLocalDate();
      var date2 = await this.getLocalDate();
      var date3 = await this.getLocalDate();

      if (manualSetting.option_extension == 12) {
        // every x-th week of the year
        date1 = DateTimeHelper.nthDayInMonth(nThWeek, manualSetting.day, 0, currentDate.getFullYear() - 1);
        date2 = DateTimeHelper.nthDayInMonth(nThWeek, manualSetting.day, 0, currentDate.getFullYear());
        date3 = DateTimeHelper.nthDayInMonth(nThWeek, manualSetting.day, 0, currentDate.getFullYear() + 1);
      } else if (manualSetting.option_extension == 3) {
        // every x-th week of the quarter
        var currentQuarter = (currentDate.getMonth() - ((currentDate.getMonth() + 3) % 3)) / 3;
        var currentQuarterStart = new Date(currentDate.getFullYear(), currentQuarter * 3, 1);
        var previousQuarterStart = new Date(new Date(currentQuarterStart).setMonth(currentQuarterStart.getMonth() - 3));
        var nextQuarterStart = new Date(new Date(currentQuarterStart).setMonth(currentQuarterStart.getMonth() + 3));

        date1 = DateTimeHelper.nthDayInMonth(nThWeek, manualSetting.day, previousQuarterStart.getMonth(), previousQuarterStart.getFullYear());
        date2 = DateTimeHelper.nthDayInMonth(nThWeek, manualSetting.day, currentQuarterStart.getMonth(), currentQuarterStart.getFullYear());
        date3 = DateTimeHelper.nthDayInMonth(nThWeek, manualSetting.day, nextQuarterStart.getMonth(), nextQuarterStart.getFullYear());
      } else if (manualSetting.option_extension == 2) {
        // every x-th week of the other month
        // We need to know the start date (if it's in an even or uneven month)
        var oddOrEvenMonth = startDate.getMonth() % 2;

        // Then we calculate up to 6 months ahead
        for (var i = -2, weekCounter = 6; i < weekCounter; i++) {
          var monthToCalculateWith = new Date(new Date(firstDayInCurrentMonth).setMonth(firstDayInCurrentMonth.getMonth() + i));
          var calculatedDate = DateTimeHelper.nthDayInMonth(nThWeek, manualSetting.day, monthToCalculateWith.getMonth(), monthToCalculateWith.getFullYear());
          if (calculatedDate.getMonth() % 2 === oddOrEvenMonth) {
            addDate(this.collectionDates, trashType, calculatedDate);
          }
        }

        return;
      } // every x-th week of the month
      else {
        date1 = DateTimeHelper.nthDayInMonth(nThWeek, manualSetting.day, previousMonth.getMonth(), previousMonth.getFullYear());
        date2 = DateTimeHelper.nthDayInMonth(nThWeek, manualSetting.day, firstDayInCurrentMonth.getMonth(), firstDayInCurrentMonth.getFullYear());
        date3 = DateTimeHelper.nthDayInMonth(nThWeek, manualSetting.day, nextMonth.getMonth(), nextMonth.getFullYear());
      }

      addDate(this.collectionDates, trashType, date1);
      addDate(this.collectionDates, trashType, date2);
      addDate(this.collectionDates, trashType, date3);
    } else if (manualSetting.option <= 8) {
      // per week
      addDate(this.collectionDates, trashType, DateTimeHelper.everyNthWeek(manualSetting.option, manualSetting.day, startDate, currentDate, -2));
      addDate(this.collectionDates, trashType, DateTimeHelper.everyNthWeek(manualSetting.option, manualSetting.day, startDate, currentDate, -1));
      addDate(this.collectionDates, trashType, DateTimeHelper.everyNthWeek(manualSetting.option, manualSetting.day, startDate, currentDate, 0));
      addDate(this.collectionDates, trashType, DateTimeHelper.everyNthWeek(manualSetting.option, manualSetting.day, startDate, currentDate, 1));
      addDate(this.collectionDates, trashType, DateTimeHelper.everyNthWeek(manualSetting.option, manualSetting.day, startDate, currentDate, 2));
    } else if (manualSetting.option >= 19 && manualSetting.option <= 20) {
      // every last, every second last
      var nthLastWeekOf = manualSetting.option - 18;

      var date1 = await this.getLocalDate();
      var date2 = await this.getLocalDate();
      var date3 = await this.getLocalDate();
      var date4 = await this.getLocalDate();

      if (manualSetting.option_extension == 12) {
        // every x-th last week of the year
        date1 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, manualSetting.day, 0, currentDate.getFullYear() - 1);
        date2 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, manualSetting.day, 0, currentDate.getFullYear());
        date3 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, manualSetting.day, 0, currentDate.getFullYear() + 1);
        date4 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, manualSetting.day, 0, currentDate.getFullYear() + 2);
      } else if (manualSetting.option_extension == 3) {
        // every x-th last week of the quarter
        var currentQuarter = (currentDate.getMonth() - ((currentDate.getMonth() + 3) % 3)) / 3;
        var currentQuarterStart = new Date(currentDate.getFullYear(), currentQuarter * 3, 1);
        var previousQuarterStart = new Date(new Date(currentQuarterStart).setMonth(currentQuarterStart.getMonth() - 3));
        var nextQuarterStart = new Date(new Date(currentQuarterStart).setMonth(currentQuarterStart.getMonth() + 3));
        var overNextQuarterStart = new Date(new Date(currentQuarterStart).setMonth(currentQuarterStart.getMonth() + 6));

        date1 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, manualSetting.day, previousQuarterStart.getMonth(), previousQuarterStart.getFullYear());
        date2 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, manualSetting.day, currentQuarterStart.getMonth(), currentQuarterStart.getFullYear());
        date3 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, manualSetting.day, nextQuarterStart.getMonth(), nextQuarterStart.getFullYear());
        date4 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, manualSetting.day, overNextQuarterStart.getMonth(), overNextQuarterStart.getFullYear());
      } // every x-th last week of the month
      else {
        date1 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, manualSetting.day, previousMonth.getMonth(), previousMonth.getFullYear());
        date2 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, manualSetting.day, firstDayInCurrentMonth.getMonth(), firstDayInCurrentMonth.getFullYear());
        date3 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, manualSetting.day, nextMonth.getMonth(), nextMonth.getFullYear());
        date4 = DateTimeHelper.nthLastDayInMonth(nthLastWeekOf, manualSetting.day, afterNextMonth.getMonth(), afterNextMonth.getFullYear());
      }

      addDate(this.collectionDates, trashType, date1);
      addDate(this.collectionDates, trashType, date2);
      addDate(this.collectionDates, trashType, date3);
      addDate(this.collectionDates, trashType, date4);
    }
  }

  // Function to help migrate settings from the old settings structure to the new to make for an easy upgrade
  async migrateSettings() {
    this.log('Checking for migration.');

    const zipCode = this.homey.settings.get('postcode');
    const hNumber = this.homey.settings.get('hnumber');

    if (!zipCode || !hNumber) {
      return;
    }

    this.log('Starting migration of settings.');

    const country = this.homey.settings.get('country');
    const apiId = this.homey.settings.get('apiId');
    const cleanApiId = this.homey.settings.get('cleanApiId');
    const streetName = this.homey.settings.get('streetName');
    const oldManualSettings = this.homey.settings.get('manualEntryData');
    const oldLabelSettings = this.homey.settings.get('labelSettings');

    const apiSettings: ApiSettings = {
      apiId: apiId,
      cleanApiId: cleanApiId,
      zipcode: zipCode,
      housenumber: hNumber,
      streetname: streetName,
      country: country,
    };

    this.homey.settings.set('apiSettings', apiSettings);

    const labelSettings: LabelSettings = {
      timeindicator: oldLabelSettings.timeindicator,
      generic: oldLabelSettings.generic,
      GFT: { trashLong: oldLabelSettings?.gft || this.homey.__('tokens.output.type.GFT') },
      REST: { trashLong: oldLabelSettings?.rest || this.homey.__('tokens.output.type.REST') },
      PMD: { trashLong: oldLabelSettings?.pmd || this.homey.__('tokens.output.type.PMD') },
      PLASTIC: { trashLong: oldLabelSettings?.plastic || this.homey.__('tokens.output.type.PLASTIC') },
      PAPIER: { trashLong: oldLabelSettings?.papier || this.homey.__('tokens.output.type.PAPIER') },
      TEXTIEL: { trashLong: oldLabelSettings?.textiel || this.homey.__('tokens.output.type.TEXTIEL') },
      GROF: { trashLong: oldLabelSettings?.grof || this.homey.__('tokens.output.type.GROF') },
      GLAS: { trashLong: oldLabelSettings?.glas || this.homey.__('tokens.output.type.GLAS') },
      KERSTBOOM: { trashLong: oldLabelSettings?.kerstboom || this.homey.__('tokens.output.type.KERSTBOOM') },
      NONE: { trashLong: oldLabelSettings?.none || this.homey.__('tokens.output.type.NONE') },
    };

    this.homey.settings.set('labelSettings', labelSettings);

    const manualSettings: ManualSettings = {
      GFT: oldManualSettings?.gft,
      PLASTIC: oldManualSettings?.plastic,
      PAPIER: oldManualSettings?.paper,
      PMD: oldManualSettings?.pmd,
      REST: oldManualSettings?.rest,
      TEXTIEL: oldManualSettings?.textile,
      GROF: oldManualSettings?.bulky,
      GLAS: oldManualSettings?.glas,
    };

    this.homey.settings.set('manualEntryData', manualSettings);

    this.homey.settings.unset('postcode');
    this.homey.settings.unset('hnumber');
    this.homey.settings.unset('country');
    this.homey.settings.unset('apiId');
    this.homey.settings.unset('cleanApiId');
    this.homey.settings.unset('streetName');
    this.homey.settings.unset('cleaningDays');
    this.homey.settings.unset('collectingDays');
    this.homey.settings.unset('manualAdditions');
  }
};
