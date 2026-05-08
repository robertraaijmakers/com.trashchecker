'use strict';

import Homey from 'homey';
import { getConfiguredApiSettingsList, isAddressReferencedByOtherDevices, normalizeApiSettings, upsertApiSettingsInList } from '../../lib/driverhelper';
import { TrashCollectionReminder } from '../../types/localTypes';

module.exports = class TrashTypeAddressDevice extends Homey.Device {
  private readonly trackedKeys = ['apiId', 'cleanApiId', 'zipcode', 'housenumber', 'streetname', 'cityname', 'country', 'countyId', 'apiKey', 'trashType'];

  async onInit() {
    this.log('Trash single-type device initialized');

    const app = this.homey.app as TrashCollectionReminder;
    await app.ensureTrashTypeDeviceCapabilities(this as unknown as Homey.Device);
  }

  async onAdded() {
    await this.syncAddressInSettingsList();
  }

  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: {
      [key: string]: boolean | string | number | undefined | null;
    };
    newSettings: {
      [key: string]: boolean | string | number | undefined | null;
    };
    changedKeys: string[];
  }): Promise<string | void> {
    if (!changedKeys.some((key) => this.trackedKeys.includes(key))) {
      return;
    }

    await this.syncAddressInSettingsList(newSettings, oldSettings);

    const app = this.homey.app as TrashCollectionReminder;
    await app.ensureTrashTypeDeviceCapabilities(this as unknown as Homey.Device);
  }

  private async syncAddressInSettingsList(settings?: { [key: string]: boolean | string | number | undefined | null }, oldSettings?: { [key: string]: boolean | string | number | undefined | null }) {
    const nextSettings = normalizeApiSettings(settings ?? this.getSettings(), { defaultCleanApiId: 'not-applicable' });
    const previousSettings = normalizeApiSettings(oldSettings ?? this.getSettings(), { defaultCleanApiId: 'not-applicable' });

    const list = getConfiguredApiSettingsList(this.homey.settings.get('apiSettingsList'), { defaultCleanApiId: 'not-applicable' });
    const keepPrevious = await isAddressReferencedByOtherDevices(this.homey, previousSettings, this);
    const updatedList = upsertApiSettingsInList(list, nextSettings, previousSettings, { keepPrevious });

    this.homey.settings.set('apiSettingsList', updatedList);
    this.homey.settings.set('apiSettings', updatedList[0] || nextSettings);

    const app = this.homey.app as TrashCollectionReminder;
    await app.recalculate();
  }
};
