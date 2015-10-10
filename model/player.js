// also possible to use statics, but I think I wanna keep statics in the repository
// http://mongoosejs.com/docs/guide.html

'use strict';

var mongoose = require('mongoose');

var playerSchema = new mongoose.Schema({
    playerId: { type: Number, default: Date.now() },
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
 * @todo actually hash the password ;-)
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 */
playerSchema.virtual('passwordx').set(function (password) {
    this.password = 'md5(' + password + ')';
});

/**
 * creates a clone of this player and removes all "unnecessary" key-value-pairs before returning it
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @returns {object}
 */
playerSchema.methods.sanitizeForOutput = function sanitizeForOutput() {
    var playerObj = (JSON.parse(JSON.stringify(this))); // "cloning" this
    playerObj.created_at = undefined;
    playerObj.__v = undefined;
    playerObj._id = undefined;
    return playerObj;
};

mongoose.model('Player', playerSchema);