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
 * @param params
 * @param callback
 */
gameSchema.methods.initialize = function initialize() {
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
};

/**
 * @author Julian Mollik <jule@creative-coding.net>
 * @param moveData
 */
gameSchema.methods.makeMove = function makeMove(moveData) {
    var fieldObj = JSON.parse(this.field);

//  console.log('gameSchema.makeMove() moveData', moveData);
//  console.log('gameSchema.makeMove() this', this);
//  console.log('gameSchema.makeMove() fieldObj', fieldObj);

    fieldObj[moveData.y][moveData.x] = this.getPiece();

    this.field = JSON.stringify(fieldObj);

    this.printField();

    // @todo check for win

    this.changeActivePlayer();
};

/**
 * returns the "character" of the current active player
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @returns {string} either 'x' for player1 or 'o' for player2
 */
gameSchema.methods.getPiece = function getPiece() {
    return this.activePlayer === 'player1' ? 'x' : 'o'; // magic strings?
};

gameSchema.methods.changeActivePlayer = function changeActivePlayer() {
    this.activePlayer = this.activePlayer === 'player1' ? 'player2' : 'player1'; // magic strings
};

gameSchema.methods.printField = function printField() {
    var fieldObj = JSON.parse(this.field),
        x,
        y,
        line = '',
        frame = '';
    for (y = 0; y < Math.floor((this.fieldWidth + 4) / 2); y++) {
        frame += '* ';
    }
    console.log(frame);
    for (x = 0; x < this.fieldHeight; x++) {
        for (y = 0; y < this.fieldWidth; y++) {
            line += fieldObj[x][y] === '' ? '□' : fieldObj[x][y];
        }
        console.log('* ' + line + ' *');
        line = '';
    }
    console.log(frame);
};

/**
 * @todo implement
 * @author Julian Mollik <jule@creative-coding.net>
 * @returns {boolean}
 */
gameSchema.methods.validateMoveData = function validateMoveData(moveData) {

    if (!this.validateMoveDataPlayer(moveData.username)) {
        this.error = 'it is not your turn';
        return false;
    }
    if (!this.validateMoveDataInsideBounds(moveData.x, moveData.y)) {
        this.error = 'coordinates are not within bounds';
        return false;
    }
    if (!this.validateMoveDataSlotAvailable(moveData.x, moveData.y)) {
        this.error = 'slot ' + moveData.x + '/' + moveData.y + ' cannot be used';
        return false;
    }

    this.error = '';
    return true;
};

/**
 * checks if the given username is actually a participant of this game
 *
 * @todo rewrite and make code less complicated
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @param username
 * @returns {boolean}
 */
gameSchema.methods.validateMoveDataPlayer = function validateMoveDataPlayer(username) {
    var player = '';
    if (this.player1 === username) {
        player = 'player1';
    }
    else {
        player = 'player2';
    }
    if (this.activePlayer === player) {
        return true;
    }
    else {
        return false;
    }
};

/**
 * checks if the given coordinates are within the bounds of the field
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
gameSchema.methods.validateMoveDataInsideBounds = function validateMoveDataInsideBounds(x, y) {
    return x < this.fieldWidth && y < this.fieldHeight;
};

/**
 * checks if the slot of the given coordinates is still empty
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
gameSchema.methods.validateMoveDataSlotAvailable = function validateMoveDataSlotAvailable(x, y) {
    var fieldObj = JSON.parse(this.field);
    return fieldObj[x][y] === '';
};

/**
 * returns the current (validation)error as string
 *
 * @todo maybe return 2 values, a string and a numeric error-identifier
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @returns {string}
 */
gameSchema.methods.getValidateMoveDataError = function getMoveDataError() {
    return this.error;
};

/**
 * removes
 *
 * @todo check if cloning is needed
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @returns {gameSchema.methods}
 */
gameSchema.methods.sanitizeForOutput = function sanitizeForOutput() {
    var obj = (JSON.parse(JSON.stringify(this))); // "cloning" this
    obj.created_at = undefined;
    obj.__v = undefined;
    obj._id = undefined;
    return obj;
};

mongoose.model('Game', gameSchema);