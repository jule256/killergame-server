'use strict';

process.env.NODE_ENV = 'test';

var mongoose = require('mongoose'), // mongo connection
    mockgoose = require('mockgoose'), // mongo database mocking
    expect = require("chai").expect;

describe('start', function() {

    before(function(done) {
        mockgoose(mongoose);
        mongoose.connect('mongodb://example.com/TestingDB', function(err) {
            done();
        });
    });

    it('preparing mongoose/mockgoose', function() {
        expect(true).to.be.true;
    });
});
