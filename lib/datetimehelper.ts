'use strict';

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
}
