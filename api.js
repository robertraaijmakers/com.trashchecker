module.exports = [
    {
        description: 'Validate user data',
        method: 'POST',
        path: '/',
        fn: function (callback, args) {
            Homey.app.updateAPI(args.body.postcode, args.body.housenumber, args.body.country, function (isValid) {
                console.log(args);
                callback(null, isValid);
            });
        }
    }
];
