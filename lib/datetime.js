class DateTimeHelper
{
	static toDays(d)
	{
		d = d || 0;
		return d / 24 / 60 / 60 / 1000;
	}
	
	static daysInMonth(m, y)
	{ 
		var y = y || new Date(Date.now()).getFullYear(); 
		return DateTimeHelper.toDays(Date.UTC(y, m + 1, 1) - Date.UTC(y, m, 1)); 
	}
	
	static toUTC(d)
	{ 
		if(!d || !d.getFullYear) return 0; 
		return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
	}

	static addDays(date, days) {
		var result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	}
	
	static daysBetween(d1,d2)
	{ 
		return Math.round(DateTimeHelper.toDays(d2-d1)); 
	}
	
	static firstDayInMonth(day, m, y)
	{
		return new Date(y, m, 1 + (day - new Date(y, m, 1).getDay() + 7) % 7);
	}
	
	static nthLastDayInMonth(n, day, m, y)
	{
		var d = DateTimeHelper.firstDayInMonth(day, m, y);
		return new Date(d.getFullYear(), d.getMonth(), (d.getDate() - (n * 7)));
	}
	
	static nthDayInMonth(n, day, m, y)
	{ 	
		var d = DateTimeHelper.firstDayInMonth(day, m, y);
		return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (n - 1) * 7);
	}
	
	static everyNthWeek(n, d, givenDate, currentDate, delta)
	{
		givenDate = new Date(givenDate.getFullYear(), givenDate.getMonth(), (givenDate.getDate() + (d - givenDate.getDay())));
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), (currentDate.getDate() + (d - currentDate.getDay())));
		
		console.log(givenDate);
		console.log(currentDate);
		
		// Calculate difference in days between the 2 dates
		var difference = DateTimeHelper.daysBetween(givenDate, currentDate);
		//if(difference < 0) { difference = difference * -1; }

		console.log("Difference in days:");
		console.log(difference);

		// Calculate the week correction factor (so, where in time is the current date on the cyclus of the n-weeks)
		var weekCorrectionFactor = (difference % (n * 7));

		console.log("Week correction factor:");
		console.log(weekCorrectionFactor);

		// Calculate the difference in days between the current date and the next interval
		var differenceWithCurrentDate = (delta * n * 7) - weekCorrectionFactor;

		return DateTimeHelper.addDays(currentDate, differenceWithCurrentDate);
	}
}

module.exports = DateTimeHelper