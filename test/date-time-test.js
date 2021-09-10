"use strict";

const DateTimeHelper = require('../lib/datetime.js');
var expect  = require('chai').expect;

it('Manual - Every 4 weeks on wednesday - 0', function(done) {

    // Every 4 weeks on Tuesday (3)
    var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-10-10"), -2);
    var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-10-10"), -1);
    var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-10-10"), 0);
    var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-10-10"), 1);
    var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"),  new Date("2021-10-10"), 2);

    expect(date1.toISOString().slice(0,10)).to.equal('2021-08-03');
    expect(date2.toISOString().slice(0,10)).to.equal('2021-08-31');
    expect(date3.toISOString().slice(0,10)).to.equal('2021-09-28');
    expect(date4.toISOString().slice(0,10)).to.equal('2021-10-26');
    expect(date5.toISOString().slice(0,10)).to.equal('2021-11-23');
    done();
});

it('Manual - Every 4 weeks on wednesday - 1', function(done) {

    // Every 4 weeks on Tuesday (3)
    var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-27"), -2);
    var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-27"), -1);
    var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-27"), 0);
    var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-27"), 1);
    var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"),  new Date("2021-09-27"), 2);

    expect(date1.toISOString().slice(0,10)).to.equal('2021-08-03');
    expect(date2.toISOString().slice(0,10)).to.equal('2021-08-31');
    expect(date3.toISOString().slice(0,10)).to.equal('2021-09-28');
    expect(date4.toISOString().slice(0,10)).to.equal('2021-10-26');
    expect(date5.toISOString().slice(0,10)).to.equal('2021-11-23');
    done();
});

it('Manual - Every 4 weeks on wednesday - 2', function(done) {

    // Every 4 weeks on Tuesday (3)
    var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-21"), -2);
    var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-21"), -1);
    var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-21"), 0);
    var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-21"), 1);
    var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"),  new Date("2021-09-21"), 2);

    expect(date1.toISOString().slice(0,10)).to.equal('2021-07-06');
    expect(date2.toISOString().slice(0,10)).to.equal('2021-08-03');
    expect(date3.toISOString().slice(0,10)).to.equal('2021-08-31');
    expect(date4.toISOString().slice(0,10)).to.equal('2021-09-28');
    expect(date5.toISOString().slice(0,10)).to.equal('2021-10-26');
    done();
});

it('Manual - Every 4 weeks on wednesday - 3', function(done) {

    // Every 4 weeks on Tuesday (3)
    var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-14"), -2);
    var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-14"), -1);
    var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-14"), 0);
    var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-14"), 1);
    var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"),  new Date("2021-09-14"), 2);

    expect(date1.toISOString().slice(0,10)).to.equal('2021-07-06');
    expect(date2.toISOString().slice(0,10)).to.equal('2021-08-03');
    expect(date3.toISOString().slice(0,10)).to.equal('2021-08-31');
    expect(date4.toISOString().slice(0,10)).to.equal('2021-09-28');
    expect(date5.toISOString().slice(0,10)).to.equal('2021-10-26');
    done();
});

it('Manual - Every 4 weeks on wednesday - 3', function(done) {

    // Every 4 weeks on Tuesday (3)
    var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-07"), -2);
    var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-07"), -1);
    var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-07"), 0);
    var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-09-07"), 1);
    var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"),  new Date("2021-09-07"), 2);

    expect(date1.toISOString().slice(0,10)).to.equal('2021-07-06');
    expect(date2.toISOString().slice(0,10)).to.equal('2021-08-03');
    expect(date3.toISOString().slice(0,10)).to.equal('2021-08-31');
    expect(date4.toISOString().slice(0,10)).to.equal('2021-09-28');
    expect(date5.toISOString().slice(0,10)).to.equal('2021-10-26');
    done();
});

it('Manual - Every 4 weeks on wednesday - 4', function(done) {

    // Every 4 weeks on Tuesday (3)
    var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-08-31"), -2);
    var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-08-31"), -1);
    var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-08-31"), 0);
    var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"), new Date("2021-08-31"), 1);
    var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-04-17"),  new Date("2021-08-31"), 2);

    expect(date1.toISOString().slice(0,10)).to.equal('2021-07-06');
    expect(date2.toISOString().slice(0,10)).to.equal('2021-08-03');
    expect(date3.toISOString().slice(0,10)).to.equal('2021-08-31');
    expect(date4.toISOString().slice(0,10)).to.equal('2021-09-28');
    expect(date5.toISOString().slice(0,10)).to.equal('2021-10-26');
    done();
});