'use strict';

module.exports = {
  async getSettings({ homey, query  }) {
    const trashData =  homey.settings.get(`collectingDays`);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison
    if(query.displayYesterday === 'true') {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    let firstDatesPerType = [];
    let remainingDates = [];

    // Step 1: Collect first future date for each trash type
    for (let trashType in trashData) {
        const futureDates = trashData[trashType]
            .map(dateStr => new Date(dateStr))
            .filter(date => date >= currentDate)
            .sort((a, b) => a - b); // Sort by ascending order

        if (futureDates.length > 0) {
            firstDatesPerType.push({ date: futureDates[0], type: trashType });
            
            if (futureDates.length > 1) {
                futureDates.slice(1).forEach(date => remainingDates.push({ date: date, type: trashType }));
            }
        }
    }

    remainingDates.sort((a, b) => a.date - b.date);
    remainingDates.slice(0, 9);

    const allDates = firstDatesPerType.concat(remainingDates);
    allDates.sort((a, b) => a.date - b.date);

    return allDates.map(item => ({
        date: item.date.toISOString().split('T')[0],  // Format date as YYYY-MM-DD
        type: item.type
    }));
  },
};
