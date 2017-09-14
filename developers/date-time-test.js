console.log(CalculatePickupDates({ option: "1", "option_extension": "1", startdate: null, day: "1" }));
console.log(CalculatePickupDates({ option: "2", "option_extension": "1", startdate: "01-01-2016", day: "2" }));
console.log(CalculatePickupDates({ option: "3", "option_extension": "1", startdate: "01-01-2016", day: "3" }));
console.log(CalculatePickupDates({ option: "4", "option_extension": "1", startdate: "01-01-2016", day: "4" }));

console.log("elke eerste maandag van de maand");
console.log(CalculatePickupDates({ option: "5", "option_extension": "1", startdate: "01-01-2016", day: "1" }));

console.log("elke tweede dinsdag van het kwartaal");
console.log(CalculatePickupDates({ option: "6", "option_extension": "3", startdate: "01-01-2016", day: "2" }));

console.log("elke derde woensdag van het jaar");
console.log(CalculatePickupDates({ option: "7", "option_extension": "12", startdate: "01-01-2016", day: "3" }));

console.log("elke laatste donderdag van de maand");
console.log(CalculatePickupDates({ option: "8", "option_extension": "1", startdate: "01-01-2016", day: "4" }));	

console.log("elke een na laatste vrijdag van het kwartaal");
console.log(CalculatePickupDates({ option: "9", "option_extension": "3", startdate: "01-01-2016", day: "5" }));	

console.log("elke een na laatste zaterdag van het jaar");
console.log(CalculatePickupDates({ option: "9", "option_extension": "12", startdate: "01-01-2016", day: "6" }));	