"use strict";

var cleanApiArray = require('../cleanapis.js');
var expect  = require('chai').expect;
/*
it('Clean API - Clean Profs', function() {
    var postcode = "3206sn";
    var homenumber = 9;
    var country = "NL";
    var cleanApiId = "cpfs";
    var apiName = "Clean API - Clean Profs (1)";

    return testAPI(cleanApiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, cleanApiId, apiName)).to.be.true;
        });
});

it('Clean API - Clean Profs', function() {
    var postcode = "2264DD";
    var homenumber = 7;
    var country = "NL";
    var cleanApiId = "cpfs";
    var apiName = "Clean API - Clean Profs (2)";

    return testAPI(cleanApiId, apiName, postcode, homenumber, "", country)
        .then(function(result)
        {
            expect(validateApiResults(null, result, cleanApiId, apiName)).to.be.true;
        });
});
*/

function testAPI(cleanApiId, apiName, postcode, homenumber, streetName, country)
{
    var result = cleanApiArray.find(o => o.id === cleanApiId);
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
        console.log(result);
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