"use strict";

module.exports = {
	async validateUserData({ homey, body }) {
		console.log(body);
		return new Promise((resolve) => {
		  homey.app.updateAPI(body.postcode, body.housenumber, body.streetName, body.country, body.api)
			.then(function (result)
			{
				if(Object.keys(result).length > 0)
				{
					resolve(true);
				} 
				else if(Object.keys(result).length === 0)
				{
					resolve(false);
				}
			})
			.catch(function (error)
			{
				console.log('Error in Update API: ', body);
				console.log('Errormessage: ', error);
			});
		}).catch(function(error)
		{
			console.log('Error in API: ', body);
			console.log('Errormessage: ', error);
		});
	}
};
