'use strict';

module.exports = {
  async getSettings({ homey, query }) {
    const trashData = homey.settings.get('collectingDays');
    let cleaningDays = homey.settings.get('cleaningDays');
    if (cleaningDays === null || typeof cleaningDays === 'undefined') cleaningDays = {};

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison
    if (query.displayYesterday === 'true') {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    const firstDatesPerType = [];
    const remainingDates = [];

    // Step 1: Collect first future date for each trash type
    Object.entries(trashData).forEach(([trashType, dates]) => {
      const futureDates = dates
        .map((dateStr) => new Date(dateStr))
        .filter((date) => date >= currentDate)
        .sort((a, b) => a - b); // Sort by ascending order

      if (futureDates.length > 0) {
        firstDatesPerType.push({ date: futureDates[0], type: trashType });

        if (futureDates.length > 1) {
          futureDates.slice(1).forEach((date) => remainingDates.push({ date, type: trashType }));
        }
      }
    });

    remainingDates.sort((a, b) => a.date - b.date);
    remainingDates.slice(0, 9);

    const allDates = firstDatesPerType.concat(remainingDates);
    allDates.sort((a, b) => a.date - b.date);

    const cleanedDatesSet = new Set(
      Object.values(cleaningDays).flat().map((dateStr) => new Date(dateStr).toISOString().split('T')[0]),
    );

    return allDates.map((item) => ({
      date: item.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      type: item.type,
      isCleaned: cleanedDatesSet.has(item.date.toISOString().split('T')[0]),
    }));
  },
};
