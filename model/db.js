var mongoose = require('mongoose'),
    config = require('../config/config');

// @todo move to some sort of bootstrap or setup file

mongoose.connect(config.database);