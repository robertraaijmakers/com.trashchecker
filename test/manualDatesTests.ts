'use strict';

import assert from 'assert';
import { addDate, formatDate, normalizeActivityDates } from '../lib/helpers';
import { DateTimeHelper } from '../lib/datetimehelper';
import { ActivityDates } from '../types/localTypes';
import { TrashType } from '../assets/publicTypes';

describe('Manual Additions & Removals', function () {
  describe('addDate function - Manual Additions', function () {
    it('should add a date to an existing trash type', function () {
      const activityDates: ActivityDates[] = [
        {
          type: 'GFT' as TrashType,
          dates: [new Date('2026-04-14')],
        },
      ];

      const newDate = new Date('2026-04-21');
      addDate(activityDates, 'GFT' as TrashType, newDate);

      assert.equal(activityDates[0].dates.length, 2);
      assert.equal(activityDates[0].dates[1].toISOString().slice(0, 10), '2026-04-21');
    });

    it('should create a new trash type if it does not exist', function () {
      const activityDates: ActivityDates[] = [
        {
          type: 'GFT' as TrashType,
          dates: [new Date('2026-04-14')],
        },
      ];

      const newDate = new Date('2026-04-21');
      addDate(activityDates, 'PMD' as TrashType, newDate);

      assert.equal(activityDates.length, 2);
      assert.equal(activityDates[1].type, 'PMD');
      assert.equal(activityDates[1].dates.length, 1);
      assert.equal(activityDates[1].dates[0].toISOString().slice(0, 10), '2026-04-21');
    });

    it('should add multiple dates to the same type', function () {
      const activityDates: ActivityDates[] = [];

      addDate(activityDates, 'REST' as TrashType, new Date('2026-04-15'));
      addDate(activityDates, 'REST' as TrashType, new Date('2026-04-22'));
      addDate(activityDates, 'REST' as TrashType, new Date('2026-04-29'));

      assert.equal(activityDates.length, 1);
      assert.equal(activityDates[0].dates.length, 3);
    });

    it('should preserve custom icon, color, and localText properties', function () {
      const activityDates: ActivityDates[] = [];

      addDate(activityDates, 'PAPIER' as TrashType, new Date('2026-04-18'), 'custom-icon', 'Custom Label', '#FF0000');

      assert.equal(activityDates[0].icon, 'custom-icon');
      assert.equal(activityDates[0].localText, 'Custom Label');
      assert.equal(activityDates[0].color, '#FF0000');
    });

    it('should allow undefined optional properties', function () {
      const activityDates: ActivityDates[] = [];

      addDate(activityDates, 'PMD' as TrashType, new Date('2026-04-20'));

      assert.strictEqual(activityDates[0].icon, undefined);
      assert.strictEqual(activityDates[0].localText, undefined);
      assert.strictEqual(activityDates[0].color, undefined);
    });
  });

  describe('Manual Removals - Date Filtering', function () {
    it('should remove a specific date from collection dates', function () {
      const activityDates: ActivityDates[] = [
        {
          type: 'GFT' as TrashType,
          dates: [new Date('2026-04-14'), new Date('2026-04-21'), new Date('2026-04-28')],
        },
      ];

      // Simulate manual removal logic
      const manualRemovals: Partial<Record<TrashType, string[]>> = {
        GFT: ['2026-04-21'],
        PMD: [],
        PAPIER: [],
        REST: [],
        GROF: [],
        PLASTIC: [],
        TEXTIEL: [],
        KERSTBOOM: [],
        GLAS: [],
      };

      const trashType = 'GFT' as TrashType;
      if (manualRemovals?.[trashType]) {
        const datesToRemove = new Set<number>(manualRemovals[trashType].map((d: string) => new Date(d).setHours(0, 0, 0, 0)));
        const targetType = activityDates.find((x) => x.type === trashType);
        if (targetType) {
          targetType.dates = targetType.dates.filter((d) => !datesToRemove.has(new Date(d).setHours(0, 0, 0, 0)));
        }
      }

      assert.equal(activityDates[0].dates.length, 2);
      assert.equal(activityDates[0].dates[0].toISOString().slice(0, 10), '2026-04-14');
      assert.equal(activityDates[0].dates[1].toISOString().slice(0, 10), '2026-04-28');
    });

    it('should handle removing multiple dates from the same type', function () {
      const activityDates: ActivityDates[] = [
        {
          type: 'PMD' as TrashType,
          dates: [new Date('2026-04-16'), new Date('2026-04-21'), new Date('2026-04-30')],
        },
      ];

      const manualRemovals: Partial<Record<TrashType, string[]>> = {
        GFT: [],
        PMD: ['2026-04-21', '2026-04-30'],
        PAPIER: [],
        REST: [],
        GROF: [],
        PLASTIC: [],
        TEXTIEL: [],
        KERSTBOOM: [],
        GLAS: [],
      };

      const trashType = 'PMD' as TrashType;
      if (manualRemovals?.[trashType]) {
        const datesToRemove = new Set<number>(manualRemovals[trashType].map((d: string) => new Date(d).setHours(0, 0, 0, 0)));
        const targetType = activityDates.find((x) => x.type === trashType);
        if (targetType) {
          targetType.dates = targetType.dates.filter((d) => !datesToRemove.has(new Date(d).setHours(0, 0, 0, 0)));
        }
      }

      assert.equal(activityDates[0].dates.length, 1);
      assert.equal(activityDates[0].dates[0].toISOString().slice(0, 10), '2026-04-16');
    });

    it('should handle removing a date that does not exist (should not fail)', function () {
      const activityDates: ActivityDates[] = [
        {
          type: 'REST' as TrashType,
          dates: [new Date('2026-04-15'), new Date('2026-04-22')],
        },
      ];

      const manualRemovals: Partial<Record<TrashType, string[]>> = {
        GFT: [],
        PMD: [],
        PAPIER: [],
        REST: ['2026-04-29'], // This date doesn't exist in the collection
        GROF: [],
        PLASTIC: [],
        TEXTIEL: [],
        KERSTBOOM: [],
        GLAS: [],
      };

      const trashType = 'REST' as TrashType;
      if (manualRemovals?.[trashType]) {
        const datesToRemove = new Set<number>(manualRemovals[trashType].map((d: string) => new Date(d).setHours(0, 0, 0, 0)));
        const targetType = activityDates.find((x) => x.type === trashType);
        if (targetType) {
          targetType.dates = targetType.dates.filter((d) => !datesToRemove.has(new Date(d).setHours(0, 0, 0, 0)));
        }
      }

      // Should still have both dates since none matched
      assert.equal(activityDates[0].dates.length, 2);
    });

    it('should remove all dates for a trash type', function () {
      const activityDates: ActivityDates[] = [
        {
          type: 'PAPIER' as TrashType,
          dates: [new Date('2026-04-17'), new Date('2026-04-24'), new Date('2026-05-01')],
        },
      ];

      const manualRemovals: Partial<Record<TrashType, string[]>> = {
        GFT: [],
        PMD: [],
        PAPIER: ['2026-04-17', '2026-04-24', '2026-05-01'],
        REST: [],
        GROF: [],
        PLASTIC: [],
        TEXTIEL: [],
        KERSTBOOM: [],
        GLAS: [],
      };

      const trashType = 'PAPIER' as TrashType;
      if (manualRemovals?.[trashType]) {
        const datesToRemove = new Set<number>(manualRemovals[trashType].map((d: string) => new Date(d).setHours(0, 0, 0, 0)));
        const targetType = activityDates.find((x) => x.type === trashType);
        if (targetType) {
          targetType.dates = targetType.dates.filter((d) => !datesToRemove.has(new Date(d).setHours(0, 0, 0, 0)));
        }
      }

      // Should now be empty
      assert.equal(activityDates[0].dates.length, 0);
    });

    it('should handle date normalization correctly (ignore time component)', function () {
      const activityDates: ActivityDates[] = [
        {
          type: 'GFT' as TrashType,
          dates: [new Date('2026-04-14'), new Date('2026-04-21T14:30:00'), new Date('2026-04-28')],
        },
      ];

      // Removal uses only date without time
      const manualRemovals: Partial<Record<TrashType, string[]>> = {
        GFT: ['2026-04-21'], // Should match regardless of time
        PMD: [],
        PAPIER: [],
        REST: [],
        GROF: [],
        PLASTIC: [],
        TEXTIEL: [],
        KERSTBOOM: [],
        GLAS: [],
      };

      const trashType = 'GFT' as TrashType;
      if (manualRemovals?.[trashType]) {
        const datesToRemove = new Set<number>(manualRemovals[trashType].map((d: string) => new Date(d).setHours(0, 0, 0, 0)));
        const targetType = activityDates.find((x) => x.type === trashType);
        if (targetType) {
          targetType.dates = targetType.dates.filter((d) => !datesToRemove.has(new Date(d).setHours(0, 0, 0, 0)));
        }
      }

      assert.equal(activityDates[0].dates.length, 2);
      assert.equal(activityDates[0].dates[0].toISOString().slice(0, 10), '2026-04-14');
      assert.equal(activityDates[0].dates[1].toISOString().slice(0, 10), '2026-04-28');
    });

    it('should handle empty removal list for a trash type', function () {
      const activityDates: ActivityDates[] = [
        {
          type: 'GROF' as TrashType,
          dates: [new Date('2026-04-19'), new Date('2026-04-26')],
        },
      ];

      const manualRemovals: Partial<Record<TrashType, string[]>> = {
        GFT: [],
        PMD: [],
        PAPIER: [],
        REST: [],
        GROF: [], // Empty removal list
        PLASTIC: [],
        TEXTIEL: [],
        KERSTBOOM: [],
        GLAS: [],
      };

      const trashType = 'GROF' as TrashType;
      if (manualRemovals?.[trashType]) {
        const datesToRemove = new Set<number>(manualRemovals[trashType].map((d: string) => new Date(d).setHours(0, 0, 0, 0)));
        const targetType = activityDates.find((x) => x.type === trashType);
        if (targetType) {
          targetType.dates = targetType.dates.filter((d) => !datesToRemove.has(new Date(d).setHours(0, 0, 0, 0)));
        }
      }

      // No dates should be removed
      assert.equal(activityDates[0].dates.length, 2);
    });

    it('should handle null removal data gracefully', function () {
      const activityDates: ActivityDates[] = [
        {
          type: 'REST' as TrashType,
          dates: [new Date('2026-04-15'), new Date('2026-04-22')],
        },
      ];

      const manualRemovals: any = null;

      // This simulates the app.ts logic: if (manualRemovals !== null)
      if (manualRemovals !== null) {
        const trashType = 'REST' as TrashType;
        if (manualRemovals[trashType]) {
          const datesToRemove = new Set<number>(manualRemovals[trashType].map((d: string) => new Date(d).setHours(0, 0, 0, 0)));
          const targetType = activityDates.find((x) => x.type === trashType);
          if (targetType) {
            targetType.dates = targetType.dates.filter((d) => !datesToRemove.has(new Date(d).setHours(0, 0, 0, 0)));
          }
        }
      }

      // No dates should be removed since manualRemovals is null
      assert.equal(activityDates[0].dates.length, 2);
    });

    it('should process multiple trash types in removal map', function () {
      const activityDates: ActivityDates[] = [
        {
          type: 'GFT' as TrashType,
          dates: [new Date('2026-04-14'), new Date('2026-04-21')],
        },
        {
          type: 'PMD' as TrashType,
          dates: [new Date('2026-04-16'), new Date('2026-04-23')],
        },
        {
          type: 'PAPIER' as TrashType,
          dates: [new Date('2026-04-17'), new Date('2026-04-24')],
        },
      ];

      const manualRemovals: Partial<Record<TrashType, string[]>> = {
        GFT: ['2026-04-21'],
        PMD: ['2026-04-23'],
        PAPIER: [],
        REST: [],
        GROF: [],
        PLASTIC: [],
        TEXTIEL: [],
        KERSTBOOM: [],
        GLAS: [],
      };

      // Apply removals for each type
      for (let type in manualRemovals) {
        const trashType = type as TrashType;
        const removals = manualRemovals[trashType];
        if (removals && removals.length > 0) {
          const datesToRemove = new Set<number>(removals.map((d: string) => new Date(d).setHours(0, 0, 0, 0)));
          const targetType = activityDates.find((x) => x.type === trashType);
          if (targetType) {
            targetType.dates = targetType.dates.filter((d) => !datesToRemove.has(new Date(d).setHours(0, 0, 0, 0)));
          }
        }
      }

      // Check results
      assert.equal(activityDates[0].dates.length, 1); // GFT: removed one
      assert.equal(activityDates[0].dates[0].toISOString().slice(0, 10), '2026-04-14');
      assert.equal(activityDates[1].dates.length, 1); // PMD: removed one
      assert.equal(activityDates[1].dates[0].toISOString().slice(0, 10), '2026-04-16');
      assert.equal(activityDates[2].dates.length, 2); // PAPIER: none removed
    });
  });

  describe('Combined Additions & Removals', function () {
    it('should handle adding and then removing the same date', function () {
      const activityDates: ActivityDates[] = [
        {
          type: 'REST' as TrashType,
          dates: [new Date('2026-04-15')],
        },
      ];

      // First, add a manual date
      const manualAddDate = new Date('2026-04-22');
      addDate(activityDates, 'REST' as TrashType, manualAddDate);

      assert.equal(activityDates[0].dates.length, 2);

      // Then, remove the manually added date
      const manualRemovals: Partial<Record<TrashType, string[]>> = {
        GFT: [],
        PMD: [],
        PAPIER: [],
        REST: ['2026-04-22'],
        GROF: [],
        PLASTIC: [],
        TEXTIEL: [],
        KERSTBOOM: [],
        GLAS: [],
      };

      const trashType = 'REST' as TrashType;
      if (manualRemovals?.[trashType]) {
        const datesToRemove = new Set<number>(manualRemovals[trashType].map((d: string) => new Date(d).setHours(0, 0, 0, 0)));
        const targetType = activityDates.find((x) => x.type === trashType);
        if (targetType) {
          targetType.dates = targetType.dates.filter((d) => !datesToRemove.has(new Date(d).setHours(0, 0, 0, 0)));
        }
      }

      // Should be back to one date (the original)
      assert.equal(activityDates[0].dates.length, 1);
      assert.equal(activityDates[0].dates[0].toISOString().slice(0, 10), '2026-04-15');
    });

    it('should handle removal priority: removals override additions', function () {
      const activityDates: ActivityDates[] = [
        {
          type: 'GFT' as TrashType,
          dates: [new Date('2026-04-14'), new Date('2026-04-21')],
        },
      ];

      // Add a date manually (simulating manual additions executed first)
      addDate(activityDates, 'GFT' as TrashType, new Date('2026-04-28'));

      assert.equal(activityDates[0].dates.length, 3);

      // Then apply removals (which should have highest priority)
      const manualRemovals: Partial<Record<TrashType, string[]>> = {
        GFT: ['2026-04-21', '2026-04-28'],
        PMD: [],
        PAPIER: [],
        REST: [],
        GROF: [],
        PLASTIC: [],
        TEXTIEL: [],
        KERSTBOOM: [],
        GLAS: [],
      };

      const trashType = 'GFT' as TrashType;
      if (manualRemovals?.[trashType]) {
        const datesToRemove = new Set<number>(manualRemovals[trashType].map((d: string) => new Date(d).setHours(0, 0, 0, 0)));
        const targetType = activityDates.find((x) => x.type === trashType);
        if (targetType) {
          targetType.dates = targetType.dates.filter((d) => !datesToRemove.has(new Date(d).setHours(0, 0, 0, 0)));
        }
      }

      // Should remove both the original 2026-04-21 and the manually added 2026-04-28
      assert.equal(activityDates[0].dates.length, 1);
      assert.equal(activityDates[0].dates[0].toISOString().slice(0, 10), '2026-04-14');
    });
  });

  describe('Manual - Extra collection days', function () {
    // Local dates and formatDate, so the results don't depend on the timezone the tests run in
    const startDate = new Date(2026, 0, 5); // Monday

    it('should collect every week on Monday and Thursday', function () {
      const dates = DateTimeHelper.everyNthWeekOnDays(1, 1, [4], startDate, new Date(2026, 3, 15));

      assert.deepEqual(dates.map(formatDate), [
        '2026-03-30',
        '2026-04-06',
        '2026-04-13',
        '2026-04-20',
        '2026-04-27',
        '2026-04-02',
        '2026-04-09',
        '2026-04-16',
        '2026-04-23',
        '2026-04-30',
      ]);
    });

    it('should collect every other week on Monday and Thursday in the same weeks', function () {
      const activityDates: ActivityDates[] = [];
      for (const date of DateTimeHelper.everyNthWeekOnDays(2, 1, [4], startDate, new Date(2026, 3, 22))) {
        addDate(activityDates, 'REST' as TrashType, date);
      }
      normalizeActivityDates(activityDates);

      assert.deepEqual(activityDates[0].dates.map(formatDate), [
        '2026-03-16',
        '2026-03-19',
        '2026-03-30',
        '2026-04-02',
        '2026-04-13',
        '2026-04-16',
        '2026-04-27',
        '2026-04-30',
        '2026-05-11',
        '2026-05-14',
      ]);

      // Next collection after Wednesday 22 April skips the off week
      const next = activityDates[0].dates.find((date) => date >= new Date(2026, 3, 22));
      assert.equal(formatDate(next!), '2026-04-27');
    });

    it('should give the same dates as before without extra days', function () {
      const givenDate = new Date('2021-04-17');
      const currentDate = new Date('2021-10-10');
      const expected = [-2, -1, 0, 1, 2].map((delta) => DateTimeHelper.everyNthWeek(4, 3, givenDate, currentDate, delta).getTime());

      assert.deepEqual(DateTimeHelper.everyNthWeekOnDays(4, 3, [], givenDate, currentDate).map((date) => date.getTime()), expected);
    });

    it('should not duplicate dates when an extra day equals the main day', function () {
      const dates = DateTimeHelper.everyNthWeekOnDays(1, 1, [1], startDate, new Date(2026, 3, 15));
      assert.deepEqual(dates.map(formatDate), ['2026-03-30', '2026-04-06', '2026-04-13', '2026-04-20', '2026-04-27']);

      const withRepeatedExtraDay = DateTimeHelper.everyNthWeekOnDays(1, 1, [1, 4, 4], startDate, new Date(2026, 3, 15));
      assert.equal(withRepeatedExtraDay.length, 10);
    });
  });

  describe('Manual - Seasons and pauses', function () {
    const startDate = new Date(2026, 0, 5); // Monday
    const between = (dates: Date[], from: string, to: string) => dates.map(formatDate).filter((date) => date >= from && date <= to);

    it('should check yearly periods, also when they run over new year', function () {
      assert.equal(DateTimeHelper.isInPeriod(new Date(2026, 3, 1), '04-01', '09-30'), true);
      assert.equal(DateTimeHelper.isInPeriod(new Date(2026, 8, 30), '04-01', '09-30'), true);
      assert.equal(DateTimeHelper.isInPeriod(new Date(2026, 9, 1), '04-01', '09-30'), false);
      assert.equal(DateTimeHelper.isInPeriod(new Date(2026, 11, 25), '11-01', '02-28'), true);
      assert.equal(DateTimeHelper.isInPeriod(new Date(2027, 1, 10), '11-01', '02-28'), true);
      assert.equal(DateTimeHelper.isInPeriod(new Date(2026, 5, 1), '11-01', '02-28'), false);
      assert.equal(DateTimeHelper.isInPeriod(new Date(2026, 5, 1), undefined, undefined), false);
    });

    it('should collect every other week, but every week in summer', function () {
      const activityDates: ActivityDates[] = [];
      const manualSetting = {
        option: 2,
        day: 1,
        startdate: '2026-01-05',
        season_option: 1,
        season_start: '04-01',
        season_end: '09-30',
      };
      for (const date of DateTimeHelper.everyNthWeekWithPeriods(manualSetting, startDate, new Date(2026, 2, 25))) {
        addDate(activityDates, 'GFT' as TrashType, date);
      }
      normalizeActivityDates(activityDates);

      assert.deepEqual(between(activityDates[0].dates, '2026-03-01', '2026-04-30'), ['2026-03-02', '2026-03-16', '2026-03-30', '2026-04-06', '2026-04-13', '2026-04-20', '2026-04-27']);
      assert.deepEqual(between(activityDates[0].dates, '2026-09-15', '2026-10-31'), ['2026-09-21', '2026-09-28', '2026-10-12', '2026-10-26']);
    });

    it('should skip the pause and know the first collection after it', function () {
      const manualSetting = {
        option: 2,
        day: 1,
        startdate: '2026-01-05',
        pause_start: '12-01',
        pause_end: '02-28',
      };
      const dates = DateTimeHelper.everyNthWeekWithPeriods(manualSetting, startDate, new Date(2026, 10, 20));
      const upcoming = dates.map(formatDate).filter((date) => date >= '2026-11-20').sort();

      assert.deepEqual(upcoming.slice(0, 2), ['2026-11-23', '2027-03-01']);
      assert.deepEqual(between(dates, '2026-12-01', '2027-02-28'), []);
    });

    it('should give the same dates as before without a season or pause', function () {
      const manualSetting = {
        option: 2,
        day: 1,
        startdate: '2026-01-05',
        extra_days: [4],
      };
      const expected = DateTimeHelper.everyNthWeekOnDays(2, 1, [4], startDate, new Date(2026, 3, 22));

      assert.deepEqual(DateTimeHelper.everyNthWeekWithPeriods(manualSetting, startDate, new Date(2026, 3, 22)), expected);
    });
  });
});
