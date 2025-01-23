'use strict';

import https from 'https';
import { HttpsPromiseOptions, HttpsPromiseResponse } from '../types/apiRequestTypes';
import { ActivityDates } from '../types/localTypes';
import { TrashType, ApiSettings } from '../assets/publicTypes';

export async function httpsPromise(options: HttpsPromiseOptions): Promise<HttpsPromiseResponse> {
  const { body, ...requestOptions } = options;

  return new Promise((resolve, reject) => {
    const req = https.request(requestOptions, (res) => {
      const chunks: Uint8Array[] = [];
      res.on('data', (data: Uint8Array) => chunks.push(data));
      res.on('end', () => {
        if (res.statusCode && res.statusCode !== 200) {
          reject(new Error(`Request failed with status ${res.statusCode}`));
          return;
        }

        let resBody = Buffer.concat(chunks).toString();
        switch (res.headers['content-type']) {
          case 'application/json':
            try {
              resBody = JSON.parse(resBody);
            } catch (error) {
              reject(new Error(`Exception parsing JSON: ${error}`));
              return;
            }
            break;
          default:
            try {
              resBody = JSON.parse(resBody);
            } catch (error) {
              resBody = resBody.toString();
            }
            break;
        }

        resolve({ body: resBody, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

export async function validateCountry(apiSettings: ApiSettings, country: string) {
  if (apiSettings?.country !== country) {
    throw new Error(`This country is not supported, set country: ${apiSettings?.country}, expected country: ${country}.`);
  }

  return true;
}

export async function validateHousenumber(apiSettings: ApiSettings) {
  if (!apiSettings?.housenumber || apiSettings?.housenumber === '') {
    throw new Error('Housenumber should be filled.');
  }

  return true;
}

export async function validateZipcode(apiSettings: ApiSettings) {
  if (!apiSettings?.zipcode || apiSettings?.zipcode === '') {
    throw new Error('Zipcode should be filled.');
  }

  return true;
}

export function addDate(activityDates: ActivityDates[], type: TrashType, date: Date, icon?: string, localText?: string, color?: string): void {
  const activityDate = activityDates.find((activity) => activity.type === type);
  if (activityDate) {
    activityDate.dates.push(date);
  } else {
    activityDates.push({
      type,
      icon,
      color,
      localText,
      dates: [date],
    });
  }
}

export function formatDate(date: Date | number) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

export function verifyDate(dateString: string) {
  var dateArray = dateString.split('-');
  if (dateArray[0].length === 4) {
    return new Date(dateString);
  } else {
    return new Date(dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0]);
  }
}

export function verifyByName(activityDates: ActivityDates[], className: string, description: string, date: Date, icon?: string, color?: string): void {
  var foundType: boolean = false;

  if (!description || description === '' || typeof description === undefined) {
    if (className == 'dhm') {
      foundType = true;
      addDate(activityDates, TrashType.TEXTIEL, date, icon, className, color);
    }

    if (foundType === true) {
      return;
    }
  }

  const localDescription = description; // Keep original description
  description = description.toLowerCase(); // Convert description to lowercase for comparison

  if (description.indexOf('groente') !== -1 || description.indexOf('gft') !== -1 || description.indexOf('bio') !== -1 || description.indexOf('green') !== -1) {
    addDate(activityDates, TrashType.GFT, date, icon, localDescription, color);
    foundType = true;
  }

  if (
    description.indexOf('rest') !== -1 ||
    description.indexOf('etensresten') !== -1 ||
    description.indexOf('residual') !== -1 ||
    description.indexOf('grey') !== -1 ||
    description.indexOf('sortibak') !== -1
  ) {
    addDate(activityDates, TrashType.REST, date, icon, localDescription, color);
    foundType = true;
  }

  if (
    description.indexOf('pmd') !== -1 ||
    description.indexOf('pbd') !== -1 ||
    description.indexOf('pd') !== -1 ||
    description.indexOf('metaal') !== -1 ||
    description.indexOf('drankkartons') !== -1 ||
    description.indexOf('packages') !== -1
  ) {
    addDate(activityDates, TrashType.PMD, date, icon, localDescription, color);
    foundType = true;
  }

  if (description.indexOf('plastic') !== -1 || description.indexOf('plc') !== -1) {
    addDate(activityDates, TrashType.PLASTIC, date, icon, localDescription, color);
    foundType = true;
  }

  if (description.indexOf('papier') !== -1 || description.indexOf('paper') !== -1) {
    addDate(activityDates, TrashType.PAPIER, date, icon, localDescription, color);
    foundType = true;
  }

  if (
    description.indexOf('textiel') !== -1 ||
    description.indexOf('retour') !== -1 ||
    description.indexOf('best') !== -1 ||
    description.indexOf('textile') !== -1 ||
    description.indexOf('wijkinzameling') !== -1
  ) {
    addDate(activityDates, TrashType.TEXTIEL, date, icon, localDescription, color);
    foundType = true;
  }

  if (description.indexOf('kerstbomen') !== -1 || description.indexOf('kerst') !== -1 || description.indexOf('christmas') !== -1) {
    addDate(activityDates, TrashType.KERSTBOOM, date, icon, localDescription, color);
    foundType = true;
  }

  if (description.indexOf('grof') !== -1 || description.indexOf('vuil') !== -1 || description.indexOf('pruning') !== -1 || description.indexOf('bulky') !== -1) {
    addDate(activityDates, TrashType.GROF, date, icon, localDescription, color);
    foundType = true;
  }

  if (description.indexOf('glas') !== -1 || description.indexOf('milieubus') !== -1) {
    addDate(activityDates, TrashType.GLAS, date, icon, localDescription, color);
    foundType = true;
  }

  // if(description.indexOf('etensresten') !== -1) {
  //     if (!fDates.FOOD) fDates.FOOD = [];
  //     fDates.FOOD.push(dateStr);
  // }

  // if(description.indexOf('takken') !== -1 || description.indexOf('snoei') !== -1) {
  //     if (!fDates.SNOEI) fDates.SNOEI = [];
  //     fDates.SNOEI.push(dateStr);
  // }

  // if(description.indexOf('chemisch') !== -1) {
  //     if (!fDates.CHEMISCH) fDates.CHEMISCH = [];
  //     fDates.CHEMISCH.push(dateStr);
  // }

  if (foundType === false) {
    console.log(`Type not identified: ${description}, ${className}`);
  }
}

export function processWasteData(afvalstromenResponse: any, kalenderResponse: any) {
  let fDates: ActivityDates[] = [];
  let afvalstroomMap: { [key: string]: TrashType } = {};

  // Map afvalstroom_id to waste types
  afvalstromenResponse.forEach((afvalstroom: any) => {
    const checkTitle = afvalstroom.page_title.toUpperCase().replace(/\s+/g, '');
    let collectionType: TrashType | null = null;
    if (checkTitle.includes('GFT') || checkTitle.includes('GROENTE') || checkTitle.includes('GROENE')) collectionType = TrashType.GFT;
    if (checkTitle.includes('PBD') || checkTitle.includes('PMD') || checkTitle.includes('PLASTIC')) collectionType = TrashType.PMD;
    if (checkTitle.includes('PAPIER')) collectionType = TrashType.PAPIER;
    if (checkTitle.includes('RESTAFVAL') || checkTitle.includes('GRIJZE')) collectionType = TrashType.REST;
    if (checkTitle.includes('TEXTIEL')) collectionType = TrashType.TEXTIEL;
    if (checkTitle.includes('KERSTBOOM') || checkTitle.includes('KERSTBOMEN')) collectionType = TrashType.KERSTBOOM;
    if (checkTitle.includes('GROF')) collectionType = TrashType.GROF;
    if (checkTitle.includes('GLAS')) collectionType = TrashType.GLAS;
    //if (checkTitle.includes('ELEKTRISCH')) title = 'ELEKTRISCH';
    //if (checkTitle.includes('SNOEI')) title = 'SNOEI';

    if (collectionType === null) {
      console.log(`Couldn't find type: ${checkTitle}.`);
      return;
    }

    afvalstroomMap[afvalstroom.id] = collectionType;
    const activityDate = fDates.find((activity) => activity.type === collectionType);
    if (!activityDate) {
      fDates.push({
        type: collectionType,
        icon: afvalstroom.icon_data,
        color: '',
        localText: afvalstroom.title,
        dates: [],
      });
    }
  });

  // Populate the result with collection dates
  kalenderResponse.forEach((entry: any) => {
    const type = afvalstroomMap[entry.afvalstroom_id];
    if (type) {
      addDate(fDates, type, entry.ophaaldatum);
    }
  });

  return fDates;
}
