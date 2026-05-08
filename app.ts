'use strict';

import Homey from 'homey';
import { ActivityDates, ActivityItem, FlowCardType, TrashFlowCardArgument, When } from './types/localTypes';
import { TrashApis } from './lib/trashapis';
import { CleanApis } from './lib/cleanapis';
import { addDate } from './lib/helpers';
import { ApiSettings, LabelSettings, ManualSetting, ManualSettings, TrashType } from './assets/publicTypes';
import { DateTimeHelper } from './lib/datetimehelper';

const AllTrashTypes = Object.freeze(['GFT', 'PLASTIC', 'PAPIER', 'PMD', 'REST', 'TEXTIEL', 'GROF', 'KERSTBOOM', 'GLAS'] as const);
const CapabilityTrashTypes = Object.freeze(['GFT', 'PLASTIC', 'PAPIER', 'PMD', 'REST', 'TEXTIEL', 'GROF', 'GLAS', 'KCA', 'SNOEI', 'KERSTBOOM'] as const);
const TrashTypeCapabilityMap: Record<TrashType, string> = {
  GFT: 'trash_collection_gft',
  GLAS: 'trash_collection_glas',
  GROF: 'trash_collection_grof',
  KCA: 'trash_collection_kca',
  PAPIER: 'trash_collection_papier',
  PLASTIC: 'trash_collection_plastic',
  PMD: 'trash_collection_pmd',
  REST: 'trash_collection_rest',
  SNOEI: 'trash_collection_snoei',
  TEXTIEL: 'trash_collection_textiel',
  KERSTBOOM: 'trash_collection_kerstboom',
};
const SingleTypeDeviceCapabilities = Object.freeze({
  nextCollectionOn: 'trash_collection_next_on',
  followingCollectionOn: 'trash_collection_following_on',
});

module.exports = class TrashCollectionReminder extends Homey.App {
  collectionDates: ActivityDates[] = [];
  cleanDates: ActivityDates[] = [];
  collectionDatesByAddress: Map<string, ActivityDates[]> = new Map<string, ActivityDates[]>();
  cleanDatesByAddress: Map<string, ActivityDates[]> = new Map<string, ActivityDates[]>();
  deviceAddressLookup: Map<string, string> = new Map<string, string>();
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
    await this.migrateApiSettingsStorage();

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

    // Update API data every 48 hours
    this.homey.setInterval(
      () => {
        this.onUpdateData();
      },
      48 * 60 * 60 * 1000,
    );

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
    return this.flowDaysToCollect(args, FlowCardType.ACTION, this.collectionDates);
  }

  async flowTrashIsCollectedCondition(args: TrashFlowCardArgument) {
    return this.flowDaysToCollect(args, FlowCardType.CONDITION, this.collectionDates);
  }

  async flowTrashIsCollectedForDeviceAction(args: TrashFlowCardArgument, state?: any) {
    args.trash_type = 'ANY';
    const addressSignature = this.resolveFlowAddressSignature(args, state);
    return this.flowDaysToCollect(args, FlowCardType.ACTION, this.collectionDatesByAddress.get(addressSignature) || []);
  }

  async flowTrashIsCollectedForDeviceCondition(args: TrashFlowCardArgument, state?: any) {
    const addressSignature = this.resolveFlowAddressSignature(args, state);
    return this.flowDaysToCollect(args, FlowCardType.CONDITION, this.collectionDatesByAddress.get(addressSignature) || []);
  }

  async flowTrashTypeIsCollectedForDeviceAction(args: TrashFlowCardArgument, state?: any) {
    const trashType = this.resolveFlowTrashType(args, state);
    if (!trashType) {
      return this.handleResultTrashCollection(FlowCardType.ACTION, false, '', '');
    }

    args.trash_type = trashType;
    const addressSignature = this.resolveFlowAddressSignature(args, state);
    return this.flowDaysToCollect(args, FlowCardType.ACTION, this.collectionDatesByAddress.get(addressSignature) || []);
  }

  async flowTrashTypeIsCollectedForDeviceCondition(args: TrashFlowCardArgument, state?: any) {
    const trashType = this.resolveFlowTrashType(args, state);
    if (!trashType) {
      return false;
    }

    args.trash_type = trashType;
    const addressSignature = this.resolveFlowAddressSignature(args, state);
    return this.flowDaysToCollect(args, FlowCardType.CONDITION, this.collectionDatesByAddress.get(addressSignature) || []);
  }

  async flowDaysToCollect(args: TrashFlowCardArgument, type: FlowCardType, dates: ActivityDates[]) {
    let result = false;
    let trashTypeCollected = '';
    let trashTypeCollectedLocalized = '';

    if (!dates || dates.length === 0) {
      return this.handleResultTrashCollection(type, result, trashTypeCollected, trashTypeCollectedLocalized);
    }

    if (args.trash_type !== 'ANY' && !dates.some((x) => x.type === args.trash_type)) {
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
    const itemsCollectedToday = await this.findResultsByDate(dates, now);

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
    return this.flowTrashIsCleaned(args, FlowCardType.ACTION, this.cleanDates);
  }

  async flowTrashIsCleanedCondition(args: TrashFlowCardArgument) {
    return this.flowTrashIsCleaned(args, FlowCardType.CONDITION, this.cleanDates);
  }

  async flowTrashIsCleanedForDeviceAction(args: TrashFlowCardArgument, state?: any) {
    args.trash_type = 'ANY';
    const addressSignature = this.resolveFlowAddressSignature(args, state);
    return this.flowTrashIsCleaned(args, FlowCardType.ACTION, this.cleanDatesByAddress.get(addressSignature) || []);
  }

  async flowTrashIsCleanedForDeviceCondition(args: TrashFlowCardArgument, state?: any) {
    const addressSignature = this.resolveFlowAddressSignature(args, state);
    return this.flowTrashIsCleaned(args, FlowCardType.CONDITION, this.cleanDatesByAddress.get(addressSignature) || []);
  }

  async flowTrashTypeIsCleanedForDeviceAction(args: TrashFlowCardArgument, state?: any) {
    const trashType = this.resolveFlowTrashType(args, state);
    if (!trashType) {
      return this.handleResultTrashCleaning(FlowCardType.ACTION, false, '', '');
    }

    args.trash_type = trashType;
    const addressSignature = this.resolveFlowAddressSignature(args, state);
    return this.flowTrashIsCleaned(args, FlowCardType.ACTION, this.cleanDatesByAddress.get(addressSignature) || []);
  }

  async flowTrashTypeIsCleanedForDeviceCondition(args: TrashFlowCardArgument, state?: any) {
    const trashType = this.resolveFlowTrashType(args, state);
    if (!trashType) {
      return false;
    }

    args.trash_type = trashType;
    const addressSignature = this.resolveFlowAddressSignature(args, state);
    return this.flowTrashIsCleaned(args, FlowCardType.CONDITION, this.cleanDatesByAddress.get(addressSignature) || []);
  }

  async flowTrashIsCleaned(args: TrashFlowCardArgument, type: FlowCardType, dates: ActivityDates[]) {
    let result = false;
    let trashTypeCleaned = '';
    let trashTypeCleanedLocalized = '';

    if (!dates || dates.length === 0) {
      return this.handleResultTrashCleaning(type, result, trashTypeCleaned, trashTypeCleanedLocalized);
    }

    if (args.trash_type !== 'ANY' && !dates.some((x) => x.type === args.trash_type.toUpperCase())) {
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
    const itemsCleanedToday = await this.findResultsByDate(dates, now);

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

  private resolveFlowAddressSignature(args: TrashFlowCardArgument, state?: any): string {
    const addressDeviceArg = this.resolveFlowDevice(args, state);
    if (!addressDeviceArg) return '';

    const fromSettings = this.getDeviceAddressSignature(addressDeviceArg);
    if (fromSettings) {
      return fromSettings;
    }

    const fromGetData = addressDeviceArg.getData?.()?.addressSignature || addressDeviceArg.getData?.()?.id;
    if (typeof fromGetData === 'string' && fromGetData !== '') {
      return fromGetData;
    }

    const fromData = addressDeviceArg.data?.id;
    if (typeof fromData === 'string' && fromData !== '') {
      return fromData;
    }

    const argId = String(addressDeviceArg.id || '');
    if (argId.startsWith('trash-address-') || argId.startsWith('trash-type-address-')) {
      return argId;
    }

    return this.deviceAddressLookup.get(argId) || '';
  }

  private resolveFlowTrashType(args: TrashFlowCardArgument, state?: any): TrashType | undefined {
    const addressDeviceArg = this.resolveFlowDevice(args, state);
    if (!addressDeviceArg) {
      return undefined;
    }

    const fromGetSettings = addressDeviceArg.getSettings?.()?.trashType;
    if (typeof fromGetSettings === 'string' && fromGetSettings !== '') {
      return fromGetSettings as TrashType;
    }

    const fromSettings = addressDeviceArg.settings?.trashType;
    if (typeof fromSettings === 'string' && fromSettings !== '') {
      return fromSettings as TrashType;
    }

    return undefined;
  }

  private resolveFlowDevice(args: TrashFlowCardArgument, state?: any): any {
    return args.address_device || args.device || state?.device || state;
  }

  private getDeviceAddressSignature(deviceLike: any): string {
    const settings = deviceLike?.getSettings?.() || deviceLike?.settings;
    if (!settings) {
      return '';
    }

    const normalized = this.normalizeApiSettings(settings);
    if (!this.hasAddressInput(normalized)) {
      return '';
    }

    return this.createAddressSignature(normalized);
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

    await this.refreshDeviceAddressLookup();

    let settingsUpdated = false;
    const settingsList = this.getApiSettingsList();
    const collectionDatesByAddress = new Map<string, ActivityDates[]>();
    const cleanDatesByAddress = new Map<string, ActivityDates[]>();

    if (settingsList.length === 0) {
      this.cleanDatesByAddress = cleanDatesByAddress;
      this.collectionDatesByAddress = collectionDatesByAddress;
      this.cleanDates = [];
      this.collectionDates = [];

      await this.calculateManualDays();
      return false;
    }

    for (let index = 0; index < settingsList.length; index += 1) {
      const apiSettings = settingsList[index];
      const addressKey = this.createAddressSignature(apiSettings);
      let collectionDays: ActivityDates[] = [];
      let cleaningDays: ActivityDates[] = [];

      if (!this.hasAddressInput(apiSettings)) {
        collectionDatesByAddress.set(addressKey, collectionDays);
        cleanDatesByAddress.set(addressKey, cleaningDays);
        continue;
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
          const shouldRediscover = this.shouldRediscoverApiForError(error);
          if (!shouldRediscover) {
            this.log(error);
          }

          if (shouldRediscover) {
            try {
              const fallbackResult = await this.trashApis.FindApi({ ...apiSettings, apiId: '' });
              if (fallbackResult.id !== '') {
                apiSettings.apiId = fallbackResult.id;
                collectionDays = fallbackResult.days;
              } else {
                apiSettings.apiId = 'not-applicable';
              }
              settingsUpdated = true;
            } catch (fallbackError) {
              this.log('Failed rediscovery after trash API execution error', fallbackError);
            }
          }
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
          const shouldRediscover = this.shouldRediscoverApiForError(error);
          if (!shouldRediscover) {
            this.log(error);
          }

          if (shouldRediscover) {
            try {
              const fallbackResult = await this.cleanApis.FindApi({ ...apiSettings, cleanApiId: '' });
              if (fallbackResult.id !== '') {
                apiSettings.cleanApiId = fallbackResult.id;
                cleaningDays = fallbackResult.days;
              } else {
                apiSettings.cleanApiId = 'not-applicable';
              }
              settingsUpdated = true;
            } catch (fallbackError) {
              this.log('Failed rediscovery after clean API execution error', fallbackError);
            }
          }
        }
      }

      settingsList[index] = apiSettings;
      collectionDatesByAddress.set(addressKey, collectionDays);
      cleanDatesByAddress.set(addressKey, cleaningDays);
    }

    this.collectionDatesByAddress = collectionDatesByAddress;
    this.cleanDatesByAddress = cleanDatesByAddress;

    this.collectionDates = this.mergeAddressDates(collectionDatesByAddress);
    this.cleanDates = this.mergeAddressDates(cleanDatesByAddress);

    await this.calculateManualDays();
    await this.updateAddressDeviceCapabilities();
    await this.updateTrashTypeDeviceCapabilities();

    if (settingsUpdated) {
      this.homey.settings.set('apiSettingsList', settingsList);
      this.homey.settings.set('apiSettings', settingsList[0]);
    }

    return true;
  }

  private normalizeApiSettings(input: any): ApiSettings {
    return {
      apiId: input?.apiId || '',
      cleanApiId: input?.cleanApiId || '',
      zipcode: String(input?.zipcode || '')
        .trim()
        .replace(/\s+/g, '')
        .toUpperCase(),
      housenumber: String(input?.housenumber || '').trim(),
      streetname: String(input?.streetname || '').trim(),
      cityname: String(input?.cityname || '').trim(),
      country: String(input?.country || 'NL')
        .trim()
        .toUpperCase(),
      countyId: String(input?.countyId || '').trim() || undefined,
      apiKey: String(input?.apiKey || '').trim() || undefined,
    };
  }

  private shouldRediscoverApiForError(error: unknown): boolean {
    const msg = String((error as any)?.message || error || '').toLowerCase();
    return msg.includes('no zipcode found') || msg.includes('invalid zipcode') || msg.includes('postal code not identified') || msg.includes('no trash data found');
  }

  private hasAddressInput(settings: ApiSettings): boolean {
    return settings.zipcode.trim() !== '' || settings.housenumber.trim() !== '' || settings.streetname.trim() !== '' || settings.cityname.trim() !== '';
  }

  private getApiSettingsList(): ApiSettings[] {
    const list = this.homey.settings.get('apiSettingsList');
    if (!Array.isArray(list)) {
      return [];
    }

    return list.map((item) => this.normalizeApiSettings(item)).filter((item) => this.hasAddressInput(item));
  }

  private createAddressSignature(settings: ApiSettings): string {
    return ['trash-address', settings.country, settings.zipcode, settings.housenumber, settings.streetname, settings.cityname]
      .map((x) =>
        String(x || '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-'),
      )
      .join('-');
  }

  private mergeAddressDates(source: Map<string, ActivityDates[]>): ActivityDates[] {
    const typeMap = new Map<TrashType, ActivityDates>();

    for (const dates of source.values()) {
      for (const entry of dates) {
        const existing = typeMap.get(entry.type);
        if (!existing) {
          typeMap.set(entry.type, {
            type: entry.type,
            icon: entry.icon,
            color: entry.color,
            localText: entry.localText,
            dates: [...entry.dates],
          });
          continue;
        }

        existing.icon = existing.icon || entry.icon;
        existing.color = existing.color || entry.color;
        existing.localText = existing.localText || entry.localText;
        existing.dates.push(...entry.dates);
      }
    }

    for (const entry of typeMap.values()) {
      const deduplicated = Array.from(new Set(entry.dates.map((d) => new Date(d).setHours(0, 0, 0, 0))));
      entry.dates = deduplicated.map((d) => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
    }

    return Array.from(typeMap.values());
  }

  private async refreshDeviceAddressLookup() {
    const lookup = new Map<string, string>();

    try {
      const driver = this.homey.drivers.getDriver('trash_address');
      if (driver) {
        const devices = await driver.getDevices();
        for (const [deviceId, device] of Object.entries(devices)) {
          const dataId = this.getDeviceAddressSignature(device) || String(device.getData()?.addressSignature || device.getData()?.id || '');
          if (dataId) {
            lookup.set(deviceId, dataId);
          }
        }
      }

      const singleTypeDriver = this.homey.drivers.getDriver('trash_type_address');
      if (singleTypeDriver) {
        const devices = await singleTypeDriver.getDevices();
        for (const [deviceId, device] of Object.entries(devices)) {
          const dataId = this.getDeviceAddressSignature(device) || String(device.getData()?.addressSignature || device.getData()?.id || '');
          if (dataId) {
            lookup.set(deviceId, dataId);
          }
        }
      }
    } catch (error) {
      const message = String((error as any)?.message || error || '');
      if (!message.includes('Driver Not Initialized')) {
        this.log('Failed to refresh device address lookup', error);
      }
    }

    this.deviceAddressLookup = lookup;
  }

  private getPrimaryApiSettings(): ApiSettings {
    const settingsList = this.getApiSettingsList();
    if (settingsList.length > 0) {
      this.homey.settings.set('apiSettings', settingsList[0]);
      return settingsList[0];
    }

    return this.normalizeApiSettings(this.homey.settings.get('apiSettings'));
  }

  private async migrateApiSettingsStorage() {
    const rawList = this.homey.settings.get('apiSettingsList');
    const rawSingle = this.homey.settings.get('apiSettings');

    let normalizedList: ApiSettings[] = [];
    if (Array.isArray(rawList)) {
      normalizedList = rawList.map((item) => this.normalizeApiSettings(item)).filter((item) => this.hasAddressInput(item));
    }

    if (normalizedList.length === 0 && rawSingle) {
      const normalizedSingle = this.normalizeApiSettings(rawSingle);
      if (this.hasAddressInput(normalizedSingle)) {
        normalizedList = [normalizedSingle];
      }
    }

    if (normalizedList.length > 0) {
      this.homey.settings.set('apiSettingsList', normalizedList);
      this.homey.settings.set('apiSettings', normalizedList[0]);
      return;
    }

    this.homey.settings.set('apiSettingsList', []);
    this.homey.settings.set('apiSettings', this.normalizeApiSettings(rawSingle));
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
    this.applyManualAdditions(this.collectionDates, manualAdditions);

    for (const datesForAddress of this.collectionDatesByAddress.values()) {
      this.applyManualAdditions(datesForAddress, manualAdditions);
    }

    // Manual removals have the highest priority and are applied after all generated/manual-added dates.
    const manualRemovals = this.homey.settings.get('manualRemovals');
    this.applyManualRemovals(this.collectionDates, manualRemovals);

    for (const datesForAddress of this.collectionDatesByAddress.values()) {
      this.applyManualRemovals(datesForAddress, manualRemovals);
    }

    this.normalizeActivityDates(this.collectionDates);
    for (const datesForAddress of this.collectionDatesByAddress.values()) {
      this.normalizeActivityDates(datesForAddress);
    }

    // After everything, force an update of the label
    await this.onUpdateLabel();
  }

  private applyManualAdditions(targetDates: ActivityDates[], manualAdditions: any) {
    for (let type in AllTrashTypes) {
      const trashType = <TrashType>AllTrashTypes[type];
      if (!manualAdditions?.[trashType]) {
        continue;
      }

      for (let index in manualAdditions[trashType]) {
        addDate(targetDates, trashType, new Date(manualAdditions[trashType][index]));
      }
    }
  }

  private applyManualRemovals(targetDates: ActivityDates[], manualRemovals: any) {
    if (manualRemovals === null) {
      return;
    }

    for (let type in AllTrashTypes) {
      const trashType = <TrashType>AllTrashTypes[type];
      if (!manualRemovals?.[trashType]) {
        continue;
      }

      const datesToRemove = new Set<number>(manualRemovals[trashType].map((d: string) => new Date(d).setHours(0, 0, 0, 0)));
      const targetType = targetDates.find((x) => x.type === trashType);
      if (!targetType) {
        continue;
      }

      targetType.dates = targetType.dates.filter((d) => !datesToRemove.has(new Date(d).setHours(0, 0, 0, 0)));
    }
  }

  private normalizeActivityDates(targetDates: ActivityDates[]) {
    for (const entry of targetDates) {
      const deduplicated = Array.from(new Set(entry.dates.map((d) => new Date(d).setHours(0, 0, 0, 0))));
      entry.dates = deduplicated.map((d) => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
    }
  }

  async dailyRefresh() {
    await this.onUpdateLabel(); // Update labels on daily interval
    await this.updateAddressDeviceCapabilities(); // Refresh relative capability strings (today/tomorrow)
    await this.updateTrashTypeDeviceCapabilities();
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
          (labelSettings?.[items[i]?.type]?.trashLong || this.homey.__(`tokens.output.type.${items[i].type}`)) +
          (i < len - 2 ? ', ' : i == len - 2 ? ' ' + this.homey.__('tokens.output.and') + ' ' : '');
      }

      outputText = alternativeTextLabel
        .replace('__time__', timeReplacement)
        .replace('__type__', multiTypeString)
        .replace('__types__', multiTypeString) // Added replacement for __types__ backwards compatibility
        .replace('__plural__', this.homey.__('tokens.output.replacementplural'));
    } else {
      let textLabel = labelSettings?.['NONE']?.trashLong || this.homey.__('tokens.output.type.NONE');
      if (items.length === 1) {
        textLabel = labelSettings?.[items[0]?.type]?.trashLong || this.homey.__(`tokens.output.type.${items[0].type}`);
      }

      outputText = alternativeTextLabel
        .replace('__time__', timeReplacement)
        .replace('__type__', textLabel)
        .replace('__types__', textLabel) // Added replacement for __types__ backwards compatibility
        .replace('__plural__', this.homey.__('tokens.output.replacementsingle'));
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

  async ensureAddressDeviceCapabilities(device?: Homey.Device) {
    await this.updateAddressDeviceCapabilities(device);
  }

  async ensureTrashTypeDeviceCapabilities(device?: Homey.Device) {
    await this.updateTrashTypeDeviceCapabilities(device);
  }

  private async updateAddressDeviceCapabilities(device?: Homey.Device) {
    try {
      const driver = this.homey.drivers.getDriver('trash_address');
      if (!driver) {
        return;
      }

      const devices = device ? [device] : Object.values(await driver.getDevices());
      const today = await this.getLocalDate();
      today.setHours(0, 0, 0, 0);

      for (const currentDevice of devices) {
        const addressSignature = this.getDeviceAddressSignature(currentDevice) || String(currentDevice.getData()?.addressSignature || currentDevice.getData()?.id || '');
        const datesForAddress = this.collectionDatesByAddress.get(addressSignature) || [];

        for (const type of CapabilityTrashTypes) {
          const trashType = type as TrashType;
          const capabilityId = TrashTypeCapabilityMap[trashType];
          const nextDate = this.getFirstUpcomingDateForType(datesForAddress, trashType, today);
          const hasCapability = currentDevice.hasCapability(capabilityId);

          if (!nextDate) {
            if (hasCapability) {
              await currentDevice.removeCapability(capabilityId);
            }
            continue;
          }

          if (!hasCapability) {
            await currentDevice.addCapability(capabilityId);
          }

          const formattedDate = await this.getCapabilityDateLabel(nextDate);
          await currentDevice.setCapabilityValue(capabilityId, formattedDate);
        }
      }
    } catch (error) {
      const message = String((error as any)?.message || error || '');
      if (!message.includes('Driver Not Initialized')) {
        this.log('Failed to update device capabilities', error);
      }
    }
  }

  private getFirstUpcomingDateForType(dates: ActivityDates[], type: TrashType, today: Date): Date | null {
    const typeDates = dates.find((x) => x.type === type)?.dates || [];
    const upcoming = typeDates
      .map((x) => new Date(x))
      .filter((x) => {
        x.setHours(0, 0, 0, 0);
        return x.getTime() >= today.getTime();
      })
      .sort((a, b) => a.getTime() - b.getTime());

    return upcoming.length > 0 ? upcoming[0] : null;
  }

  private async getCapabilityDateLabel(collectionDate: Date): Promise<string> {
    const now = await this.getLocalDate();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const target = new Date(collectionDate);
    target.setHours(0, 0, 0, 0);

    if (target.getTime() === yesterday.getTime()) {
      return this.homey.__('tokens.output.timeindicator.t-1');
    }

    if (target.getTime() === today.getTime()) {
      return this.homey.__('tokens.output.timeindicator.t0');
    }

    if (target.getTime() === tomorrow.getTime()) {
      return this.homey.__('tokens.output.timeindicator.t1');
    }

    return target.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
    });
  }

  private async updateTrashTypeDeviceCapabilities(device?: Homey.Device) {
    try {
      const driver = this.homey.drivers.getDriver('trash_type_address');
      if (!driver) {
        return;
      }

      const devices = device ? [device] : Object.values(await driver.getDevices());
      const today = await this.getLocalDate();
      today.setHours(0, 0, 0, 0);

      for (const currentDevice of devices) {
        const addressSignature = this.getDeviceAddressSignature(currentDevice) || String(currentDevice.getData()?.addressSignature || currentDevice.getData()?.id || '');
        const trashType = String(currentDevice.getSettings?.()?.trashType || '') as TrashType;
        if (!trashType) {
          continue;
        }

        const datesForAddress = this.collectionDatesByAddress.get(addressSignature) || [];
        const timeline = this.getCollectionTimelineForType(datesForAddress, trashType, today);

        const nextValue = timeline.next ? await this.getCapabilityDateLabel(timeline.next) : '';
        const followingValue = timeline.following ? await this.getCapabilityDateLabel(timeline.following) : '';

        if (currentDevice.hasCapability(SingleTypeDeviceCapabilities.nextCollectionOn)) {
          await currentDevice.setCapabilityValue(SingleTypeDeviceCapabilities.nextCollectionOn, nextValue);
        }

        if (currentDevice.hasCapability(SingleTypeDeviceCapabilities.followingCollectionOn)) {
          await currentDevice.setCapabilityValue(SingleTypeDeviceCapabilities.followingCollectionOn, followingValue);
        }
      }
    } catch (error) {
      const message = String((error as any)?.message || error || '');
      if (!message.includes('Driver Not Initialized')) {
        this.log('Failed to update single type device capabilities', error);
      }
    }
  }

  private getCollectionTimelineForType(dates: ActivityDates[], type: TrashType, today: Date): { last: Date | null; next: Date | null; following: Date | null } {
    const typeDates = dates.find((x) => x.type === type)?.dates || [];
    const normalized = typeDates
      .map((x) => new Date(x))
      .map((x) => {
        x.setHours(0, 0, 0, 0);
        return x;
      })
      .sort((a, b) => a.getTime() - b.getTime());

    let last: Date | null = null;
    let next: Date | null = null;
    const upcoming: Date[] = [];

    for (const date of normalized) {
      if (date.getTime() <= today.getTime()) {
        last = date;
      }

      if (date.getTime() >= today.getTime()) {
        upcoming.push(date);
      }
    }

    if (upcoming.length > 0) {
      next = upcoming[0];
    }

    return {
      last,
      next,
      following: upcoming.length > 1 ? upcoming[1] : null,
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
};
