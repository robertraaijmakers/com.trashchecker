'use strict';

import assert from 'assert';
import { DateTimeHelper } from '../lib/datetimehelper';

it('Manual - Every 4 weeks on tuesday - 0', function (done) {
  // Every 4 weeks on Tuesday (3)
  var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-10-10'), -2);
  var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-10-10'), -1);
  var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-10-10'), 0);
  var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-10-10'), 1);
  var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-10-10'), 2);

  assert.equal(date1.toISOString().slice(0, 10), '2021-08-03');
  assert.equal(date2.toISOString().slice(0, 10), '2021-08-31');
  assert.equal(date3.toISOString().slice(0, 10), '2021-09-28');
  assert.equal(date4.toISOString().slice(0, 10), '2021-10-26');
  assert.equal(date5.toISOString().slice(0, 10), '2021-11-23');
  done();
});

it('Manual - Every 4 weeks on tuesday - 1', function (done) {
  // Every 4 weeks on Tuesday (3)
  var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-27'), -2);
  var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-27'), -1);
  var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-27'), 0);
  var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-27'), 1);
  var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-27'), 2);

  assert.equal(date1.toISOString().slice(0, 10), '2021-08-03');
  assert.equal(date2.toISOString().slice(0, 10), '2021-08-31');
  assert.equal(date3.toISOString().slice(0, 10), '2021-09-28');
  assert.equal(date4.toISOString().slice(0, 10), '2021-10-26');
  assert.equal(date5.toISOString().slice(0, 10), '2021-11-23');
  done();
});

it('Manual - Every 4 weeks on tuesday - 2', function (done) {
  // Every 4 weeks on Tuesday (3)
  var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-21'), -2);
  var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-21'), -1);
  var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-21'), 0);
  var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-21'), 1);
  var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-21'), 2);

  assert.equal(date1.toISOString().slice(0, 10), '2021-07-06');
  assert.equal(date2.toISOString().slice(0, 10), '2021-08-03');
  assert.equal(date3.toISOString().slice(0, 10), '2021-08-31');
  assert.equal(date4.toISOString().slice(0, 10), '2021-09-28');
  assert.equal(date5.toISOString().slice(0, 10), '2021-10-26');
  done();
});

it('Manual - Every 4 weeks on tuesday - 3', function (done) {
  // Every 4 weeks on Tuesday (3)
  var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-14'), -2);
  var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-14'), -1);
  var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-14'), 0);
  var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-14'), 1);
  var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-14'), 2);

  assert.equal(date1.toISOString().slice(0, 10), '2021-07-06');
  assert.equal(date2.toISOString().slice(0, 10), '2021-08-03');
  assert.equal(date3.toISOString().slice(0, 10), '2021-08-31');
  assert.equal(date4.toISOString().slice(0, 10), '2021-09-28');
  assert.equal(date5.toISOString().slice(0, 10), '2021-10-26');
  done();
});

it('Manual - Every 4 weeks on tuesday - 4', function (done) {
  // Every 4 weeks on Tuesday (3)
  var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-07'), -2);
  var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-07'), -1);
  var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-07'), 0);
  var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-07'), 1);
  var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-09-07'), 2);

  assert.equal(date1.toISOString().slice(0, 10), '2021-07-06');
  assert.equal(date2.toISOString().slice(0, 10), '2021-08-03');
  assert.equal(date3.toISOString().slice(0, 10), '2021-08-31');
  assert.equal(date4.toISOString().slice(0, 10), '2021-09-28');
  assert.equal(date5.toISOString().slice(0, 10), '2021-10-26');
  done();
});

it('Manual - Every 4 weeks on tuesday - 5', function (done) {
  // Every 4 weeks on Tuesday (3)
  var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-08-31'), -2);
  var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-08-31'), -1);
  var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-08-31'), 0);
  var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-08-31'), 1);
  var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-04-17'), new Date('2021-08-31'), 2);

  assert.equal(date1.toISOString().slice(0, 10), '2021-07-06');
  assert.equal(date2.toISOString().slice(0, 10), '2021-08-03');
  assert.equal(date3.toISOString().slice(0, 10), '2021-08-31');
  assert.equal(date4.toISOString().slice(0, 10), '2021-09-28');
  assert.equal(date5.toISOString().slice(0, 10), '2021-10-26');
  done();
});

it('Manual - Every 4 weeks on tuesday - 6', function (done) {
  // Every 4 weeks on Tuesday (3)
  var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-11-16'), new Date('2021-11-10'), -2);
  var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-11-16'), new Date('2021-11-10'), -1);
  var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-11-16'), new Date('2021-11-10'), 0);
  var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-11-16'), new Date('2021-11-10'), 1);
  var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-11-16'), new Date('2021-11-10'), 2);

  assert.equal(date1.toISOString().slice(0, 10), '2021-09-21');
  assert.equal(date2.toISOString().slice(0, 10), '2021-10-19');
  assert.equal(date3.toISOString().slice(0, 10), '2021-11-16');
  assert.equal(date4.toISOString().slice(0, 10), '2021-12-14');
  assert.equal(date5.toISOString().slice(0, 10), '2022-01-11');
  done();
});

it('Manual - Every 4 weeks on tuesday - 6', function (done) {
  // Every 4 weeks on Tuesday (3)
  var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-11-23'), new Date('2021-11-10'), -2);
  var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-11-23'), new Date('2021-11-10'), -1);
  var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-11-23'), new Date('2021-11-10'), 0);
  var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-11-23'), new Date('2021-11-10'), 1);
  var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date('2021-11-23'), new Date('2021-11-10'), 2);

  assert.equal(date1.toISOString().slice(0, 10), '2021-09-28');
  assert.equal(date2.toISOString().slice(0, 10), '2021-10-26');
  assert.equal(date3.toISOString().slice(0, 10), '2021-11-23');
  assert.equal(date4.toISOString().slice(0, 10), '2021-12-21');
  assert.equal(date5.toISOString().slice(0, 10), '2022-01-18');
  done();
});

it('Manual - Every 3 weeks on thursday - 1', function (done) {
  // Every 3 weeks on Thursday (5)
  var date1 = DateTimeHelper.everyNthWeek(3, 5, new Date('2021-11-04'), new Date('2021-10-27'), -2);
  var date2 = DateTimeHelper.everyNthWeek(3, 5, new Date('2021-11-04'), new Date('2021-10-27'), -1);
  var date3 = DateTimeHelper.everyNthWeek(3, 5, new Date('2021-11-04'), new Date('2021-10-27'), 0);
  var date4 = DateTimeHelper.everyNthWeek(3, 5, new Date('2021-11-04'), new Date('2021-10-27'), 1);
  var date5 = DateTimeHelper.everyNthWeek(3, 5, new Date('2021-11-04'), new Date('2021-10-27'), 2);

  assert.equal(date1.toISOString().slice(0, 10), '2021-09-23');
  assert.equal(date2.toISOString().slice(0, 10), '2021-10-14');
  assert.equal(date3.toISOString().slice(0, 10), '2021-11-04');
  assert.equal(date4.toISOString().slice(0, 10), '2021-11-25');
  assert.equal(date5.toISOString().slice(0, 10), '2021-12-16');
  done();
});

it('Manual - Every 3 weeks on thursday - 2', function (done) {
  // Every 3 weeks on Thursday (5)
  var date1 = DateTimeHelper.everyNthWeek(3, 5, new Date('2021-11-04'), new Date('2021-11-05'), -2);
  var date2 = DateTimeHelper.everyNthWeek(3, 5, new Date('2021-11-04'), new Date('2021-11-05'), -1);
  var date3 = DateTimeHelper.everyNthWeek(3, 5, new Date('2021-11-04'), new Date('2021-11-05'), 0);
  var date4 = DateTimeHelper.everyNthWeek(3, 5, new Date('2021-11-04'), new Date('2021-11-05'), 1);
  var date5 = DateTimeHelper.everyNthWeek(3, 5, new Date('2021-11-04'), new Date('2021-11-05'), 2);

  assert.equal(date1.toISOString().slice(0, 10), '2021-09-23');
  assert.equal(date2.toISOString().slice(0, 10), '2021-10-14');
  assert.equal(date3.toISOString().slice(0, 10), '2021-11-04');
  assert.equal(date4.toISOString().slice(0, 10), '2021-11-25');
  assert.equal(date5.toISOString().slice(0, 10), '2021-12-16');
  done();
});

it('Manual - Every 2 weeks on friday - 1', function (done) {
  // Every 2 weeks on Friday (6)
  var date1 = DateTimeHelper.everyNthWeek(2, 6, new Date('2021-11-04'), new Date('2021-10-27'), -2);
  var date2 = DateTimeHelper.everyNthWeek(2, 6, new Date('2021-11-04'), new Date('2021-10-27'), -1);
  var date3 = DateTimeHelper.everyNthWeek(2, 6, new Date('2021-11-04'), new Date('2021-10-27'), 0);
  var date4 = DateTimeHelper.everyNthWeek(2, 6, new Date('2021-11-04'), new Date('2021-10-27'), 1);
  var date5 = DateTimeHelper.everyNthWeek(2, 6, new Date('2021-11-04'), new Date('2021-10-27'), 2);

  assert.equal(date1.toISOString().slice(0, 10), '2021-10-08');
  assert.equal(date2.toISOString().slice(0, 10), '2021-10-22');
  assert.equal(date3.toISOString().slice(0, 10), '2021-11-05');
  assert.equal(date4.toISOString().slice(0, 10), '2021-11-19');
  assert.equal(date5.toISOString().slice(0, 10), '2021-12-03');
  done();
});

it('Manual - Every 2 weeks on friday - 2', function (done) {
  // Every 2 weeks on Friday (6)
  var date1 = DateTimeHelper.everyNthWeek(2, 6, new Date('2021-11-04'), new Date('2021-11-05'), -2);
  var date2 = DateTimeHelper.everyNthWeek(2, 6, new Date('2021-11-04'), new Date('2021-11-05'), -1);
  var date3 = DateTimeHelper.everyNthWeek(2, 6, new Date('2021-11-04'), new Date('2021-11-05'), 0);
  var date4 = DateTimeHelper.everyNthWeek(2, 6, new Date('2021-11-04'), new Date('2021-11-05'), 1);
  var date5 = DateTimeHelper.everyNthWeek(2, 6, new Date('2021-11-04'), new Date('2021-11-05'), 2);

  assert.equal(date1.toISOString().slice(0, 10), '2021-10-08');
  assert.equal(date2.toISOString().slice(0, 10), '2021-10-22');
  assert.equal(date3.toISOString().slice(0, 10), '2021-11-05');
  assert.equal(date4.toISOString().slice(0, 10), '2021-11-19');
  assert.equal(date5.toISOString().slice(0, 10), '2021-12-03');
  done();
});
