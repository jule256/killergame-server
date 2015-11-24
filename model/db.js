'use strict';

var mongoose = require('mongoose'),
    config = require('../config/config');

mongoose.connect(config.database, function(err) {
    if (err) {
        throw err;
    }
});
