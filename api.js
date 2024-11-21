"use strict";

module.exports = {
	async validateUserData({ homey, body }) {
		console.log(body);
		return new Promise((resolve) => {
		  homey.app.updateAPI(
			body.postcode,
			body.housenumber,
			body.streetName,
			body.country,
			body.api,
			(isValid, obj, apiId) => resolve(isValid)
		  );
		});
	},
	async validateUserCleanData({ homey, body }) {
		console.log(body);
		return new Promise((resolve) => {
		  homey.app.updateCleaningAPI(
			body.postcode,
			body.housenumber,
			body.streetName,
			body.country,
			body.cleanApiId,
			(isValid, obj, cleanApiId) => resolve(isValid)
		  );
		});
	}
};
