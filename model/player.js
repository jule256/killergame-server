// also possible to use statics, but I think I wanna keep statics in the repository
// http://mongoosejs.com/docs/guide.html

'use strict';

var mongoose = require('mongoose'),
    Md5 = require('md5'),
    Shortid = require('shortid'),
    config = require('../config/config'),
    PlayerRepository = require('../repository/player');

var playerSchema = new mongoose.Schema({
    playerId: { type: String, default: Shortid.generate() },
    name: String,
    username: String,
    email: String,
    score: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    password: String
});

/**
 * initializes this player by setting his (hashed) password
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @public
 */
playerSchema.methods.initialize = function initialize(password) {
    this.passwordx = password; // should automatically invoke the virtual passwordx method
};

/**
 * hashes the given password and sets the passwordx value of this player
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 */
playerSchema.virtual('passwordx').set(function (password) {
    this.password = Md5(password + config.passwordHash);
});

/**
 * adds the given delta value to the current score of this player
 * if no delta is passed, the default value from the config will be used
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @public
 * @param {Number} [delta]
 */
playerSchema.methods.increaseScore = function increaseScore(delta) {
    delta = delta || config.scoreIncreaseWin;
    this.score += +delta;
};

/**
 * creates a clone of this player and removes all "unnecessary" key-value-pairs before returning it
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @returns {object}
 */
playerSchema.methods.sanitizeForOutput = function sanitizeForOutput() {
    var playerObj = (JSON.parse(JSON.stringify(this))), // "cloning" this
        blacklist = PlayerRepository.getBlacklist(),
        i;
    for (i = 0; i < blacklist.length; i++) {
        playerObj[blacklist[i]] = undefined;
    }
    return playerObj;
};

mongoose.model('Player', playerSchema);