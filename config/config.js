'use strict';

var databaseConfig = require('./config.db');

module.exports = {

    // hash for password storage
    passwordHash: 'oi82s0923&safgh+e.!¨',

    // hash for token creation and validation
    tokenHash: 'secretTokenOfTheKillergameServer',

    // get database connection details
    database: databaseConfig.getConnectionString(process.env.NODE_ENV),

    // application related settings
    scoreIncreaseDraw: 1,
    scoreIncreaseWin: 3,

    playerListLimit: 5,
    playerListOffset: 0,
    playerListColumn: 'score',
    playerListDirection: 'desc',
    playerListWhitelistValue: ['score', 'created_at', 'name', 'username'],
    playerListWhitelistOrder: ['asc', 'desc'],

    gameListWhitelistValue: ['player1', 'player2', 'created_at', 'status'],
    gameListWhitelistOrder: ['asc', 'desc'],

    gameFieldWidth: 10,
    gameFieldHeight: 10
};
