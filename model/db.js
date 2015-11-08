'use strict';

var mongoose = require('mongoose'),
    config = require('../config/config');

// console.log('connecting to mongoDb:', config.database);

mongoose.connect(config.database, function(err) {
    if (err) {
        throw err;
    }
//  else {
//      console.log('connected');
//  }
});
