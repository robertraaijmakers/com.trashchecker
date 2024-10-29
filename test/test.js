"use strict";

var apiArray = require('../trashapis.js');
var expect  = require('chai').expect;

/*
it('API - Mijn Afvalwijzer', function() {
    var postcode = "9821TT";
    var homenumber = 9;
    var country = "NL";
    var apiId = "afw";
    var apiName = "API - Afvalwijzer";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalkalender Recycle BE - 1', function() {
    var postcode = "8930";
    var homenumber = 58;
    var country = "BE";
    var street = "Rozenstraat"
    var apiId = "recbe";
    var apiName = "API - Recycle BE";

    return testAPI(apiId, apiName, postcode, homenumber, street, country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalkalender Recycle BE - 2', function() {
    var postcode = "1731";
    var homenumber = 30;
    var country = "BE";
    var street = "Plataanlaan"
    var apiId = "recbe";
    var apiName = "API - Recycle BE";

    return testAPI(apiId, apiName, postcode, homenumber, street, country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalkalender Recycle BE - 3', function() {
    var postcode = "9100";
    var homenumber = 87;
    var country = "BE";
    var street = "Paddeschootdreef"
    var apiId = "recbe";
    var apiName = "API - Recycle BE";

    return testAPI(apiId, apiName, postcode, homenumber, street, country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});*/

it('API - Afvalkalender Recycle BE - 4', function() {
    var postcode = "8470";
    var homenumber = 64;
    var country = "BE";
    var street = "Voetweg"
    var apiId = "recbe";
    var apiName = "API - Recycle BE";

    return testAPI(apiId, apiName, postcode, homenumber, street, country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});
/*
it('API - Afvalkalender Westland', function() {
    var postcode = "2671BK";
    var homenumber = 12;
    var country = "NL";
    var apiId = "akwl";
    var apiName = "API - Afvalkalender Westland";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalkalender AVRI', function() {
    var postcode = "4002AK";
    var homenumber = 14;
    var country = "NL";
    var apiId = "avr";
    var apiName = "API - Afvalkalender AVRI";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalkalender Assen', function() {
    var postcode = "9402JW";
    var homenumber = 254;
    var country = "NL";
    var apiId = "gemas";
    var apiName = "API - Afvalkalender Assen";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - RD4', function() {
    var postcode = "6374BA";
    var homenumber = 159;
    var country = "NL";
    var apiId = "rd4";
    var apiName = "API - RD4";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - RD4 - Toevoeging', function() {
    var postcode = "6471CD";
    var homenumber = "57A";
    var country = "NL";
    var apiId = "rd4";
    var apiName = "API - RD4 - Toevoeging";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalwijzer', function() {
    var postcode = "9681TP";
    var homenumber = 5;
    var country = "NL";
    var apiId = "afw";
    var apiName = "API - Afvalwijzer";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalwijzer - Manual Description', function() {
    var postcode = "1141SL";
    var homenumber = 15;
    var country = "NL";
    var apiId = "afw";
    var apiName = "API - Afvalwijzer";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalwijzer - Extra GFT', function() {
    var postcode = "9321GZ";
    var homenumber = 52;
    var country = "NL";
    var apiId = "afw";
    var apiName = "API - Afvalwijzer";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Nissewaard', function() {
    var postcode = "3204BJ";
    var homenumber = 5;
    var country = "NL";
    var apiId = "aknw";
    var apiName = "API - Nissewaard";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Area Reiniging', function() {
    var postcode = "7812GL";
    var homenumber = 280;
    var country = "NL";
    var apiId = "arei";
    var apiName = "API - Area Reiniging";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Suez', function() {
    var postcode = "6836ME";
    var homenumber = 10;
    var country = "NL";
    var apiId = "arn";
    var apiName = "API - Suez";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Meerlanden', function() {
    var postcode = "2134PJ";
    var homenumber = 105;
    var country = "NL";
    var apiId = "akm";
    var apiName = "API - Meerlanden";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Waardlanden', function() {
    var postcode = "4132BL";
    var homenumber = 48;
    var country = "NL";
    var apiId = "rewl";
    var apiName = "API - Waardlanden";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalwijzer', function() {
    var postcode = "6191JM";
    var homenumber = 12;
    var country = "NL";
    var apiId = "afw";
    var apiName = "API - Afvalwijzer";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - ZRD', function() {
    var postcode = "4569AD";
    var homenumber = 26;
    var country = "NL";
    var apiId = "afzrd";
    var apiName = "API - ZRD";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Mijn Blink', function() {
    var postcode = "5673RE";
    var homenumber = 2;
    var country = "NL";
    var apiId = "mba";
    var apiName = "API - Mijn Blink";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Circulus Berkel', function() {
    var postcode = "7415TW";
    var homenumber = 66;
    var country = "NL";
    var apiId = "acb";
    var apiName = "API - Circulus Berkel";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Circulus Berkel', function() {
    var postcode = "7326RK";
    var homenumber = 305;
    var country = "NL";
    var apiId = "acb";
    var apiName = "API - Circulus Berkel - Henk";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Mijn Blink', function() {
    var postcode = "5673RE";
    var homenumber = 2;
    var country = "NL";
    var apiId = "mba";
    var apiName = "API - Mijn Blink";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalwijzer', function() {
    var postcode = "7007HS";
    var homenumber = 35;
    var country = "NL";
    var apiId = "afw";
    var apiName = "API - Afvalwijzer";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalwijzer', function() {
    var postcode = "4707RE";
    var homenumber = 1;
    var country = "NL";
    var apiId = "afw";
    var apiName = "API - Afvalwijzer";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalwijzer - Den Bosch', function() {
    var postcode = "5231PB";
    var homenumber = 4;
    var country = "NL";
    var apiId = "dbafw";
    var apiName = "API - Afvalwijzer - Den Bosch";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalwijzer - Rova', function() {
    var postcode = "3824GL";
    var homenumber = 11;
    var country = "NL";
    var apiId = "rov";
    var apiName = "API - Afvalwijzer - Rova";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Waste API - Gemeente Hellendoorn', function() {
    var postcode = "7447CE";
    var homenumber = 17;
    var country = "NL";
    var apiId = "geh";
    var apiName = "API - Waste API - Gemeente Hellendoorn";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Stadswerk072', function() {
    var postcode = "1817HP";
    var homenumber = 190;
    var country = "NL";
    var apiId = "hvc";
    var apiName = "API - Stadswerk072";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});
    
it('API - Waste API - Twente Milieu', function() {
  var postcode = "7642GN";
  var homenumber = 16;
  var country = "NL";
  var apiId = "twm";
    var apiName = "API - Waste API - Twente Milieu";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afval App', function() {
    var postcode = "5427CB";
    var homenumber = 10;
    var country = "NL";
    var apiId = "afa";
    var apiName = "API - Afval App";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
  });
*/
it('API - Almere Ximmio', function() {
    var postcode = "1324AM";
    var homenumber = 10;
    var country = "NL";
    var apiId = "alm";
    var apiName = "API - Almere Ximmio - 1";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});
it('API - Almere Ximmio', function() {
    var postcode = "1359KS";
    var homenumber = 20;
    var country = "NL";
    var apiId = "alm";
    var apiName = "API - Almere Ximmio - 2";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

/*
it('API - Afvalkalender RMN', function() {
    var postcode = "3768MJ";
    var homenumber = 40;
    var country = "NL";
    var apiId = "afrm";
    var apiName = "API - Afvalkalender RMN";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});
*/
it('API - Afvalkalender Etten-Leur', function() {
    var postcode = "4871TK";
    var homenumber = 36;
    var country = "NL";
    var apiId = "akel";
    var apiName = "API - Afvalkalender Etten-Leur";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});
/*
it('API - Afvalkalender Den Haag', function() {
    var postcode = "2552LJ";
    var homenumber = 13;
    var country = "NL";
    var apiId = "hkdh";
    var apiName = "API - Afvalkalender Den Haag";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Recycle!', function() {
    var postcode = "9040";
    var homenumber = 116;
    var streetName = "Isidoor de vosstraat";
    var country = "BE";
    var apiId = "recbe";
    var apiName = "API - REcycle!";

    return testAPI(apiId, apiName, postcode, homenumber, streetName, country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Avalex', function() {
    var postcode = "2627AD";
    var homenumber = 33;
    var streetName = "";
    var country = "NL";
    var apiId = "avx";
    var apiName = "API - Avalex";

    return testAPI(apiId, apiName, postcode, homenumber, streetName, country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afval App', function() {
    var postcode = "5427CW";
    var homenumber = 6;
    var streetName = "";
    var country = "NL";
    var apiId = "afa";
    var apiName = "API - Afval App";

    return testAPI(apiId, apiName, postcode, homenumber, streetName, country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

/*it('API - Mijn Blink - ERROR', function() {
    var postcode = "5673RE";
    var homenumber = 1111125;
    var country = "NL";
    var apiId = "mba";
    var apiName = "API - Mijn Blink";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});


it('API - Afvalkalender Súdwest-Fryslân', function() {
    var postcode = "9021CK";
    var homenumber = 27;
    var country = "NL";
    var apiId = "swf";
    var apiName = "API - Afvalkalender Súdwest-Fryslân'";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalkalender Súdwest-Fryslân', function() {
    var postcode = "9021CK";
    var homenumber = 27;
    var country = "NL";
    var apiId = "swf";
    var apiName = "API - Afvalkalender Súdwest-Fryslân'";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - Afvalkalender Cyclus Gouda', function() {
    var postcode = "2806KL";
    var homenumber = 26;
    var country = "NL";
    var apiId = "afc";
    var apiName = "API - Afvalkalender Cyclus Gouda'";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - RWM', function() {
    var postcode = "6191CE";
    var homenumber = 20;
    var country = "NL";
    var apiId = "rwm";
    var apiName = "API - RWM'";

    return testAPI(apiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});

it('API - RWM', function() {
    var postcode = "2650";
    var homenumber = 24;
    var country = "BE";
    var street = "De Pelgrim"
    var apiId = "recbe";
    var apiName = "API - RWM'";

    return testAPI(apiId, apiName, postcode, homenumber, street, country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, apiId, apiName)).to.be.true;
        });
});*/

function testAPI(apiId, apiName, postcode, homenumber, streetName, country)
{
    var result = apiArray.find(o => o.id === apiId);
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        return Promise.reject(new Error("Invalid API - " + apiName));
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    return result['execute'](postcode,homenumber,streetName,country);
}

function validateApiResults(err, result, apiId, apiName)
{
    console.log("Results for " + apiId + " - " + apiName);

    if(err) {
        console.log('Error in API', err);
        return false;
    }
    else if(Object.keys(result).length > 0)
    {
        console.log('API Settings found.');
        return true;
    }
    else if(Object.keys(result).length === 0) {
        console.log('No information found, go to settings to reset your API settings.');
        return false;
    } else {
        console.log("fail");
        return false;
    }
}