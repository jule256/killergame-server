/* jshint node: true */

'use strict';

var mongoose = require('mongoose');

var gameSchema = new mongoose.Schema({
    gameId: { type: Number, default: Date.now() },
    field: String, // json string
    fieldWidth: { type: Number, default: 10 },
    fieldHeight: { type: Number, default: 10 },
    activePlayer: { type: String, default: 'player1' }, // magic strings?
    status: { type: String, default: 'prestart' }, // magic strings?
    created_at: { type: Date, default: Date.now },
    player1: String, // username of player 1
    player2: String // username of player 2
});

/**
 * @author Julian Mollik <jule@creative-coding.net>
 */

gameSchema.methods.initialize = function initialize(params, callback) {
    var fieldObj = [],
        x,
        y;
    for (x = 0; x < this.fieldHeight; x++) {
        fieldObj[x] = [];
        for (y = 0; y < this.fieldWidth; y++) {
            fieldObj[x][y] = '';
        }
    }
    this.field = JSON.stringify(fieldObj);
}

mongoose.model('Game', gameSchema);