'use strict';

import { ApiSettings } from '../assets/publicTypes';
import { ActivityDates, ApiDefinition, ApiFindResult } from '../types/localTypes';
import { formatDate, httpsPromise, validateCountry, validateHousenumber, validateZipcode, verifyByName } from './helpers';

export class CleanApis {
  #apiList: ApiDefinition[] = [];
  #log: (...args: any[]) => void;

  constructor(logger: (...args: any[]) => void) {
    this.#log = logger || console.log;

    this.#apiList.push({ name: 'Clean Profs', id: 'cpfs', country: 'NL', execute: (apiSettings) => this.#cleanProfs(apiSettings) });
  }

  async ExecuteApi(apiSettings: ApiSettings) {
    if (apiSettings.cleanApiId === 'not-applicable' || apiSettings.cleanApiId === '') {
      return [];
    }

    const executingApi = this.#apiList.find((x) => x.id === apiSettings.cleanApiId);
    if (!executingApi || typeof executingApi === 'undefined') {
      throw new Error(`Couldn\'t find specified cleaning API ID: ${apiSettings.cleanApiId}`);
    }

    return executingApi.execute(apiSettings);
  }

  async FindApi(apiSettings: ApiSettings) {
    let apiFindResult: ApiFindResult = {
      id: '',
      name: '',
      days: [],
    };

    if (apiSettings?.cleanApiId && apiSettings?.cleanApiId !== '') {
      try {
        const collectionDays = await this.ExecuteApi(apiSettings);
        apiFindResult.id = apiSettings.cleanApiId;
        apiFindResult.days = collectionDays;
      } catch (error) {
        this.#log(`Error executing cleaning API: ${apiSettings.cleanApiId}.`);
        this.#log(error);
      }
      return apiFindResult;
    }

    for (const apiDefinition of this.#apiList) {
      try {
        const collectionDays = await apiDefinition.execute(apiSettings);
        apiFindResult = {
          days: collectionDays,
          id: apiDefinition.id,
          name: apiDefinition.name,
        };

        break;
      } catch (error) {
        this.#log(`Error executing cleaning API: ${apiDefinition.id} - ${apiDefinition.name}.`);
        this.#log(error);
      }
    }

    return apiFindResult;
  }

  async #cleanProfs(apiSettings: ApiSettings) {
    return this.#cleanProfsApi(apiSettings);
  }

  /**
   * Generic Clean API Providers
   */
  async #cleanProfsApi(apiSettings: ApiSettings) {
    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const startDate = new Date().setDate(new Date().getDate() - 14);
    const endDate = new Date().setDate(new Date().getDate() + 30);

    const getCleanProfsRequest = await httpsPromise({
      hostname: `cleanprofs.jmsdev.nl`,
      path: `/api/get-plannings-address?zipcode=${apiSettings.zipcode}&house_number=${apiSettings.housenumber}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&code=crm`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
      },
    });

    var result = <any>getCleanProfsRequest.body;

    if (result.length <= 0) {
      throw new Error('No cleaning data found for: cleanprofs.jmsdev.nl');
    }

    for (let i in result) {
      const entry = result[i];
      const dateStr = entry['full_date'];
      const description = entry['product_name']?.toLowerCase();

      verifyByName(fDates, '', description, new Date(dateStr), '', '');
    }

    return fDates;
  }
}
