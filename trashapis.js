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
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'zrd.nl');
}

function afvalRmn(postcode, housenumber, street, country) {
    return generalImplementationBurgerportaal(postcode, housenumber, country, '138204213564933597');
}

function afvalkalenderBar(postcode, housenumber, street, country) {
    return generalImplementationBurgerportaal(postcode, housenumber, country, '138204213564933497');
}

function afvalkalenderAssen(postcode, housenumber, street, country) {
    return generalImplementationBurgerportaal(postcode, housenumber, country, '138204213565303512');
}

function afvalkalenderCure(postcode, housenumber, street, country) {
    return Promise.reject(Error('Cure moved to mijn afvalwijzer.')); //newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.cure-afvalbeheer.nl');
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
    return Promise.reject(Error('Stadswerk moved to HVC group.'));
}

function afvalwijzerPreZero(postcode, housenumber, street, country) {
    console.log("Checking Inzamelwijzer Pre Zero");
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'inzamelwijzer.prezero.nl')
}

function afvalkalenderPurmerend(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.purmerend.nl')
}

function huisvuilkalenderDenHaag(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'huisvuilkalender.denhaag.nl')
}

function huisvuilkalenderEttenLeur(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'www.afval3xbeter.nl')
}

function afvalkalenderMeerlanden(postcode, housenumber, street, country) {
    console.log("Checking Meerlanden");
    return generalImplementationWasteApi(postcode, housenumber, country, "800bf8d7-6dd1-4490-ba9d-b419d6dc8a45", "wasteprod2api.ximmio.com");
}

function afvalkalenderAvri(postcode, housenumber, street, country) {
    console.log("Checking Avri");
    return generalImplementationWasteApi(postcode, housenumber, country, "78cd4156-394b-413d-8936-d407e334559a", "wasteapi.ximmio.com");
}

function afvalAvalex(postcode, housenumber, street, country) {
    console.log("Checking Avalex");
    return generalImplementationWasteApi(postcode, housenumber, country, 'f7a74ad1-fdbf-4a43-9f91-44644f4d4222', "wasteprod2api.ximmio.com");
}

function twenteMilieu(postcode, housenumber, street, country) {
    console.log("Checking Twente Milieu");
    return generalImplementationWasteApi(postcode, housenumber, country, "8d97bb56-5afd-4cbc-a651-b4f7314264b4", "twentemilieuapi.ximmio.com");
}

function nissewaard(postcode, housenumber, street, country) {
    console.log("Checking Nissewaard");
    return generalImplementationWasteApi(postcode, housenumber, country, "9dc25c8a-175a-4a41-b7a1-83f237a80b77", "wasteapi.ximmio.com");
}

function gemeenteHellendoorn(postcode, housenumber, street, country) {
    console.log("Checking Gemeente Hellendoorn");
    return generalImplementationWasteApi(postcode, housenumber, country, "24434f5b-7244-412b-9306-3a2bd1e22bc1", "wasteapi.ximmio.com");
}

function gemeenteMeppel(postcode, housenumber, street, country) {
    console.log("Checking Gemeente Meppel");
    return generalImplementationWasteApi(postcode, housenumber, country, "b7a594c7-2490-4413-88f9-94749a3ec62a", "wasteapi.ximmio.com");
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

function afvalKalenderWestland(postcode, housenumber, street, country)
{
    console.log("Checking Afvalkalender Westland");
    return generalImplementationWasteApi(postcode, housenumber, country, "6fc75608-126a-4a50-9241-a002ce8c8a6c", "wasteapi2.ximmio.com");
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

function afvalkalenderSudwestFryslan(postcode, housenumber, street, country) {
    return newGeneralAfvalkalendersNederland(postcode, housenumber, country, "afvalkalender.sudwestfryslan.nl");
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
        retrieveIdentificationRequest.then(function(response)
        {
            var result = response.body;
            if(result.length <= 0)
            {
                return reject(new Error("Invalid zipcode for " + baseUrl));
            }

            var identificatie = result[0].bagid;

            var retrieveCalendar  = httpsPromise({
                hostname: baseUrl,
                path: `/ical/${identificatie}`,
                method: 'GET'
            });

            retrieveCalendar.then(function(response)
            {
                console.log(`response: ${response.body}`);

                var icalResult = response.body;
                const dates = {};
                const entries = ical.parseICS(icalResult);
                for (let i in entries) {
                    const entry = entries[i];
                    const dateStr = entry.start.getFullYear() + '-' + (('0' + (entry.start.getMonth() + 1)).slice(-2)) + "-" + ('0' + entry.start.getDate()).slice(-2);

                    var description = entry.description.toLowerCase().trim();

                    if (description.indexOf('groente') !== -1 || description.indexOf('gft') !== -1 || description.indexOf('bio') !== -1) {
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

function generalMijnAfvalwijzerApiImplementation(postcode, housenumber, country, baseUrl) {
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
        retrieveCalendarDataRequest.then(function(response)
        {            
            // Stip lot of data from body to prevent memory overflow
            var body = response.body;
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
                    var wasteDescription = "";
                    if(elem.children[1].children.length < 1)
                    {
                        dateStr = parseDate(elem.children[0].data);
                        wasteDescription = $(".afvaldescr", elem).text();
                    }
                    else {
                        dateStr = parseDate(elem.children[1].children[0].data);
                        wasteDescription = $(".afvaldescr", elem).text();
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
						case 'textiel':
							if (!fDates.TEXTIEL) fDates.TEXTIEL = [];
                            fDates.TEXTIEL.push(dateStr);
                            break;
                        case 'glas':
                        case 'milieubus':
                            if (!fDates.GLAS) fDates.GLAS = [];
                            fDates.GLAS.push(dateStr);
                            break;
                        case 'kerst':
                        case 'kerstbomen':
                            if (!fDates.KERSTBOOM) fDates.KERSTBOOM = [];
                            fDates.KERSTBOOM.push(dateStr);
                            break;
                        default:
                            fDates = verifyByName(fDates, elem.attribs.class.trim(), wasteDescription, dateStr);
                            console.log("Defaulted. Element not found: ", elem.attribs.class);
                            console.log("Trying to find date based on description: ", wasteDescription);
                            break;            
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
            
            $ = null;                

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

function verifyByName(fDates, className, description, dateStr)
{
    if(description === "" || typeof description === undefined)
    {
        if(className == "dhm")
        {
            if (!fDates.TEXTIEL) fDates.TEXTIEL = [];
            fDates.TEXTIEL.push(dateStr);
        }
        
        return fDates;
    }

    description = description.toLowerCase();

    if (description.indexOf('groente') !== -1 || description.indexOf('gft') !== -1) {
        if (!fDates.GFT) fDates.GFT = [];
        fDates.GFT.push(dateStr);
    } 
    
    if (description.indexOf('rest') !== -1 && description.indexOf('etensresten') === -1) {
        if (!fDates.REST) fDates.REST = [];
        fDates.REST.push(dateStr);
    } 
    
    if (description.indexOf('pmd') !== -1 || description.indexOf('pd') !== -1 || description.indexOf('metaal') !== -1 || description.indexOf('drankkartons') !== -1) {
        if (!fDates.PMD) fDates.PMD = [];
        fDates.PMD.push(dateStr);
    } 
    
    if (description.indexOf('plastic') !== -1) {
        if (!fDates.PLASTIC) fDates.PLASTIC = [];
        fDates.PLASTIC.push(dateStr);
    }
    
    if (description.indexOf('papier') !== -1) {
        if (!fDates.PAPIER) fDates.PAPIER = [];
        fDates.PAPIER.push(dateStr);
    } 
    
    if (description.indexOf('textiel') !== -1 || description.indexOf('retour') !== -1) {
        if (!fDates.TEXTIEL) fDates.TEXTIEL = [];
        fDates.TEXTIEL.push(dateStr);
    } 
    
    if(description.indexOf('kerstbomen') !== -1 || description.indexOf('kerst') !== -1) {
        if (!fDates.KERSTBOOM) fDates.KERSTBOOM = [];
        fDates.KERSTBOOM.push(dateStr);
    } 
    
    if(description.indexOf('grof') !== -1 || description.indexOf('vuil') !== -1) {
        if (!fDates.GROF) fDates.GROF = [];
        fDates.GROF.push(dateStr);
    }
    
    if(description.indexOf('glas') !== -1) {
        if (!fDates.GLAS) fDates.GLAS = [];
        fDates.GLAS.push(dateStr);
    }
    
    if(description.indexOf('retour') !== -1) {      // Marking retourstoffen as textiel to make sure it can be identified
        if (!fDates.TEXTIEL) fDates.TEXTIEL = [];
        fDates.TEXTIEL.push(dateStr);
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

    return fDates;
}

function generalImplementationWasteApi(postcode, housenumber, country, companyCode, hostName = 'wasteapi.ximmio.com')
{
    console.log(`Checking company code ${companyCode} for hostname ${hostName}.`);

    if (country !== "NL") {
        console.log('unsupported country');
        return Promise.reject(Error('Unsupported country'));
    }

    var startDate = new Date();
    startDate = formatDate(startDate.setDate(startDate.getDate() - 14));

    var endDate = new Date();
    endDate = formatDate(endDate.setDate(endDate.getDate() + 30));

    var post_data1 = `{companyCode:"${companyCode}",postCode:"${postcode}",houseNumber:${housenumber}}`;
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
        retrieveUniqueId.then(function(response)
        {            
            var result = response.body;
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

            var uniqueID = result.dataList[0].UniqueId;

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

            retrieveCalendarDataRequest.then(function(response)
            {    
                var calendarResult = response.body;
                if(!calendarResult.status)
                {
                    reject(new Error('Invalid calendar result. ' + calendarResult.status));
                    return;
                }
                
                var fDates = {};
                for (var i = 0; i < Object.keys(calendarResult.dataList).length; i++) {
                    for (var j = 0; j < Object.keys(calendarResult.dataList[i].pickupDates).length; j++) {
                        var date = formatDate(calendarResult.dataList[i].pickupDates[j]);
                        switch (calendarResult.dataList[i]._pickupTypeText) {
                            case "GREENGREY":
                            case "GREYGREEN":
                                if (!fDates.REST) fDates.REST = [];
                                if (!fDates.GFT) fDates.GFT = [];
                                fDates.REST.push(date);
                                fDates.GFT.push(date);
                                break;
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
                
                console.log(fDates);
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

function generalImplementationRecycleApp(postcode, housenumber, street, country)
{
    var fDates = {};    
    if (country !== "BE") {
        console.log('unsupported country');
        return Promise.reject(Error('Unsupported country'));
    }

    // API's moved to api.fostplus.be/recycle-public/app/v1 
    var hostName = "api.fostplus.be";
    var accessConsumer = "recycleapp.be";
    var accessSecret = "Op2tDi2pBmh1wzeC5TaN2U3knZan7ATcfOQgxh4vqC0mDKmnPP2qzoQusmInpglfIkxx8SZrasBqi5zgMSvyHggK9j6xCQNQ8xwPFY2o03GCcQfcXVOyKsvGWLze7iwcfcgk2Ujpl0dmrt3hSJMCDqzAlvTrsvAEiaSzC9hKRwhijQAFHuFIhJssnHtDSB76vnFQeTCCvwVB27DjSVpDmq8fWQKEmjEncdLqIsRnfxLcOjGIVwX5V0LBntVbeiBvcjyKF2nQ08rIxqHHGXNJ6SbnAmTgsPTg7k6Ejqa7dVfTmGtEPdftezDbuEc8DdK66KDecqnxwOOPSJIN0zaJ6k2Ye2tgMSxxf16gxAmaOUqHS0i7dtG5PgPSINti3qlDdw6DTKEPni7X0rxM";

    // Get access token
    var accessTokenRequest = httpsPromise({
        hostname: hostName,
        path: '/recycle-public/app/v1/access-token',
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Homey',
          'x-consumer': accessConsumer,
          'x-secret': accessSecret
        }
    });

    return new Promise(function(resolve, reject)
    {
        accessTokenRequest.then(function(response)
        {
            var accessToken = response.body.accessToken;

            // Validate zipcode request
            var validateZipCodeRequest = httpsPromise({
                hostname: hostName,
                path: `/recycle-public/app/v1/zipcodes?q=${postcode}`,
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Homey',
                    'Authorization': accessToken,
                    'x-consumer': accessConsumer,
                }
            });

            validateZipCodeRequest.then(function(response)
            {
                var result = response.body;
                if(result.items.length <= 0)
                {
                    reject(new Error("No zipcode found for: " + postcode));
                    return;
                }

                if(result.items.length > 1)
                {
                    reject(new Error("Multiple zipcode entries found for: " + postcode));
                    return;
                }

                var zipcodeId = result.items[0].id;

                // Validate street request
                var validateStreetRequest = httpsPromise({
                    hostname: hostName,
                    path: encodeURI(`/recycle-public/app/v1/streets?q=${street.trim()}&zipcodes=${zipcodeId}`),
                    method: "POST",
                    headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Homey',
                    'Authorization': accessToken,
                    'x-consumer': accessConsumer,                
                    }
                });
    
                validateStreetRequest.then(function(response)
                {
                    var result = response.body;
                    if(result.items.length <= 0)
                    {
                        reject(new Error("No street found for: " + street.trim()));
                        return;
                    }

                    if(result.items.length > 1)
                    {
                        reject(new Error("Multiple streets found for: " + street.trim()));
                        return;
                    }

                    var streetId = result.items[0].id;

                    // Retrieve trash request
                    var startDate = new Date(); //startDate.set
                    startDate = formatDate(startDate.setDate(startDate.getDate() - 7));

                    var endDate = new Date();
                    endDate = formatDate(endDate.setDate(endDate.getDate() + 14));
                    
                    var getTrashRequest = httpsPromise({
                        hostname: hostName,
                        path: `/recycle-public/app/v1/collections?size=100&untilDate=${endDate}&fromDate=${startDate}&houseNumber=${housenumber}&streetId=${streetId}&zipcodeId=${zipcodeId}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'Homey',
                            'Authorization': accessToken,
                            'x-consumer': accessConsumer,                
                        }
                    });
        
                    getTrashRequest.then(function(response)
                    {
                        var result = response.body;
                        if(result.items.length <= 0)
                        {
                            reject(new Error("No trash data found for: " + getTrashRequest.path));
                            return;
                        }

                        for (let i in result.items) {
                            const entry = result.items[i];
                            const dateStr = entry.timestamp.substr(0,10);

                            var description = "";
                            if(entry.type !== 'collection') continue;

                            try {
                                description = entry.fraction.name.nl.toLowerCase().trim();
                            } catch(Exception) {
                                description = entry.fraction.name.fr.toLowerCase().trim();
                            }

                            if (description.indexOf('groente') !== -1 || description.indexOf('gft') !== -1) {
                                if (!fDates.GFT) fDates.GFT = [];
                                fDates.GFT.push(dateStr);
                            } else if (description.indexOf('rest') !== -1) {
                                if (!fDates.REST) fDates.REST = [];
                                fDates.REST.push(dateStr);
                            } else if (description.indexOf('pmd') !== -1 || description.indexOf('pd') !== -1 || description.indexOf('metaal') !== -1 || description.indexOf('drankkartons') !== -1) {
                                if (!fDates.PMD) fDates.PMD = [];
                                fDates.PMD.push(dateStr);
                            } else if (description.indexOf('plastic') !== -1) {
                                if (!fDates.PLASTIC) fDates.PLASTIC = [];
                                fDates.PLASTIC.push(dateStr);
                            }  else if (description.indexOf('papier') !== -1) {
                                if (!fDates.PAPIER) fDates.PAPIER = [];
                                fDates.PAPIER.push(dateStr);
                            } else if (description.indexOf('textiel') !== -1 || description.indexOf('retour') !== -1) {
                                if (!fDates.TEXTIEL) fDates.TEXTIEL = [];
                                fDates.TEXTIEL.push(dateStr);
                            } else if(description.indexOf('kerstbomen') !== -1 || description.indexOf('kerst') !== -1) {
                                if (!fDates.KERSTBOOM) fDates.KERSTBOOM = [];
                                fDates.KERSTBOOM.push(dateStr);
                            } else if(description.indexOf('grof') !== -1 || description.indexOf('vuil') !== -1) {
                                if (!fDates.GROF) fDates.GROF = [];
                                fDates.GROF.push(dateStr);
                            } else if(description.indexOf('glas') !== -1) {
                                if (!fDates.GLAS) fDates.GLAS = [];
                                fDates.GLAS.push(dateStr);
                            } else {
                                console.log("Unknown description: " + description);
                            }
                        }
                        
                        resolve(fDates);
                        return;
                    }).catch(function(error)
                    {
                        reject(new Error("Can't retrieve trash data: " + error));
                    });
                }).catch(function(error)
                {
                    reject(new Error("Can't validate street: " + error));
                });
            }).catch(function(error)
            {
                reject(new Error("Can't validate zipcode: " + error));
            });
        }).catch(function(error)
        {
            reject(new Error("Can't retrieve access token: " + error));
        });
    });
}

function generalImplementationBurgerportaal(zipcode, housenumber, country, organisationId = '138204213564933597')
{
    var fDates = {};    
    if (country !== "NL") {
        console.log('unsupported country');
        return Promise.reject(Error('Unsupported country'));
    }

    var hostName = "europe-west3-burgerportaal-production.cloudfunctions.net";
    var userToken = "AIzaSyA6NkRqJypTfP-cjWzrZNFJzPUbBaGjOdk";

    // Get access token
    var idTokenRequest = httpsPromise({
        hostname: 'www.googleapis.com',
        path: `/identitytoolkit/v3/relyingparty/signupNewUser?key=${userToken}`,
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Homey'
        }
    });

    return new Promise(function(resolve, reject)
    {
        idTokenRequest.then(function(response)
        {
            var refreshToken = response.body.refreshToken;

            // Retrieve access token
            var post_data = '?&grant_type=refresh_token&refresh_token=' + refreshToken;
            var headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(post_data) }
            var accessTokenRequest = httpsPromise({
                hostname: 'securetoken.googleapis.com',
                path: `/v1/token?key=${userToken}`,
                method: 'POST',
                body: post_data,
                headers: headers
            });

            accessTokenRequest.then(function(response)
            {
                var accessToken = response.body.access_token;

                // Retrieve address ID
                var addressIdRequest = httpsPromise({
                    hostname: hostName,
                    path: `/exposed/organisations/${organisationId}/address?zipcode=${zipcode}&housenumber=${housenumber}`,
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Homey',
                        'Authorization': accessToken,
                    }
                });
                
                addressIdRequest.then(function(response)
                {
                    var result = response.body;
                    if(result.length <= 0)
                    {
                        reject(new Error("No zipcode found for: " + zipcode));
                        return;
                    }

                    if(result.length > 1)
                    {
                        reject(new Error("Multiple zipcode entries found for: " + zipcode));
                        return;
                    }

                    var addressId = result[0].addressId;

                    // Validate street request
                    var getTrashRequest = httpsPromise({
                        hostname: hostName,
                        path: `/exposed/organisations/${organisationId}/address/${addressId}/calendar`,
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'Homey',
                            'Authorization': accessToken,
                        }
                    });
    
                    getTrashRequest.then(function(response)
                    {
                        var result = response.body;
                        if(result.length <= 0)
                        {
                            reject(new Error("No trash data found for: " + getTrashRequest.path));
                            return;
                        }

                        for (let i in result) {
                            const entry = result[i];
                            const dateStr = entry.collectionDate.substr(0,10);

                            var description = entry.fraction.toLowerCase();

                            if (description.indexOf('groente') !== -1 || description.indexOf('gft') !== -1) {
                                if (!fDates.GFT) fDates.GFT = [];
                                fDates.GFT.push(dateStr);
                            } else if (description.indexOf('pmdrest') !== -1) {
                                if (!fDates.REST) fDates.REST = [];
                                if (!fDates.PMD) fDates.PMD = [];
                                fDates.REST.push(dateStr);
                                fDates.PMD.push(dateStr);
                            } else if (description.indexOf('rest') !== -1) {
                                if (!fDates.REST) fDates.REST = [];
                                fDates.REST.push(dateStr);
                            } else if (description.indexOf('pmd') !== -1 || description.indexOf('pd') !== -1 || description.indexOf('metaal') !== -1 || description.indexOf('drankkartons') !== -1) {
                                if (!fDates.PMD) fDates.PMD = [];
                                fDates.PMD.push(dateStr);
                            } else if (description.indexOf('plastic') !== -1) {
                                if (!fDates.PLASTIC) fDates.PLASTIC = [];
                                fDates.PLASTIC.push(dateStr);
                            }  else if (description.indexOf('papier') !== -1 || description.indexOf('opk') !== -1) {
                                if (!fDates.PAPIER) fDates.PAPIER = [];
                                fDates.PAPIER.push(dateStr);
                            } else if (description.indexOf('textiel') !== -1 || description.indexOf('retour') !== -1) {
                                if (!fDates.TEXTIEL) fDates.TEXTIEL = [];
                                fDates.TEXTIEL.push(dateStr);
                            } else if(description.indexOf('kerstbomen') !== -1 || description.indexOf('kerst') !== -1) {
                                if (!fDates.KERSTBOOM) fDates.KERSTBOOM = [];
                                fDates.KERSTBOOM.push(dateStr);
                            } else if(description.indexOf('grof') !== -1 || description.indexOf('vuil') !== -1) {
                                if (!fDates.GROF) fDates.GROF = [];
                                fDates.GROF.push(dateStr);
                            } else if(description.indexOf('glas') !== -1) {
                                if (!fDates.GLAS) fDates.GLAS = [];
                                fDates.GLAS.push(dateStr);
                            } else {
                                console.log("Unknown description: " + description);
                            }
                        }
                        
                        console.log(fDates);
                        resolve(fDates);
                        return;
                    }).catch(function(error)
                    {
                        reject(new Error("Can't retrieve trash data: " + error));
                    });
                }).catch(function(error)
                {
                    reject(new Error("Can't validate address: " + error));
                });
            }).catch(function(error)
            {
                reject(new Error("Can't retrieve access token: " + error));
            });
        }).catch(function(error)
        {
            reject(new Error("Can't retrieve ID token: " + error));
        });
    });
}

/**
 * Vendor specific API implementations
 */
function recycleManager(postcode, housenumber, street, country)
{
    console.log("Recyclemanager met: " + postcode + " " + housenumber);

    var fDates = {};    
    if (country !== "NL") {
        console.log('unsupported country');
        return Promise.reject(Error('Unsupported country'));
    }

    // Retrieve recyclemanager data
    var getRecycleData = httpsPromise({
        hostname: 'vpn-wec-api.recyclemanager.nl',
        path: `/v2/calendars?postalcode=${postcode}&number=${housenumber}`,
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
    });

    return new Promise(function(resolve, reject)
    {
        getRecycleData.then(function(response)
        {
            var obj1 = response.body;
            if (obj1.status != "success") {
                reject(Error('Not a valid response from Recyclemanager: ' + getRecycleData.path));
                return;
            }

            for (var i = 0; i < 2; i++) {
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
            resolve(fDates);
            return;
        }).catch(function(error)
        {
            reject(new Error("Error in API execution: " + error));
            return;
        });
    });
}

function afvalkalenderRD4(postcode, housenumber, street, country) {
    console.log("Checking afvalkalender RD4");

    var fDates = {};  
    const d = new Date(); 
    if (country !== "NL") {
        return Promise.reject(Error('Unsupported country'));
    }

    var onlyHouseNumber = (housenumber+"").match(/\d+/g);
    var numberAddition = (housenumber+"").match(/[a-zA-Z]+/g);
    var queryAddition = "";

    if(numberAddition !== null && numberAddition.length > 0 && numberAddition[0] !== null)
    {
        queryAddition = "&house_number_extension=" + numberAddition;
    }

    // Retrieve recyclemanager data
    var getRecycleData = httpsPromise({
        hostname: 'data.rd4.nl',
        path: `/api/v1/waste-calendar?postal_code=${postcode.substring(0,4)}+${postcode.substring(4,6)}&house_number=${onlyHouseNumber[0]}${queryAddition}&year=${d.getFullYear()}&types[]=residual_waste&types[]=gft&types[]=paper&types[]=pruning_waste&types[]=pmd&types[]=best_bag&types[]=christmas_trees`,
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
    });

    return new Promise(function(resolve, reject)
    {
        getRecycleData.then(function(response)
        {
            var result = response.body;
            for(var et in result.data.items[0])
            {
                var entry = result.data.items[0][et];
                //var dateStr = entry.date.substring(8,10) + "-" + entry.date.substring(5,7) + "-" + entry.date.substring(0,4);
                var dateStr = entry.date.substring(0,4) + "-" + entry.date.substring(5,7) + "-" + entry.date.substring(8,10)

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

            console.log(fDates);
            resolve(fDates);
        }).catch(function(error)
        {
            reject(new Error('Invalid location: ' + error));
        });
    });
}

function afvalapp(postcode, homenumber, street, country) {
    console.log("Checking De Afval App");

    var fDates = {};  
    if (country !== "NL") {
        return Promise.reject(Error('Unsupported country'));
    }

    // Retrieve recyclemanager data
    var getRecycleData = httpsPromise({
        hostname: 'dataservice.deafvalapp.nl',
        path: `/dataservice/DataServiceServlet?type=ANDROID&service=OPHAALSCHEMA&land=NL&postcode=${postcode}&straatId=0&huisnr=${homenumber}'&huisnrtoev=`,
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
    });

    return new Promise(function(resolve, reject)
    {
        getRecycleData.then(function(response)
        {
            var data = response.body;
            var respArray = data.toString().split('\n').join('').split(";");
            respArray.pop();
            var curr = "";
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
                    fDates[curr] = [];
                }
                else {
                    var verifiedDate = verifyDate(respArray[i]);
                    fDates[curr].push(verifiedDate);
                }
            }

            if (Object.keys(fDates).length === 0 && fDates.constructor === Object) {
                reject(new Error("No dates found"));
                return;
            } else { //validate the response
                resolve(fDates);
                return;
            }
        }).catch(function(error)
        {
            reject(new Error('Error occured during request: ' + error));
            return;
        });
    });
}

function circulusBerkel(postcode, homenumber, street, country)
{
    var fDates = {};  
    if (country !== "NL") {
        return Promise.reject(Error('Unsupported country'));
    }

    // Retrieve recyclemanager data
    var getRecycleData = httpsPromise({
        hostname: 'mijn.circulus.nl',
        path: '/login',
        method: "GET",
    });

    return new Promise(function(resolve, reject)
    {
        getRecycleData.then(function(response)
        {
            let cookie = response.headers['set-cookie'];
            let authenticityToken = null;
            for (var i = 0; i < cookie.length; i++) {
                if (cookie[i].startsWith('CB_SESSION')) { 
                    console.log(cookie[i]);
                    var j = cookie[i].indexOf('___AT='); var k = cookie[i].indexOf('&', j); 
                    authenticityToken = cookie[i].substring(j + 6, k); 
                }
            }

            var post_data = `?authenticityToken=${authenticityToken}&zipCode=${postcode}&number=${homenumber}`;
            var headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookie, 'Content-Length': Buffer.byteLength(post_data) };
            var validateAddressRequest = httpsPromise({
                hostname: 'mijn.circulus.nl',
                path: '/register/zipcode.json',
                method: 'POST',
                body: post_data,
                headers: headers
            });

            validateAddressRequest.then(function(response)
            {
                var startDate = new Date(); //startDate.set
                startDate = formatDate(startDate.setDate(startDate.getDate() - 14)).replaceAll('-0','-');
    
                var endDate = new Date();
                endDate = formatDate(endDate.setDate(endDate.getDate() + 90)).replaceAll('-0','-');

                let cookie = response.headers['set-cookie'];
                var headers = { 'Content-Type': 'application/json', 'Cookie': cookie };
                var getTrashData = httpsPromise({
                    hostname: 'mijn.circulus.nl',
                    path: `/afvalkalender.json?from=${startDate}&till=${endDate}`,
                    method: 'GET',
                    headers: headers
                });

                getTrashData.then(function(response)
                {
                    if(response.body == null || typeof response.body.customData === 'undefined' || typeof response.body.customData.response === "undefined" || typeof response.body.customData.response.garbage === 'undefined')
                    {
                        console.log('Something went wrong while retrieving the data.');
                        reject(new Error('Something went wrong while retrieving the data.'));
                        return;
                    }

                    var o = response.body.customData.response.garbage;
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
                            case 'kerst':
                                key = 'KERSTBOOM';
                                break;
                            default:
                                key = key.toUpperCase();
                                break;
                        }

                        addToDates(key, o[i].dates, fDates);
                    }

                    console.log("Circulus");
                    console.log(fDates);
                    resolve(fDates);
                    return;
                }).catch(function(error)
                {
                    console.log('Error occured during retrieval of trash data: ' + error);
                    reject(new Error('Error occured during retrieval of trash data: ' + error));
                    return;
                });
            }).catch(function(error)
            {
                console.log('Error occured during retrieval of address: ' + error);
                reject(new Error('Error occured during retrieval of address: ' + error));
                return;
            });
        }).catch(function(error)
        {
            console.log('Error occured during retrieval of first cookie: ' + error);
            reject(new Error('Error occured during retrieval of first cookie: ' + error));
            return;
        });;
    });
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
                            return;
                        }
                    break;
                    default:
                        try {
                            resBody = JSON.parse(resBody);
                        }
                        catch(error)
                        {
                            resBody = resBody.toString();
                        }
                    break;
                }

                resolve({body: resBody, headers: res.headers});
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
apiList.push({ name: "Afvalkalender ACV", id: "acv", execute: acvAfvalkalender });
apiList.push({ name: "Afvalkalender Almere", id: "alm", execute: almereAfvalkalender });
apiList.push({ name: "Afvalkalender BAR", id: "afbar", execute: afvalkalenderBar });
apiList.push({ name: "Afvalkalender Circulus-Berkel", id: "acb", execute: circulusBerkel });
apiList.push({ name: "Afvalkalender Cyclus", id: "afc", execute: afvalkalenderCyclus });
apiList.push({ name: "Afvalkalender DAR", id: "dar", execute: darAfvalkalender });
apiList.push({ name: "Afvalkalender Etten-Leur", id: "akel", execute: huisvuilkalenderEttenLeur });
apiList.push({ name: "Afvalkalender Meerlanden", id: "akm", execute: afvalkalenderMeerlanden });
apiList.push({ name: "Afvalkalender Peel en Maas", id: "akpm", execute: afvalkalenderPeelEnMaas });
apiList.push({ name: "Afvalkalender Purmerend", id: "akpu", execute: afvalkalenderPurmerend});
apiList.push({ name: "Afvalkalender RD4", id: "rd4", execute: afvalkalenderRD4 });
apiList.push({ name: "Afvalkalender Reinis", id: "aknw", execute: nissewaard });
apiList.push({ name: "Afvalkalender RMN", id: "afrm", execute: afvalRmn });
apiList.push({ name: "Afvalkalender ROVA", id: "rov", execute: rovaAfvalkalender });
apiList.push({ name: "Afvalkalender Súdwest-Fryslân", id: "swf", execute: afvalkalenderSudwestFryslan });
apiList.push({ name: "Afvalkalender Venray", id: "akvr", execute: afvalkalenderVenray });
apiList.push({ name: "Afvalkalender Westland", id: "akwl", execute: afvalKalenderWestland });
apiList.push({ name: "Afvalkalender ZRD", id: "afzrd", execute: afvalkalenderZrd });
apiList.push({ name: "Afvalwijzer Pre Zero", id: "arn", execute: afvalwijzerPreZero });
apiList.push({ name: "Area Reiniging", id: "arei", execute: areaReiniging });
apiList.push({ name: "Avalex", id: "avx", execute: afvalAvalex });
apiList.push({ name: "Avri", id: "avr", execute: afvalkalenderAvri });
apiList.push({ name: "Den Bosch Afvalstoffendienstkalender", id: "dbafw", execute: denBoschAfvalstoffendienstCalendar });
apiList.push({ name: "GAD Gooi en Vechtstreek", id: "gad", execute: GadGooiAndVechtstreek });
apiList.push({ name: "Gemeente Assen", id: "gemas", execute: afvalkalenderAssen });
apiList.push({ name: "Gemeente Hellendoorn", id: "geh", execute: gemeenteHellendoorn });
apiList.push({ name: "Gemeente Meppel", id: "gem", execute: gemeenteMeppel });
apiList.push({ name: "Huisvulkalender Den Haag", id: "hkdh", execute: huisvuilkalenderDenHaag});
apiList.push({ name: "Inzamelkalender HVC", id: "hvc", execute: inzamelkalenderHVC });
apiList.push({ name: "Mijn Afvalwijzer", id: "afw", execute: mijnAfvalWijzer });
apiList.push({ name: "Mijn Blink Afvalkalender", id: "mba", execute: BlinkAfvalkalender });
apiList.push({ name: "Recyclemanager", id: "remg", execute: recycleManager });
apiList.push({ name: "Reinigingsdienst Waardlanden", id: "rewl", execute: reinigingsdienstWaardlanden });
apiList.push({ name: "Twente Milieu", id: "twm", execute: twenteMilieu });

apiList.push({ name: "Recycle App (BE)", id: "recbe", execute: recycleApp });

apiList.push({ name: "Afvalkalender Cure", id: "acu", execute: afvalkalenderCure })                             // Deprecated as of 2022-06-09
apiList.push({ name: "Stadswerk072", id: "sw072", execute: afvalwijzerStadswerk072 });                          // Deprecated as of 2022-06-09

module.exports = apiList;
