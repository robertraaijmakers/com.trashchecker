'use strict';

import Homey from 'homey';
import apiRegistry from '../../assets/api-registry.json';
import { ApiMeta, ApiSettings, TrashType } from '../../assets/publicTypes';
import {
  createAddressSignature,
  createSignature,
  getConfiguredAddressOptions,
  getConfiguredApiSettingsList,
  getRegistryByCountry,
  hasAddressInput,
  isAddressReferencedByOtherDevices,
  normalizeApiSettings,
  upsertApiSettingsInList,
} from '../../lib/driverhelper';
import { ActivityDates, TrashCollectionReminder } from '../../types/localTypes';

interface ValidationResponse {
  success: boolean;
  error?: string;
  apiSettings?: ApiSettings;
  collectionDays?: ActivityDates[];
}

const TrashTypeIconMap: Record<TrashType, string> = {
  GFT: '/icons/trash-GFT.svg',
  GLAS: '/icons/trash-GLAS.svg',
  GROF: '/icons/trash-GROF.svg',
  KCA: '/icons/trash-KCA.svg',
  PAPIER: '/icons/trash-PAPIER.svg',
  PLASTIC: '/icons/trash-PLASTIC.svg',
  PMD: '/icons/trash-PMD.svg',
  REST: '/icons/trash-REST.svg',
  SNOEI: '/icons/trash-SNOEI.svg',
  TEXTIEL: '/icons/trash-TEXTIEL.svg',
  KERSTBOOM: '/icons/trash-KERSTBOOM.svg',
};

module.exports = class TrashTypeAddressDriver extends Homey.Driver {
  async onInit() {
    this.registerDeviceFlowListeners();
  }

  private registerDeviceFlowListeners() {
    const app = this.homey.app as any;

    this.homey.flow.getConditionCard('days_to_collect_single_type_device').registerRunListener(async (args, state) => {
      return app.flowTrashTypeIsCollectedForDeviceCondition(args, state);
    });

    this.homey.flow.getActionCard('days_to_collect_single_type_device').registerRunListener(async (args, state) => {
      return app.flowTrashTypeIsCollectedForDeviceAction(args, state);
    });

    this.homey.flow.getConditionCard('days_to_clean_single_type_device').registerRunListener(async (args, state) => {
      return app.flowTrashTypeIsCleanedForDeviceCondition(args, state);
    });

    this.homey.flow.getActionCard('days_to_clean_single_type_device').registerRunListener(async (args, state) => {
      return app.flowTrashTypeIsCleanedForDeviceAction(args, state);
    });
  }

  async onPair(session: any) {
    const state: { apiSettings?: ApiSettings; collectionDays?: ActivityDates[] } = {};

    session.setHandler('get_pair_context', async () => {
      const settingsList = getConfiguredApiSettingsList(this.homey.settings.get('apiSettingsList'), { defaultCleanApiId: '', requireAddressInput: true });
      const settings = settingsList[0] || normalizeApiSettings(this.homey.settings.get('apiSettings'), { defaultCleanApiId: '' });

      return {
        apiSettings: settings,
        apiRegistry: getRegistryByCountry(settings.country, apiRegistry as ApiMeta[]),
        configuredAddresses: getConfiguredAddressOptions(settingsList),
      };
    });

    session.setHandler('get_api_registry', async (country: string) => {
      return getRegistryByCountry(country, apiRegistry as ApiMeta[]);
    });

    session.setHandler('validate_api_settings', async (input: Partial<ApiSettings>): Promise<ValidationResponse> => {
      return this.validateApiSettings(input);
    });

    session.setHandler('set_api_settings', async (input: Partial<ApiSettings>): Promise<ValidationResponse> => {
      const validation = await this.validateApiSettings(input);
      if (!validation.success || !validation.apiSettings || !validation.collectionDays) {
        return validation;
      }

      state.apiSettings = validation.apiSettings;
      state.collectionDays = validation.collectionDays;
      return validation;
    });

    session.setHandler('set_existing_api_settings', async (index: number): Promise<ValidationResponse> => {
      const settingsList = getConfiguredApiSettingsList(this.homey.settings.get('apiSettingsList'), { defaultCleanApiId: '', requireAddressInput: true });
      const selected = settingsList[Number(index)];

      if (!selected) {
        return {
          success: false,
          error: 'Selected address could not be found.',
        };
      }

      const validation = await this.validateApiSettings(selected);
      if (!validation.success || !validation.apiSettings || !validation.collectionDays) {
        return validation;
      }

      state.apiSettings = validation.apiSettings;
      state.collectionDays = validation.collectionDays;

      return {
        success: true,
        apiSettings: state.apiSettings,
        collectionDays: state.collectionDays,
      };
    });

    session.setHandler('list_devices', async () => {
      if (!state.apiSettings || !state.collectionDays) {
        return [];
      }

      const settings = state.apiSettings;
      const addressSignature = createAddressSignature(settings);
      const addressParts = [settings.zipcode, settings.housenumber, settings.cityname].filter((v) => v && v.trim() !== '');
      const existingDevices = await this.getDevices();
      const existingIds = new Set(Object.values(existingDevices).map((device) => String(device.getData()?.id || '')));
      const availableTypes = state.collectionDays.filter((entry) => Array.isArray(entry.dates) && entry.dates.length > 0).map((entry) => entry.type);

      return availableTypes
        .filter((trashType) => !existingIds.has(this.createSingleTypeDeviceId(settings, trashType)))
        .map((trashType) => {
          const uniqueDeviceId = this.createSingleTypeDeviceId(settings, trashType);
          const trashTypeLabel = this.homey.__(`widgets.trashType.${trashType}`);

          return {
            name: `${trashTypeLabel} - ${addressParts.join(' ').trim() || this.homey.__('settings.api_data')}`,
            icon: TrashTypeIconMap[trashType],
            data: {
              id: uniqueDeviceId,
              addressSignature,
            },
            settings: {
              ...settings,
              trashType,
            },
          };
        });
    });
  }

  async onRepair(session: any, device: Homey.Device) {
    session.setHandler('get_pair_context', async () => {
      const settings = normalizeApiSettings(device.getSettings(), { defaultCleanApiId: '' });
      const settingsList = getConfiguredApiSettingsList(this.homey.settings.get('apiSettingsList'), { defaultCleanApiId: '', requireAddressInput: true });
      const currentSignature = createAddressSignature(settings);

      return {
        apiSettings: settings,
        apiRegistry: getRegistryByCountry(settings.country, apiRegistry as ApiMeta[]),
        configuredAddresses: getConfiguredAddressOptions(settingsList),
        selectedAddressIndex: settingsList.findIndex((entry) => createAddressSignature(entry) === currentSignature),
      };
    });

    session.setHandler('get_api_registry', async (country: string) => {
      return getRegistryByCountry(country, apiRegistry as ApiMeta[]);
    });

    session.setHandler('set_existing_api_settings', async (index: number): Promise<ValidationResponse> => {
      const settingsList = getConfiguredApiSettingsList(this.homey.settings.get('apiSettingsList'), { defaultCleanApiId: '', requireAddressInput: true });
      const selected = settingsList[Number(index)];
      const currentTrashType = String(device.getSettings()?.trashType || 'REST') as TrashType;

      if (!selected) {
        return {
          success: false,
          error: 'Selected address could not be found.',
        };
      }

      const oldSettings = normalizeApiSettings(device.getSettings(), { defaultCleanApiId: '' });
      const nextSettings = normalizeApiSettings(selected, { defaultCleanApiId: '' });
      const keepPrevious = await isAddressReferencedByOtherDevices(this.homey, oldSettings, device);
      const updatedSettingsList = upsertApiSettingsInList(settingsList, nextSettings, oldSettings, { keepPrevious });

      this.homey.settings.set('apiSettingsList', updatedSettingsList);
      this.homey.settings.set('apiSettings', updatedSettingsList[0] || nextSettings);

      await device.setSettings({
        ...nextSettings,
        trashType: currentTrashType,
      });

      const app = this.homey.app as TrashCollectionReminder;
      await app.recalculate();

      return {
        success: true,
        apiSettings: nextSettings,
      };
    });

    session.setHandler('validate_api_settings', async (input: Partial<ApiSettings> & { trashType?: TrashType }): Promise<ValidationResponse> => {
      return this.validateApiSettings(input);
    });

    session.setHandler('apply_api_settings', async (input: Partial<ApiSettings>) => {
      const currentTrashType = String(device.getSettings()?.trashType || 'REST') as TrashType;
      const validation = await this.validateApiSettings(input);
      if (!validation.success || !validation.apiSettings) {
        return validation;
      }

      const oldSettings = normalizeApiSettings(device.getSettings(), { defaultCleanApiId: '' });
      const nextSettings = validation.apiSettings;

      const settingsList = getConfiguredApiSettingsList(this.homey.settings.get('apiSettingsList'), { defaultCleanApiId: '', requireAddressInput: true });
      const keepPrevious = await isAddressReferencedByOtherDevices(this.homey, oldSettings, device);
      const updatedSettingsList = upsertApiSettingsInList(settingsList, nextSettings, oldSettings, { keepPrevious });

      this.homey.settings.set('apiSettingsList', updatedSettingsList);
      this.homey.settings.set('apiSettings', updatedSettingsList[0] || nextSettings);

      await device.setSettings({
        ...nextSettings,
        trashType: currentTrashType,
      });

      const app = this.homey.app as TrashCollectionReminder;
      await app.recalculate();

      return {
        success: true,
        apiSettings: nextSettings,
      };
    });
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

  private async validateApiSettings(input: Partial<ApiSettings>): Promise<ValidationResponse> {
    const apiSettings = normalizeApiSettings(input, { defaultCleanApiId: '' });

    if (!hasAddressInput(apiSettings)) {
      return {
        success: false,
        error: 'Please provide at least a postcode or street with house number.',
      };
    }

    try {
      const app = this.homey.app as TrashCollectionReminder;

      const trashResult = await app.trashApis.FindApi(apiSettings);
      if (!trashResult?.id) {
        return {
          success: false,
          error: this.homey.__('settings.fail'),
        };
      }

      apiSettings.apiId = trashResult.id;

      const cleanResult = apiSettings.cleanApiId && apiSettings.cleanApiId !== 'not-applicable' ? { id: apiSettings.cleanApiId } : await app.cleanApis.FindApi(apiSettings);
      apiSettings.cleanApiId = cleanResult?.id || 'not-applicable';

      return {
        success: true,
        apiSettings,
        collectionDays: (trashResult.days || []).filter((entry) => Array.isArray(entry.dates) && entry.dates.length > 0),
      };
    } catch (error) {
      this.error('Error while validating API settings', error);
      return {
        success: false,
        error: (error as Error).message || 'Validation failed',
      };
    }
  }

  private createSingleTypeDeviceId(settings: ApiSettings, trashType: TrashType): string {
    return createSignature(['trash-type-address', settings.country, settings.zipcode, settings.housenumber, settings.streetname, settings.cityname, trashType]);
  }
};
