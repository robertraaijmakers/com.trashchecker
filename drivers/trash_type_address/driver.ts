'use strict';

import Homey from 'homey';
import { ApiSettings, TrashType } from '../../assets/publicTypes';
import { AddressPairState, BaseAddressDriver } from '../../lib/baseaddressdriver';
import { createAddressSignature, createSingleTypeDeviceId, normalizeApiSettings } from '../../lib/driverhelper';
import { ActivityDates, TrashCollectionReminder } from '../../types/localTypes';

interface ValidationResponse extends AddressPairState {
  success: boolean;
  error?: string;
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

interface PairState extends AddressPairState {
  collectionDays?: ActivityDates[];
}

module.exports = class TrashTypeAddressDriver extends BaseAddressDriver<PairState> {
  protected getValidationOptions() {
    return {
      defaultCleanApiId: '',
      includeCollectionDays: true,
    };
  }

  protected registerDeviceFlowListeners() {
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
    const state: PairState = {};

    this.registerSharedPairHandlers(session);

    session.setHandler('set_api_settings', async (input: Partial<ApiSettings>): Promise<ValidationResponse> => {
      const validation = await this.handlePairSetApiSettings(state, input);
      if (!validation.success || !validation.apiSettings || !validation.collectionDays) {
        return validation;
      }

      return validation;
    });

    session.setHandler('set_existing_api_settings', async (index: number): Promise<ValidationResponse> => {
      const validation = await this.handlePairSelectExistingApiSettings(state, index);
      if (!validation.success || !validation.apiSettings || !validation.collectionDays) {
        return validation;
      }

      return validation;
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
        .filter((trashType) => !existingIds.has(createSingleTypeDeviceId(settings, trashType)))
        .map((trashType) => {
          const uniqueDeviceId = createSingleTypeDeviceId(settings, trashType);
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
    this.registerSharedRepairHandlers(session, device, (nextSettings, currentDevice) => ({
      ...nextSettings,
      trashType: String(currentDevice.getSettings()?.trashType || 'REST') as TrashType,
    }));
  }

  protected assignPairState(state: PairState, validation: ValidationResponse) {
    super.assignPairState(state, validation);
    if (validation.collectionDays) {
      state.collectionDays = validation.collectionDays;
    }
  }
};
