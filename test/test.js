"use strict";

var apiArray = require('../trashapis.js');
var expect  = require('chai').expect;

it('API - RD4', function(done) {
    var postcode = "6374BA";
    var homenumber = 159;
    var country = "NL";

    var result = apiArray.find(o => o.id === "rd4");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "rd4", "API - RD4")).to.be.true;
        done();
    });
});

it('API - Afvalwijzer', function(done) {
    var postcode = "9681TP";
    var homenumber = 5;
    var country = "NL";

    var result = apiArray.find(o => o.id === "afw");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "afw", "API - Afvalwijzer")).to.be.true;
        done();
    });
});

it('API - Area Reiniging', function(done) {
    var postcode = "7812GL";
    var homenumber = 280;
    var country = "NL";

    var result = apiArray.find(o => o.id === "areareiniging");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "areareiniging", "API - Area Reiniging")).to.be.true;
        done();
    });
});


it('API - Suez', function(done) {
    var postcode = "6836ME";
    var homenumber = 10;
    var country = "NL";

    var result = apiArray.find(o => o.id === "arn");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "arn", "API - Suez")).to.be.true;
        done();
    });
});

it('API - Meerlanden', function(done) {
    var postcode = "2134PJ";
    var homenumber = 105;
    var country = "NL";

    var result = apiArray.find(o => o.id === "akm");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "akm", "API - Meerlanden")).to.be.true;
        done();
    });
});

it('API - Waardlanden', function(done) {
    var postcode = "4132BL";
    var homenumber = 48;
    var country = "NL";

    var result = apiArray.find(o => o.id === "rewl");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "rewl", "API - Waardlanden")).to.be.true;
        done();
    });
});

it('API - Afvalwijzer', function(done) {
    var postcode = "6191JM";
    var homenumber = 12;
    var country = "NL";

    var result = apiArray.find(o => o.id === "afw");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "afw", "API - Afvalwijzer")).to.be.true;
        done();
    });
});

it('API - Mijn Blink', function(done) {
    var postcode = "5673RE";
    var homenumber = 2;
    var country = "NL";

    var result = apiArray.find(o => o.id === "mba");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "mba", "API - Mijn Blink")).to.be.true;
        done();
    });
});

it('API - Circulus Berkel', function(done) {
    var postcode = "7415TW";
    var homenumber = 66;
    var country = "NL";

    var result = apiArray.find(o => o.id === "acb");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "acb", "API - Circulus Berkel")).to.be.true;
        done();
    });
});

it('API - Mijn Blink', function(done) {
    var postcode = "5673RE";
    var homenumber = 2;
    var country = "NL";

    var result = apiArray.find(o => o.id === "mba");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "mba", "API - Mijn Blink")).to.be.true;
        done();
    });
});

it('API - Afvalwijzer', function(done) {
    var postcode = "7007HS";
    var homenumber = 35;
    var country = "NL";

    var result = apiArray.find(o => o.id === "afw");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "afw", "API - Afvalwijzer")).to.be.true;
        done();
    });
});

it('API - Afvalwijzer', function(done) {
    var postcode = "4707RE";
    var homenumber = 1;
    var country = "NL";

    var result = apiArray.find(o => o.id === "afw");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "afw", "API - Afvalwijzer")).to.be.true;
        done();
    });
});

it('API - Afvalwijzer', function(done) {
    var postcode = "5231PB";
    var homenumber = 4;
    var country = "NL";

    var result = apiArray.find(o => o.id === "dbafw");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "dbafw", "API - Afvalwijzer")).to.be.true;
        done();
    });
});

it('API - Waste API - Gemeente Hellendoorn', function(done) {
    var postcode = "7441DH";
    var homenumber = 30;
    var country = "NL";

    var result = apiArray.find(o => o.id === "geh");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "geh", "API - Waste API - Gemeente Hellendoorn")).to.be.true;
        done();
    });
});

it('API - Stadswerk072', function(done) {
    var postcode = "1817HP";
    var homenumber = 190;
    var country = "NL";

    var result = apiArray.find(o => o.id === "sw072");
    if(result == null || typeof result === 'undefined')
    {
        console.log("Invalid API");
        done();
    }
    
    // only load that API, this is so that we won't send requests to all data providers all the time.
    result['execute'](postcode,homenumber,country,
    (err,result) => {
        expect(validateApiResults(err, result, "sw072", "API - Stadswerk072")).to.be.true;
        done();
    });
});

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
