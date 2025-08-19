'use strict';

import { TrashApis } from '../lib/trashapis';
import { describe, it } from 'node:test';
import { ActivityDates } from '../types/localTypes';
import assert from 'assert';
import { ApiSettings } from '../assets/publicTypes';

describe('Blink Manager', function () {
  it('API - Blink Manager', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '5741WT',
      housenumber: '9',
      country: 'NL',
      apiId: 'mba',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

/*



describe('Kliko Manager', function () {
  it('API - Klikomanager Uithoorn', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '1421TZ',
      housenumber: '9',
      country: 'NL',
      apiId: 'kmuit',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Klikomanager Oude IJsselstreek', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '7051AA',
      housenumber: '8',
      country: 'NL',
      apiId: 'kmoij',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiApn', function () {
  it('API - Afvalkalender Alfen aan den Rijn', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '2406XT',
      housenumber: '21',
      country: 'NL',
      apiId: 'apn',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

/*
describe('TrashApiAkwl', function () {
  it('API - Afvalkalender Westland', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '2671BK',
      housenumber: '12',
      country: 'NL',
      apiId: 'akwl',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiRmn', function () {
  it('API - Afvalkalender RMN', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '3768MJ',
      housenumber: '40',
      country: 'NL',
      apiId: 'afrm',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiAvx', function () {
  it('API - Avalex', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '2627AD',
      housenumber: '33',
      country: 'NL',
      apiId: 'avx',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiAfrm', function () {
  it('API - Afvalkalender RMN', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '3768MJ',
      housenumber: '40',
      country: 'NL',
      apiId: 'afrm',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiAkm', function () {
  it('API - Meerlanden', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '2134PJ',
      housenumber: '105',
      country: 'NL',
      apiId: 'akm',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiGemas', function () {
  it('API - Afvalkalender Assen', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '9402JW',
      housenumber: '254',
      country: 'NL',
      apiId: 'gemas',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiAfc', function () {
  it('API - Mijn Cyclus', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '2741jb',
      housenumber: '37',
      country: 'NL',
      apiId: 'afc',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Cyclus (2)', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '2914EM',
      housenumber: '107',
      country: 'NL',
      apiId: 'afc',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiSvr', function () {
  it('API - Saver (1)', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '4715EP',
      housenumber: '7',
      country: 'NL',
      apiId: 'svr',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Saver (2)', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '4707RE',
      housenumber: '1',
      country: 'NL',
      apiId: 'svr',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Saver (3) - Roosendaal', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '4702AN',
      housenumber: '7',
      country: 'NL',
      apiId: 'svr',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});
/*
describe('TrashApiRov', function () {
  it('API - Afvalwijzer - Rova', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '3824GL',
      housenumber: '11',
      country: 'NL',
      apiId: 'rov',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Afvalwijzer - Rova - Niet bestaand adres', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '7461JC',
      housenumber: '12',
      country: 'NL',
      apiId: 'rov',
      cleanApiId: '',
      streetname: '',
    };

    try {
      const result = await testAPI(apiSettings);
      assert.ok(false, 'Expected an error for non-existing address');
    } catch (error) {
      console.log('Error caught as expected for non-existing address');
      assert.ok(true);
    }
  });
});

describe('TrashApiRad', function () {
  it('API - RAD 2', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '3241CM',
      housenumber: '22',
      country: 'NL',
      apiId: 'rad',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - RAD', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '3284XR',
      housenumber: '17',
      country: 'NL',
      apiId: 'rad',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});
/*
describe('TrashApiRecbe', function () {
  it('API - Afvalkalender Recycle BE - 1', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '8930',
      housenumber: '58',
      country: 'BE',
      apiId: 'recbe',
      cleanApiId: '',
      streetname: 'Rozenstraat',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Afvalkalender Recycle BE - 2', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '1731',
      housenumber: '30',
      country: 'BE',
      apiId: 'recbe',
      cleanApiId: '',
      streetname: 'Plataanlaan',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Afvalkalender Recycle BE - 3', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '9100',
      housenumber: '87',
      country: 'BE',
      apiId: 'recbe',
      cleanApiId: '',
      streetname: 'Paddeschootdreef',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Afvalkalender Recycle BE - 4', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '8470',
      housenumber: '64',
      country: 'BE',
      apiId: 'recbe',
      cleanApiId: '',
      streetname: 'Voetweg',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - RECYCLE BE 5', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '2650',
      housenumber: '24',
      country: 'BE',
      apiId: 'recbe',
      cleanApiId: '',
      streetname: 'De Pelgrim',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiAvr', function () {
  it('API - Afvalkalender AVRI', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '4002AK',
      housenumber: '14',
      country: 'NL',
      apiId: 'avr',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('HuisvuilDenHaag', function () {
  it('API - Huisvuil Den Haag', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '2492NN',
      housenumber: '9',
      country: 'NL',
      apiId: 'hkdh',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiRd4', function () {
  it('API - RD4', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '6374BA',
      housenumber: '159',
      country: 'NL',
      apiId: 'rd4',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - RD4 - Toevoeging', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '6471CD',
      housenumber: '57A',
      country: 'NL',
      apiId: 'rd4',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});
*/
describe('TrashApiAfw', function () {
  /*
  it('API - Mijn Afvalwijzer (7) - Rotterdam', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '3077SJ',
      housenumber: '9',
      country: 'NL',
      apiId: 'afw',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Mijn Afvalwijzer (1)', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '9821TT',
      housenumber: '9',
      country: 'NL',
      apiId: 'afw',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Afvalwijzer (2) - #204', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '5122GP',
      housenumber: '94',
      country: 'NL',
      apiId: 'afw',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Afvalwijzer (3)', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '9681TP',
      housenumber: '5',
      country: 'NL',
      apiId: 'afw',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Afvalwijzer (4) - Manual Description', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '1141SL',
      housenumber: '15',
      country: 'NL',
      apiId: 'afw',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Afvalwijzer (5) - Extra GFT', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '9321GZ',
      housenumber: '52',
      country: 'NL',
      apiId: 'afw',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
  /*
  it('API - Afvalwijzer (1)', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '7007HS',
      housenumber: '35',
      country: 'NL',
      apiId: 'afw',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Afvalwijzer - Den Bosch', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '5231PB',
      housenumber: '4',
      country: 'NL',
      apiId: 'dbafw',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });*/
});
/*
describe('Woerden Ximmio', function () {
  it('API - Ximmio - Woerden', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '3441AX',
      housenumber: '9',
      country: 'NL',
      apiId: 'akwrd',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

/*
describe('TrashApiAknw', function () {
  it('API - Nissewaard', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '3204BJ',
      housenumber: '5',
      country: 'NL',
      apiId: 'aknw',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiArei', function () {
  it('API - Area Reiniging', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '7812GL',
      housenumber: '280',
      country: 'NL',
      apiId: 'arei',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiArn', function () {
  it('API - Suez', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '6836ME',
      housenumber: '10',
      country: 'NL',
      apiId: 'arn',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiRewl', function () {
  it('API - Waardlanden', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '4132BL',
      housenumber: '48',
      country: 'NL',
      apiId: 'rewl',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiAfzrd', function () {
  it('API - ZRD - 1', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '4569AD',
      housenumber: '26',
      country: 'NL',
      apiId: 'afzrd',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - ZRD - 2 - Lege respons', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '4463LG',
      housenumber: '19',
      country: 'NL',
      apiId: 'afzrd',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiMba', function () {
  it('API - Mijn Blink', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '5673RE',
      housenumber: '2',
      country: 'NL',
      apiId: 'mba',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiAcb', function () {
  it('API - Circulus Berkel', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '7415TW',
      housenumber: '66',
      country: 'NL',
      apiId: 'acb',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Circulus Berkel - Henk', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '7326RK',
      housenumber: '305',
      country: 'NL',
      apiId: 'acb',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiAfa', function () {
  it('API - Afval App', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '5427CB',
      housenumber: '10',
      country: 'NL',
      apiId: 'afa',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });

  it('API - Afval App', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '5427CW',
      housenumber: '6',
      country: 'NL',
      apiId: 'afa',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiSwf', function () {
  it('API - Afvalkalender Súdwest-Fryslân', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '9021CK',
      housenumber: '27',
      country: 'NL',
      apiId: 'swf',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiAfc', function () {
  it('API - Afvalkalender Cyclus Gouda', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '2806KL',
      housenumber: '26',
      country: 'NL',
      apiId: 'afc',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiRwm', function () {
  it('API - RWM', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '6191CE',
      housenumber: '20',
      country: 'NL',
      apiId: 'rwm',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiBAR', function () {
  it('API - BAR', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '2992WG',
      housenumber: '19',
      country: 'NL',
      apiId: 'afbar',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiHVC', function () {
  it('API - HVC', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '2671BK',
      housenumber: '12',
      country: 'NL',
      apiId: 'hvc',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiBurgerportaalAssen', function () {
  it('API - HVC', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '9405HA',
      housenumber: '7',
      country: 'NL',
      apiId: 'gemas',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiVenlo', function () {
  it('API - Venlo', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '5922BT',
      housenumber: '48',
      country: 'NL',
      apiId: 'akvnl',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});

describe('TrashApiGroningen', function () {
  it('API - Groningen', async function () {
    const apiSettings: ApiSettings = {
      zipcode: '9713RH',
      housenumber: '10',
      country: 'NL',
      apiId: 'akgr',
      cleanApiId: '',
      streetname: '',
    };

    const result = await testAPI(apiSettings);
    const isValid = validateApiResults(apiSettings, result);
    assert.equal(isValid, true);
  });
});*/

function testAPI(apiSettings: ApiSettings) {
  const trashApis = new TrashApis(console.log);
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
