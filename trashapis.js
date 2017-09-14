"use strict";

var apiList = [];
var http = require('http');
var https = require('https');
var dateFormat = require('dateformat');
var request = require('request');
var cheerio = require('cheerio');
var ical = require('ical');
var DOMParser = require('xmldom').DOMParser;

function afvalapp(postcode, homenumber, country, callback) {
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
            } else {//validate the response
                return callback(null, dates);
            }
        });
    });

    req.on('error', function (err) {
        console.log(err.message);
    });
}

function mijnAfvalWijzer(postcode, housenumber, country, callback) {
    var fDates = {};
    if (country !== "NL") {
        callback(new Error('unsupported country'));
        return;
    }

    request(`http://www.mijnafvalwijzer.nl/nl/${postcode}/${housenumber}/`, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(res.body);

            $('a.wasteInfoIcon p').each((i, elem) => {
                var dateStr = parseDate(elem.children[0].data);
                //console.log(elem.attribs.class);
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
                        console.log('defaulted', elem.attribs.class);
                }
            });
            console.log(fDates);
            return callback(null, fDates);
        } else {
            return callback(new Error('Invalid location'));
        }
    });
}

function afvalwijzerArnhem(postcode, housenumber, country, callback) {
    var fDates = {};
    if (country !== "NL") {
        callback(new Error('unsupported country'));
        return;
    }

    var url = `http://www.afvalwijzer-arnhem.nl/applicatie?ZipCode=${postcode}&HouseNumber=${housenumber}&HouseNumberAddition=`;
    // console.log(url);

    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(res.body);
            $('ul.ulPickupDates li').each((i, elem) => {
                var dateStr = dateFormat(elem.children[2].data.trim());
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
            return callback(null, fDates);
        } else {
            return callback(new Error('Invalid location'));
        }
    });
}


function afvalwijzerArnhem(postcode, housenumber, country, callback){
  var fDates = {};
  if(country !== "NL"){
    console.log('unsupported country');
    callback(new Error('unsupported country'));
  }

  var url = `http://www.afvalwijzer-arnhem.nl/applicatie?ZipCode=${postcode}&HouseNumber=${housenumber}&HouseNumberAddition=`;
 // console.log(url);

  request(url, function(err, res, body){
    if(!err && res.statusCode == 200){
      //console.log(res);
       var $ = cheerio.load(res.body);
       $('ul.ulPickupDates li').each((i, elem)=>{
         var dateStr =dateFormat(elem.children[2].data.trim());
         switch (elem.attribs.class) {
          case 'gft':
            if(!fDates.GFT) fDates.GFT = [];
            fDates.GFT.push(dateStr);
            break;
          case 'papier':
            if(!fDates.PAPIER) fDates.PAPIER = [];
            fDates.PAPIER.push(dateStr);
            break;
          case 'restafval':
            if(!fDates.REST) fDates.REST = [];
            fDates.REST.push(dateStr);
            break;
          case 'kunststof':
            if(!fDates.PLASTIC) fDates.PLASTIC = [];
            fDates.PLASTIC.push(dateStr);
            break;
          default:
            console.log('defaulted', elem.attribs.class);
        }
        // console.log(i);
        //  console.log(elem);
        //  console.log(elem.attribs.class);
        // console.log(`${elem.attribs.class}:\t\t${elem.children[2].data.trim()}`);
      });
      console.log(fDates);
      return callback(null, fDates);
    } else {
       return callback(new Error('Invalid location'));
    }

    const r = request.defaults({jar: true});
    r.post({
        url: 'http://afvalkalender.cyclusnv.nl/login.php',
        followAllRedirects: true,
        form: {
            postcode: postcode,
            huisnummer: housenumber,
            toevoeging: '',
            toon: true
        }
    }, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            r.get(`http://afvalkalender.cyclusnv.nl/download_ical.php?p=${postcode}&h=${housenumber}&t=`, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    const dates = {};
                    const entries = ical.parseICS(body);
                    for (let i in entries) {
                        const entry = entries[i];
                        const dateStr = ('0' + entry.start.getDate()).slice(-2) + '-' + (('0' + (entry.start.getMonth() + 1)).slice(-2)) + '-' + entry.start.getFullYear();

                        if (entry.description.indexOf('GFT') !== -1) {
                            if (!dates.GFT) dates.GFT = [];
                            dates.GFT.push(dateStr);
                        } else if (entry.description.indexOf('Rest') !== -1) {
                            if (!dates.REST) dates.REST = [];
                            dates.REST.push(dateStr);
                        } else if (entry.description.indexOf('Plastic') !== -1) {
                            if (!dates.PLASTIC) dates.PLASTIC = [];
                            dates.PLASTIC.push(dateStr);
                        }
                    }

                    return callback(null, dates);
                } else {
                    return callback(new Error('Unable to download ical file'));
                }
            });
        } else {
            return callback(new Error('Unable to login'));
        }
    });
  });
}

function twenteMilieu(postcode, housenumber, country, callback){
  var fDates = {};
  if(country !== "NL"){
    console.log('unsupported country');
    callback(new Error('unsupported country'));
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

  var buffer1="";
  var buffer2="";

  var post_req1 = https.request(post_options1, function(res1) {
    if (res1.statusCode == 200){
      res1.on( "data", function( chunk1 ) { buffer1 = buffer1 + chunk1; } );
      res1.on( "end", function( chunk1 ) {
        // console.log("Output fetchAddress is: " + buffer1);
        var obj1 = JSON.parse(buffer1);
        if(obj1.status){
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
          var post_req2 = https.request(post_options2, function(res2) {
            res2.on( "data", function( chunk2 ) { buffer2 = buffer2 + chunk2; } );
            res2.on( "end", function( chunk2 ) {
              var obj2 = JSON.parse(buffer2);
              if (obj2.status){
                for (var i=0; i < Object.keys(obj2.dataList).length; i++){
                  // console.log("Type afval is: " + obj2.dataList[i]._pickupTypeText);
                  switch(obj2.dataList[i]._pickupTypeText)
                  {
                    case "GREY":
                      // console.log("REST:");
                      if(!fDates.REST) fDates.REST = [];
                      break;
                   case "GREEN":
                     // console.log("GFT:");
                     if(!fDates.GFT) fDates.GFT = [];
                     break;
                   case "PAPER":
                     // console.log("PAPIER:");
                     if(!fDates.PAPIER) fDates.PAPIER = [];
                     break;
                   case "PACKAGES":
                     // console.log("PLASTIC:");
                     if(!fDates.PLASTIC) fDates.PLASTIC = [];
                     break;
                   }
                  // console.log("Datum is: " + obj2.dataList[i].pickupDates[0]);
                  //console.log("Aantal datums: " + Object.keys(obj2.dataList[i].pickupDates).length);
                  for (var j=0; j < Object.keys(obj2.dataList[i].pickupDates).length; j++){
                      var date = dateFormat(obj2.dataList[i].pickupDates[j], "dd-mm-yyyy");
                      switch(obj2.dataList[i]._pickupTypeText)
                      {
                        case "GREY":
                          if(!fDates.REST) fDates.REST = [];
                          fDates.REST.push(date);
                          break;
                       case "GREEN":
                         if(!fDates.GFT) fDates.GFT = [];
                         fDates.GFT.push(date);
                         break;
                       case "PAPER":
                         if(!fDates.PAPIER) fDates.PAPIER = [];
                         fDates.PAPIER.push(date);
                         break;
                       case "PACKAGES":
                         if(!fDates.PLASTIC) fDates.PLASTIC = [];
                         fDates.PLASTIC.push(date);
                         break;
                       }
                   }
                }
                console.log(fDates);
                return callback(null, fDates);
              }else{
                console.log("Er is iets fout gegaan bij het ophalen vd data");
                return callback(new Error('Invalid location'));
              }
            });
          });

        // post the data
        post_req2.write(post_data2);
        post_req2.end();
      }else{
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

function gemeenteHellendoorn(postcode, housenumber, country, callback){
  if(country !== "NL"){
    console.log('unsupported country');
    callback(new Error('unsupported country'));
  }
  var DOMParser = new DOMParser();

  var startDate = new Date();
  startDate = dateFormat(startDate.setDate(startDate.getDate() - 14), "yyyy-mm-dd");
  // console.log("startDate is: " + startDate);

  var endDate = new Date();
  endDate = dateFormat(endDate.setDate(endDate.getDate() + 90), "yyyy-mm-dd");
  // console.log("endDate is: " + endDate);

  var body1 = '<?xml version="1.0" encoding="utf-8"?>' +
             '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">'+
             '<soap12:Body><GetAddresses xmlns="http://www.meurs-software.nl/afval-ris">'+
             `<ZipCode>${postcode}</ZipCode>`+
             `<HouseNumber>${housenumber}</HouseNumber>`+
             '<HouseLetter></HouseLetter>'+
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

  var req1 = http.request( postRequest1, function( res1 )    {
     if (res1.statusCode == 200) {
       // console.log( res1.statusCode );
       console.log("Aanroep Hellendoorn met: " + postcode + housenumber + country);
       var buffer1 = "";
       res1.on( "data", function( data1 ) { buffer1 = buffer1 + data1; } );
       res1.on( "end", function( data1 ) {
         // console.log( buffer1 );
         var doc1 = DOMParser.parseFromString(buffer1,"text/xml");
         // console.log("statusCode is: " + doc1.getElementsByTagName("StatusCode")[0].childNodes[0].data);
         if (doc1.getElementsByTagName("StatusCode")[0].childNodes[0].data == "Ok" && doc1.getElementsByTagName("Addresses")[0].childNodes.length > 0){
           var uniqueIDObject = doc1.getElementsByTagName("UniqueId");
           uniqueID = uniqueIDObject[0].childNodes[0].data;
           var body2 = '<?xml version="1.0" encoding="utf-8"?>' +
                      '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">'+
                      '<soap12:Body><GetContainerDates xmlns="http://www.meurs-software.nl/afval-ris">'+
                      `<UniqueAddressId>${uniqueID}</UniqueAddressId>`+
                      `<Start>${startDate}</Start>`+
                      `<End>${endDate}</End>`+
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
           var req2 = http.request( postRequest2, function( res2 )    {
              if (res2.statusCode == 200){
                // console.log( res2.statusCode );
                var buffer2 = "";
                // console.log("uniqueID is: ", uniqueID);
                res2.on( "data", function( data2 ) {buffer2 = buffer2 + data2; });
                res2.on( "end", function( data2 ) {
                  var doc2 = DOMParser.parseFromString(buffer2,"text/xml");
                  if (doc2.getElementsByTagName("StatusCode")[0].childNodes[0].data == "Ok"){
                    var trashCodeObject = doc2.getElementsByTagName("Code");
                    var numberOfCodes = trashCodeObject.length;
                         // console.log("Code is: ", doc.getElementsByTagName("Code")[0].childNodes[0].data);
                    // console.log("Aantal gevonden Code velden: ", numberOfCodes);
                    for (var i=0; i < numberOfCodes; i++){
                      switch(trashCodeObject[i].childNodes[0].data)
                      {
                        case "00":
                          // console.log("REST:");
                          if(!fDates.REST) fDates.REST = [];
                          break;
                       case "11":
                         // console.log("GFT:");
                         if(!fDates.GFT) fDates.GFT = [];
                         break;
                       case "22":
                         // console.log("PAPIER:");
                         if(!fDates.PAPIER) fDates.PAPIER = [];
                         break;
                       case "66":
                         // console.log("PLASTIC:");
                         if(!fDates.PLASTIC) fDates.PLASTIC = [];
                         break;
                       }

                      var numberOfDates = trashCodeObject[i].parentNode.lastChild.childNodes.length;
                      // console.log("Aantal gevonden Datums: ", numberOfDates);
                      for (var j=0; j < numberOfDates; j++){
                        var date = trashCodeObject[i].parentNode.lastChild.childNodes[j].childNodes[0].nodeValue;
                        // console.log(dateFormat(date, "dd-mm-yyyy"));
                        switch(trashCodeObject[i].childNodes[0].data)
                        {
                          case "00":
                            if(!fDates.REST) fDates.REST = [];
                            fDates.REST.push(dateFormat(date, "dd-mm-yyyy"));
                            break;
                         case "11":
                           if(!fDates.GFT) fDates.GFT = [];
                           fDates.GFT.push(dateFormat(date, "dd-mm-yyyy"));
                           break;
                         case "22":
                           if(!fDates.PAPIER) fDates.PAPIER = [];
                           fDates.PAPIER.push(dateFormat(date, "dd-mm-yyyy"));
                           break;
                         case "66":
                           if(!fDates.PLASTIC) fDates.PLASTIC = [];
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
                console.log("Er is iets fout gegaan!");
                return callback(new Error('Invalid location'));
              }
            });
           req2.write( body2 );
           req2.end();
         } else {
           console.log("Er is iets fout gegaan!");
           return callback(new Error('Invalid location'));
         }
       });
     } else {
       console.log("Er is iets fout gegaan!");
       return callback(new Error('Invalid location'));
     }
  });
  req1.write( body1 );
  req1.end();

}

function recycleManager(postcode, housenumber, country, callback){
  if(country !== "NL"){
    console.log('unsupported country');
    callback(new Error('unsupported country'));
  }
  var fDates = {};
  console.log("Recyclemanager met: " + postcode + " " + housenumber);
  var url = `https://vpn-wec-api.recyclemanager.nl/v2/calendars?postalcode=${postcode}&number=${housenumber}`;

  request(url, function(err, res, body){
    if(!err && res.statusCode == 200){
      // console.log(res);
      var obj1 = JSON.parse(res.body);
      if (obj1.status == "success"){
        for (var i=0; i < 2; i++){
          // console.log("Maand is: " + dateFormat(obj1.data[i].title));
          for (var j=0; j < obj1.data[i].occurrences.length; j++){
            var dateStr = dateFormat(obj1.data[i].occurrences[j].from.date, "dd-mm-yyyy");
            console.log("Soort afval is: " + obj1.data[i].occurrences[j].title);
            switch (obj1.data[i].occurrences[j].title) {
              case 'Groente en fruit':
	            case 'GFT':
                if(!fDates.GFT) fDates.GFT = [];
                fDates.GFT.push(dateStr);
                break;
              case 'Papier':
                if(!fDates.PAPIER) fDates.PAPIER = [];
                fDates.PAPIER.push(dateStr);
                break;
              case 'Restafval':
                if(!fDates.REST) fDates.REST = [];
                fDates.REST.push(dateStr);
              break;
              case 'PMD':
	            case 'Plastic verpakkingen':
                if(!fDates.PLASTIC) fDates.PLASTIC = [];
                fDates.PLASTIC.push(dateStr);
              break;
              default:
                console.log('defaulted', obj1.data[i].occurrences[j]);
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

function dateFormat(date) {
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

apiList.push(afvalapp);
apiList.push(mijnAfvalWijzer);
apiList.push(afvalwijzerArnhem);
apiList.push(twenteMilieu);
apiList.push(gemeenteHellendoorn);
apiList.push(recycleManager);

module.exports = apiList;