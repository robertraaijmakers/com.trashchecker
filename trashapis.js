"use strict";

var apiList = [];
var http = require('http');
var https = require('https');
var dateFormat = require('dateformat');
var request = require('request');
var cheerio = require('cheerio');
var ical = require('ical');

/**
 * Different vendors using the same three base API's
 */

function mijnAfvalWijzer(postcode, housenumber, country, callback) {
    generalMijnAfvalwijzerApiImplementation(postcode, housenumber, country, "https://www.mijnafvalwijzer.nl/nl/", callback);
}

function denBoschAfvalstoffendienstCalendar(postcode, housenumber, country, callback) {
    generalMijnAfvalwijzerApiImplementation(postcode, housenumber, country, 'http://denbosch.afvalstoffendienstkalender.nl/nl/', callback);
}

function rovaAfvalkalender(postcode, housenumber, country, callback) {
    generalMijnAfvalwijzerApiImplementation(postcode, housenumber, country, "https://inzamelkalender.rova.nl/nl/", callback);
}

function afvalkalenderCyclus(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.cyclusnv.nl', callback);
}

function afvalkalenderZrd(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.zrd.nl', callback);
}

function afvalRmn(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'inzamelschema.rmn.nl', callback);
}

function afvalAvalex(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'avalex.nl', callback);
}

function afvalkalenderCure(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.cure-afvalbeheer.nl', callback);
}

function afvalkalenderPeelEnMaas(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.peelenmaas.nl', callback);
}

function afvalkalenderVenray(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.venray.nl', callback);
}

function darAfvalkalender(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.dar.nl', callback);
}

function inzamelkalenderHVC(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'inzamelkalender.hvcgroep.nl', callback);
}

function BlinkAfvalkalender(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'mijnblink.nl', callback);
}

function GadGooiAndVechtstreek(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'inzamelkalender.gad.nl', callback);
}

function afvalkalenderMeerlanden(postcode, housenumber, country, callback) {
    console.log("Checking Meerlanden");
    generalImplementationWasteApi(postcode, housenumber, country, "800bf8d7-6dd1-4490-ba9d-b419d6dc8a45", callback);
}

function twenteMilieu(postcode, housenumber, country, callback) {
    console.log("Checking Twente Milieu");
    generalImplementationWasteApi(postcode, housenumber, country, "8d97bb56-5afd-4cbc-a651-b4f7314264b4", callback);
}

function gemeenteHellendoorn(postcode, housenumber, country, callback) {
    console.log("Checking Gemeente Hellendoorn");
    generalImplementationWasteApi(postcode, housenumber, country, "24434f5b-7244-412b-9306-3a2bd1e22bc1", callback);
}

function acvAfvalkalender(postcode, housenumber, country, callback)
{
    console.log("Checking ACV afvalkalender");
    generalImplementationWasteApi(postcode, housenumber, country, "f8e2844a-095e-48f9-9f98-71fceb51d2c3", callback);
}

function areaReiniging(postcode, housenumber, country, callback)
{
    console.log("Checking Area Reiniging");
    generalImplementationWasteApi(postcode, housenumber, country, "adc418da-d19b-11e5-ab30-625662870761", callback);
}

/**
 * General implementation of the afvalkalender API used by a lot of different vendors.
 */

function newGeneralAfvalkalendersNederland(postcode, housenumber, country, baseUrl, callback) {
    console.log("Checking new general afvalkalenders with URL: " + baseUrl);

    if (country !== "NL") {
        console.log('unsupported country');
        return callback(new Error('unsupported country'));
    }

    var urlRequest = "https://" + baseUrl + "/adressen/" + postcode + ":" + housenumber;

    request(urlRequest, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var result = "{}";

            try {
                result = JSON.parse(body);
            }
            catch(err)
            {
                return callback(new Error("Exception parsing JSON: " + err + " for base url " + baseUrl + " and zip code " + postcode));
            }

            if (result.length <= 0)
            {
                return callback(new Error('Invalid zipcode for: ' + baseUrl));
            }

            var identificatie = result[0].bagid;
            console.log(identificatie);

            var url = 'https://' + baseUrl + '/ical/' + identificatie;
            console.log(url);
            const r = request.defaults({
                jar: true
            });
            r.get(url, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    const dates = {};
                    const entries = ical.parseICS(body);
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
                        } else {
                            console.log("Unknown description: " + description);
                        }
                    }

                    console.log(dates);
                    return callback(null, dates);
                } else {
                    return callback(new Error('Unable to download ical file'));
                }
            });

        }
        else {
            return callback(new Error('Onbekende fout'));
        }
    });
}

function generalMijnAfvalwijzerApiImplementation(postcode, housenumber, country, baseUrl, callback) {
    console.log("Checking general afvalkalenders API implementation URL: " + baseUrl);

    var fDates = {};
    if (country !== "NL") {
        console.log('unsupported country');
        return callback(new Error('unsupported country'));
    }

    request(`${baseUrl}${postcode}/${housenumber}/`, function (err, res, body) {
        if (!err && res.statusCode == 200) {

            // Stip lot of data from body to prevent memory overflow
            var searchResultIndex = res.body.indexOf('<table width="100%" cellpadding="0" cellspacing="0" role=\'presentation\'>');

            var regex = /<a href="#waste-(.*) class="wasteInfoIcon/i;
            var searchResultIndex = res.body.search(regex);


            console.log(searchResultIndex);

            while(searchResultIndex >= 0)
            {
                var endString = res.body.indexOf('</a>', searchResultIndex);
                var result = res.body.substr(searchResultIndex, endString-searchResultIndex+4);
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
                        default:
                            console.log('Defaulted. Element not found:', elem.attribs.class);
                    }

                    elem = null; // clear memory leak?
                });

                var nextResult = res.body.substring(searchResultIndex+4).search(regex);
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
            return callback(null, fDates);
        } else {
            return callback(new Error('Invalid location'));
        }
    });
}

function generalImplementationWasteApi(postcode, housenumber, country, companyCode, callback)
{
    console.log(`Checking company code ${companyCode}.`);

    var fDates = {};
    if (country !== "NL") {
        console.log('unsupported country');
        return callback(new Error('unsupported country'));
    }

    var startDate = new Date();
    startDate = dateFormat(startDate.setDate(startDate.getDate() - 14), "yyyy-mm-dd");

    var endDate = new Date();
    endDate = dateFormat(endDate.setDate(endDate.getDate() + 30), "yyyy-mm-dd");

    var post_data1 = `{companyCode:"${companyCode}",postCode:"${postcode}",houseNumber:"${housenumber}",houseLetter:""}`;
    var post_options1 = {
        host: 'wasteprod2api.ximmio.com',
        port: '443',
        path: '/api/FetchAdress',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(post_data1)
        }
    };

    var buffer1 = "";
    var buffer2 = "";
    var post_req1 = https.request(post_options1, function (res1) {
        if (res1.statusCode == 200) {
            res1.on("data", function (chunk1) { buffer1 = buffer1 + chunk1; });
            res1.on("end", function (chunk1) {
                var obj1 = JSON.parse(buffer1);
                if (obj1.status) {

                    if (typeof obj1 === 'undefined' || typeof obj1.dataList === 'undefined' || typeof obj1.dataList[0] === 'undefined') {
                        console.log("UniqueID couldn't be found in the respons.");
                        return callback(new Error('UniqueID could not be found in the response.'));
                    }

                    var uniqueID = obj1.dataList[0].UniqueId;
                    // console.log("UniqueID: " + uniqueID);
                    var post_data2 = `{companyCode:"${companyCode}",uniqueAddressID:"${uniqueID}",startDate:"${startDate}",endDate:"${endDate}"}`;
                    var post_options2 = {
                        host: 'wasteprod2api.ximmio.com',
                        port: '443',
                        path: '/api/GetCalendar',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(post_data2)
                        }
                    };
                    var post_req2 = https.request(post_options2, function (res2) {
                        res2.on("data", function (chunk2) { buffer2 = buffer2 + chunk2; });
                        res2.on("end", function (chunk2) {
                            var obj2 = JSON.parse(buffer2);
                            if (obj2.status) {
                                for (var i = 0; i < Object.keys(obj2.dataList).length; i++) {
                                    // console.log("Type afval is: " + obj2.dataList[i]._pickupTypeText);
                                    // console.log("Datum is: " + obj2.dataList[i].pickupDates[0]);
                                    //console.log("Aantal datums: " + Object.keys(obj2.dataList[i].pickupDates).length);
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
                                            case "PACKAGES":
                                                if (!fDates.PLASTIC) fDates.PLASTIC = [];
                                                fDates.PLASTIC.push(date);
                                                break;
                                            case "TEXTILE":
                                                if (!fDates.TEXTIEL) fDates.TEXTIEL = [];
                                                fDates.TEXTIEL.push(date);
                                                break;
                                        }
                                    }
                                }
                                console.log(fDates);
                                return callback(null, fDates);
                            } else {
                                console.log("Er is iets fout gegaan bij het ophalen vd data");
                                return callback(new Error('Invalid location'));
                            }
                        });
                    });

                    // post the data
                    post_req2.write(post_data2);
                    post_req2.end();
                } else {
                    console.log("Postcode niet gevonden status = false");
                    return callback(new Error('Invalid location'));
                }
            });
        } else {
            console.log("Postcode niet gevonden != 200");
            return callback(new Error('Invalid location'));
        }
    });

    // post the data
    post_req1.write(post_data1);
    post_req1.end();
}

/**
 * Vendor specific API implementations
 */

function recycleManager(postcode, housenumber, country, callback) {
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

function afvalkalenderRD4(postcode, housenumber, country, callback) {
    console.log("Checking afvalkalender RD4");

    var url = "https://rd4.syzygy.eu/" + postcode + "/" + housenumber + "/";

    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
          try {
            var result = JSON.parse(res.body);
                    var transformedResult = {};

                    for(var type in result) {
                        transformedResult[type] = [];
                        result[type].forEach(function(value) {
                            var splitted = value.split('-');

                            if(splitted[2].len == 4)
                            {
                                transformedResult[type].push(splitted[2] + '-' + splitted[1] + '-' + splitted[0]);
                            }
                            else
                            {
                                transformedResult[type].push(splitted[0] + '-' + splitted[1] + '-' + splitted[2]);
                            }
                        });
                    }

            return callback(null, transformedResult);
          } catch (ex) {
            return callback(new Error('Error: ' + ex));
          }
        } else {
            return callback(new Error('Invalid location'));
        }
    });
}

function circulusBerkel(postcode, homenumber, country, callback) {

    if (country !== "NL") {
        return callback(new Error('unsupported country'));
    }

    try {
        //Get a session token
        request('https://mijn.circulus-berkel.nl/', (err, response, body) => {
            let cookie = response.headers['set-cookie'];
            let authenticityToken = null;
            for (var i = 0; i < cookie.length; i++) {
                if (cookie[i].startsWith('CB_SESSION')) { var j = cookie[i].indexOf('___AT='); var k = cookie[i].indexOf('&', j); authenticityToken = cookie[i].substring(j + 6, k); }
            }
            var headers = { 'Content-Type': 'application/json', 'Cookie': cookie };
            var options = {
                url: 'https://mijn.circulus-berkel.nl/register/zipcode.json',
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
                    url: 'https://mijn.circulus-berkel.nl/afvalkalender.json?from=' + startDate + '&till=' + endDate,
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
        //res.write('Error: ' + ex);
        return callback(new Error('Error: ' + ex));
    }
}

function afvalapp(postcode, homenumber, country, callback) {
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

    var req = http.get(options, (res) => {
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
                    dates[curr].push(respArray[i]);
                }
            }

            if (Object.keys(dates).length === 0 && dates.constructor === Object) {
                console.log('Invalid input');
                return callback(null, {});
            } else { //validate the response
                return callback(null, dates);
            }
        });
    });

    req.on('error', function (err) {
        console.log(err.message);
        return callback(new Error('Error occured during request: ' + err.message));
    });
}

function afvalwijzerSuez(postcode, housenumber, country, callback) {
    console.log("Checking Afvalwijzer Suez");

    var fDates = {};
    if (country !== "NL") {
        console.log('unsupported country');
        return callback(new Error('unsupported country'));
    }

    var url = `https://inzamelwijzer.suez.nl/adres/${postcode.replace(/ +/g, "")}:${housenumber}`;

    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {

            var $ = cheerio.load(res.body);
            $('#ophaaldata li').each((i, elem) => {
                try {
                    console.log(`datum:${elem.children[1].children[3].children[0].data.trim()}`);
                    console.log(`href: ${elem.children[1].attribs.href}`);

                    var dateString = elem.children[1].children[3].children[0].data.trim();
                    var splitted = dateString.split(" ");

                    if(typeof splitted[2] === 'undefined')
                    {
                        // Skip, not a valid date
                        console.log(`datum: ${elem.children[1].children[3].children[0].data.trim()}`);
                        return;
                    }

                    var dateString = splitted[0] + " " + splitted[1] + " " + splitted[2];
                    var dateStr = parseDate(dateString);

                    switch (elem.children[1].attribs.href) {
                        case '/afvalstroom/1':
                            if (!fDates.GFT) fDates.GFT = [];
                            fDates.GFT.push(dateStr);
                            break;
                        case '/afvalstroom/2':
                            if (!fDates.PAPIER) fDates.PAPIER = [];
                            fDates.PAPIER.push(dateStr);
                            break;
                        case '/afvalstroom/3':
                            if (!fDates.REST) fDates.REST = [];
                            fDates.REST.push(dateStr);
                            break;
                        case '/afvalstroom/4':
                            if (!fDates.PLASTIC) fDates.PLASTIC = [];
                            fDates.PLASTIC.push(dateStr);
                            break;
                        case '/afvalstroom/6':
                            if (!fDates.TEXTIEL) fDates.TEXTIEL = [];
                            fDates.TEXTIEL.push(dateStr);
                            break;
                        default:
                            console.log('defaulted', elem.children[1].attribs.href);
                    }
                } catch (error) {
                    return callback(new Error('Date format Error'));
                }
            });
            console.log(fDates);
            return callback(null, fDates);
        }
        else {
            return callback(new Error('Invalid location'));
        }
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

function customFormatDate(date) {
    var ad = date.split('-');
    return ad[2] + '-' + ('0' + ad[1]).slice(-2) + '-' + ('0' + ad[0]).slice(-2);
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

/**
 * List of providers consuming different API implementations
 */

// Don't forget to add the ID and name to the option set in settings/index.html page as well! :)
apiList.push({ name: "Afval App", id: "afa", execute: afvalapp });
apiList.push({ name: "Mijn Afvalwijzer", id: "afw", execute: mijnAfvalWijzer });
apiList.push({ name: "Den Bosch Afvalstoffendienstkalender", id: "dbafw", execute: denBoschAfvalstoffendienstCalendar });
apiList.push({ name: "Afvalwijzer Suez", id: "arn", execute: afvalwijzerSuez });
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


module.exports = apiList;
