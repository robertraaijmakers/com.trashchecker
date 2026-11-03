'use strict';

import { ManualSetting } from '../assets/publicTypes';

export class DateTimeHelper {
  static #addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static #daysBetween(d1: Date, d2: Date) {
    const msPerDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
    return Math.round((d2.getTime() - d1.getTime()) / msPerDay);
  }

  static #firstDayInMonth(day: number, m: number, y: number) {
    return new Date(y, m, 1 + ((day - new Date(y, m, 1).getDay() + 7) % 7));
  }

  static nthLastDayInMonth(n: number, day: number, m: number, y: number) {
    var d = DateTimeHelper.#firstDayInMonth(day, m, y);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n * 7);
  }

  static nthDayInMonth(n: number, day: number, m: number, y: number) {
    var d = DateTimeHelper.#firstDayInMonth(day, m, y);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (n - 1) * 7);
  }

  static everyNthWeek(n: number, d: number, givenDate: Date, currentDate: Date, delta: number) {
    givenDate = new Date(givenDate.getFullYear(), givenDate.getMonth(), givenDate.getDate() + (d - givenDate.getDay()));
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (d - currentDate.getDay()));

    // Calculate the difference in days between the two dates
    const difference = DateTimeHelper.#daysBetween(givenDate, currentDate);

    // Determine the week correction factor
    const weekCorrectionFactor = difference % (n * 7);

    // Calculate the days to the next interval, considering delta
    const differenceWithCurrentDate = delta * n * 7 - weekCorrectionFactor;

    // Return the adjusted date
    return DateTimeHelper.#addDays(currentDate, differenceWithCurrentDate);
  }

  static everyNthWeekOnDays(n: number, d: number, extraDays: number[], givenDate: Date, currentDate: Date, deltaAhead = 2) {
    // Extra days fall in the same collection weeks as the main day, so they keep its alignment with the start date
    const days = [d, ...extraDays.filter((day, index) => Number(day) !== Number(d) && extraDays.indexOf(day) === index)];

    const dates: Date[] = [];
    for (const day of days) {
      for (let delta = -2; delta <= deltaAhead; delta++) {
        dates.push(DateTimeHelper.everyNthWeek(n, day, givenDate, currentDate, delta));
      }
    }

    return dates;
  }

  static isInPeriod(date: Date, start?: string, end?: string) {
    // Periods are month-day ranges (MM-DD) that repeat every year and may run over new year, e.g. 11-01 to 02-28
    if (!start || !end) return false;

    const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return start <= end ? monthDay >= start && monthDay <= end : monthDay >= start || monthDay <= end;
  }

  static everyNthWeekWithPeriods(manualSetting: ManualSetting, givenDate: Date, currentDate: Date) {
    const extraDays = manualSetting.extra_days ?? [];
    const hasSeason = !!(manualSetting.season_option && manualSetting.season_start && manualSetting.season_end);
    const hasPause = !!(manualSetting.pause_start && manualSetting.pause_end);

    if (!hasSeason && !hasPause) {
      return DateTimeHelper.everyNthWeekOnDays(manualSetting.option, manualSetting.day, extraDays, givenDate, currentDate);
    }

    // Look a year ahead, so the first collection after a pause or a change of season is known
    const deltaAhead = (n: number) => Math.ceil(53 / n);
    const inSeason = (date: Date) => hasSeason && DateTimeHelper.isInPeriod(date, manualSetting.season_start, manualSetting.season_end);

    // Both frequencies keep the alignment with the start date, each one is only used in its own part of the year
    let dates = DateTimeHelper.everyNthWeekOnDays(manualSetting.option, manualSetting.day, extraDays, givenDate, currentDate, deltaAhead(manualSetting.option)).filter((date) => !inSeason(date));
    if (hasSeason) {
      const seasonOption = manualSetting.season_option as number;
      dates = dates.concat(DateTimeHelper.everyNthWeekOnDays(seasonOption, manualSetting.day, extraDays, givenDate, currentDate, deltaAhead(seasonOption)).filter(inSeason));
    }

    if (hasPause) {
      dates = dates.filter((date) => !DateTimeHelper.isInPeriod(date, manualSetting.pause_start, manualSetting.pause_end));
    }

    return dates;
  }
}
