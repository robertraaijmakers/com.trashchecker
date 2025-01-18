'use strict';

import { ApiSettings, TrashCollectionReminder } from './types/localTypes';

module.exports = {
  async trashCollectionDays({ homey, query }: { homey: any; query: any }) {
    const app = <TrashCollectionReminder>homey.app;

    if (query.recalculate === 'true') {
      app.log('Recalculation started.');
      await app.recalculate();
    }

    return app.collectionDates;
  },
  async validateUserData({ homey, body }: { homey: any; body: ApiSettings }) {
    console.log(body);
    const app = <TrashCollectionReminder>homey.app;

    const apiFindResult = await app.trashApis.FindApi(body);
    return apiFindResult;
  },
  async validateUserCleanData({ homey, body }: { homey: any; body: ApiSettings }) {
    console.log(body);
    const app = <TrashCollectionReminder>homey.app;

    const cleanApiResult = await app.cleanApis.FindApi(body);
    return cleanApiResult;
  },
};
