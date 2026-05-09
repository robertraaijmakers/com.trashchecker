'use strict';

import Homey from 'homey';
import apiRegistry from '../assets/api-registry.json';
import { ApiMeta, ApiSettings } from '../assets/publicTypes';
import { TrashCollectionReminder } from '../types/localTypes';
import {
  ApiSettingsValidationResult,
  ConfiguredAddressOption,
  ValidateApiSettingsOptions,
  createAddressSignature,
  getConfiguredAddressOptions,
  getConfiguredApiSettingsList,
  getRegistryByCountry,
  normalizeApiSettings,
  persistApiSettingsList,
  validateApiSettingsWithApis,
} from './driverhelper';

export interface AddressPairContext {
  apiSettings: ApiSettings;
  apiRegistry: ApiMeta[];
  cleanApiRegistry: Array<{ id: string; name: string; country: string }>;
  configuredAddresses: ConfiguredAddressOption[];
  selectedAddressIndex?: number;
}

export interface AddressPairState {
  apiSettings?: ApiSettings;
}

export type DeviceSettingsTransformer = (nextSettings: ApiSettings, device: Homey.Device) => Record<string, unknown>;
export type FlowCardProxyDefinition = {
  cardType: 'condition' | 'action';
  cardId: string;
  appMethod: string;
};

export abstract class BaseAddressDriver<TPairState extends AddressPairState = AddressPairState> extends Homey.Driver {
  async onInit() {
    this.registerDeviceFlowListeners();
  }

  protected abstract registerDeviceFlowListeners(): void;

  protected registerFlowCardProxyListeners(definitions: FlowCardProxyDefinition[]) {
    const app = this.homey.app as any;

    for (const definition of definitions) {
      const card = definition.cardType === 'condition' ? this.homey.flow.getConditionCard(definition.cardId) : this.homey.flow.getActionCard(definition.cardId);

      card.registerRunListener(async (args, state) => {
        return app[definition.appMethod](args, state);
      });
    }
  }

  protected getValidationOptions(): ValidateApiSettingsOptions {
    return { defaultCleanApiId: '' };
  }

  protected getConfiguredSettingsList(): ApiSettings[] {
    return getConfiguredApiSettingsList(this.homey.settings.get('apiSettingsList'), {
      ...this.getValidationOptions(),
      requireAddressInput: true,
    });
  }

  protected getDefaultSettings(): ApiSettings {
    const settingsList = this.getConfiguredSettingsList();
    return settingsList[0] || normalizeApiSettings(this.homey.settings.get('apiSettings'), this.getValidationOptions());
  }

  protected createPairContext(settings?: ApiSettings): AddressPairContext {
    const activeSettings = settings || this.getDefaultSettings();
    const settingsList = this.getConfiguredSettingsList();

    return {
      apiSettings: activeSettings,
      apiRegistry: getRegistryByCountry(activeSettings.country, apiRegistry as ApiMeta[]),
      cleanApiRegistry: this.getCleanApiRegistry(activeSettings.country),
      configuredAddresses: getConfiguredAddressOptions(settingsList),
    };
  }

  protected createRepairContext(device: Homey.Device): AddressPairContext {
    const settings = normalizeApiSettings(device.getSettings(), this.getValidationOptions());
    const settingsList = this.getConfiguredSettingsList();
    const currentSignature = createAddressSignature(settings);

    return {
      apiSettings: settings,
      apiRegistry: getRegistryByCountry(settings.country, apiRegistry as ApiMeta[]),
      cleanApiRegistry: this.getCleanApiRegistry(settings.country),
      configuredAddresses: getConfiguredAddressOptions(settingsList),
      selectedAddressIndex: settingsList.findIndex((entry) => createAddressSignature(entry) === currentSignature),
    };
  }

  protected getCleanApiRegistry(country: string): Array<{ id: string; name: string; country: string }> {
    const app = this.homey.app as TrashCollectionReminder;
    return app.cleanApis.getAvailableApis(country);
  }

  protected registerSharedPairHandlers(session: any) {
    session.setHandler('get_pair_context', async () => this.createPairContext());
    session.setHandler('get_api_registry', async (country: string) => getRegistryByCountry(country, apiRegistry as ApiMeta[]));
    session.setHandler('get_clean_api_registry', async (country: string) => this.getCleanApiRegistry(country));
    session.setHandler('validate_api_settings', async (input: Partial<ApiSettings>): Promise<ApiSettingsValidationResult> => this.validateApiSettings(input));
  }

  protected registerSharedRepairHandlers(session: any, device: Homey.Device, transformDeviceSettings?: DeviceSettingsTransformer) {
    session.setHandler('get_pair_context', async () => this.createRepairContext(device));
    session.setHandler('get_api_registry', async (country: string) => getRegistryByCountry(country, apiRegistry as ApiMeta[]));
    session.setHandler('get_clean_api_registry', async (country: string) => this.getCleanApiRegistry(country));
    session.setHandler('validate_api_settings', async (input: Partial<ApiSettings>): Promise<ApiSettingsValidationResult> => this.validateApiSettings(input));

    session.setHandler('set_existing_api_settings', async (index: number): Promise<ApiSettingsValidationResult> => {
      const selected = this.getConfiguredSettingsList()[Number(index)];
      if (!selected) {
        return {
          success: false,
          error: 'Selected address could not be found.',
        };
      }

      const nextSettings = normalizeApiSettings(selected, this.getValidationOptions());
      await this.updateDeviceAddressSettings(device, nextSettings, transformDeviceSettings);

      return {
        success: true,
        apiSettings: nextSettings,
      };
    });

    session.setHandler('apply_api_settings', async (input: Partial<ApiSettings>): Promise<ApiSettingsValidationResult> => {
      const validation = await this.validateApiSettings(input);
      if (!validation.success || !validation.apiSettings) {
        return validation;
      }

      await this.updateDeviceAddressSettings(device, validation.apiSettings, transformDeviceSettings);
      return validation;
    });
  }

  protected async validateApiSettings(input: Partial<ApiSettings>): Promise<ApiSettingsValidationResult> {
    const validation = await validateApiSettingsWithApis(this.homey, input, this.getValidationOptions());
    if (!validation.success) {
      this.error('Error while validating API settings', validation.error);
    }

    return validation;
  }

  protected assignPairState(state: TPairState, validation: ApiSettingsValidationResult) {
    if (validation.apiSettings) {
      state.apiSettings = validation.apiSettings;
    }
  }

  protected async handlePairSetApiSettings(state: TPairState, input: Partial<ApiSettings>): Promise<ApiSettingsValidationResult> {
    const validation = await this.validateApiSettings(input);
    if (!validation.success || !validation.apiSettings) {
      return validation;
    }

    this.assignPairState(state, validation);
    return validation;
  }

  protected async handlePairSelectExistingApiSettings(state: TPairState, index: number): Promise<ApiSettingsValidationResult> {
    const selected = this.getConfiguredSettingsList()[Number(index)];
    if (!selected) {
      return {
        success: false,
        error: 'Selected address could not be found.',
      };
    }

    const requiresCollectionDays = this.getValidationOptions().includeCollectionDays === true;
    const validation = requiresCollectionDays ? await this.validateApiSettings(selected) : { success: true, apiSettings: normalizeApiSettings(selected, this.getValidationOptions()) };

    if (!validation.success || !validation.apiSettings) {
      return validation;
    }

    this.assignPairState(state, validation);
    return validation;
  }

  private async updateDeviceAddressSettings(device: Homey.Device, nextSettings: ApiSettings, transformDeviceSettings?: DeviceSettingsTransformer) {
    const oldSettings = normalizeApiSettings(device.getSettings(), this.getValidationOptions());
    await persistApiSettingsList(this.homey, nextSettings, oldSettings, {
      ...this.getValidationOptions(),
      currentDevice: device,
    });

    const deviceSettings = transformDeviceSettings ? transformDeviceSettings(nextSettings, device) : nextSettings;
    await device.setSettings(deviceSettings);

    const app = this.homey.app as TrashCollectionReminder;
    await app.recalculate();
  }
}
