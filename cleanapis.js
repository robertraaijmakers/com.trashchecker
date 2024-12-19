"use strict";

var apiList = [];
var https = require('https');

/**
 * Different vendors using the same three base API's
 */

function CleanProfs(zipCode, houseNumber, street, country) {
     
    if (country !== "NL") {
        return Promise.reject(Error('Unsupported country'));
    }

    if (zipCode === '') {
        return Promise.reject(Error('Zip code is required'));
    }

    let fDates = {};

    // Retrieve trash request
    let startDate = new Date(); //startDate.set
    startDate = formatDate(startDate.setDate(startDate.getDate() - 7));

    let endDate = new Date();
    endDate = formatDate(endDate.setDate(endDate.getDate() + 21));
    
    return new Promise(function(resolve, reject)
    {
        var getCleanProfsRequest = httpsPromise({
            hostname: `cleanprofs.jmsdev.nl`,
            path: `/api/get-plannings-address?zipcode=${zipCode}&house_number=${houseNumber}&start_date=${startDate}&end_date=${endDate}&code=crm`,
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Homey'
            }
        });

        console.log("Starting GET");
    
        getCleanProfsRequest.then(function(response)
        {
            var result = response.body;

            console.log(result);

            if(result.length <= 0)
            {
                reject(new Error("No cleaning data found for: cleanprofs.jmsdev.nl"));
                return;
            }

            for (let i in result) {
                const entry = result[i];
                const dateStr = entry['full_date'];
                const description = entry['product_name']?.toLowerCase();

                if (typeof description === 'undefined' || description === null || description === '') {
                    console.log(`No description found for date: ${dateStr}. Full entry details: ${entry}.`);
                }
                else if (description.indexOf('gft') !== -1) {
                    if (!fDates.GFT) fDates.GFT = [];
                    fDates.GFT.push(dateStr);
                } else if (description.indexOf('rest') !== -1 || description.indexOf('rst') !== -1) {
                    if (!fDates.REST) fDates.REST = [];
                    fDates.REST.push(dateStr);
                } else if (description.indexOf('pmd') !== -1 || description.indexOf('pd') !== -1 || description.indexOf('metaal') !== -1 || description.indexOf('drankkartons') !== -1) {
                    if (!fDates.PMD) fDates.PMD = [];
                    fDates.PMD.push(dateStr);
                } else if (description.indexOf('plc') !== -1) {
                    if (!fDates.PLASTIC) fDates.PLASTIC = [];
                    fDates.PLASTIC.push(dateStr);
                } else if (description.indexOf('papier') !== -1) {
                    if (!fDates.PAPIER) fDates.PAPIER = [];
                    fDates.PAPIER.push(dateStr);
                } else {
                    console.log("Unknown description: " + description);
                }
            }
            
            resolve(fDates);
        });
    });
}

/**
 * List of providers consuming different API implementations
 */

/** Generic helper functions */
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

// Don't forget to add the ID and name to the option set in settings/index.html page as well! :)
apiList.push({ name: "Clean Profs", id: "cpfs", execute: CleanProfs });

module.exports = apiList;
