"use strict";

const DateTimeHelper = require('../lib/datetime.js');
var expect  = require('chai').expect;

it('Manual - Every 4 weeks on tuesday - 0', function(done) {

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
/*
it('Manual - Every 4 weeks on tuesday - 1', function(done) {

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

it('Manual - Every 4 weeks on tuesday - 2', function(done) {

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

it('Manual - Every 4 weeks on tuesday - 3', function(done) {

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

it('Manual - Every 4 weeks on tuesday - 4', function(done) {

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

it('Manual - Every 4 weeks on tuesday - 5', function(done) {

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

it('Manual - Every 4 weeks on tuesday - 6', function(done) {

    // Every 4 weeks on Tuesday (3)
    var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-11-16"), new Date("2021-11-10"), -2);
    var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-11-16"), new Date("2021-11-10"), -1);
    var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-11-16"), new Date("2021-11-10"), 0);
    var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-11-16"), new Date("2021-11-10"), 1);
    var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-11-16"),  new Date("2021-11-10"), 2);

    expect('2021-09-21').to.equal(date1.toISOString().slice(0,10));
    expect('2021-10-19').to.equal(date2.toISOString().slice(0,10));
    expect('2021-11-16').to.equal(date3.toISOString().slice(0,10));
    expect('2021-12-14').to.equal(date4.toISOString().slice(0,10));
    expect('2022-01-11').to.equal(date5.toISOString().slice(0,10));
    done();
});

it('Manual - Every 4 weeks on tuesday - 6', function(done) {

    // Every 4 weeks on Tuesday (3)
    var date1 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-11-23"), new Date("2021-11-10"), -2);
    var date2 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-11-23"), new Date("2021-11-10"), -1);
    var date3 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-11-23"), new Date("2021-11-10"), 0);
    var date4 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-11-23"), new Date("2021-11-10"), 1);
    var date5 = DateTimeHelper.everyNthWeek(4, 3, new Date("2021-11-23"),  new Date("2021-11-10"), 2);

    expect('2021-09-28').to.equal(date1.toISOString().slice(0,10));
    expect('2021-10-26').to.equal(date2.toISOString().slice(0,10));
    expect('2021-11-23').to.equal(date3.toISOString().slice(0,10));
    expect('2021-12-21').to.equal(date4.toISOString().slice(0,10));
    expect('2022-01-18').to.equal(date5.toISOString().slice(0,10));
    done();
});


it('Manual - Every 3 weeks on thursday - 1', function(done) {

    // Every 3 weeks on Thursday (5)
    var date1 = DateTimeHelper.everyNthWeek(3, 5, new Date("2021-11-04"), new Date("2021-10-27"), -2);
    var date2 = DateTimeHelper.everyNthWeek(3, 5, new Date("2021-11-04"), new Date("2021-10-27"), -1);
    var date3 = DateTimeHelper.everyNthWeek(3, 5, new Date("2021-11-04"), new Date("2021-10-27"), 0);
    var date4 = DateTimeHelper.everyNthWeek(3, 5, new Date("2021-11-04"), new Date("2021-10-27"), 1);
    var date5 = DateTimeHelper.everyNthWeek(3, 5, new Date("2021-11-04"), new Date("2021-10-27"), 2);

    expect('2021-09-23').to.equal(date1.toISOString().slice(0,10));
    expect('2021-10-14').to.equal(date2.toISOString().slice(0,10));
    expect('2021-11-04').to.equal(date3.toISOString().slice(0,10));
    expect('2021-11-25').to.equal(date4.toISOString().slice(0,10));
    expect('2021-12-16').to.equal(date5.toISOString().slice(0,10));
    done();
});

it('Manual - Every 3 weeks on thursday - 2', function(done) {

    // Every 3 weeks on Thursday (5)
    var date1 = DateTimeHelper.everyNthWeek(3, 5, new Date("2021-11-04"), new Date("2021-11-05"), -2);
    var date2 = DateTimeHelper.everyNthWeek(3, 5, new Date("2021-11-04"), new Date("2021-11-05"), -1);
    var date3 = DateTimeHelper.everyNthWeek(3, 5, new Date("2021-11-04"), new Date("2021-11-05"), 0);
    var date4 = DateTimeHelper.everyNthWeek(3, 5, new Date("2021-11-04"), new Date("2021-11-05"), 1);
    var date5 = DateTimeHelper.everyNthWeek(3, 5, new Date("2021-11-04"), new Date("2021-11-05"), 2);

    expect('2021-09-23').to.equal(date1.toISOString().slice(0,10));
    expect('2021-10-14').to.equal(date2.toISOString().slice(0,10));
    expect('2021-11-04').to.equal(date3.toISOString().slice(0,10));
    expect('2021-11-25').to.equal(date4.toISOString().slice(0,10));
    expect('2021-12-16').to.equal(date5.toISOString().slice(0,10));
    done();
});

it('Manual - Every 2 weeks on friday - 1', function(done) {

    // Every 2 weeks on Friday (6)
    var date1 = DateTimeHelper.everyNthWeek(2, 6, new Date("2021-11-04"), new Date("2021-10-27"), -2);
    var date2 = DateTimeHelper.everyNthWeek(2, 6, new Date("2021-11-04"), new Date("2021-10-27"), -1);
    var date3 = DateTimeHelper.everyNthWeek(2, 6, new Date("2021-11-04"), new Date("2021-10-27"), 0);
    var date4 = DateTimeHelper.everyNthWeek(2, 6, new Date("2021-11-04"), new Date("2021-10-27"), 1);
    var date5 = DateTimeHelper.everyNthWeek(2, 6, new Date("2021-11-04"), new Date("2021-10-27"), 2);

    expect('2021-10-08').to.equal(date1.toISOString().slice(0,10));
    expect('2021-10-22').to.equal(date2.toISOString().slice(0,10));
    expect('2021-11-05').to.equal(date3.toISOString().slice(0,10));
    expect('2021-11-19').to.equal(date4.toISOString().slice(0,10));
    expect('2021-12-03').to.equal(date5.toISOString().slice(0,10));
    done();
});

it('Manual - Every 2 weeks on friday - 2', function(done) {

    // Every 2 weeks on Friday (6)
    var date1 = DateTimeHelper.everyNthWeek(2, 6, new Date("2021-11-04"), new Date("2021-11-05"), -2);
    var date2 = DateTimeHelper.everyNthWeek(2, 6, new Date("2021-11-04"), new Date("2021-11-05"), -1);
    var date3 = DateTimeHelper.everyNthWeek(2, 6, new Date("2021-11-04"), new Date("2021-11-05"), 0);
    var date4 = DateTimeHelper.everyNthWeek(2, 6, new Date("2021-11-04"), new Date("2021-11-05"), 1);
    var date5 = DateTimeHelper.everyNthWeek(2, 6, new Date("2021-11-04"), new Date("2021-11-05"), 2);
    
    expect('2021-10-08').to.equal(date1.toISOString().slice(0,10));
    expect('2021-10-22').to.equal(date2.toISOString().slice(0,10));
    expect('2021-11-05').to.equal(date3.toISOString().slice(0,10));
    expect('2021-11-19').to.equal(date4.toISOString().slice(0,10));
    expect('2021-12-03').to.equal(date5.toISOString().slice(0,10));
    done();
});*/