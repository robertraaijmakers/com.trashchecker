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
		return Date.UTC(d.getFullYear(), d.getMonth(),d.getDate());
	}
	
	static daysBetween(d1,d2)
	{ 
		return DateTimeHelper.toDays(DateTimeHelper.toUTC(d2)-DateTimeHelper.toUTC(d1)); 
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
		
		var difference = DateTimeHelper.daysBetween(givenDate, currentDate);
		if(difference < 0) { difference = difference * -1; }
		
		var differenceWithCurrentDate = (difference % (n * 7)) + (delta * n * 7);
		
		return new Date(currentDate.getFullYear(), currentDate.getMonth(), (currentDate.getDate() + differenceWithCurrentDate));
	}
}

module.exports = DateTimeHelper