# HOW TO USE A NON-LOCAL MONGODB

Because the [MongoLab](https://mongolab.com/ "MongoLab Website") MongoDB database credentials should not be visible in this Github Repository, the `./config/config.db.mongolab.js` file was added to the [.gitignore](../.gitignore).

To connect the _Killergame REST API_ to a MongoLab database, the following two steps have to be done:

## create a database specific config file
Create a file `config.db.mongolab.js` parallel to the `config.js` file with the following contents:
```javascript
'use strict';

var ConfigDB = {

    /**
     * returns the database-connection string needed for the mongoose.connect() function 
     * in environment "mongolab"
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @returns {string}
     */
    getConnectionString: function() {
        return 'mongodb://<mongolab-db-user>:<mongolab-db-password>@<mongolab-db-url>/<mongolab-db-name>';
    }
};

module.exports = ConfigDB;
```
## start the app with specific environment
Edit the [package.json](../package.json) and add the environment variable `NODE_ENV` with the value `mongolab` to the start script:
```javascript
{
  // [...]
  "scripts": {
    "start": "NODE_ENV=mongolab node ./bin/www"
    // [...]
  },
  // [...]
}
```