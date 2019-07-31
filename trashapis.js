"use strict";

var apiList = [];
var http = require('http');
var https = require('https');
var dateFormat = require('dateformat');
var request = require('request');
var cheerio = require('cheerio');
var ical = require('ical');

/**
 * Different venders using the same two base API's
 */

function mijnAfvalWijzer(postcode, housenumber, country, callback) {
    generalMijnAfvalwijzerApiImplementation(postcode, housenumber, country, "https://www.mijnafvalwijzer.nl/nl/", callback);
}

function denBoschAfvalstoffendienstCalendar(postcode, housenumber, country, callback) {
    generalMijnAfvalwijzerApiImplementation(postcode, housenumber, country, 'http://denbosch.afvalstoffendienstkalender.nl/nl/', callback);
}

function afvalkalenderCyclus(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.cyclusnv.nl', callback);
}

function afvalRmn(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'inzamelschema.rmn.nl', callback);
}

function afvalAvalex(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'avalex.nl', callback);
}

function afvalkalenderMeerlanden(postcode, housenumber, country, callback) {
    newGeneralAfvalkalendersNederland(postcode, housenumber, country, 'afvalkalender.meerlanden.nl', callback);
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
            var result = JSON.parse(body);
            console.log(result);

            if (result.length <= 0) {
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
                        const dateStr = ('0' + entry.start.getDate()).slice(-2) + '-' + (('0' + (entry.start.getMonth() + 1)).slice(-2)) + '-' + entry.start.getFullYear();

                        var description = entry.description.toLowerCase();

                        if (description.indexOf('groente') !== -1 || description.indexOf('gft') !== -1) {
                            if (!dates.GFT) dates.GFT = [];
                            dates.GFT.push(dateStr);
                        } else if (description.indexOf('rest') !== -1) {
                            if (!dates.REST) dates.REST = [];
                            dates.REST.push(dateStr);
                        } else if (description.indexOf('plastic') !== -1 || description.indexOf('pmd') !== -1) {
                            if (!dates.PLASTIC) dates.PLASTIC = [];
                            dates.PLASTIC.push(dateStr);
                        } else if (description.indexOf('papier') !== -1) {
                            if (!dates.PAPIER) dates.PAPIER = [];
                            dates.PAPIER.push(dateStr);
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
            var $ = cheerio.load(res.body);

            $('a.wasteInfoIcon p').each((i, elem) => {
                var dateStr = parseDate(elem.children[0].data);
                //console.log(elem.attribs.class);
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
                        if (!fDates.PMD) fDates.PMD = [];
                        fDates.PMD.push(dateStr);
                        break;
                    case 'restgft':
                        if (!fDates.REST) fDates.REST = [];
                        if (!fDates.GFT) fDates.GFT = [];
                        fDates.REST.push(dateStr);
                        fDates.GFT.push(dateStr);
                        break;
                    case 'dhm':
                        if (!fDates.PAPIER) fDates.PAPIER = [];
                        if (!fDates.PMD) fDates.PMD = [];
                        fDates.PAPIER.push(dateStr);
                        fDates.PMD.push(dateStr);
                        break;
                    default:
                        console.log('Defaulted. Element not found:', elem.attribs.class);
                }
            });
            console.log(fDates);
            return callback(null, fDates);
        } else {
            return callback(new Error('Invalid location'));
        }
    });
}

/**
 * Vendor specific API implementations
 */

function twenteMilieu(postcode, housenumber, country, callback) {
    console.log("Checking Twente Milieu");

    var fDates = {};
    if (country !== "NL") {
        console.log('unsupported country');
        return callback(new Error('unsupported country'));
    }

    var startDate = new Date();
    startDate = dateFormat(startDate.setDate(startDate.getDate() - 14), "yyyy-mm-dd");
    // console.log("startDate is: " + startDate);

    var endDate = new Date();
    endDate = dateFormat(endDate.setDate(endDate.getDate() + 30), "yyyy-mm-dd");
    // console.log("endDate is: " + endDate);

    var post_data1 = `companyCode=8d97bb56-5afd-4cbc-a651-b4f7314264b4&postCode=${postcode}&houseNumber=${housenumber}&houseLetter=&houseNumberAddition=`;
    var post_options1 = {
        host: 'wasteapi.2go-mobile.com',
        port: '443',
        path: '/api/FetchAdress',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data1)
        }
    };

    var buffer1 = "";
    var buffer2 = "";
    var post_req1 = https.request(post_options1, function (res1) {
        if (res1.statusCode == 200) {
            res1.on("data", function (chunk1) { buffer1 = buffer1 + chunk1; });
            res1.on("end", function (chunk1) {
                // console.log("Output fetchAddress is: " + buffer1);
                var obj1 = JSON.parse(buffer1);
                if (obj1.status) {

                    if (typeof obj1 === 'undefined' || typeof obj1.dataList === 'undefined' || typeof obj1.dataList[0] === 'undefined') {
                        console.log("UniqueID couldn't be found in the respons.");
                        return callback(new Error('UniqueID could not be found in the response.'));
                    }

                    var uniqueID = obj1.dataList[0].UniqueId;
                    // console.log("UniqueID: " + uniqueID);
                    var post_data2 = `companyCode=8d97bb56-5afd-4cbc-a651-b4f7314264b4&uniqueAddressID=${uniqueID}&startDate=${startDate}&endDate=${endDate}`;
                    var post_options2 = {
                        host: 'wasteapi.2go-mobile.com',
                        port: '443',
                        path: '/api/GetCalendar',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
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
                                    switch (obj2.dataList[i]._pickupTypeText) {
                                        case "GREY":
                                            // console.log("REST:");
                                            if (!fDates.REST) fDates.REST = [];
                                            break;
                                        case "GREEN":
                                            // console.log("GFT:");
                                            if (!fDates.GFT) fDates.GFT = [];
                                            break;
                                        case "PAPER":
                                            // console.log("PAPIER:");
                                            if (!fDates.PAPIER) fDates.PAPIER = [];
                                            break;
                                        case "PACKAGES":
                                            // console.log("PLASTIC:");
                                            if (!fDates.PLASTIC) fDates.PLASTIC = [];
                                            break;
                                    }
                                    // console.log("Datum is: " + obj2.dataList[i].pickupDates[0]);
                                    //console.log("Aantal datums: " + Object.keys(obj2.dataList[i].pickupDates).length);
                                    for (var j = 0; j < Object.keys(obj2.dataList[i].pickupDates).length; j++) {
                                        var date = dateFormat(obj2.dataList[i].pickupDates[j], "dd-mm-yyyy");
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
                                            case "PACKAGES":
                                                if (!fDates.PLASTIC) fDates.PLASTIC = [];
                                                fDates.PLASTIC.push(date);
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

function gemeenteHellendoorn(postcode, housenumber, country, callback) {
    console.log("Checking Gemeente Hellendoorn");

    if (country !== "NL") {
        console.log('unsupported country');
        return callback(new Error('unsupported country'));
    }

    var DOMParser = require('xmldom').DOMParser;

    var startDate = new Date();
    startDate = dateFormat(startDate.setDate(startDate.getDate() - 14), "yyyy-mm-dd");
    // console.log("startDate is: " + startDate);

    var endDate = new Date();
    endDate = dateFormat(endDate.setDate(endDate.getDate() + 90), "yyyy-mm-dd");
    // console.log("endDate is: " + endDate);

    var body1 = '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">' +
        '<soap12:Body><GetAddresses xmlns="http://www.meurs-software.nl/afval-ris">' +
        `<ZipCode>${postcode}</ZipCode>` +
        `<HouseNumber>${housenumber}</HouseNumber>` +
        '<HouseLetter></HouseLetter>' +
        '</GetAddresses></soap12:Body></soap12:Envelope>';

    var postRequest1 = {
        host: "hellendoornportal-srvc.2go-mobile.com",
        path: "/ReportService.asmx",
        port: 80,
        method: "POST",
        headers: {
            'Cookie': "cookie",
            'Content-Type': 'text/xml',
            'Content-Length': Buffer.byteLength(body1)
        }
    };
    var result = "";
    var fDates = {};
    var buffer1 = "";
    var uniqueID = "";

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    var req1 = http.request(postRequest1, function (res1) {
        if (res1.statusCode == 200) {
            // console.log( res1.statusCode );
            console.log("Aanroep Hellendoorn met: " + postcode + housenumber + country);
            var buffer1 = "";
            res1.on("data", function (data1) { buffer1 = buffer1 + data1; });
            res1.on("end", function (data1) {
                // console.log( buffer1 );
                var doc1 = new DOMParser().parseFromString(buffer1, "text/xml");
                // console.log("statusCode is: " + doc1.getElementsByTagName("StatusCode")[0].childNodes[0].data);
                if (doc1.getElementsByTagName("StatusCode")[0].childNodes[0].data == "Ok" && doc1.getElementsByTagName("Addresses")[0].childNodes.length > 0) {
                    var uniqueIDObject = doc1.getElementsByTagName("UniqueId");
                    uniqueID = uniqueIDObject[0].childNodes[0].data;
                    var body2 = '<?xml version="1.0" encoding="utf-8"?>' +
                        '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">' +
                        '<soap12:Body><GetContainerDates xmlns="http://www.meurs-software.nl/afval-ris">' +
                        `<UniqueAddressId>${uniqueID}</UniqueAddressId>` +
                        `<Start>${startDate}</Start>` +
                        `<End>${endDate}</End>` +
                        '</GetContainerDates></soap12:Body></soap12:Envelope>';

                    var postRequest2 = {
                        host: "hellendoornportal-srvc.2go-mobile.com",
                        path: "/ReportService.asmx",
                        port: 80,
                        method: "POST",
                        headers: {
                            'Cookie': "cookie",
                            'Content-Type': 'text/xml',
                            'Content-Length': Buffer.byteLength(body2)
                        }
                    };
                    var req2 = http.request(postRequest2, function (res2) {
                        if (res2.statusCode == 200) {
                            // console.log( res2.statusCode );
                            var buffer2 = "";
                            // console.log("uniqueID is: ", uniqueID);
                            res2.on("data", function (data2) { buffer2 = buffer2 + data2; });
                            res2.on("end", function (data2) {
                                var doc2 = new DOMParser().parseFromString(buffer2, "text/xml");
                                if (doc2.getElementsByTagName("StatusCode")[0].childNodes[0].data == "Ok") {
                                    var trashCodeObject = doc2.getElementsByTagName("Code");
                                    var numberOfCodes = trashCodeObject.length;
                                    // console.log("Code is: ", doc.getElementsByTagName("Code")[0].childNodes[0].data);
                                    // console.log("Aantal gevonden Code velden: ", numberOfCodes);
                                    for (var i = 0; i < numberOfCodes; i++) {
                                        switch (trashCodeObject[i].childNodes[0].data) {
                                            case "00":
                                                // console.log("REST:");
                                                if (!fDates.REST) fDates.REST = [];
                                                break;
                                            case "11":
                                                // console.log("GFT:");
                                                if (!fDates.GFT) fDates.GFT = [];
                                                break;
                                            case "22":
                                                // console.log("PAPIER:");
                                                if (!fDates.PAPIER) fDates.PAPIER = [];
                                                break;
                                            case "66":
                                                // console.log("PLASTIC:");
                                                if (!fDates.PLASTIC) fDates.PLASTIC = [];
                                                break;
                                        }

                                        var numberOfDates = trashCodeObject[i].parentNode.lastChild.childNodes.length;
                                        // console.log("Aantal gevonden Datums: ", numberOfDates);
                                        for (var j = 0; j < numberOfDates; j++) {
                                            var date = trashCodeObject[i].parentNode.lastChild.childNodes[j].childNodes[0].nodeValue;
                                            // console.log(dateFormat(date, "dd-mm-yyyy"));
                                            switch (trashCodeObject[i].childNodes[0].data) {
                                                case "00":
                                                    if (!fDates.REST) fDates.REST = [];
                                                    fDates.REST.push(dateFormat(date, "dd-mm-yyyy"));
                                                    break;
                                                case "11":
                                                    if (!fDates.GFT) fDates.GFT = [];
                                                    fDates.GFT.push(dateFormat(date, "dd-mm-yyyy"));
                                                    break;
                                                case "22":
                                                    if (!fDates.PAPIER) fDates.PAPIER = [];
                                                    fDates.PAPIER.push(dateFormat(date, "dd-mm-yyyy"));
                                                    break;
                                                case "66":
                                                    if (!fDates.PLASTIC) fDates.PLASTIC = [];
                                                    fDates.PLASTIC.push(dateFormat(date, "dd-mm-yyyy"));
                                                    break;
                                            }
                                            // console.log(dateFormat(date, "dd-mm-yyyy"));

                                        }
                                        // console.log(trashCodeObject[i].getElementsByTagName("string")[0]);
                                    }
                                    console.log(fDates);
                                    return callback(null, fDates);
                                } else {
                                    console.log("Ophalen van ophaaldata is mislukt!");
                                    return callback(new Error('Invalid location'));
                                }
                            });
                        } else {
                            console.log(res2.statusCode);
                            console.log("Er is iets fout gegaan! (response code req2)");
                            return callback(new Error('Invalid location'));
                        }
                    });
                    req2.write(body2);
                    req2.end();
                } else {
                    console.log("Er is iets fout gegaan! (parsen van doc 1)");
                    return callback(new Error('Invalid location'));
                }
            });
        } else {
            console.log(res1.statusCode);
            console.log("Er is iets fout gegaan! (response code req1)");
            return callback(new Error('Invalid location'));
        }
    });
    req1.write(body1);
    req1.end();
}

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
                            var dateStr = dateFormat(obj1.data[i].occurrences[j].from.date, "dd-mm-yyyy");
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
            var result = JSON.parse(res.body);
            console.log(result);
            return callback(null, result);
        } else {
            return callback(new Error('Invalid location'));
        }
    });
}

function rovaAfvalkalender(postcode, housenumber, country, callback) {
    //console.log("Checking ROVA Afvalkalender");

    var fDates = {};
    if (country !== "NL") {
        //console.log('unsupported country');
        return callback(new Error('unsupported country'));
    }

    var year = (new Date()).getFullYear();

    // split c
    var postCodeNumbers = postcode.substr(0, 4);
    var postCodeChars = postcode.substr(4, 2);

    var fullPath = `http://rova.quintor.nl/rest/afvalkalender/${year}/${postCodeNumbers}/${postCodeChars}/${housenumber}`;

    //console.log(`requesting for ${fullPath}`)

    var options = {
        url: fullPath,
        headers: {
            'User-Agent': 'Android',
            'Accept': 'application/json;version=1.6'
        }
    };

    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var responseJson = JSON.parse(res.body);
            //console.log(`response json ${responseJson}`)

            // root has one afvalkalender with one array inzameldagen
            var pickupDays = responseJson.afvalkalender.inzameldagen;

            for (let i in pickupDays) {
                var pickupDay = pickupDays[i];
                var date = dateFormat(pickupDay["datum"], "dd-mm-yyyy"); // because pickupDay uses yyyy-mm-dd

                // inzamelsoorten is an array with only one string
                switch (pickupDay["inzamelsoorten"][0]) {
                    case 'PLASTICPLUS':
                        if (!fDates.PLASTIC) fDates.PLASTIC = [];
                        fDates.PLASTIC.push(date);
                        break;
                    case 'REST':
                        if (!fDates.REST) fDates.REST = [];
                        fDates.REST.push(date);
                        break;
                    case 'GFT':
                        if (!fDates.GFT) fDates.GFT = [];
                        fDates.GFT.push(date);
                        break;
                    case 'PAPIER':
                        if (!fDates.PAPIER) fDates.PAPIER = [];
                        fDates.PAPIER.push(date);
                        break;
                    case 'GROF':
                        // not supported
                        break;
                }
            }

            //console.log(fDates);
            return callback(null, fDates);
        }
        else {
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
                    var o = json_body.customData.response.garbage;
                    for (var i = 0; i < o.length; i++) {
                        var key = o[i].code;
                        switch (key) {
                            case 'PMD':
                            case 'GFT':
                            case 'REST':
                                break;
                            case 'ZWAKRA':
                                key = "PMD";
                                break;
                            case 'PAP':
                                key = 'PAPIER';
                                break;
                            case 'BEST':
                                key = 'TEXTIEL';
                                break;
                            default:
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

function afvalwijzerArnhem(postcode, housenumber, country, callback) {
    console.log("Checking Afvalwijzer Arnhem");

    var fDates = {};
    if (country !== "NL") {
        console.log('unsupported country');
        return callback(new Error('unsupported country'));
    }

    var url = `http://www.afvalwijzer-arnhem.nl/applicatie?ZipCode=${postcode}&HouseNumber=${housenumber}&HouseNumberAddition=`;

    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            //console.log(res);
            var $ = cheerio.load(res.body);
            $('ul.ulPickupDates li').each((i, elem) => {
                var dateStr = customFormatDate(elem.children[2].data.trim());
                switch (elem.attribs.class) {
                    case 'gft':
                        if (!fDates.GFT) fDates.GFT = [];
                        fDates.GFT.push(dateStr);
                        break;
                    case 'papier':
                        if (!fDates.PAPIER) fDates.PAPIER = [];
                        fDates.PAPIER.push(dateStr);
                        break;
                    case 'restafval':
                        if (!fDates.REST) fDates.REST = [];
                        fDates.REST.push(dateStr);
                        break;
                    case 'kunststof':
                        if (!fDates.PLASTIC) fDates.PLASTIC = [];
                        fDates.PLASTIC.push(dateStr);
                        break;
                    default:
                        console.log('defaulted', elem.attribs.class);
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
        var dutchDate = arrDate[2] + "-" + arrDate[1] + "-" + arrDate[0];
        dates[key].push(dutchDate);
    }
}

function customFormatDate(date) {
    var ad = date.split('-');
    return ('0' + ad[0]).slice(-2) + '-' + ('0' + ad[1]).slice(-2) + '-' + ad[2];
}

function parseDate(dateString) {
    var dateArray = dateString.split(" ");
    var fullString = dateArray[1] + '-'; //day of the month(already padded)
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
    ];
    var monthNum = months.indexOf(dateArray[2]) + 1;
    if (monthNum > 0) {
        var monthString = (monthNum).toString();
        if (monthString.length === 1) {
            monthString = '0' + monthString;
        }
        fullString += monthString + '-';
    } else {
        console.log('This should not be possible...');
        return 'erroneous date';
    }
    fullString += new Date().getFullYear();
    return fullString;
}

/**
 * List of providers consuming different API implementations
 */

// Don't forget to add the ID and name to the option set in settings/index.html page as well! :)
apiList.push({ name: "Afval App", id: "afa", execute: afvalapp });
apiList.push({ name: "Mijn Afvalwijzer", id: "afw", execute: mijnAfvalWijzer });
apiList.push({ name: "Den Bosch Afvalstoffendienstkalender", id: "dbafw", execute: denBoschAfvalstoffendienstCalendar });
apiList.push({ name: "Afvalwijzer Arnhem", id: "arn", execute: afvalwijzerArnhem });
apiList.push({ name: "Afvalkalender Cyclus", id: "afc", execute: afvalkalenderCyclus });
apiList.push({ name: "Afvalkalender RMN", id: "afrm", execute: afvalRmn });
apiList.push({ name: "Twente Milieu", id: "twm", execute: twenteMilieu });
apiList.push({ name: "Gemeente Hellendoorn", id: "geh", execute: gemeenteHellendoorn });
apiList.push({ name: "Recyclemanager", id: "remg", execute: recycleManager });
apiList.push({ name: "Afvalkalender Meerlanden", id: "akm", execute: afvalkalenderMeerlanden });
apiList.push({ name: "Afvalkalender Venray", id: "akvr", execute: afvalkalenderVenray });
apiList.push({ name: "Inzamelkalender HVC", id: "hvc", execute: inzamelkalenderHVC });
apiList.push({ name: "Dar Afvalkalender", id: "dar", execute: darAfvalkalender });
apiList.push({ name: "Afvalkalender RD4", id: "rd4", execute: afvalkalenderRD4 });
apiList.push({ name: "ROVA Afvalkalender", id: "rov", execute: rovaAfvalkalender });
apiList.push({ name: "Afvalkalender Circulus-Berkel", id: "acb", execute: circulusBerkel });
apiList.push({ name: "Mijn Blink Afvalkalender", id: "mba", execute: BlinkAfvalkalender });
apiList.push({ name: "Avalex", id: "avx", execute: afvalAvalex });

module.exports = apiList;
