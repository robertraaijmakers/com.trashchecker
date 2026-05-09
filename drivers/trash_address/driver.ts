'use strict';

import Homey from 'homey';
import { ApiSettings } from '../../assets/publicTypes';
import { AddressPairState, BaseAddressDriver } from '../../lib/baseaddressdriver';
import { createAddressSignature, getAddressDisplayParts } from '../../lib/driverhelper';

module.exports = class TrashAddressDriver extends BaseAddressDriver<AddressPairState> {
  protected registerDeviceFlowListeners() {
    this.registerFlowCardProxyListeners([
      {
        cardType: 'condition',
        cardId: 'days_to_collect_device',
        appMethod: 'flowTrashIsCollectedForDeviceCondition',
      },
      {
        cardType: 'action',
        cardId: 'days_to_collect_device',
        appMethod: 'flowTrashIsCollectedForDeviceAction',
      },
      {
        cardType: 'condition',
        cardId: 'days_to_clean_device',
        appMethod: 'flowTrashIsCleanedForDeviceCondition',
      },
      {
        cardType: 'action',
        cardId: 'days_to_clean_device',
        appMethod: 'flowTrashIsCleanedForDeviceAction',
      },
    ]);
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
      const addressParts = getAddressDisplayParts(settings);
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
