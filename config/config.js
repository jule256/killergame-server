'use strict';

module.exports = {

    // hash for password storage
    passwordHash: 'oi82s0923&safgh+e.!¨',

    // hash for token creation and validation
    tokenHash: 'secretTokenOfTheKillergameServer',

    // database connection details
    database: 'mongodb://localhost:27017/killergame2',

    // application related settings
    scoreIncreaseDraw: 1,
    scoreIncreaseWin: 3,

    playerListLimit: 5,
    playerListOffset: 0,
    playerListColumn: 'score',
    playerListDirection: 'desc',
    playerListWhitelistValue: ['score', 'created_at', 'name', 'username'],
    playerListWhitelistOrder: ['asc', 'desc']
};