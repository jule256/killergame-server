var mongoose = require('mongoose'),
    config = require('../config/config');

mongoose.connect(config.database);