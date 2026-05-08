import { ApiMeta, ApiSettings } from '../assets/publicTypes';

export interface ConfiguredAddressOption {
  index: number;
  label: string;
  apiSettings: ApiSettings;
}

export interface NormalizeApiSettingsOptions {
  defaultCleanApiId?: string;
}

export interface ConfiguredApiSettingsListOptions extends NormalizeApiSettingsOptions {
  requireAddressInput?: boolean;
}

export interface UpsertApiSettingsInListOptions {
  keepPrevious?: boolean;
}

export function normalizeApiSettings(input: any, options?: NormalizeApiSettingsOptions): ApiSettings {
  const defaultCleanApiId = options?.defaultCleanApiId ?? '';

  return {
    apiId: input?.apiId || '',
    cleanApiId: input?.cleanApiId || defaultCleanApiId,
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

export function hasAddressInput(settings: ApiSettings): boolean {
  return settings.zipcode.trim() !== '' || settings.housenumber.trim() !== '' || settings.streetname.trim() !== '' || settings.cityname.trim() !== '';
}

export function createSignature(parts: Array<string | number | null | undefined>): string {
  return parts
    .map((x) =>
      String(x || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-'),
    )
    .join('-');
}

export function createAddressSignature(settings: ApiSettings): string {
  return createSignature(['trash-address', settings.country, settings.zipcode, settings.housenumber, settings.streetname, settings.cityname]);
}

export function getRegistryByCountry(country: string, registry: ApiMeta[]): ApiMeta[] {
  const upperCountry = String(country || 'NL').toUpperCase();
  return registry.filter((entry) => entry.country === upperCountry).sort((a, b) => a.name.localeCompare(b.name));
}

export function getConfiguredApiSettingsList(rawList: unknown, options?: ConfiguredApiSettingsListOptions): ApiSettings[] {
  if (!Array.isArray(rawList)) {
    return [];
  }

  const normalized = rawList.map((item) => normalizeApiSettings(item, options));
  if (!options?.requireAddressInput) {
    return normalized;
  }

  return normalized.filter((item) => hasAddressInput(item));
}

export function getConfiguredAddressOptions(settingsList: ApiSettings[]): ConfiguredAddressOption[] {
  return settingsList.map((apiSettings, index) => {
    const parts = [apiSettings.zipcode, apiSettings.housenumber, apiSettings.streetname, apiSettings.cityname].filter((x) => x && x.trim() !== '');

    return {
      index,
      label: parts.join(', '),
      apiSettings,
    };
  });
}

export function upsertApiSettingsInList(settingsList: ApiSettings[], nextSettings: ApiSettings, previousSettings: ApiSettings, options?: UpsertApiSettingsInListOptions): ApiSettings[] {
  const nextSignature = createAddressSignature(nextSettings);
  const previousSignature = createAddressSignature(previousSettings);
  const keepPrevious = options?.keepPrevious === true && previousSignature !== nextSignature;

  const previousIndex = settingsList.findIndex((x) => createAddressSignature(x) === previousSignature);
  const filtered = settingsList.filter((x) => {
    const signature = createAddressSignature(x);
    if (signature === nextSignature) {
      return false;
    }

    if (signature === previousSignature) {
      return keepPrevious;
    }

    return true;
  });

  if (previousIndex >= 0) {
    filtered.splice(Math.min(previousIndex, filtered.length), 0, nextSettings);
    return filtered;
  }

  return [...filtered, nextSettings];
}

export async function isAddressReferencedByOtherDevices(homey: any, addressSettings: ApiSettings, currentDevice?: any): Promise<boolean> {
  const targetSignature = createAddressSignature(addressSettings);
  const currentDeviceId = String(currentDevice?.getId?.() || currentDevice?.id || '');

  for (const driverId of ['trash_address', 'trash_type_address']) {
    const driver = homey.drivers.getDriver(driverId);
    if (!driver) {
      continue;
    }

    const devices = await driver.getDevices();
    for (const [deviceId, device] of Object.entries(devices)) {
      const candidateDevice = device as any;
      const candidateDeviceId = String(candidateDevice.getId?.() || deviceId || '');
      if (currentDeviceId !== '' && candidateDeviceId === currentDeviceId) {
        continue;
      }

      const candidateSettings = normalizeApiSettings(candidateDevice.getSettings?.() || candidateDevice.settings || {});
      if (!hasAddressInput(candidateSettings)) {
        continue;
      }

      if (createAddressSignature(candidateSettings) === targetSignature) {
        return true;
      }
    }
  }

  return false;
}
