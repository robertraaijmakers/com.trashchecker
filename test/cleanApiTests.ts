'use strict';

/*
  Disabled tests are to make sure we don't spam the APIs with requests when not needed.
  Enable tests when needed to test against the APIs.
*/

import { CleanApis } from '../lib/cleanapis';
import { describe, it } from 'node:test';
import { ActivityDates } from '../types/localTypes';
import assert from 'assert';
import { ApiSettings } from '../assets/publicTypes';

/*
describe('CleanApiCleanProfs', function () {
  it('Clean API - Clean Profs 1', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '3206sn',
      housenumber: '9',
      country: 'NL',
      apiId: '',
      cleanApiId: 'cpfs',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('Clean API - Clean Profs 2', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '2264DD',
      housenumber: '7',
      country: 'NL',
      apiId: '',
      cleanApiId: 'cpfs',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});
*/
function testAPI(apiSettings: ApiSettings) {
  const trashApis = new CleanApis(console.log);
  try {
    return trashApis.ExecuteApi(apiSettings);
  } catch (error) {
    console.log(error);
  }

  return null;
}

function validateApiResults(apiSettings: ApiSettings, apiResults: ActivityDates[] | null) {
  console.log('Results for: ' + apiSettings.apiId + ' - ' + apiSettings.zipcode + ':' + apiSettings.housenumber);
  console.log(apiResults);

  if (apiResults === null) {
    console.log('Error in API');
    return false;
  } else if (Object.keys(apiResults).length > 0) {
    console.log('API Settings found.');
    return true;
  } else if (Object.keys(apiResults).length === 0) {
    console.log('No information found, go to settings to reset your API settings.');
    return false;
  } else {
    console.log('fail');
    return false;
  }
}
