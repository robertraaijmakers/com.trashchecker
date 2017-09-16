"use strict";

const Homey = require('homey');

module.exports = [
    {
        description: 'Validate user data',
        method: 'POST',
        path: '/',
        fn: function (args, callback) {
	        console.log(args);
	        console.log(callback);
            Homey.app.updateAPI(args['body']['postcode'], args['body']['housenumber'], args['body']['country'], null, 
            function (isValid)
            {
                console.log(callback);
                callback(null, isValid);
            });
        }
    }
];
