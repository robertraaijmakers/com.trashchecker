'use strict';

import Homey from 'homey';
import { ApiSettings } from '../../assets/publicTypes';
import { AddressPairState, BaseAddressDriver } from '../../lib/baseaddressdriver';
import { createAddressSignature, normalizeApiSettings } from '../../lib/driverhelper';

module.exports = class TrashAddressDriver extends BaseAddressDriver<AddressPairState> {
  protected registerDeviceFlowListeners() {
    const app = this.homey.app as any;

    this.homey.flow.getConditionCard('days_to_collect_device').registerRunListener(async (args, state) => {
      return app.flowTrashIsCollectedForDeviceCondition(args, state);
    });

    this.homey.flow.getActionCard('days_to_collect_device').registerRunListener(async (args, state) => {
      return app.flowTrashIsCollectedForDeviceAction(args, state);
    });

    this.homey.flow.getConditionCard('days_to_clean_device').registerRunListener(async (args, state) => {
      return app.flowTrashIsCleanedForDeviceCondition(args, state);
    });

    this.homey.flow.getActionCard('days_to_clean_device').registerRunListener(async (args, state) => {
      return app.flowTrashIsCleanedForDeviceAction(args, state);
    });
  }

  async onPair(session: any) {
    const state: AddressPairState = {};

    this.registerSharedPairHandlers(session);

    session.setHandler('set_api_settings', async (input: Partial<ApiSettings>) => this.handlePairSetApiSettings(state, input));

    session.setHandler('set_existing_api_settings', async (index: number) => this.handlePairSelectExistingApiSettings(state, index));

    session.setHandler('list_devices', async () => {
      if (!state.apiSettings) {
        return [];
      }

      const settings = state.apiSettings;
      const addressParts = [settings.zipcode, settings.housenumber, settings.cityname].filter((v) => v && v.trim() !== '');
      const signature = createAddressSignature(settings);

      const existingDevices = await this.getDevices();
      if (Object.values(existingDevices).some((device) => String(device.getData()?.id || '') === signature)) {
        return [];
      }

      return [
        {
          name: addressParts.join(' ').trim() || this.homey.__('settings.api_data'),
          data: {
            id: signature,
          },
          settings,
        },
      ];
    });
  }

  async onRepair(session: any, device: Homey.Device) {
    this.registerSharedRepairHandlers(session, device);
  }
};
