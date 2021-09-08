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
	}
};
