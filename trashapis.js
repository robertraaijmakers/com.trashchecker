"use strict";

var apiList = [];
var https = require('https');
var cheerio = require('cheerio');
var ical = require('ical');

/**
 * Different vendors using the same three base API's
 */

function mijnAfvalWijzer(postcode, housenumber, street, country) {
    return generalMijnAfvalwijzerApiImplementation(postcode, housenumber, country, "www.mijnafvalwijzer.nl");
}

function denBoschAfvalstoffendienstCalendar(postcode, housenumber, street, country) {
    return generalMijnAfvalwijzerApiImplementation(postcode, housenumber, country, 'denbosch.afvalstoffendienstkalender.nl');
}

function rovaAfvalkalender(postcode, housenumber, street, country) {
    return generalMijnAfvalwijzerApiImplementation(postcode, housenumber, country, "inzamelkalender.rova.nl");
}

function afvalkalenderCyclus(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.cyclusnv.nl');
}

function afvalkalenderZrd(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.zrd.nl');
}

function afvalRmn(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'inzamelschema.rmn.nl');
}

function afvalkalenderCure(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.cure-afvalbeheer.nl');
}

function afvalkalenderPeelEnMaas(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.peelenmaas.nl');
}

function afvalkalenderVenray(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.venray.nl');
}

function darAfvalkalender(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.dar.nl');
}

function inzamelkalenderHVC(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'inzamelkalender.hvcgroep.nl');
}

function BlinkAfvalkalender(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'mijnblink.nl');
}

function GadGooiAndVechtstreek(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'inzamelkalender.gad.nl');
}

function afvalwijzerStadswerk072(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'www.stadswerk072.nl');
}

function afvalwijzerPreZero(postcode, housenumber, street, country) {
    console.log("Checking Afvalwijzer Suez");
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'inzamelwijzer.prezero.nl')
}

function afvalkalenderMeerlanden(postcode, housenumber, street, country) {
    console.log("Checking Meerlanden");
    return generalImplementationWasteApi(postcode, housenumber, country, "800bf8d7-6dd1-4490-ba9d-b419d6dc8a45");
}

function afvalAvalex(postcode, housenumber, street, country) {
    console.log("Checking Avalex");
    return generalImplementationWasteApi(postcode, housenumber, country, 'f7a74ad1-fdbf-4a43-9f91-44644f4d4222');
}

function twenteMilieu(postcode, housenumber, street, country) {
    console.log("Checking Twente Milieu");
    return generalImplementationWasteApi(postcode, housenumber, country, "8d97bb56-5afd-4cbc-a651-b4f7314264b4", "twentemilieuapi.ximmio.com");
}

function nissewaard(postcode, housenumber, street, country) {
    console.log("Checking Nissewaard");
    return generalImplementationWasteApi(postcode, housenumber, country, "9dc25c8a-175a-4a41-b7a1-83f237a80b77", "reinis.ximmio.com");
}

function gemeenteHellendoorn(postcode, housenumber, street, country) {
    console.log("Checking Gemeente Hellendoorn");
    return generalImplementationWasteApi(postcode, housenumber, country, "24434f5b-7244-412b-9306-3a2bd1e22bc1", "wasteapi.ximmio.com");
}

function acvAfvalkalender(postcode, housenumber, street, country)
{
    console.log("Checking ACV afvalkalender");
    return generalImplementationWasteApi(postcode, housenumber, country, "f8e2844a-095e-48f9-9f98-71fceb51d2c3", "wasteapi.ximmio.com");
}

function almereAfvalkalender(postcode, housenumber, street, country)
{
    console.log("Checking Almere afvalkalender");
    return generalImplementationWasteApi(postcode, housenumber, country, "53d8db94-7945-42fd-9742-9bbc71dbe4c1", "wasteapi.ximmio.com");
}

function areaReiniging(postcode, housenumber, street, country)
{
    console.log("Checking Area Reiniging");
    return generalImplementationWasteApi(postcode, housenumber, country, "adc418da-d19b-11e5-ab30-625662870761");
}

function reinigingsdienstWaardlanden(postcode, housenumber, street, country)
{
    console.log("Checking Reinigingsdienst Waardlanden");
    return generalImplementationWasteApi(postcode, housenumber, country, "942abcf6-3775-400d-ae5d-7380d728b23c", "wasteapi.ximmio.com");
}

function recycleApp(postcode, housenumber, street, country)
{
    console.log("Checking Recycle App");
    return generalImplementationRecycleApp(postcode, housenumber, street, country);
}

/**
 * General implementation of the afvalkalender API used by a lot of different vendors.
 */
function newGeneralAfvalkalendersNederland(postcode, housenumber, country, baseUrl) {
    console.log("Checking new general afvalkalenders with URL: " + baseUrl);

    if (country !== "NL") {
        console.log('unsupported country');
        return Promise.reject(Error('Unsupported country'));
    }

    var retrieveIdentificationRequest = httpsPromise({
        hostname: baseUrl,
        path: `/adressen/${postcode}:${housenumber}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    
    return new Promise(function(resolve, reject)
    {
        retrieveIdentificationRequest.then(function(result)
        {            
            if(result.length <= 0)
            {
                reject(new Error("Invalid zipcode for " + baseUrl));
            }

            var identificatie = result[0].bagid;
            console.log(identificatie);

            var retrieveCalendar  = httpsPromise({
                hostname: baseUrl,
                path: `/ical/${identificatie}`,
                method: 'GET'
            });

            retrieveCalendar.then(function(icalResult)
            {
                const dates = {};
                const entries = ical.parseICS(icalResult);
                for (let i in entries) {
                    const entry = entries[i];
                    const dateStr = entry.start.getFullYear() + '-' + (('0' + (entry.start.getMonth() + 1)).slice(-2)) + "-" + ('0' + entry.start.getDate()).slice(-2);

                    var description = entry.description.toLowerCase().trim();

                    if (description.indexOf('groente') !== -1 || description.indexOf('gft') !== -1) {
                        if (!dates.GFT) dates.GFT = [];
                        dates.GFT.push(dateStr);
                    } else if (description.indexOf('rest') !== -1) {
                        if (!dates.REST) dates.REST = [];
                        dates.REST.push(dateStr);
                    } else if (description.indexOf('pmd') !== -1 || description.indexOf('pd') !== -1 || description.indexOf('metaal') !== -1 || description.indexOf('drankkartons') !== -1) {
                        if (!dates.PMD) dates.PMD = [];
                        dates.PMD.push(dateStr);
                    } else if (description.indexOf('plastic') !== -1) {
                        if (!dates.PLASTIC) dates.PLASTIC = [];
                        dates.PLASTIC.push(dateStr);
                    }  else if (description.indexOf('papier') !== -1) {
                        if (!dates.PAPIER) dates.PAPIER = [];
                        dates.PAPIER.push(dateStr);
                    } else if (description.indexOf('textiel') !== -1 || description.indexOf('retour') !== -1) {
                        if (!dates.TEXTIEL) dates.TEXTIEL = [];
                        dates.TEXTIEL.push(dateStr);
                    } else if(description.indexOf('kerstbomen') !== -1 || description.indexOf('kerst') !== -1) {
                        if (!dates.KERSTBOOM) dates.KERSTBOOM = [];
                        dates.KERSTBOOM.push(dateStr);
                    } else if(description.indexOf('grof') !== -1 || description.indexOf('vuil') !== -1) {
                        if (!dates.GROF) dates.GROF = [];
                        dates.GROF.push(dateStr);
                    } else if(description.indexOf('glas') !== -1) {
                        if (!dates.GLAS) dates.GLAS = [];
                        dates.GLAS.push(dateStr);
                    } else {
                        console.log("Unknown description: " + description);
                    }
                }

                console.log(dates);
                resolve(dates);
            })
            .catch(function(error)
            {
                console.log("retrieve calender rejected");
                console.log(error);
                reject(error);
            });
        }).catch(function(error)
        {
            console.log("retrieve identification rejected");
            console.log(error);
            reject(error);
        });
    });
}

function generalMijnAfvalwijzerApiImplementation(postcode, housenumber, country, baseUrl, callback) {
    console.log("Checking general afvalkalenders API implementation URL: " + baseUrl);

    if (country !== "NL") {
        console.log('unsupported country');
        return Promise.reject(Error('Unsupported country'));
    }

    var retrieveCalendarDataRequest = httpsPromise({
        hostname: baseUrl,
        path: `/nl/${postcode}/${housenumber}/`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    
    return new Promise(function(resolve, reject)
    {
        retrieveCalendarDataRequest.then(function(body)
        {            
            // Stip lot of data from body to prevent memory overflow
            var fDates = {};
            var searchResultIndex = body.indexOf('<table width="100%" cellpadding="0" cellspacing="0" role=\'presentation\'>');

            var regex = /<a href="#waste-(.*) class="wasteInfoIcon/i;
            var searchResultIndex = body.search(regex);
            console.log(searchResultIndex);

            while(searchResultIndex >= 0)
            {
                var endString = body.indexOf('</a>', searchResultIndex);
                var result = body.substr(searchResultIndex, endString-searchResultIndex+4);
                var $ = cheerio.load(result);

                $('a.wasteInfoIcon p').each((i, elem) => {

                    if(elem == null)
                    {
                        return;
                    }

                    if(elem.children.length < 2)
                    {
                        return;
                    }

                    if(elem.children[1].children == null)
                    {
                        return;
                    }

                    var dateStr = "";
                    if(elem.children[1].children.length < 1)
                    {
                        dateStr = parseDate(elem.children[0].data);
                    }
                    else {
                        dateStr = parseDate(elem.children[1].children[0].data);
                    }

                    switch (elem.attribs.class.trim()) {
                        case 'gft':
                            if (!fDates.GFT) fDates.GFT = [];
                            fDates.GFT.push(dateStr);
                            break;
                        case 'papier':
                            if (!fDates.PAPIER) fDates.PAPIER = [];
                            fDates.PAPIER.push(dateStr);
                            break;
                        case 'plastic':
                            if (!fDates.PLASTIC) fDates.PLASTIC = [];
                            fDates.PLASTIC.push(dateStr);
                            break;
                        case 'restafval':
                            if (!fDates.REST) fDates.REST = [];
                            fDates.REST.push(dateStr);
                            break;
                        case 'pmd':
                        case 'pd':
                            if (!fDates.PMD) fDates.PMD = [];
                            fDates.PMD.push(dateStr);
                            break;
                        case 'restgft':
                            if (!fDates.REST) fDates.REST = [];
                            if (!fDates.GFT) fDates.GFT = [];
                            fDates.REST.push(dateStr);
                            fDates.GFT.push(dateStr);
                            break;
                        case 'grof':
                        case 'grof vuil':
                        case 'grofvuil':
                            if (!fDates.GROF) fDates.GROF = [];
                            fDates.GROF.push(dateStr);
                            break;
                        case 'kerst':
                        case 'kerstboom':
                        case 'kerstbomen':
                            if (!fDates.KERSTBOOM) fDates.KERSTBOOM = [];
                            fDates.KERSTBOOM.push(dateStr);
                            break;
						case 'dhm':
						case 'textiel':
							if (!fDates.TEXTIEL) fDates.TEXTIEL = [];
                            fDates.TEXTIEL.push(dateStr);
                            break;
                        case 'glas':
                            if (!fDates.GLAS) fDates.GLAS = [];
                            fDates.GLAS.push(dateStr);
                            break;
                        default:
                            console.log('Defaulted. Element not found:', elem.attribs.class);
                    }

                    elem = null; // clear memory leak?
                });

                var nextResult = body.substring(searchResultIndex+4).search(regex);
                if(nextResult > 0)
                {
                    searchResultIndex = nextResult + searchResultIndex + 4;
                }
                else
                {
                    searchResultIndex = -1;
                }
            }

            console.log(fDates);
            resolve(fDates);
        }).catch(function(error)
        {
            console.log("retrieve identification rejected");
            console.log(error);
            reject(error);
        });
    });
}

function generalImplementationWasteApi(postcode, housenumber, country, companyCode, callback, hostName = 'wasteprod2api.ximmio.com')
{
    console.log(`Checking company code ${companyCode}.`);

    if (country !== "NL") {
        console.log('unsupported country');
        return Promise.reject(Error('Unsupported country'));
    }

    return Promise.reject(Error('Waste API isnt working at this moment due to an unknown error.'));

    var startDate = new Date();
    startDate = formatDate(startDate.setDate(startDate.getDate() - 14));

    var endDate = new Date();
    endDate = formatDate(endDate.setDate(endDate.getDate() + 30));

    console.log(startDate);
    console.log(endDate);

    var post_data1 = `{companyCode:"${companyCode}",postCode:"${postcode}",houseNumber:"${housenumber}",houseLetter:""}`;
    var retrieveUniqueId = httpsPromise({ 
        hostname: hostName,
        path: `/api/FetchAdress`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(post_data1)
        },
        body: post_data1
    });

    return new Promise(function(resolve, reject)
    {
        retrieveUniqueId.then(function(result)
        {            
            console.log(result);

            if(!result.status)
            {
                reject(new Error("Invalid response. Postal code not identified."));
                return;
            }

            if (typeof result === 'undefined' || typeof result.dataList === 'undefined' || typeof result.dataList[0] === 'undefined')
            {
                reject(new Error('UniqueID could not be found in the response.'));
                return;
            }

            var uniqueID = obj1.dataList[0].UniqueId;

            var post_data2 = `{companyCode:"${companyCode}",uniqueAddressID:"${uniqueID}",startDate:"${startDate}",endDate:"${endDate}"}`;
            var retrieveCalendarDataRequest = httpsPromise({
                hostname: hostName,
                path: `/api/GetCalendar`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(post_data2)
                },
                body: post_data2
            });

            retrieveCalendarDataRequest.then(function(calendarResult)
            {    
                if(!calendarResult.status)
                {
                    reject(new Error('Invalid calendar result. ' + calendarResult.status));
                    return;
                }
                
                var fDates = {};
                for (var i = 0; i < Object.keys(obj2.dataList).length; i++) {
                    for (var j = 0; j < Object.keys(obj2.dataList[i].pickupDates).length; j++) {
                        var date = dateFormat(obj2.dataList[i].pickupDates[j], "yyyy-mm-dd");
                        switch (obj2.dataList[i]._pickupTypeText) {
                            case "GREY":
                                if (!fDates.REST) fDates.REST = [];
                                fDates.REST.push(date);
                                break;
                            case "GREEN":
                                if (!fDates.GFT) fDates.GFT = [];
                                fDates.GFT.push(date);
                                break;
                            case "PAPER":
                                if (!fDates.PAPIER) fDates.PAPIER = [];
                                fDates.PAPIER.push(date);
                                break;
                            case "PLASTIC":
                                if (!fDates.PLASTIC) fDates.PLASTIC = [];
                                fDates.PLASTIC.push(date);
                                break;
                            case "PACKAGES":
                            case "PMD":
                                if (!fDates.PMD) fDates.PMD = [];
                                fDates.PMD.push(date);
                                break;
                            case "TEXTILE":
                                if (!fDates.TEXTIEL) fDates.TEXTIEL = [];
                                fDates.TEXTIEL.push(date);
                                break;
                            case "GLAS":
                            case "GLASS":
                                if (!fDates.GLAS) fDates.GLAS = [];
                                fDates.GLAS.push(date);
                                break;
                        }
                    }
                }
                
                resolve(fDates);
            }).catch(function(error)
            {
                console.log("Retrieval of dates failed.");
                console.log(error);
                reject(error);
            });
        }).catch(function(error)
        {
            console.log("Retrieval of identification failed.");
            console.log(error);
            reject(error);
        });
    });
}

function generalImplementationRecycleApp(postcode, housenumber, street, country, callback)
{
    var fDates = {};
    if (country !== "BE") {
        console.log('unsupported country');
        return callback(new Error('unsupported country'));
    }

    var host = "https://recycleapp.be/";
    var accessConsumer = "recycleapp.be";
    var accessSecret = "Crgja3EGWe8jdapyr4EEoMBgZACYYjRRcRpaMQrLDW9HJBvmgkfGQyYqLgeXPavAGvnJqkV87PBB2b8zx43q46sUgzqio4yRZbABhtKeagkVKypTEDjKfPgGycjLyJTtLHYpzwJgp4YmmCuJZN9ZmJY8CGEoFs8MKfdJpU9RjkEVfngmmk2LYD4QzFegLNKUbcCeAdEW";

    // Get access token
    var accessTokenRequest = {
        url: host + 'api/app/v1/access-token',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Homey',
          'x-consumer': accessConsumer,
          'x-secret': accessSecret
        }
    };

    request.get(accessTokenRequest, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var result = "{}";

            try {
                result = JSON.parse(body);
            }
            catch(err)
            {
                return callback(new Error("Exception parsing JSON: " + err + " for " + accessTokenRequest.url + " and zip code " + postcode));
            }

            var accessToken = result.accessToken;

            // Validate zipcode request
            var validateZipCodeRequest = {
                url: host + 'api/app/v1/zipcodes?q=' + postcode,
                headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Homey',
                'Authorization': accessToken,
                'x-consumer': accessConsumer,                
                }
            };
            
            request.get(validateZipCodeRequest, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    var result = "{}";
        
                    try {
                        result = JSON.parse(body);
                    }
                    catch(err)
                    {
                        return callback(new Error("Exception parsing JSON: " + err + " for " + validateZipCodeRequest.url + " and zip code " + postcode));
                    }

                    if(result.items.length <= 0)
                    {
                        return callback(new Error("No zipcode found for: " + postcode));
                    }

                    if(result.items.length > 1)
                    {
                        return callback(new Error("Multiple zipcode entries found for: " + postcode));
                    }

                    var zipcodeId = result.items[0].id;

                    // Validate street request
                    var validateStreetRequest = {
                        url: host + 'api/app/v1/streets?q=' + street + '&zipcodes=' + zipcodeId,
                        headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Homey',
                        'Authorization': accessToken,
                        'x-consumer': accessConsumer,                
                        }
                    };
                    
                    request.get(validateStreetRequest, function (err, res, body) {
                        if (!err && res.statusCode == 200) {
                            var result = "{}";
        
                            try {
                                result = JSON.parse(body);
                            }
                            catch(err)
                            {
                                return callback(new Error("Exception parsing JSON: " + err + " for " + validateStreetRequest.url + " and zip code " + postcode));
                            }

                            if(result.items.length <= 0)
                            {
                                return callback(new Error("No street found for: " + street));
                            }

                            if(result.items.length > 1)
                            {
                                return callback(new Error("Multiple streets found for: " + street));
                            }

                            var streetId = result.items[0].id;

                            // Validate street request
                            var startDate = new Date(); //startDate.set
                            startDate = dateFormat(startDate.setDate(startDate.getDate() - 7), "yyyy-mm-dd");

                            var endDate = new Date();
                            endDate = dateFormat(endDate.setDate(endDate.getDate() + 14), "yyyy-mm-dd");

                            var getTrashRequest = {
                                url: host + 'api/app/v1/collections?size=100&untilDate=' + endDate + '&fromDate=' + startDate + '&houseNumber=' + housenumber + '&streetId=' + streetId + '&zipcodeId=' + zipcodeId,
                                headers: {
                                'Content-Type': 'application/json',
                                'User-Agent': 'Homey',
                                'Authorization': accessToken,
                                'x-consumer': accessConsumer,                
                                }
                            };
                            
                            request.get(getTrashRequest, function (err, res, body) {
                                if (!err && res.statusCode == 200) {
                                    var result = "{}";
                                    const dates = {};
        
                                    try {
                                        result = JSON.parse(body);
                                    }
                                    catch(err)
                                    {
                                        return callback(new Error("Exception parsing JSON: " + err + " for " + getTrashRequest.url + " and zip code " + postcode));
                                    }

                                    if(result.items.length <= 0)
                                    {
                                        return callback(new Error("No trash data found for: " + getTrashRequest.url));
                                    }

                                    for (let i in result.items) {
                                        const entry = result.items[i];
                                        const dateStr = entry.timestamp.substr(0,10);

                                        var description = "";
                                        try {
                                            description = entry.fraction.name.nl.toLowerCase().trim();
                                        } catch(Exception) {
                                            description = entry.fraction.name.fr.toLowerCase().trim();
                                        }

                                        if (description.indexOf('groente') !== -1 || description.indexOf('gft') !== -1) {
                                            if (!dates.GFT) dates.GFT = [];
                                            dates.GFT.push(dateStr);
                                        } else if (description.indexOf('rest') !== -1) {
                                            if (!dates.REST) dates.REST = [];
                                            dates.REST.push(dateStr);
                                        } else if (description.indexOf('pmd') !== -1 || description.indexOf('pd') !== -1 || description.indexOf('metaal') !== -1 || description.indexOf('drankkartons') !== -1) {
                                            if (!dates.PMD) dates.PMD = [];
                                            dates.PMD.push(dateStr);
                                        } else if (description.indexOf('plastic') !== -1) {
                                            if (!dates.PLASTIC) dates.PLASTIC = [];
                                            dates.PLASTIC.push(dateStr);
                                        }  else if (description.indexOf('papier') !== -1) {
                                            if (!dates.PAPIER) dates.PAPIER = [];
                                            dates.PAPIER.push(dateStr);
                                        } else if (description.indexOf('textiel') !== -1 || description.indexOf('retour') !== -1) {
                                            if (!dates.TEXTIEL) dates.TEXTIEL = [];
                                            dates.TEXTIEL.push(dateStr);
                                        } else if(description.indexOf('kerstbomen') !== -1 || description.indexOf('kerst') !== -1) {
                                            if (!dates.KERSTBOOM) dates.KERSTBOOM = [];
                                            dates.KERSTBOOM.push(dateStr);
                                        } else if(description.indexOf('grof') !== -1 || description.indexOf('vuil') !== -1) {
                                            if (!dates.GROF) dates.GROF = [];
                                            dates.GROF.push(dateStr);
                                        } else if(description.indexOf('glas') !== -1) {
                                            if (!dates.GLAS) dates.GLAS = [];
                                            dates.GLAS.push(dateStr);
                                        } else {
                                            console.log("Unknown description: " + description);
                                        }
                                    }
                                        
                                    console.log(dates);
                                    return callback(null, dates);
                                }
                                else {
                                    return callback(new Error("Can't retrieve trash data."));
                                }
                            });
                        }
                        else {
                            return callback(new Error("Can't validate street."));
                        }
                    });
                }
                else {
                    return callback(new Error("Can't validate zipcode."));
                }
            });
        }
        else {
            return callback(new Error("Can't retrieve access token."));
        }
    });
}

/**
 * Vendor specific API implementations
 */
function recycleManager(postcode, housenumber, street, country, callback) {
    if (country !== "NL") {
        console.log('unsupported country');
        callback(new Error('unsupported country'));
    }

    var fDates = {};
    console.log("Recyclemanager met: " + postcode + " " + housenumber);
    var url = `https://vpn-wec-api.recyclemanager.nl/v2/calendars?postalcode=${postcode}&number=${housenumber}`;

    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            // console.log(res);
            var obj1 = JSON.parse(res.body);
            if (obj1.status == "success") {
                for (var i = 0; i < 2; i++) {
                    // console.log("Maand is: " + dateFormat(obj1.data[i].title));
                    if (typeof obj1.data[i].occurrences !== 'undefined') {
                        for (var j = 0; j < obj1.data[i].occurrences.length; j++) {
                            var dateStr = dateFormat(obj1.data[i].occurrences[j].from.date, "yyyy-mm-dd");
                            console.log("Soort afval is: " + obj1.data[i].occurrences[j].title);
                            switch (obj1.data[i].occurrences[j].title) {
                                case 'Groente en fruit':
                                case 'GFT':
                                    if (!fDates.GFT) fDates.GFT = [];
                                    fDates.GFT.push(dateStr);
                                    break;
                                case 'Papier':
                                    if (!fDates.PAPIER) fDates.PAPIER = [];
                                    fDates.PAPIER.push(dateStr);
                                    break;
                                case 'Restafval':
                                    if (!fDates.REST) fDates.REST = [];
                                    fDates.REST.push(dateStr);
                                    break;
                                case 'PMD':
                                case 'Plastic verpakkingen':
                                    if (!fDates.PLASTIC) fDates.PLASTIC = [];
                                    fDates.PLASTIC.push(dateStr);
                                    break;
                                default:
                                    console.log('defaulted', obj1.data[i].occurrences[j]);
                            }
                        }
                    }
                }
                console.log(fDates);
                return callback(null, fDates);
            } else {
                console.log("Postcode niet gevonden!");
                return callback(new Error("Postcode niet gevonden!"));
            }
        } else {
            console.log("Probleem met aanroep API!");
            return callback(new Error("Probleem met aanroep API!"));
        }
    });
}

function afvalkalenderRD4(postcode, housenumber, street, country, callback) {
    console.log("Checking afvalkalender RD4");

    const d = new Date();
    var url = "https://data.rd4.nl/api/v1/waste-calendar?postal_code="+postcode.substring(0,4)+"+"+postcode.substring(4,6)+"&house_number="+housenumber+"&year="+d.getFullYear()+"&types[]=residual_waste&types[]=gft&types[]=paper&types[]=pruning_waste&types[]=pmd&types[]=best_bag&types[]=christmas_trees";

    request(url, function (err, res, body) {

        if (!err && res.statusCode == 200) {
          try {
            var result = JSON.parse(body);
            if(!result.success)
            {
                return callback(new Error(result.message));                
            }

            var fDates = {};

            for(var et in result.data.items[0])
            {
                var entry = result.data.items[0][et];
                var dateStr = entry.date.substring(8,10) + "-" + entry.date.substring(5,7) + "-" + entry.date.substring(0,4);

                switch(entry.type)
                {
                    case 'gft':
                        if (!fDates.GFT) fDates.GFT = [];
                        fDates.GFT.push(dateStr);
                        break;
                    case 'paper':
                        if (!fDates.PAPIER) fDates.PAPIER = [];
                        fDates.PAPIER.push(dateStr);
                        break;
                    case 'plastic':
                        if (!fDates.PLASTIC) fDates.PLASTIC = [];
                        fDates.PLASTIC.push(dateStr);
                        break;
                    case 'residual_waste':
                        if (!fDates.REST) fDates.REST = [];
                        fDates.REST.push(dateStr);
                        break;
                    case 'pmd':
                        if (!fDates.PMD) fDates.PMD = [];
                        fDates.PMD.push(dateStr);
                        break;
                    case 'best_bag':
                        if (!fDates.TEXTIEL) fDates.TEXTIEL = [];
                        fDates.TEXTIEL.push(dateStr);
                        break;
                    case 'pruning_waste':
                        if (!fDates.GROF) fDates.GROF = [];
                        fDates.GROF.push(dateStr);
                        break;
                    case 'christmas_trees':
                        if (!fDates.KERSTBOOM) fDates.KERSTBOOM = [];
                        fDates.KERSTBOOM.push(dateStr);
                        break;
                    default:
                        console.log('Defaulted. Element not found:', entry.type);
                }
            }

            return callback(null, fDates);
          } catch (ex) {
            return callback(new Error('Error: ' + ex));
          }
        } else {
            return callback(new Error('Invalid location'));
        }
    });
}

function afvalapp(postcode, homenumber, street, country, callback) {
    console.log("Checking De Afval App");

    if (country !== "NL") {
        console.log('unsupported country');
        callback(new Error('Unsupported country'));
        return;
    }

    var options = {
        host: 'dataservice.deafvalapp.nl',
        path: '/dataservice/DataServiceServlet?type=ANDROID&service=OPHAALSCHEMA&land=' +
            country + '&postcode=' + postcode + '&straatId=0&huisnr=' + homenumber + '&huisnrtoev='
    };

    var req = https.get(options, (res) => {
        var dates = {};
        var curr = '';
        var data = '';

        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('end', () => {
            var respArray = data.toString().split('\n').join('').split(";");
            respArray.pop();
            for (var i in respArray) {
                if (isNaN(parseInt(respArray[i]))) {
                    curr = respArray[i];
                    switch (curr) {
                        case "ZAK_BLAUW":
                            curr = "REST";
                            break;
                        case "PBP":
                            curr = "PLASTIC";
                            break;
                    }
                    dates[curr] = [];
                }
                else {
                    var verifiedDate = verifyDate(respArray[i]);
                    dates[curr].push(verifiedDate);
                }
            }

            if (Object.keys(dates).length === 0 && dates.constructor === Object) {
                console.log('Invalid input');
                return callback(null, {});
            } else { //validate the response
                console.log(dates);
                return callback(null, dates);
            }
        });
    });

    req.on('error', function (err) {
        console.log(err.message);
        return callback(new Error('Error occured during request: ' + err.message));
    });
}

function circulusBerkel(postcode, homenumber, street, country, callback) {

    if (country !== "NL") {
        return callback(new Error('unsupported country'));
    }

    try {
        //Get a session token
        request('https://mijn.circulus.nl/', (err, response, body) => {
            let cookie = response.headers['set-cookie'];
            let authenticityToken = null;
            for (var i = 0; i < cookie.length; i++) {
                if (cookie[i].startsWith('CB_SESSION')) { var j = cookie[i].indexOf('___AT='); var k = cookie[i].indexOf('&', j); authenticityToken = cookie[i].substring(j + 6, k); }
            }
            var headers = { 'Content-Type': 'application/json', 'Cookie': cookie };
            var options = {
                url: 'https://mijn.circulus.nl/register/zipcode.json',
                method: 'POST',
                form: { authenticityToken: authenticityToken, zipCode: postcode, number: homenumber },
                headers: headers
            };

            var startDate = new Date(); //startDate.set
            startDate = dateFormat(startDate.setDate(startDate.getDate() - 14), "yyyy-mm-dd");

            var endDate = new Date();
            endDate = dateFormat(endDate.setDate(endDate.getDate() + 90), "yyyy-mm-dd");

            //Get a security token
            request(options, function (err, res, body) {
                let cookie = res.headers['set-cookie'];
                var headers = { 'Content-Type': 'application/json', 'Cookie': cookie };
                var options = {
                    url: 'https://mijn.circulus.nl/afvalkalender.json?from=' + startDate + '&till=' + endDate,
                    method: 'GET',
                    headers: headers
                };
                //Execute the real trash request
                request(options, function (err, res, body) {
                    let dates = {}
                    var json_body = JSON.parse(body);

                    if(json_body == null || typeof json_body.customData === 'undefined' || typeof json_body.customData.response === "undefined" || typeof json_body.customData.response.garbage === 'undefined')
                    {
                        console.log(json_body);
                        return callback(new Error('Something went wrong while retrieving the data.'));
                    }

                    var o = json_body.customData.response.garbage;
                    for (var i = 0; i < o.length; i++) {
                        var key = o[i].code.toLowerCase();
                        switch (key) {
                            case 'pmd':
                            case 'gft':
                            case 'rest':
                                key = key.toUpperCase();
                                break;
                            case 'drocodev':
                                key = "PLASTIC";
                                break;
                            case 'zwakra':
                                key = "PMD";
                                break;
                            case 'pap':
                                key = 'PAPIER';
                                break;
                            case 'best':
                                key = 'TEXTIEL';
                                break;
                            default:
                                key = key.toUpperCase();
                                break;
                        }

                        addToDates(key, o[i].dates, dates);
                    }
                    return callback(null, dates);
                });
            });
        });
    } catch (ex) {
        return callback(new Error('Error: ' + ex));
    }
}

/**
 * Helper functions used by different API implementations
 */
function addToDates(key, datesToAdd, dates) {
    for (var i = 0; i < datesToAdd.length; i++) {
        var date = datesToAdd[i];
        if (!date) continue;
        if (dates[key] == null) dates[key] = [];
        var arrDate = date.split('-');
        var dutchDate = arrDate[0] + "-" + arrDate[1] + "-" + arrDate[2];
        dates[key].push(dutchDate);
    }
}

function parseDate(dateString) {
    try {
        var dateArray = dateString.split(" ");
        var fullString = "";

        if(typeof dateArray[3] !== 'undefined' && dateArray[3].length === 4)
        {
            fullString += dateArray[3] + "-";
        }
        else {
            fullString += new Date().getFullYear() + "-";
        }

        var months = [
            'januari',
            'februari',
            'maart',
            'april',
            'mei',
            'juni',
            'juli',
            'augustus',
            'september',
            'oktober',
            'november',
            'december',
            'jan',
            'feb',
            'mar',
            'apr',
            'mei',
            'jun',
            'jul',
            'aug',
            'sep',
            'okt',
            'nov',
            'dec',
            'jan',
            'feb',
            'mrt', // suez
            'apr',
            'mei',
            'jun',
            'jul',
            'aug',
            'sep',
            'okt',
            'nov',
            'dec'
        ];

        var monthNum = months.indexOf(dateArray[2]) + 1;
        if (monthNum > 0) {
            if(monthNum > 24)
            {
                monthNum = monthNum-24;
            }
			
            if(monthNum > 12)
            {
                monthNum = monthNum-12;
            }

            var monthString = (monthNum).toString().padStart(2, "0");
            fullString += monthString + '-';
        } else {
            console.log('This should not be possible...');
            return 'invalid month';
        }

        fullString += dateArray[1].padStart(2, "0"); //day of the month(already padded)

        return fullString;
    }
    catch(ex)
    {
        console.log(ex);
    }
}

function verifyDate(dateString) {
    var dateArray = dateString.split("-");
    if(dateArray[0].length === 4)
    {
        return dateString;
    }
    else
    {
        return dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0];
    }
}

function formatDate(date)
{
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function httpsPromise({body, ...options}) {

    return new Promise((resolve, reject) => {
        const req = https.request({
            ...options,
        }, res => {
            const chunks = [];
            res.on('data', data => chunks.push(data))
            res.on('end', () => {
                let resBody = Buffer.concat(chunks);
                switch(res.headers['content-type']) {
                    case 'application/json':
                        try {
                            resBody = JSON.parse(resBody);
                        }
                        catch(error)
                        {
                            reject(new Error("Exception parsing JSON: " + err + " for base url " + baseUrl + " and zip code " + postcode));
                        }
                    break;
                    default:
                        resBody = resBody.toString();
                    break;
                }

                resolve(resBody)
            })
        })
        req.on('error', reject);
        if(body) {
            req.write(body);
        }
        req.end();
    });
}

/**
 * List of providers consuming different API implementations
 */

// Don't forget to add the ID and name to the option set in settings/index.html page as well! :)
apiList.push({ name: "Afval App", id: "afa", execute: afvalapp });
apiList.push({ name: "Mijn Afvalwijzer", id: "afw", execute: mijnAfvalWijzer });
apiList.push({ name: "Den Bosch Afvalstoffendienstkalender", id: "dbafw", execute: denBoschAfvalstoffendienstCalendar });
apiList.push({ name: "Afvalwijzer Pre Zero", id: "arn", execute: afvalwijzerPreZero });
apiList.push({ name: "Afvalkalender Cure", id: "acu", execute: afvalkalenderCure })
apiList.push({ name: "Afvalkalender Cyclus", id: "afc", execute: afvalkalenderCyclus });
apiList.push({ name: "Afvalkalender RMN", id: "afrm", execute: afvalRmn });
apiList.push({ name: "Afvalkalender ZRD", id: "afzrd", execute: afvalkalenderZrd });
apiList.push({ name: "Twente Milieu", id: "twm", execute: twenteMilieu });
apiList.push({ name: "Gemeente Hellendoorn", id: "geh", execute: gemeenteHellendoorn });
apiList.push({ name: "Recyclemanager", id: "remg", execute: recycleManager });
apiList.push({ name: "Afvalkalender Meerlanden", id: "akm", execute: afvalkalenderMeerlanden });
apiList.push({ name: "Afvalkalender Peel en Maas", id: "akpm", execute: afvalkalenderPeelEnMaas });
apiList.push({ name: "Afvalkalender Venray", id: "akvr", execute: afvalkalenderVenray });
apiList.push({ name: "Afvalkalender Reinis", id: "aknw", execute: nissewaard });
apiList.push({ name: "Inzamelkalender HVC", id: "hvc", execute: inzamelkalenderHVC });
apiList.push({ name: "Dar Afvalkalender", id: "dar", execute: darAfvalkalender });
apiList.push({ name: "Afvalkalender RD4", id: "rd4", execute: afvalkalenderRD4 });
apiList.push({ name: "ROVA Afvalkalender", id: "rov", execute: rovaAfvalkalender });
apiList.push({ name: "Afvalkalender Circulus-Berkel", id: "acb", execute: circulusBerkel });
apiList.push({ name: "Mijn Blink Afvalkalender", id: "mba", execute: BlinkAfvalkalender });
apiList.push({ name: "Avalex", id: "avx", execute: afvalAvalex });
apiList.push({ name: "ACV", id: "acv", execute: acvAfvalkalender });
apiList.push({ name: "GAD Gooi en Vechtstreek", id: "gad", execute: GadGooiAndVechtstreek });
apiList.push({ name: "Area Reiniging", id: "arei", execute: areaReiniging });
apiList.push({ name: "Reinigingsdienst Waardlanden", id: "rewl", execute: reinigingsdienstWaardlanden });
apiList.push({ name: "Stadswerk072", id: "sw072", execute: afvalwijzerStadswerk072 });
apiList.push({ name: "Almere", id: "alm", execute: almereAfvalkalender });
apiList.push({ name: "Recycle App (BE)", id: "recbe", execute: recycleApp });

module.exports = apiList;