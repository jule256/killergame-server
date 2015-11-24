'use strict';

process.env.NODE_ENV = 'test';

var mongoose = require('mongoose'), // mongo connection
    expect = require("chai").expect;

describe('end', function() {

    after(function(done) {
        mongoose.disconnect();
        done();
    });

    it('disconnecting mongoose/mockgoose', function() {
        expect(true).to.be.true;
    });
});
