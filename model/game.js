// also possible to use statics, but I think I wanna keep statics in the repository
// http://mongoosejs.com/docs/guide.html

'use strict';

var mongoose = require('mongoose'),
    Promise = require('bluebird'), // to use promises
    Shortid = require('shortid'),
    constants = require('../config/constants');

var gameSchema = new mongoose.Schema({
    gameId: { type: String, default: Shortid.generate() },
    field: String, // json string
    fieldWidth: { type: Number, default: 10 },
    fieldHeight: { type: Number, default: 10 },
    activePlayer: { type: String, default: constants.player1 },
    status: { type: String, default: constants.status.prestart },
    result: { type: String, default: constants.result.default },
    created_at: { type: Date, default: Date.now },
    player1: String, // username of player 1
    player2: String, // username of player 2
    setCoord: { type: Array, default: [] }, // where the winning set is stored
    moveCount: { type: Number, default: 0 } // contains the number of completed moves (needed for "draw-detection")
});

/**
 * initializes this game by creating the game's field accordingly to the fieldHeight and fieldWidth
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @public
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
 * @public
 * @param {object} moveData
 */
gameSchema.methods.makeMove = function makeMove(moveData) {
    var fieldObj = JSON.parse(this.field);
    fieldObj[moveData.x][moveData.y] = this.getPiece();
    this.field = JSON.stringify(fieldObj);

    this.moveCount++; // increase number of moves

    // @todo think of best place to change from "ready" to "inprogress", here it is set during every move
    this.status = constants.status.inprogress;
};

/**
 * returns the 'character' of the current active player
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @returns {string} either 'x' for player1 or 'o' for player2
 */
gameSchema.methods.getPiece = function getPiece() {
    return this.activePlayer === constants.player1 ? constants.token.player1 : constants.token.player2;
};

/**
 * toggles the active player of this game between 'player1' and 'player2'
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @public
 */
gameSchema.methods.changeActivePlayer = function changeActivePlayer() {
    this.activePlayer = this.activePlayer === constants.player1 ? constants.player2 : constants.player1;
};

/**
 * checks if the given moveData is valid for the current state of this game
 * if a validation error occurs, this game's error value is set (even tho this.errorText and this.errorKey are NOT part
 * of the Schema and will therefore not be permanently stored to database), the error value object can be fetched with
 * this.getValidateMoveDataError()
 * if no validation error occurs, this game's errorText and errorKey values will be reset to ''
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @public
 * @param {object} moveData
 * @returns {boolean}
 */
gameSchema.methods.validateMoveData = function validateMoveData(moveData) {

    if (this.status === constants.status.finished) {
        this.errorText = 'this game is already over';
        this.errorKey = 'game_0003';
        return false;
    }
    if (!this.validateMoveDataPlayer(moveData.username)) {
        this.errorText = 'it is not your turn';
        this.errorKey = 'game_0004';
        return false;
    }
    if (!this.validateMoveDataInsideBounds(moveData.x, moveData.y)) {
        this.errorText = 'coordinates are not within bounds';
        this.errorKey = 'game_0005';
        return false;
    }
    if (!this.validateMoveDataSlotAvailable(moveData.x, moveData.y)) {
        this.errorText = 'slot ' + moveData.x + '/' + moveData.y + ' cannot be used';
        this.errorKey = 'game_0006';
        return false;
    }

    this.errorText = '';
    this.errorKey = '';
    return true;
};

/**
 * checks if the given username is actually a participant of this game
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @param username
 * @returns {boolean}
 */
gameSchema.methods.validateMoveDataPlayer = function validateMoveDataPlayer(username) {
    var player = this.player1 === username ? constants.player1 : constants.player2;
    return this.activePlayer === player;
};

/**
 * checks if the given coordinates are within the bounds of the field
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
gameSchema.methods.validateMoveDataInsideBounds = function validateMoveDataInsideBounds(x, y) {
    return x >= 0 && x < this.fieldWidth &&
           y >= 0 && y < this.fieldHeight;
};

/**
 * checks if the slot of the given coordinates is still empty
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
gameSchema.methods.validateMoveDataSlotAvailable = function validateMoveDataSlotAvailable(x, y) {
    var fieldObj = JSON.parse(this.field);
    return fieldObj[x][y] === '';
};

/**
 * returns the current (validation)error as object with keys "text" and "key"
 * usable for ErrorHelper.sendErrorResponse()
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @public
 * @returns {object}
 */
gameSchema.methods.getValidateMoveDataError = function getMoveDataError() {
    return {
        text: this.errorText,
        key: this.errorKey
    };
};

/**
 * checks if there is a set of 5 pieces starting from the coordinates of the given moveData of this game's active player
 * checks in all 4 possible directions (EAST ► WEST, NORTH ► SOUTH, NORTH-WEST ► SOUTH-EAST, NORTH-EAST ► SOUTH-WEST)
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @public
 * @param {object} moveData
 * @returns {boolean}
 */
gameSchema.methods.checkForWin = function checkForWin(moveData) {
    var setCoord,
        resetSetCoord = [ [moveData.x, moveData.y] ];

    // check EAST ► WEST ⟷
    setCoord = resetSetCoord;
    setCoord = this.checkForWinDirection1(moveData.x, moveData.y, setCoord, 1, 0, -1, 0);
    if (setCoord.length === 5) {
        this.finishGame('win_' + this.usernameToPlayerX(moveData.username), setCoord);
        return true;
    }

    // check NORTH ► SOUTH ↕
    setCoord = resetSetCoord;
    setCoord = this.checkForWinDirection1(moveData.x, moveData.y, setCoord, 0, 1, 0, -1);
    if (setCoord.length === 5) {
        this.finishGame('win_' + this.usernameToPlayerX(moveData.username), setCoord);
        return true;
    }

    // check NORTH-WEST ► SOUTH-EAST ⤡
    setCoord = resetSetCoord;
    setCoord = this.checkForWinDirection1(moveData.x, moveData.y, setCoord, 1, 1, -1, -1);
    if (setCoord.length === 5) {
        this.finishGame('win_' + this.usernameToPlayerX(moveData.username), setCoord);
        return true;
    }

    // check NORTH-EAST ► SOUTH-WEST ⤢
    setCoord = resetSetCoord;
    setCoord = this.checkForWinDirection1(moveData.x, moveData.y, setCoord, -1, 1, 1, -1);
    if (setCoord.length === 5) {
        this.finishGame('win_' + this.usernameToPlayerX(moveData.username), setCoord);
        return true;
    }

    return false;
};

/**
 * checks for winning set from startX/startY to the WEST, NORTH, NORTH-WEST or NORTH-EAST
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @param {number} startX -1, 0 or 1
 * @param {number} startY -1, 0 or 1
 * @param {Array} setCoord
 * @param {number} startModX -1, 0 or 1
 * @param {number} startModY -1, 0 or 1
 * @param {number} incrementModX -1, 0 or 1
 * @param {number} incrementModY -1, 0 or 1
 * @returns {Array}
 */
gameSchema.methods.checkForWinDirection1 =
    function checkForWinDirection1(startX, startY, setCoord, startModX, startModY, incrementModX, incrementModY) {

    var piece = this.getPiece(), // is 'x' or 'o'
        fieldObj = JSON.parse(this.field),
        x,
        y;

    //noinspection PointlessArithmeticExpressionJS
    for (x = (startX - startModX * 1), y = (startY - startModY * 1);
         true; // bounds-check is ensured by 'setCoord.length === 5' and 'validateMoveDataInsideBounds()'
         x = x + incrementModX * 1,    y = y + incrementModY * 1) {

        if (this.validateMoveDataInsideBounds(x, y)) {
            if (fieldObj[x][y] === piece) {
                setCoord.push([x, y]);
                if (setCoord.length === 5) {
                    return setCoord;
                }
            }
            else {
                return this.checkForWinDirection2(startX, startY, setCoord,
                                                  startModX, startModY, incrementModX, incrementModY);
            }
        }
        else {
            return this.checkForWinDirection2(startX, startY, setCoord,
                                              startModX, startModY, incrementModX, incrementModY);
        }
    }
};

/**
 * checks for winning set from startX/startY to the EAST, SOUTH, SOUTH-EAST or SOUTH-WEST
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @param {number} startX -1, 0 or 1
 * @param {number} startY -1, 0 or 1
 * @param {Array} setCoord
 * @param {number} startModX -1, 0 or 1
 * @param {number} startModY -1, 0 or 1
 * @param {number} incrementModX -1, 0 or 1
 * @param {number} incrementModY -1, 0 or 1
 * @returns {Array}
 */
gameSchema.methods.checkForWinDirection2 =
    function checkForWinDirection2(startX, startY, setCoord, startModX, startModY, incrementModX, incrementModY) {

    var piece = this.getPiece(), // is 'x' or 'o'
        fieldObj = JSON.parse(this.field),
        x,
        y;

    //noinspection PointlessArithmeticExpressionJS
    for (x = (startX + startModX * 1), y = (startY + startModY * 1);
         true; // bounds-check is ensured by 'setCoord.length === 5' and 'validateMoveDataInsideBounds()'
         x = x + incrementModX * -1,   y = y + incrementModY * -1) {

        if (this.validateMoveDataInsideBounds(x, y)) {
            if (fieldObj[x][y] === piece) {
                setCoord.push([x, y]);
                if (setCoord.length === 5) {
                    return setCoord;
                }
            }
            else {
                return setCoord;
            }
        }
        else {
            return setCoord;
        }
    }
};

/**
 * finishes this game (but only if the game is not already finished), sets this game's result to the given result and
 * sets the winning set's coordinates (but only if a setCoord object is passed)
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @param {String} result
 * @param {Array} [setCoord]
 * @param setCoord
 */
gameSchema.methods.finishGame = function finishGame(result, setCoord) {
    if (this.status !== constants.status.finished) {
        this.status = constants.status.finished;
        this.result = result;
        if (typeof setCoord !== 'undefined') {
            this.setCoord = setCoord; // store the winning set of coordinates
        }
    }
};

/**
 * returns "player1" if this games player1 is the given username. Otherwise "player"
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @param {String} username
 * @returns {String}
 */
gameSchema.methods.usernameToPlayerX = function usernameToPlayerX(username) {
    return this.player1 === username ? constants.player1 : constants.player2;
};

/**
 * returns true if the number of moves is equal the number of slots on the field, otherwise false
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @public
 * @returns {boolean}
 */
gameSchema.methods.checkForDraw = function checkForDraw() {
    if (+this.moveCount === +(this.fieldHeight * this.fieldWidth)) {
        this.finishGame(constants.result.draw);
        return true;
    }
    return false;
};

/**
 * lets moveData.username forfeit the game
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @public
 * @param {object} moveData
 */
gameSchema.methods.forfeit = function forfeit(moveData) {
    this.finishGame('forfeit_' + this.usernameToPlayerX(moveData.username));
};

/**
 * rejects if the given username is NOT challengee of this game or the game is not in state "prestart"
 * otherwise sets the status of this game to "ready" (and thereby accepting the challenge for userame) and resolves
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @public
 * @param {string} username
 * @returns {bluebird|exports|module.exports}
 */
gameSchema.methods.acceptChallenge = function(username) {
    var scope = this;

    return new Promise(function(resolve, reject) {
        // check if given username is challengee of this game (has to be player2)
        if (scope.player2 !== username) {
            reject({
                text: 'cannot accept challenge of game if user is not the challengee',
                key: 'game_0016'
            });
            return;
        }

        // check if the game is in status "prestart"
        if (scope.status !== constants.status.prestart) {
            reject({
                text: 'cannot accept challenge of game if status is "prestart"',
                key: 'game_0017'
            });
            return;
        }

        scope.status = constants.status.ready;

        resolve();
    });
};

/**
 * creates a clone of this game and removes all "unnecessary" key-value-pairs before returning it
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @returns {object}
 */
gameSchema.methods.sanitizeForOutput = function sanitizeForOutput() {
    var gameObj = (JSON.parse(JSON.stringify(this))); // "cloning" this
    gameObj.created_at = undefined;
    gameObj.__v = undefined;
    gameObj._id = undefined;
    return gameObj;
};

/**
 * this debugging method allows to set an arbitrary value at the given coordinates on the field of this game
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @public
 * @param {number} x
 * @param {number} y
 * @param {string|number} value
 */
gameSchema.methods.modifyField = function modifyField(x, y, value) {
    var fieldObj = JSON.parse(this.field);
    fieldObj[x][y] = value + ''; // make sure it's a string
    this.field = JSON.stringify(fieldObj);
};

/**
 * prints a visual debug output of the field on the (server's) console
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @public
 */
gameSchema.methods.printField = function printField() {
    var fieldObj = JSON.parse(this.field),
        x,
        y,
        line = '',
        frame1 = '    ',
        frame2 = '    ';
    for (x = 0; x < Math.floor((this.fieldWidth) / 2); x++) {
        frame1 += '| ';
        frame2 += (x * 2) + ' ';
    }
    console.log(frame1);
    console.log(frame2);
    for (y = 0; y < this.fieldHeight; y++) {
        for (x = 0; x < this.fieldWidth; x++) {
            line += fieldObj[x][y] === '' ? '□' : fieldObj[x][y];
        }
        console.log('- ' + y + ' ' + line + ' ' + y + ' -');
        line = '';
    }
    console.log(frame2);
    console.log(frame1);
};

mongoose.model('Game', gameSchema);