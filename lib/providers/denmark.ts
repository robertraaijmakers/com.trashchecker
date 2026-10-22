'use strict';

import { ActivityDates } from '../../types/localTypes';
import { ApiSettings } from '../../assets/publicTypes';
import { filterFutureDates, httpsPromise, validateCountry, validateHousenumber, validateStreet, validateZipcode, verifyByName } from '../helpers';

const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0';

/**
 * Danish providers, ported from the Home Assistant waste_collection_schedule sources.
 *
 * Providers that cannot find a household from street + house number use `apiSettings.countyId`
 * as the provider specific identifier (address number, customer number or location GUID).
 */
export class DenmarkProviders {
  constructor(private log: (...args: any[]) => void) {}

  // RenoWeb --------------------------------------------------------------------------------

  async renoWebFrederiksberg(apiSettings: ApiSettings) {
    return this.generalRenoWeb(apiSettings, 'frederiksberg');
  }

  async renoWebRudersdal(apiSettings: ApiSettings) {
    return this.generalRenoWeb(apiSettings, 'rudersdal');
  }

  private async generalRenoWeb(apiSettings: ApiSettings, municipality: string) {
    this.log(`Checking RenoWeb ${municipality}`);

    const fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'DK');
    await validateStreet(apiSettings);
    await validateHousenumber(apiSettings);

    // RenoWeb wraps its JSON responses in a JSON string inside the "d" property.
    const post = async (endpoint: string, payload: object) => {
      const response = await httpsPromise({
        hostname: `${municipality}.renoweb.dk`,
        path: `/Legacy/JService.asmx/${endpoint}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': BROWSER_USER_AGENT },
        body: JSON.stringify(payload),
      });
      const body = <any>response.body;
      return typeof body?.d === 'string' ? JSON.parse(body.d) : body?.d;
    };

    const addressSearch = await post('Adresse_SearchByString', {
      searchterm: `${apiSettings.streetname} ${apiSettings.housenumber},`,
      addresswithmateriel: 3,
    });

    const addressId = addressSearch?.list?.[0]?.value;
    if (!addressId) {
      throw new Error('Address not found in RenoWeb.');
    }

    const materials = await post('GetAffaldsplanMateriel_mitAffald', { adrid: addressId, common: false });
    const status = materials?.status?.status;
    if (status) {
      throw new Error(`RenoWeb returned an error: ${status} ${materials?.status?.msg ?? ''}`);
    }

    for (const material of materials?.list ?? []) {
      // Skip ordered pickups and materials without a planned emptying date.
      if (material.afhentningsbestillingmateriel || !/dag den \d{2}-\d{2}-\d{4}/.test(material.toemningsdato)) {
        continue;
      }

      const calendar = await post('GetCalender_mitAffald', { materialid: material.id });
      for (const entry of calendar?.list ?? []) {
        const [day, month, year] = String(entry).split(' ').pop()!.split('-');
        const trashDate = new Date(`${year}-${month}-${day}`);
        if (Number.isNaN(trashDate.getTime())) {
          continue;
        }

        verifyByName(fDates, '', `${material.ordningnavn} ${material.materielnavn}`, trashDate);
      }
    }

    if (fDates.length === 0) {
      throw new Error('No trash data found for the given address in RenoWeb.');
    }

    return filterFutureDates(fDates);
  }

  // Vestforbrænding -------------------------------------------------------------------------

  async vestforbraending(apiSettings: ApiSettings) {
    this.log('Checking Vestforbrænding');

    const fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'DK');
    await validateStreet(apiSettings);
    await validateHousenumber(apiSettings);
    await validateZipcode(apiSettings);

    const hostname = 'selvbetjening.vestfor.dk';
    const term = `${apiSettings.streetname} ${apiSettings.housenumber}, ${apiSettings.zipcode}`;

    const addressRequest = await httpsPromise({
      hostname,
      path: `/Adresse/AddressByName?term=${encodeURIComponent(term)}&numberOfResults=1`,
      method: 'GET',
      headers: { 'User-Agent': 'Homey' },
    });

    const addresses = <any>addressRequest.body;
    if (!Array.isArray(addresses) || addresses.length === 0) {
      throw new Error('Address not found at Vestforbrænding.');
    }

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 365);

    const datesRequest = await httpsPromise({
      hostname,
      path: `/Adresse/ToemmeDates?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`,
      method: 'GET',
      headers: { 'User-Agent': 'Homey', Cookie: `addressId=${addresses[0].Id}` },
    });

    const items = <any>datesRequest.body;
    if (!Array.isArray(items)) {
      throw new Error('Unexpected response from Vestforbrænding.');
    }

    for (const item of items) {
      const trashDate = new Date(item.start);
      if (!item.title || Number.isNaN(trashDate.getTime())) {
        continue;
      }

      verifyByName(fDates, '', item.title, trashDate);
    }

    if (fDates.length === 0) {
      throw new Error('No trash data found for the given address at Vestforbrænding.');
    }

    return filterFutureDates(fDates);
  }

  // RessourceIndsamling (waste2x) -----------------------------------------------------------

  async ressourceIndsamling(apiSettings: ApiSettings) {
    this.log('Checking RessourceIndsamling');

    const fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'DK');
    await validateStreet(apiSettings);
    await validateHousenumber(apiSettings);

    const hostname = 'selfserviceapi.waste2x.dk';
    const headers = { 'User-Agent': 'Homey', organizationid: '76fbcd50-996e-4b0e-8b5b-3e9e49cea6d6' };

    // The trailing % is required by the search endpoint.
    const term = encodeURIComponent(`${apiSettings.streetname} ${apiSettings.housenumber}`.toLowerCase() + '%');
    const customerRequest = await httpsPromise({
      hostname,
      path: `/api/Customer/Customer/SearchCustomer/${term}`,
      method: 'GET',
      headers,
    });

    const customerId = (<any>customerRequest.body)?.items?.[0]?.customerId;
    if (!customerId) {
      throw new Error('Address not found at RessourceIndsamling.');
    }

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 90);

    const servicesRequest = await httpsPromise({
      hostname,
      path: `/api/Services/Services/GetServicesForCustomer/${customerId}/${encodeURIComponent(start.toISOString())}/${encodeURIComponent(end.toISOString())}`,
      method: 'GET',
      headers,
    });

    const services = <any>servicesRequest.body;
    if (!Array.isArray(services)) {
      throw new Error('Unexpected response from RessourceIndsamling.');
    }

    for (const service of services) {
      const trashDate = new Date(service.stopTime);
      if (!service.serviceTypePublicName || Number.isNaN(trashDate.getTime())) {
        continue;
      }

      verifyByName(fDates, '', service.serviceTypePublicName, trashDate);
    }

    if (fDates.length === 0) {
      throw new Error('No trash data found for the given address at RessourceIndsamling.');
    }

    return filterFutureDates(fDates);
  }

  // Identifier based providers (identifier is stored in countyId) ----------------------------

  async odenseRenovation(apiSettings: ApiSettings) {
    this.log('Checking Odense Renovation');

    const fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'DK');
    this.requireIdentifier(apiSettings, 'address number (addressNo)');

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 365);

    const response = await httpsPromise({
      hostname: 'mit.odenserenovation.dk',
      path: `/api/Calendar/GetCalendarByAddress?addressNo=${encodeURIComponent(apiSettings.countyId!)}&startDate=${encodeURIComponent(start.toISOString())}&endDate=${encodeURIComponent(end.toISOString())}&noCache=false`,
      method: 'GET',
      headers: { 'User-Agent': 'Homey' },
    });

    for (const month of (<any>response.body)?.Months ?? []) {
      for (const day of month.Days ?? []) {
        const trashDate = new Date(day.Date);
        for (const bin of day.Bins ?? []) {
          verifyByName(fDates, '', bin.Label, trashDate);
        }
      }
    }

    if (fDates.length === 0) {
      throw new Error('No trash data found for the given address number at Odense Renovation.');
    }

    return filterFutureDates(fDates);
  }

  async renosyd(apiSettings: ApiSettings) {
    this.log('Checking Renosyd');

    const fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'DK');
    this.requireIdentifier(apiSettings, 'customer number');

    const response = await httpsPromise({
      hostname: 'skoda-selvbetjeningsapi.renosyd.dk',
      path: `/api/v1/toemmekalender?nummer=${encodeURIComponent(apiSettings.countyId!.padStart(6, '0'))}`,
      method: 'GET',
      headers: { 'User-Agent': 'Homey' },
    });

    const items = <any>response.body;
    if (!Array.isArray(items)) {
      throw new Error('Unexpected response from Renosyd.');
    }

    for (const item of items) {
      for (const pickup of item['planlagtetømninger'] ?? []) {
        const trashDate = new Date(pickup.dato);
        for (const fraction of pickup.fraktioner ?? []) {
          verifyByName(fDates, '', String(fraction), trashDate);
        }
      }
    }

    if (fDates.length === 0) {
      throw new Error('No trash data found for the given customer number at Renosyd.');
    }

    return filterFutureDates(fDates);
  }

  async renoDjurs(apiSettings: ApiSettings) {
    this.log('Checking Reno Djurs');

    const fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'DK');
    this.requireIdentifier(apiSettings, 'customer id');

    const response = await httpsPromise({
      hostname: 'minside.renodjurs.dk',
      path: `/Ordninger.aspx?id=${encodeURIComponent(apiSettings.countyId!)}`,
      method: 'GET',
      headers: { 'User-Agent': BROWSER_USER_AGENT },
    });

    const html = String(response.body);
    const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];

    for (const row of rows) {
      const cells = (row.match(/<td[\s\S]*?<\/td>/gi) ?? []).map((cell) => cell.replace(/<[^>]*>/g, '').trim());
      if (cells.length <= 4) {
        continue;
      }

      // cells[3] is the current pickup (only relevant when it's today), cells[4] the next pickup.
      for (const rawDate of [cells[3], cells[4]]) {
        const match = rawDate.match(/(\d{2})-(\d{2})-(\d{4})/);
        if (match) {
          verifyByName(fDates, '', cells[1], new Date(`${match[3]}-${match[2]}-${match[1]}`));
        }
      }
    }

    if (fDates.length === 0) {
      throw new Error('No trash data found for the given customer id at Reno Djurs.');
    }

    return filterFutureDates(fDates);
  }

  async kalundborg(apiSettings: ApiSettings) {
    return this.generalInfovision(apiSettings, 'kalundborgivapi.infovision.dk');
  }

  async kolding(apiSettings: ApiSettings) {
    return this.generalInfovision(apiSettings, 'koldingivapi.infovision.dk');
  }

  private async generalInfovision(apiSettings: ApiSettings, hostname: string) {
    this.log(`Checking Infovision ${hostname}`);

    const fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'DK');
    this.requireIdentifier(apiSettings, 'address id (the GUID in the address URL of the municipality portal)');

    const response = await httpsPromise({
      hostname,
      path: `/api/publiccitizen/container/address/active/${encodeURIComponent(apiSettings.countyId!)}`,
      method: 'GET',
      headers: {
        accept: 'application/json, text/plain, */*',
        publicaccesstoken: '__NetDialogCitizenPublicAccessToken__',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const containers = <any>response.body;
    if (!Array.isArray(containers)) {
      throw new Error('Unexpected response from the municipality portal.');
    }

    for (const container of containers) {
      const name = container?.containerType?.description;
      if (!name) {
        continue;
      }

      for (const rawDate of container.collectDates ?? []) {
        const value = String(rawDate);
        const trashDate = new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`);
        if (!Number.isNaN(trashDate.getTime())) {
          verifyByName(fDates, '', name, trashDate);
        }
      }
    }

    if (fDates.length === 0) {
      throw new Error('No trash data found for the given address id.');
    }

    return filterFutureDates(fDates);
  }

  private requireIdentifier(apiSettings: ApiSettings, description: string) {
    if (!apiSettings.countyId || apiSettings.countyId.trim() === '') {
      throw new Error(`This provider needs the ${description} in the "County ID" field.`);
    }
  }
}
