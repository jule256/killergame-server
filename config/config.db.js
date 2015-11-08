'use strict';

var ConfigDb;

ConfigDb = {

    /**
     * returns the database-connection string needed for the mongoose.connect() function in the given environment
     * if no "environment" parameter is given, the development connection string will be returned
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {string} [environment]
     * @returns {string}
     */
    getConnectionString: function(environment) {
        var configDbMongolabPath = './config.db.mongolab',
            ConfigDbMongolab;
        switch (environment) {
            case 'mongolab':
                try {
                    require.resolve(configDbMongolabPath);
                    ConfigDbMongolab = require(configDbMongolabPath);
                    return ConfigDbMongolab.getConnectionString();
                }
                catch(e) {
                    if (e.code === 'MODULE_NOT_FOUND') {
                        return Error('could not find mongolab database config at "' + configDbMongolabPath + '.js"');
                    }
                }
                break;
            case 'development':
                /* falls through */
            default:
                return 'mongodb://localhost:27017/killergame2';
        }
    }
};

module.exports = ConfigDb;
