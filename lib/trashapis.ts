'use strict';

import { ActivityDates, ApiDefinition, ApiFindResult } from '../types/localTypes';
import {
  addDate,
  formatDate,
  httpsPromise,
  parseDutchDate,
  processWasteData,
  validateCity,
  validateCountry,
  validateHousenumber,
  validateStreet,
  validateZipcode,
  verifyByName,
  verifyDate,
} from './helpers';
import { ApiMeta, ApiSettings, TrashType } from '../assets/publicTypes';
import { parseDocument, DomUtils } from 'htmlparser2';
import crypto from 'crypto';

type Exec = (apiSettings: ApiDefinition) => Promise<unknown>;

export class TrashApis {
  private apiList: ApiDefinition[] = [];
  private log: (...args: any[]) => void;

  constructor(logger: (...args: any[]) => void) {
    this.log = logger || console.log;

    const API_REGISTRY = require('../assets/api-registry.json') as ApiMeta[];

    this.apiList = API_REGISTRY.map((meta: any) => {
      const fn = (this as any)[meta.handler];
      if (typeof fn !== 'function') {
        throw new Error(`Missing handler method: ${String(meta.handler)}`);
      }
      // Ensure all ApiDefinition properties are present
      return {
        ...meta,
        execute: fn.bind(this) as Exec,
        name: meta.name,
        id: meta.id,
        country: meta.country,
      } as ApiDefinition;
    });
  }

  async ExecuteApi(apiSettings: ApiSettings) {
    if (apiSettings.apiId === 'not-applicable' || apiSettings.apiId === '') {
      return [];
    }

    const executingApi = this.apiList.find((x) => x.id === apiSettings.apiId);
    if (!executingApi || typeof executingApi === 'undefined') {
      throw new Error(`Couldn\'t find specified API ID: ${apiSettings.apiId}`);
    }

    return executingApi.execute(apiSettings);
  }

  async FindApi(apiSettings: ApiSettings) {
    let apiFindResult: ApiFindResult = {
      id: '',
      name: '',
      days: [],
    };

    if (apiSettings?.apiId && apiSettings?.apiId !== '') {
      try {
        const collectionDays = await this.ExecuteApi(apiSettings);

        if (Object.keys(collectionDays).length === 0) {
          throw new Error(`No trash data found.`);
        }

        apiFindResult.id = apiSettings.apiId;
        apiFindResult.days = collectionDays;
      } catch (error) {
        this.log(`Executing API: ${apiSettings.apiId}.`);
        this.log(error);
      }

      return apiFindResult;
    }

    apiFindResult = (await this.findFirstSuccessfulApi(apiSettings)) as ApiFindResult;

    return apiFindResult;
  }

  async findFirstSuccessfulApi(apiSettings: ApiSettings) {
    return new Promise(async (resolve, reject) => {
      let resolved = false;

      for (const apiDefinition of this.apiList) {
        apiDefinition
          .execute(apiSettings)
          .then((collectionDays) => {
            if (!resolved) {
              resolved = true;
              let apiFindResult: ApiFindResult = {
                id: apiDefinition.id,
                name: apiDefinition.name,
                days: collectionDays,
              };
              resolve(apiFindResult);
            }
          })
          .catch((error) => this.log(`API failed: ${apiDefinition.id} - ${error}`));
      }

      setTimeout(() => {
        if (!resolved) reject(new Error('All API calls failed.'));
      }, 10000); // Optional timeout
    });
  }

  private filterFutureDates(dates: ActivityDates[]): ActivityDates[] {
    const today = new Date();
    today.setDate(today.getDate() - 7); // Include today
    today.setHours(0, 0, 0, 0); // Start of today

    return dates
      .map((activity) => ({
        ...activity,
        dates: activity.dates.filter((date) => {
          const collectionDate = new Date(date);
          collectionDate.setHours(0, 0, 0, 0);
          return collectionDate >= today;
        }),
      }))
      .filter((activity) => activity.dates.length > 0); // Remove activities with no future dates
  }

  private async mijnAfvalWijzer(apiSettings: ApiSettings) {
    return this.generalMijnAfvalwijzerApiImplementation(apiSettings, 'www.mijnafvalwijzer.nl');
  }

  private async denBoschAfvalstoffendienstCalendar(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalstoffendienst.nl');
  }

  private async rovaAfvalkalender(apiSettings: ApiSettings) {
    return this.rovaWasteCalendar(apiSettings, 'www.rova.nl', '/api/waste-calendar/year');
  }

  private async afvalkalenderCyclus(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'cyclusnv.nl');
  }

  private async afvalkalenderZrd(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'zrd.nl');
  }

  private async afvalkalenderRwm(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'rwm.nl');
  }

  private async afvalRmn(apiSettings: ApiSettings) {
    return this.generalImplementationBurgerportaal(apiSettings, '138204213564933597');
  }

  private async afvalkalenderBar(apiSettings: ApiSettings) {
    return this.generalImplementationBurgerportaal(apiSettings, '138204213564933497');
  }

  private async afvalkalenderAssen(apiSettings: ApiSettings) {
    return this.generalImplementationBurgerportaal(apiSettings, '138204213565303512');
  }

  private async afvalkalenderGroningen(apiSettings: ApiSettings) {
    return this.generalImplementationBurgerportaal(apiSettings, '452048812597326549');
  }

  private async afvalkalenderNijkerk(apiSettings: ApiSettings) {
    return this.generalImplementationBurgerportaal(apiSettings, '138204213565304094');
  }

  private async afvalkalenderTilburg(apiSettings: ApiSettings) {
    return this.generalImplementationBurgerportaal(apiSettings, '452048812597339353');
  }

  private async afvalkalenderPeelEnMaas(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalkalender.peelenmaas.nl');
  }

  private async afvalkalenderVenray(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalkalender.venray.nl');
  }

  private async darAfvalkalender(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalkalender.dar.nl');
  }

  private async inzamelkalenderHVC(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'inzamelkalender.hvcgroep.nl');
  }

  private async BlinkAfvalkalender(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, '252d30d0-2e74-469c-8f1e-c0e2e434eb58', 'wasteprod2api.ximmio.com');
  }

  private async GadGooiAndVechtstreek(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'inzamelkalender.gad.nl');
  }

  private async afvalwijzerPreZero(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'inzamelwijzer.prezero.nl');
  }

  private async afvalkalenderPurmerend(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalkalender.purmerend.nl');
  }

  private async huisvuilkalenderDenHaag(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'huisvuilkalender.denhaag.nl');
  }

  private async huisvuilkalenderEttenLeur(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'afval3xbeter.nl');
  }

  private async afvalkalenderMeerlanden(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, '800bf8d7-6dd1-4490-ba9d-b419d6dc8a45', 'wasteprod2api.ximmio.com');
  }

  private async afvalkalenderRad(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, '13a2cad9-36d0-4b01-b877-efcb421a864d', 'wasteapi2.ximmio.com');
  }

  private async afvalkalenderAvri(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, '78cd4156-394b-413d-8936-d407e334559a', 'wasteapi.ximmio.com');
  }

  private async afvalAvalex(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, 'f7a74ad1-fdbf-4a43-9f91-44644f4d4222', 'wasteprod2api.ximmio.com');
  }

  private async twenteMilieu(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, '8d97bb56-5afd-4cbc-a651-b4f7314264b4', 'twentemilieuapi.ximmio.com');
  }

  private async reinis(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'reinis.nl');
  }

  private async gemeenteHellendoorn(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, '24434f5b-7244-412b-9306-3a2bd1e22bc1', 'wasteapi.ximmio.com');
  }

  private async gemeenteMeppel(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, 'b7a594c7-2490-4413-88f9-94749a3ec62a', 'wasteapi.ximmio.com');
  }

  private async acvAfvalkalender(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, 'f8e2844a-095e-48f9-9f98-71fceb51d2c3', 'wasteapi.ximmio.com');
  }

  private async almereAfvalkalender(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, '53d8db94-7945-42fd-9742-9bbc71dbe4c1', 'wasteapi.ximmio.com');
  }

  private async areaReiniging(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, 'adc418da-d19b-11e5-ab30-625662870761');
  }

  private async afvalKalenderWestland(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'inzamelkalender.hvcgroep.nl');
  }

  private async afvalKalenderWoerden(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, '06856f74-6826-4c6a-aabf-69bc9d20b5a6', 'wasteprod2api.ximmio.com');
  }

  private async reinigingsdienstWaardlanden(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, '942abcf6-3775-400d-ae5d-7380d728b23c', 'wasteapi.ximmio.com');
  }

  private async recycleApp(apiSettings: ApiSettings) {
    return this.generalImplementationRecycleApp(apiSettings);
  }

  private async afvalkalenderSudwestFryslan(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalkalender.sudwestfryslan.nl');
  }

  private async afvalwijzerMontferland(apiSettings: ApiSettings) {
    return this.afvalwijzerMontferlandApiImplementation(apiSettings, 'appapi.montferland.info');
  }

  private async afvalkalenderSaver(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'saver.nl');
  }

  private async afvalkalenderNoordOostFriesland(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'offalkalinder.nl');
  }

  private async afvalkalenderApn(apiSettings: ApiSettings) {
    return this.newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalkalender.alphenaandenrijn.nl');
  }

  private async afvalKalenderVenlo(apiSettings: ApiSettings) {
    return this.generalImplementationWasteApi(apiSettings, '280affe9-1428-443b-895a-b90431b8ca31', 'wasteapi.ximmio.com');
  }

  private async klikoManagerOudeIJsselstreek(apiSettings: ApiSettings) {
    return this.generalImplementationContainerManager(apiSettings, 'cp-oudeijsselstreek.klikocontainermanager.com', '454');
  }

  /**
   * Generic API waste providers
   */
  private async newGeneralAfvalkalendersNederlandRest(apiSettings: ApiSettings, baseUrl: string) {
    this.log('Checking new general afvalkalenders REST with URL: ' + baseUrl);

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const retrieveIdentificationRequest = await httpsPromise({
      hostname: baseUrl,
      path: `/adressen/${apiSettings.zipcode}:${apiSettings.housenumber}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
      rejectUnauthorized: false,
    });

    let result = <any>retrieveIdentificationRequest.body;
    if (result.length <= 0) {
      throw new Error(`Invalid zipcode for ${baseUrl}`);
    }

    let identificatie = result[0].bagid;
    this.log(identificatie);

    const retrieveTrashTypes = await httpsPromise({
      hostname: baseUrl,
      path: `/rest/adressen/${identificatie}/afvalstromen`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
      rejectUnauthorized: false,
    });

    let today = new Date();
    today.setDate(today.getDate() + 7);
    let year = today.getFullYear();
    const currentMonth = new Date().getMonth(); // 0-11
    const isDecember = currentMonth === 11;

    let retrieveCollectionDays = await httpsPromise({
      hostname: baseUrl,
      path: `/rest/adressen/${identificatie}/kalender/${year}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
      rejectUnauthorized: false,
    });

    let fDates = processWasteData(retrieveTrashTypes.body, retrieveCollectionDays.body);

    // In December, also fetch next year's data if available
    if (isDecember) {
      try {
        const nextYearData = await httpsPromise({
          hostname: baseUrl,
          path: `/rest/adressen/${identificatie}/kalender/${year + 1}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          family: 4,
          rejectUnauthorized: false,
        });

        const nextYearDates = processWasteData(retrieveTrashTypes.body, nextYearData.body);
        // Merge next year's dates with current year's dates
        nextYearDates.forEach((nextYearActivity) => {
          const existingActivity = fDates.find((a) => a.type === nextYearActivity.type);
          if (existingActivity) {
            existingActivity.dates.push(...nextYearActivity.dates);
          } else {
            fDates.push(nextYearActivity);
          }
        });
      } catch (error) {
        this.log(`Next year data not yet available for ${baseUrl}: ${error}`);
      }
    }

    return this.filterFutureDates(fDates);
  }

  private async generalMijnAfvalwijzerApiImplementation(apiSettings: ApiSettings, baseUrl: string) {
    this.log('Checking general afvalkalenders API implementation URL: ' + baseUrl);

    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const retrieveCalendarDataRequest = await httpsPromise({
      hostname: baseUrl,
      path: `/nl/${apiSettings.zipcode}/${apiSettings.housenumber}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
      rejectUnauthorized: false,
    });

    // Month name mappings (both English and Dutch)
    const monthMapping: { [key: string]: number } = {
      january: 0,
      januari: 0,
      february: 1,
      februari: 1,
      march: 2,
      maart: 2,
      april: 3,
      may: 4,
      mei: 4,
      june: 5,
      juni: 5,
      july: 6,
      juli: 6,
      august: 7,
      augustus: 7,
      september: 8,
      october: 9,
      oktober: 9,
      november: 10,
      december: 11,
    };

    const body = <string>retrieveCalendarDataRequest.body;
    const currentYear = new Date().getFullYear();

    // Find all month sections with IDs like "january-2025" or "januari-2025"
    const monthSectionRegex = /<div[^>]*id="([a-z]+-\d{4})"[^>]*class="month-section[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
    let monthMatch;

    while ((monthMatch = monthSectionRegex.exec(body)) !== null) {
      const monthId = monthMatch[1]; // e.g., "january-2025" or "januari-2025"
      const monthContent = monthMatch[2];

      // Extract month and year from the ID
      const idParts = monthId.split('-');
      if (idParts.length !== 2) continue;

      const monthName = idParts[0].toLowerCase();
      const monthIndex = monthMapping[monthName];
      const year = parseInt(idParts[1], 10);

      if (monthIndex === undefined || isNaN(year)) {
        this.log(`Could not parse month section ID: ${monthId}`);
        continue;
      }

      const regex = /<a href="#waste-.*?" class="[^"]*\bwasteInfoIcon\b[^"]*"[^\>]*>[\s\S]*?<\/a>/gi;
      let match;

      while ((match = regex.exec(monthContent)) !== null) {
        const result = match[0];
        const doc = parseDocument(result);

        const wasteInfoLinks = DomUtils.findAll((elem) => DomUtils.isTag(elem) && elem.tagName === 'a' && elem.attribs.class?.includes('wasteInfoIcon'), doc.children);

        for (const link of wasteInfoLinks) {
          const firstParagraph = DomUtils.findOne((elem) => DomUtils.isTag(elem) && elem.tagName === 'p', link.children);

          if (!firstParagraph || !firstParagraph.children || firstParagraph.children.length < 2) continue;

          const trashType = link.attribs?.title || 'Unknown';
          const spanElement = DomUtils.findOne((el) => DomUtils.isTag(el) && el.name === 'span', firstParagraph.children);
          if (!spanElement) continue;

          const trashDate = DomUtils.innerText(spanElement).trim();
          if (trashDate === 'Unknown') continue;

          const parsedTrashDate = parseDutchDate(trashDate, year);
          if (parsedTrashDate === null) continue;

          verifyByName(fDates, '', trashType, parsedTrashDate);
        }
      }
    }

    // Fallback: Try old format if no month sections were found
    if (fDates.length === 0) {
      this.log('No month sections found, trying old format parsing.');
      const regex = /<a href="#waste-.*?" class="[^"]*\bwasteInfoIcon\b[^"]*"[^\>]*>[\s\S]*?<\/a>/gi;
      let match;

      while ((match = regex.exec(body)) !== null) {
        const result = match[0];
        const doc = parseDocument(result);

        const wasteInfoLinks = DomUtils.findAll((elem) => DomUtils.isTag(elem) && elem.tagName === 'a' && elem.attribs.class?.includes('wasteInfoIcon'), doc.children);

        for (const link of wasteInfoLinks) {
          const firstParagraph = DomUtils.findOne((elem) => DomUtils.isTag(elem) && elem.tagName === 'p', link.children);

          if (!firstParagraph || !firstParagraph.children || firstParagraph.children.length < 2) continue;

          const trashType = link.attribs?.title || 'Unknown';
          const spanElement = DomUtils.findOne((el) => DomUtils.isTag(el) && el.name === 'span', firstParagraph.children);
          if (!spanElement) continue;

          const trashDate = DomUtils.innerText(spanElement).trim();
          if (trashDate === 'Unknown') continue;

          const parsedTrashDate = parseDutchDate(trashDate);
          if (parsedTrashDate === null) continue;

          verifyByName(fDates, '', trashType, parsedTrashDate);
        }
      }
    }

    // Remove potential duplicates
    fDates.forEach((activity) => {
      activity.dates = Array.from(new Map(activity.dates.map((d) => [d.toISOString(), d])).values());
    });

    return this.filterFutureDates(fDates);
  }

  private async generalImplementationWasteApi(apiSettings: ApiSettings, companyCode: string, hostName = 'wasteapi.ximmio.com') {
    this.log(`Checking company code ${companyCode} for hostname ${hostName}.`);

    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const startDate = new Date().setDate(new Date().getDate() - 14);
    const endDate = new Date().setDate(new Date().getDate() + 30);

    const post_data1 = `{companyCode:"${companyCode}",postCode:"${apiSettings.zipcode?.toUpperCase()}",houseNumber:${apiSettings.housenumber}}`;
    const retrieveUniqueId = await httpsPromise({
      hostname: hostName,
      path: `/api/FetchAdress`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(post_data1),
      },
      body: post_data1,
      family: 4,
      rejectUnauthorized: false,
    });

    var result = <any>retrieveUniqueId.body;
    if (!result.status) {
      throw new Error('Invalid response. Postal code not identified.');
    }

    if (typeof result === 'undefined' || typeof result.dataList === 'undefined' || typeof result.dataList[0] === 'undefined') {
      throw new Error('UniqueID could not be found in the response.');
    }

    var uniqueID = result.dataList[0].UniqueId;
    const post_data2 = `{companyCode:"${companyCode}",uniqueAddressID:"${uniqueID}",startDate:"${formatDate(startDate)}",endDate:"${formatDate(endDate)}"}`;
    const retrieveCalendarDataRequest = await httpsPromise({
      hostname: hostName,
      path: `/api/GetCalendar`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(post_data2),
      },
      body: post_data2,
      family: 4,
      rejectUnauthorized: false,
    });

    var calendarResult = <any>retrieveCalendarDataRequest.body;
    if (!calendarResult.status) {
      throw new Error('Invalid calendar result. ' + calendarResult.status);
    }

    for (var i = 0; i < Object.keys(calendarResult.dataList).length; i++) {
      for (var j = 0; j < Object.keys(calendarResult.dataList[i].pickupDates).length; j++) {
        verifyByName(fDates, '', calendarResult.dataList[i]._pickupTypeText, calendarResult.dataList[i].pickupDates[j]);
      }
    }
    return this.filterFutureDates(fDates);
  }

  private async generalImplementationRecycleApp(apiSettings: ApiSettings) {
    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'BE');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    // API's moved to api.fostplus.be/recycle-public/app/v1
    var hostName = 'api.fostplus.be';
    var accessConsumer = 'recycleapp.be';
    var accessSecret =
      'Op2tDi2pBmh1wzeC5TaN2U3knZan7ATcfOQgxh4vqC0mDKmnPP2qzoQusmInpglfIkxx8SZrasBqi5zgMSvyHggK9j6xCQNQ8xwPFY2o03GCcQfcXVOyKsvGWLze7iwcfcgk2Ujpl0dmrt3hSJMCDqzAlvTrsvAEiaSzC9hKRwhijQAFHuFIhJssnHtDSB76vnFQeTCCvwVB27DjSVpDmq8fWQKEmjEncdLqIsRnfxLcOjGIVwX5V0LBntVbeiBvcjyKF2nQ08rIxqHHGXNJ6SbnAmTgsPTg7k6Ejqa7dVfTmGtEPdftezDbuEc8DdK66KDecqnxwOOPSJIN0zaJ6k2Ye2tgMSxxf16gxAmaOUqHS0i7dtG5PgPSINti3qlDdw6DTKEPni7X0rxM';

    // Get access token
    const accessTokenRequest = await httpsPromise({
      hostname: hostName,
      path: '/recycle-public/app/v1/access-token',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
        'x-consumer': accessConsumer,
        'x-secret': accessSecret,
      },
      family: 4,
      rejectUnauthorized: false,
    });

    const accessTokenResult = <any>accessTokenRequest.body;
    const accessToken = accessTokenResult.accessToken;
    let zipcodeId = '';

    if (apiSettings.zipcode.includes('-')) {
      zipcodeId = apiSettings.zipcode;
    } else {
      // Validate zipcode request
      const validateZipCodeRequest = await httpsPromise({
        hostname: hostName,
        path: `/recycle-public/app/v1/zipcodes?q=${apiSettings.zipcode}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Homey',
          Authorization: accessToken,
          'x-consumer': accessConsumer,
        },
        family: 4,
        rejectUnauthorized: false,
      });

      const zipCodeResult = <any>validateZipCodeRequest.body;
      if (zipCodeResult.items.length <= 0) {
        throw new Error('No zipcode found for: ' + apiSettings.zipcode);
      }

      if (zipCodeResult.items.length > 1) {
        throw new Error('Multiple zipcode entries found for: ' + apiSettings.zipcode);
      }

      zipcodeId = zipCodeResult.items[0].id;
    }

    let streetId = '';
    if (apiSettings.streetname.includes('-')) {
      streetId = apiSettings.zipcode;
    } else {
      // Validate street request
      const validateStreetRequest = await httpsPromise({
        hostname: hostName,
        path: encodeURI(`/recycle-public/app/v1/streets?q=${apiSettings.streetname.trim()}&zipcodes=${zipcodeId}`),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Homey',
          Authorization: accessToken,
          'x-consumer': accessConsumer,
        },
        family: 4,
        rejectUnauthorized: false,
      });

      const streetResult = <any>validateStreetRequest.body;
      if (streetResult.items.length <= 0) {
        throw new Error('No street found for: ' + apiSettings.streetname.trim());
      }

      // Search for exact streetname match
      if (streetResult.items.length > 1) {
        const exactMatch = streetResult.items.find((item: any) => item.name.toLowerCase().trim() === apiSettings.streetname.trim().toLowerCase());
        if (exactMatch) {
          streetId = exactMatch.id;
        } else {
          throw new Error('Multiple streets found for: ' + apiSettings.streetname.trim());
        }
      } else {
        streetId = streetResult.items[0].id;
      }
    }

    // Retrieve trash request
    var startDate = new Date().setDate(new Date().getDate() - 7);
    var endDate = new Date().setDate(new Date().getDate() + 14);

    var getTrashRequest = await httpsPromise({
      hostname: hostName,
      method: 'GET',
      path: `/recycle-public/app/v1/collections?size=100&untilDate=${formatDate(endDate)}&fromDate=${formatDate(startDate)}&houseNumber=${
        apiSettings.housenumber
      }&streetId=${streetId}&zipcodeId=${zipcodeId}`,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
        Authorization: accessToken,
        'x-consumer': accessConsumer,
      },
      family: 4,
      rejectUnauthorized: false,
    });

    var result = <any>getTrashRequest.body;
    if (result.items.length <= 0) {
      throw new Error(
        `No trash data found for: /recycle-public/app/v1/collections?size=100&untilDate=${formatDate(endDate)}&fromDate=${formatDate(startDate)}&houseNumber=${
          apiSettings.housenumber
        }&streetId=${streetId}&zipcodeId=${zipcodeId}`,
      );
    }

    for (let i in result.items) {
      const entry = result.items[i];
      const dateStr = entry.timestamp.substr(0, 10);

      var description = '';
      if (entry.type !== 'collection') continue;

      try {
        description = entry.fraction.name.nl.toLowerCase().trim();
      } catch (Exception) {
        description = entry.fraction.name.fr.toLowerCase().trim();
      }

      verifyByName(fDates, '', description, dateStr);
    }

    return this.filterFutureDates(fDates);
  }

  private async generalImplementationBurgerportaal(apiSettings: ApiSettings, organisationId = '138204213564933597') {
    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const hostName = 'europe-west3-burgerportaal-production.cloudfunctions.net';
    const userToken = 'AIzaSyA6NkRqJypTfP-cjWzrZNFJzPUbBaGjOdk';

    // Get access token
    const idTokenRequest = await httpsPromise({
      hostname: 'www.googleapis.com',
      path: `/identitytoolkit/v3/relyingparty/signupNewUser?key=${userToken}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
      },
    });

    const responseToken = <any>idTokenRequest.body;
    const refreshToken = responseToken.refreshToken;

    // Retrieve access token
    const post_data = '?&grant_type=refresh_token&refresh_token=' + refreshToken;
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(post_data) };
    const accessTokenRequest = await httpsPromise({
      hostname: 'securetoken.googleapis.com',
      path: `/v1/token?key=${userToken}`,
      method: 'POST',
      body: post_data,
      headers: headers,
    });

    const accessTokenBody = <any>accessTokenRequest.body;
    const accessToken = accessTokenBody.access_token;

    // Retrieve address ID
    const addressIdRequest = await httpsPromise({
      hostname: hostName,
      path: `/exposed/organisations/${organisationId}/address?zipcode=${apiSettings.zipcode}&housenumber=${apiSettings.housenumber}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
        Authorization: accessToken,
      },
      family: 4,
      rejectUnauthorized: false,
    });

    let result = <any>addressIdRequest.body;
    if (result.length <= 0) {
      throw new Error('No zipcode found for: ' + apiSettings.zipcode);
    }

    if (result.length > 1) {
      throw new Error('Multiple zipcode entries found for: ' + apiSettings.zipcode);
    }

    var addressId = result[0].addressId;

    // Validate street request
    const getTrashRequest = await httpsPromise({
      hostname: hostName,
      path: `/exposed/organisations/${organisationId}/address/${addressId}/calendar`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
        Authorization: accessToken,
      },
      family: 4,
      rejectUnauthorized: false,
    });

    result = getTrashRequest.body;
    if (result.length <= 0) {
      throw new Error(`No trash data found for: /exposed/organisations/${organisationId}/address/${addressId}/calendar`);
    }

    for (let i in result) {
      const entry = result[i];
      verifyByName(fDates, '', entry.fraction, new Date(entry.collectionDate.substr(0, 10)));
    }

    return this.filterFutureDates(fDates);
  }

  private async generalImplementationContainerManager(apiSettings: ApiSettings, hostName: string, organizationId: string) {
    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const path = `/MyKliko/wasteCalendarJSON/${organizationId}/${apiSettings.zipcode}/${apiSettings.housenumber}`;

    const trashRequest = await httpsPromise({
      hostname: hostName,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
      },
      family: 4,
      rejectUnauthorized: false,
    });

    const trashResult = <any>trashRequest.body;
    if (!trashResult || !trashResult.calendar || trashResult.calendar.length <= 0) {
      throw new Error(`No trash data found for given details: ${path}`);
    }

    for (const dateString in trashResult.calendar) {
      const date = new Date(dateString); // Convert the string to Date
      const trashTypes = Object.keys(trashResult.calendar[dateString]); // Get trash types for the given date

      trashTypes.forEach((trashType) => {
        verifyByName(fDates, '', trashType, date);
      });
    }

    return this.filterFutureDates(fDates);
  }

  /**
   * Vendor specific API implementations
   */
  private async recycleManager(apiSettings: ApiSettings) {
    this.log('Recyclemanager met: ' + apiSettings.zipcode + ' ' + apiSettings.housenumber);

    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    // Retrieve recyclemanager data
    var getRecycleData = await httpsPromise({
      hostname: 'vpn-wec-api.recyclemanager.nl',
      path: `/v2/calendars?postalcode=${apiSettings.zipcode}&number=${apiSettings.housenumber}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
      rejectUnauthorized: false,
    });

    var obj1 = <any>getRecycleData.body;
    if (obj1.status != 'success') {
      throw new Error(`Not a valid response from Recyclemanager.`);
    }

    for (var i = 0; i < 2; i++) {
      if (typeof obj1.data[i].occurrences !== 'undefined') {
        for (var j = 0; j < obj1.data[i].occurrences.length; j++) {
          var trashDate = new Date(obj1.data[i].occurrences[j].from.date);
          verifyByName(fDates, '', obj1.data[i].occurrences[j].title, trashDate);
        }
      }
    }

    return fDates;
  }

  private async afvalkalenderIrado(apiSettings: ApiSettings) {
    this.log('Checking afvalkalender Irado');

    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateHousenumber(apiSettings);

    const houseNumberMatch = `${apiSettings.housenumber}`.match(/\d+/g);
    const numberAdditionMatch = `${apiSettings.housenumber}`.match(/[a-zA-Z]+/g);

    if (!houseNumberMatch || houseNumberMatch.length === 0) {
      throw new Error('Invalid house number');
    }

    let queryAddition = '';
    if (numberAdditionMatch !== null && numberAdditionMatch.length > 0 && numberAdditionMatch[0] !== null) {
      queryAddition = '&extention=' + numberAdditionMatch[0];
    }

    // Retrieve Irado data
    const getRecycleData = await httpsPromise({
      hostname: 'irado.nl',
      path: `/wp-json/wsa/v1/location/address/calendar/pickups?zipcode=${apiSettings.zipcode}&number=${houseNumberMatch[0]}${queryAddition}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      family: 4,
      rejectUnauthorized: false,
    });

    const result = <any>getRecycleData.body;
    const pickupsByYear = result?.calendar_data?.pickups || {};

    for (const yearKey of Object.keys(pickupsByYear)) {
      const months = pickupsByYear[yearKey] || {};

      for (const monthKey of Object.keys(months)) {
        const days = months[monthKey] || {};

        for (const dayKey of Object.keys(days)) {
          const items = days[dayKey];

          if (!Array.isArray(items)) {
            continue;
          }

          for (const item of items) {
            if (!item || !item.date) {
              continue;
            }

            const type = item.type ? String(item.type).trim() : '';
            if (!type) {
              continue;
            }

            const rawDate = String(item.date);
            let trashDate: Date | null = null;

            if (rawDate.includes('/')) {
              const [day, month, year] = rawDate.split('/');
              if (day && month && year) {
                trashDate = new Date(`${year}-${month}-${day}`);
              }
            } else if (rawDate.includes('-')) {
              trashDate = new Date(rawDate);
            }

            if (!trashDate || Number.isNaN(trashDate.getTime())) {
              continue;
            }

            verifyByName(fDates, '', type, trashDate);
          }
        }
      }
    }

    if (fDates.length === 0) {
      throw new Error('No trash data found for the given address in Irado.');
    }

    return this.filterFutureDates(fDates);
  }

  private async afvalkalenderRD4(apiSettings: ApiSettings) {
    this.log('Checking afvalkalender RD4');

    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const houseNumberMatch = `${apiSettings.housenumber}`.match(/\d+/g);
    const numberAdditionMatch = `${apiSettings.housenumber}`.match(/[a-zA-Z]+/g);

    if (!houseNumberMatch || houseNumberMatch.length === 0) {
      throw new Error('Invalid house number');
    }

    let queryAddition = '';
    if (numberAdditionMatch !== null && numberAdditionMatch.length > 0 && numberAdditionMatch[0] !== null) {
      queryAddition = '&house_number_extension=' + numberAdditionMatch[0];
    }

    // Retrieve recyclemanager data
    const d = new Date();
    const currentYear = d.getFullYear();
    const currentMonth = d.getMonth(); // 0-11
    const isDecember = currentMonth === 11;

    const yearsToFetch = isDecember ? [currentYear, currentYear + 1] : [currentYear];

    for (const year of yearsToFetch) {
      try {
        const getRecycleData = await httpsPromise({
          hostname: 'data.rd4.nl',
          path: `/api/v1/waste-calendar?postal_code=${apiSettings.zipcode.substring(0, 4)}+${apiSettings.zipcode.substring(4, 6)}&house_number=${
            houseNumberMatch[0]
          }${queryAddition}&year=${year}&types[]=residual_waste&types[]=gft&types[]=paper&types[]=pruning_waste&types[]=pmd&types[]=best_bag&types[]=christmas_trees`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          family: 4,
          rejectUnauthorized: false,
        });

        var result = <any>getRecycleData.body;
        for (var et in result.data.items[0]) {
          var entry = result.data.items[0][et];
          var trashDate = new Date(entry.date.substring(0, 4) + '-' + entry.date.substring(5, 7) + '-' + entry.date.substring(8, 10));

          verifyByName(fDates, '', entry.type, trashDate);
        }
      } catch (error) {
        if (year === currentYear + 1) {
          this.log(`Next year data not yet available for RD4: ${error}`);
        } else {
          throw error; // Re-throw if current year fails
        }
      }
    }

    return this.filterFutureDates(fDates);
  }

  private async rovaWasteCalendar(apiSettings: ApiSettings, hostname: string, startPath: string) {
    this.log('Checking afvalkalender Rova');

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    let fDates: ActivityDates[] = [];
    const houseNumberMatch = `${apiSettings.housenumber}`.match(/\d+/g);
    const numberAdditionMatch = `${apiSettings.housenumber}`.match(/[a-zA-Z]+/g);

    if (!houseNumberMatch || houseNumberMatch.length === 0) {
      throw new Error('Invalid house number');
    }

    let queryAddition = '';
    if (numberAdditionMatch !== null && numberAdditionMatch.length > 0 && numberAdditionMatch[0] !== null) {
      queryAddition = '&addition=' + numberAdditionMatch[0];
    }

    const d = new Date();
    const currentYear = d.getFullYear();
    const currentMonth = d.getMonth(); // 0-11
    const isDecember = currentMonth === 11;

    const yearsToFetch = isDecember ? [currentYear, currentYear + 1] : [currentYear];

    for (const year of yearsToFetch) {
      try {
        const fullPath = `${startPath}?postalcode=${apiSettings.zipcode}&year=${year}${queryAddition}&houseNumber=${houseNumberMatch[0]}&types[]=residual_waste&types[]=gft&types[]=paper&types[]=pruning_waste&types[]=pmd&types[]=best_bag&types[]=christmas_trees`;

        // Retrieve rova data
        const getRecycleData = await httpsPromise({
          hostname: hostname,
          path: fullPath,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          family: 4,
          rejectUnauthorized: false,
        });

        const result = <any>getRecycleData.body;
        if (result.length === 0 && year === currentYear) {
          throw new Error('No data found for this address.');
        }

        for (var et in result) {
          const entry = result[et];
          const trashDate = new Date(entry.date.substring(0, 4) + '-' + entry.date.substring(5, 7) + '-' + entry.date.substring(8, 10));
          verifyByName(fDates, entry.wasteType.code, entry.wasteType.title, trashDate);
        }
      } catch (error) {
        if (year === currentYear + 1) {
          this.log(`Next year data not yet available for Rova: ${error}`);
        } else {
          throw error; // Re-throw if current year fails
        }
      }
    }

    return this.filterFutureDates(fDates);
  }

  private async afvalapp(apiSettings: ApiSettings) {
    this.log('Checking De Afval App');

    const fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    // Retrieve recyclemanager data
    const getRecycleData = await httpsPromise({
      hostname: 'dataservice.deafvalapp.nl',
      path: `/dataservice/DataServiceServlet?type=ANDROID&service=OPHAALSCHEMA&land=NL&postcode=${apiSettings.zipcode}&straatId=0&huisnr=${apiSettings.housenumber}'&huisnrtoev=`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
      rejectUnauthorized: false,
    });

    var data = getRecycleData.body;
    var respArray = data.toString().split('\n').join('').split(';');
    respArray.pop();
    var curr: TrashType = TrashType.REST; // Just start with REST later defined by switch statement

    for (var i in respArray) {
      if (isNaN(parseInt(respArray[i]))) {
        switch (respArray[i]) {
          case 'ZAK_BLAUW':
            curr = TrashType.REST;
            break;
          case 'PBP':
            curr = TrashType.PLASTIC;
            break;
          default:
            curr = <TrashType>respArray[i];
            break;
        }
      } else {
        var verifiedDate = verifyDate(respArray[i]);
        addDate(fDates, curr, verifiedDate);
      }
    }

    if (fDates.length <= 0) {
      throw new Error('No dates found in Afval App.');
    }

    return this.filterFutureDates(fDates);
  }

  private async mijnCirculus(apiSettings: ApiSettings) {
    const fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    // Retrieve recyclemanager data
    var getRecycleData = await httpsPromise({
      hostname: 'mijn.circulus.nl',
      path: '/login',
      method: 'GET',
      family: 4,
      rejectUnauthorized: false,
    });

    let cookie = getRecycleData.headers['set-cookie'];
    let authenticityToken = null;

    if (!cookie || cookie.length === 0) {
      throw new Error('No cookie found');
    }

    for (var i = 0; i < cookie.length; i++) {
      if (cookie[i].startsWith('CB_SESSION')) {
        var j = cookie[i].indexOf('___AT=');
        var k = cookie[i].indexOf('&', j);
        authenticityToken = cookie[i].substring(j + 6, k);
      }
    }

    if (!authenticityToken || authenticityToken.length === 0) {
      throw new Error("Couldn't find authenticity token");
    }

    const post_data = `?authenticityToken=${authenticityToken}&zipCode=${apiSettings.zipcode}&number=${apiSettings.housenumber}`;
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookie, 'Content-Length': Buffer.byteLength(post_data) };
    const validateAddressRequest = await httpsPromise({
      hostname: 'mijn.circulus.nl',
      path: '/register/zipcode.json',
      method: 'POST',
      body: post_data,
      headers: headers,
      family: 4,
      rejectUnauthorized: false,
    });

    let startDate = new Date();
    const queryStartDate = formatDate(startDate.setDate(startDate.getDate() - 14))
      .replace('-0', '-')
      .replace('-0', '-');

    let endDate = new Date();
    const queryEndDate = formatDate(endDate.setDate(endDate.getDate() + 90))
      .replace('-0', '-')
      .replace('-0', '-');

    cookie = validateAddressRequest.headers['set-cookie'];
    if (!cookie || cookie.length === 0) {
      throw new Error('No second cookie found, need more cookies!');
    }

    const newHeaders = { 'Content-Type': 'application/json', Cookie: cookie };
    const getTrashData = <any>await httpsPromise({
      hostname: 'mijn.circulus.nl',
      path: `/afvalkalender.json?from=${queryStartDate}&till=${queryEndDate}`,
      method: 'GET',
      headers: newHeaders,
      family: 4,
      rejectUnauthorized: false,
    });

    if (
      getTrashData.body == null ||
      typeof getTrashData.body.customData === 'undefined' ||
      typeof getTrashData.body.customData.response === 'undefined' ||
      typeof getTrashData.body.customData.response.garbage === 'undefined'
    ) {
      throw new Error('Something went wrong while retrieving the data.');
    }

    var o = getTrashData.body.customData.response.garbage;
    for (var i = 0; i < o.length; i++) {
      let key = o[i].code.toLowerCase();
      switch (key) {
        case 'pmd':
        case 'gft':
        case 'rest':
          key = key.toUpperCase();
          break;
        case 'restafr':
          key = 'REST';
        case 'drocodev':
          key = 'PLASTIC';
          break;
        case 'zwakra':
          key = 'PMD';
          break;
        case 'pap':
          key = 'PAPIER';
          break;
        case 'best':
        case 'bestafr':
          key = 'TEXTIEL';
          break;
        case 'kerst':
          key = 'KERSTBOOM';
          break;
        default:
          key = key.toUpperCase();
          break;
      }

      for (let index in o[i].dates) {
        addDate(fDates, key, new Date(o[i].dates[index]));
      }
    }

    return this.filterFutureDates(fDates);
  }

  private async afvalwijzerMontferlandApiImplementation(apiSettings: ApiSettings, baseUrl: string) {
    this.log('Checking afvalwijzer Montferland with URL: ' + baseUrl);

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const houseNumberMatch = `${apiSettings.housenumber}`.match(/\d+/g);
    const numberAdditionMatch = `${apiSettings.housenumber}`.match(/[a-zA-Z]+/g);

    if (!houseNumberMatch || houseNumberMatch.length === 0) {
      throw new Error('Invalid house number');
    }

    const houseNumber = houseNumberMatch[0];
    let numberAddition = '';

    if (numberAdditionMatch && numberAdditionMatch.length > 0) {
      numberAddition = numberAdditionMatch[0];
    }

    const getGarbageList = await httpsPromise({
      hostname: baseUrl,
      path: `/api/v1/garbage/${apiSettings.zipcode}/${houseNumber}/${numberAddition}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authToken: '77FE5F8B-9051-4B05-A525-C7CCCD42236F',
      },
      family: 4,
      rejectUnauthorized: false,
    });

    const result = <any>getGarbageList.body;
    const fDates: ActivityDates[] = [];

    if (result.errorCode === 100) {
      throw new Error('auth token is invalid, it might have changed');
    } else if (result.errorCode === 2002) {
      throw new Error('Address is not supported');
    } else if (result.collections.length === 0) {
      throw new Error('No garbage data found');
    }

    for (const collection of result.collections) {
      const date = collection.collectionDate.split('T')[0] || null; // get rid of the time part

      if (date === null || isNaN(Date.parse(date))) {
        this.log(`Unable to parse date: ${date}`);
        continue;
      }

      switch (collection.fraction) {
        case 1:
          addDate(fDates, TrashType.REST, date);
          break;

        case 2:
          addDate(fDates, TrashType.GFT, date);
          break;

        case 3:
          addDate(fDates, TrashType.PAPIER, date);
          break;

        case 10:
          addDate(fDates, TrashType.PMD, date);
          break;

        default:
          this.log(`Unknown fraction: ${collection.fraction}`);
          break;
      }
    }

    return this.filterFutureDates(fDates);
  }

  private async afvalkalenderOmrin(apiSettings: ApiSettings) {
    this.log('Checking afvalkalender Omrin');

    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const houseNumberMatch = `${apiSettings.housenumber}`.match(/\d+/g);
    const numberAdditionMatch = `${apiSettings.housenumber}`.match(/[a-zA-Z]+/g);

    if (!houseNumberMatch || houseNumberMatch.length === 0) {
      throw new Error('Invalid house number');
    }

    let queryAddition = '';
    if (numberAdditionMatch !== null && numberAdditionMatch.length > 0 && numberAdditionMatch[0] !== null) {
      queryAddition = '&extention=' + numberAdditionMatch[0];
    }

    const hostname = 'api-omrin.freed.nl';
    const uniqueAppId = '8e6f4b70-1d3a-11ee-be56-0242ac120002';

    const post_data1 = `{'AppId':'${uniqueAppId}','AppVersion':'','OsVersion':'','Platform':'Homey'}`;

    // Retrieve Omrin App Token
    const getOmrinAppToken = await httpsPromise({
      hostname: hostname,
      path: `/Account/GetToken`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: post_data1,
      family: 4,
      rejectUnauthorized: false,
    });

    const result = <any>getOmrinAppToken.body;
    const publicKey = result.PublicKey;
    if (!publicKey || publicKey.length === 0) {
      throw new Error('No public key received from Omrin');
    }

    const post_data2 = `{'a':false,'Email':'','Password':'','PostalCode':'${apiSettings.zipcode}','HouseNumber':${houseNumberMatch[0]}}`;
    const encryptedBuffer = crypto.publicEncrypt(
      {
        key: `-----BEGIN PUBLIC KEY-----
${publicKey}
-----END PUBLIC KEY-----`,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(post_data2, 'utf8'),
    );

    const getOmrinTrashData = await httpsPromise({
      hostname: hostname,
      path: `/Account/FetchAccount/${uniqueAppId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: `"${encryptedBuffer.toString('base64')}"`,
      family: 4,
      rejectUnauthorized: false,
    });

    const trashDataResult = <any>getOmrinTrashData.body;

    for (let trashEntry of trashDataResult['CalendarV2']) {
      verifyByName(fDates, trashEntry.WelkAfval, trashEntry.Omschrijving, trashEntry.Datum.substr(0, 19), undefined, trashEntry.Kleur);
    }

    return this.filterFutureDates(fDates);
  }

  private async afvalkalenderLimburgNET(apiSettings: ApiSettings) {
    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'BE'); // Limburg.net is Belgium
    //await validateZipcode(apiSettings); // keep behavior consistent with other providers
    await validateHousenumber(apiSettings);
    await validateStreet(apiSettings);
    await validateCity(apiSettings);

    const houseNumberMatch = `${apiSettings.housenumber}`.match(/\d+/g);
    const numberAdditionMatch = `${apiSettings.housenumber}`.match(/[a-zA-Z]+/g);

    if (!houseNumberMatch || houseNumberMatch.length === 0) {
      throw new Error('Invalid house number');
    }

    let queryAddition = '';
    if (numberAdditionMatch !== null && numberAdditionMatch.length > 0 && numberAdditionMatch[0] !== null) {
      queryAddition = '&toevoeging=' + numberAdditionMatch[0];
    }

    // Helpers
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    const baseHost = 'limburg.net';
    const basePath = '/api-proxy/public';

    // Find cityId (nisCode)
    const cityQuery = encodeURIComponent(apiSettings.cityname);
    const cityResp = await httpsPromise({
      hostname: baseHost,
      path: `${basePath}/afval-kalender/gemeenten/search?query=${cityQuery}`,
      method: 'GET',
      headers,
      family: 4,
      rejectUnauthorized: false,
    });

    const cityList = <any[]>cityResp.body || [];

    if (!Array.isArray(cityList) || cityList.length === 0 || !cityList[0]?.nisCode) {
      throw new Error('City not found on Limburg.net');
    }

    const cityId = String(cityList[0].nisCode);

    // Find streetId (nummer)
    const streetQuery = encodeURIComponent(apiSettings.streetname);
    const streetResp = await httpsPromise({
      hostname: baseHost,
      path: `${basePath}/afval-kalender/gemeente/${cityId}/straten/search?query=${streetQuery}`,
      method: 'GET',
      headers,
      family: 4,
      rejectUnauthorized: false,
    });

    const streetList = <any[]>streetResp.body || [];
    if (!Array.isArray(streetList) || streetList.length === 0 || !streetList[0]?.nummer) {
      throw new Error('Street not found on Limburg.net');
    }

    const streetId = String(streetList[0].nummer);

    // Fetch current + next 2 months
    const collectEvents: any[] = [];
    let cur = new Date();
    cur.setDate(1); // normalize

    for (let i = 0; i < 3; i++) {
      const year = cur.getFullYear();
      const month = cur.getMonth() + 1; // 1..12
      const path = `${basePath}/kalender/${cityId}/${year}-${month}?straatNummer=${encodeURIComponent(streetId)}&huisNummer=${encodeURIComponent(houseNumberMatch[0])}${queryAddition}`;

      const mResp = await httpsPromise({
        hostname: baseHost,
        path,
        method: 'GET',
        headers,
        family: 4,
        rejectUnauthorized: false,
      });

      const monthJson = <any>mResp.body || {};
      if (Array.isArray(monthJson?.events)) {
        collectEvents.push(...monthJson.events);
      }

      // move to first of next month
      cur = new Date(year, month, 1);
    }

    // Map to ActivityDates[]
    for (const item of collectEvents) {
      if (!item || !item.date) continue;

      console.log(item);

      const type = (item.title ?? '').toString().trim();
      if (!type) continue;

      // API date like "2025-09-22T00:00:00+0200"
      const dt = new Date(item.date);
      if (Number.isNaN(dt.getTime())) continue;

      verifyByName(fDates, '', type, dt);
    }

    return this.filterFutureDates(fDates);
  }

  private svgToBase64(svgElement: any): string {
    const svgHtml = this.serializeNode(svgElement);
    const base64 = Buffer.from(svgHtml).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  private serializeNode(node: any): string {
    if (node.type === 'text') return node.data || '';
    if (node.type === 'comment') return `<!--${node.data}-->`;
    if (!node.name) return '';

    const attrs = Object.entries(node.attribs || {})
      .map(([key, val]) => `${key}="${val}"`)
      .join(' ');

    const children = (node.children || []).map((child: any) => this.serializeNode(child)).join('');
    return `<${node.name}${attrs ? ' ' + attrs : ''}>${children}</${node.name}>`;
  }
}
