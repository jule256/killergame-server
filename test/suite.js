'use strict';

process.env.NODE_ENV = 'test';

var mongoose = require('mongoose'), // mongo connection
    mockgoose = require('mockgoose'); // mongo database mocking

// setup
before(function(done) {
    mockgoose(mongoose);
    mongoose.connect('mongodb://example.com/TestingDB', function(err) {
        done();
    });
});

// teardown
after(function(done) {
    mongoose.disconnect();
    done();
});