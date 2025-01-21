'use strict';

import Homey from 'homey/lib/Homey';
import { ActivityItem, TrashCollectionReminder, WidgetItem } from '../../types/localTypes';

module.exports = {
  async getSettings({ homey, query }: { homey: Homey; query: any }): Promise<WidgetItem[]> {
    const trashApp = <TrashCollectionReminder>homey.app;

    const trashData = trashApp.collectionDates;
    let cleaningDays = trashApp.cleanDates;
    if (cleaningDays === null || typeof cleaningDays === 'undefined') cleaningDays = [];

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison
    if (query.displayYesterday === 'true') {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    let firstDatesPerType: ActivityItem[] = [];
    let remainingDates: ActivityItem[] = [];

    // Step 1: Collect first future date for each trash type
    for (let trashType in trashData) {
      const futureDates = trashData[trashType].dates
        .map((dateStr) => new Date(dateStr))
        .filter((date) => date >= currentDate)
        .sort((a, b) => a.getTime() - b.getTime()); // Sort by ascending order

      if (futureDates.length > 0) {
        firstDatesPerType.push({
          activityDate: futureDates[0],
          type: trashData[trashType].type,
          color: trashData[trashType].color,
          icon: trashData[trashType].icon,
          localText: trashData[trashType].localText,
        });

        if (futureDates.length > 1) {
          futureDates.slice(1).forEach((date) =>
            remainingDates.push({
              activityDate: date,
              type: trashData[trashType].type,
              color: trashData[trashType].color,
              icon: trashData[trashType].icon,
              localText: trashData[trashType].localText,
            }),
          );
        }
      }
    }

    remainingDates.sort((a, b) => a.activityDate.getTime() - b.activityDate.getTime());
    remainingDates = remainingDates.slice(0, 9);

    const allDates = firstDatesPerType.concat(remainingDates);
    allDates.sort((a, b) => a.activityDate.getTime() - b.activityDate.getTime());

    const cleanedDatesSet = new Set(cleaningDays.flatMap((activity) => activity.dates).map((dateStr) => new Date(dateStr).toISOString().split('T')[0]));

    const result = allDates.map((item) => ({
      activityDate: item.activityDate,
      type: item.type,
      color: item.color,
      icon: item.icon,
      localText: item.localText,
      isCleaned: cleanedDatesSet.has(item.activityDate.toISOString().split('T')[0]),
    }));

    return result;
  },
};
