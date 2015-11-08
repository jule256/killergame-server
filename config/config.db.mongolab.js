'use strict';

var ConfigDB = {

    /**
     * returns the database-connection string needed for the mongoose.connect() function in environment "mongolab"
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @returns {string}
     */
    getConnectionString: function() {
        return 'mongodb://killergame1:poi8_.33Dda@ds047514.mongolab.com:47514/killergame1';
    }
};

module.exports = ConfigDB;