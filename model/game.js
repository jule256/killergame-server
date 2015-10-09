/* jshint node: true */

// also possible to use statics, but I think I wanna keep statics in the repository
// http://mongoosejs.com/docs/guide.html

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
 * @param {object} moveData
 */
gameSchema.methods.makeMove = function makeMove(moveData) {
    var fieldObj = JSON.parse(this.field);

    fieldObj[moveData.y][moveData.x] = this.getPiece();

    this.field = JSON.stringify(fieldObj);

    this.printField();

    // this.changeActivePlayer(); // @todo move after check-for-win
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

gameSchema.methods.checkForWin = function checkForWin(moveData) {
    var setCoord;

    console.log('checkForWin() moveData: ', moveData);
    console.log('checkForWin() activePlayer', this.activePlayer);

    // check E and W
    console.log('------------------- E/W');
    setCoord = [ [moveData.x, moveData.y, '(0)'] ];
    this.modifyField(moveData.x, moveData.y, setCoord.length);
    setCoord = this.checkForWinDirection1(moveData.x, moveData.y, setCoord, 1, 0, -1, 0);
    if (setCoord.length === 5) {
        console.log('checkForWin() WIN at E/W:', setCoord, ' -> length ' + setCoord.length);
        this.printField();
        return;
    }
    console.log('E/W result:', setCoord, ' -> length ' + setCoord.length);

    // check N and S
    console.log('------------------- N/S');
    setCoord = [ [moveData.x, moveData.y, '(0)'] ];
    this.modifyField(moveData.x, moveData.y, setCoord.length);
    setCoord = this.checkForWinDirection1(moveData.x, moveData.y, setCoord, 0, 1, 0, -1);
    if (setCoord.length === 5) {
        console.log('checkForWin() WIN at N/S:', setCoord, ' -> length ' + setCoord.length);
        this.printField();
        return;
    }
    console.log('N/S result:', setCoord, ' -> length ' + setCoord.length);

    // check NW and SE
    console.log('------------------- NW/SE');
    setCoord = [ [moveData.x, moveData.y, '(0)'] ];
    this.modifyField(moveData.x, moveData.y, setCoord.length);
    setCoord = this.checkForWinDirection1(moveData.x, moveData.y, setCoord, 1, 1, -1, -1);
    if (setCoord.length === 5) {
        console.log('checkForWin() WIN at NW/SE:', setCoord, ' -> length ' + setCoord.length);
        this.printField();
        return;
    }
    console.log('NW/SE result:', setCoord, ' -> length ' + setCoord.length);

    // check NE and SW
    console.log('------------------- NE/SW');
    setCoord = [ [moveData.x, moveData.y, '(0)'] ];
    this.modifyField(moveData.x, moveData.y, setCoord.length);
    setCoord = this.checkForWinDirection1(moveData.x, moveData.y, setCoord, -1, 1, 1, -1);
    if (setCoord.length === 5) {
        console.log('checkForWin() WIN at NE/SW:', setCoord, ' -> length ' + setCoord.length);
        this.printField();
        return;
    }
    console.log('NE/SW result:', setCoord, ' -> length ' + setCoord.length);

    this.printField();
};

gameSchema.methods.checkForWinDirection1 =
    function checkForWinDirection1(startX, startY, setCoord, boundsModX, boundsModY, incrementModX, incrementModY) {

    var piece = this.getPiece(), // is 'x' or 'o'
        fieldObj = JSON.parse(this.field),
        x,
        y;

    console.log('checkForWinDirection1(), startX: ' + startX + ', boundsModX: ' + boundsModX + ', incrementModX: ' + incrementModX);
    console.log('checkForWinDirection1(), startY: ' + startY + ', boundsModY: ' + boundsModY + ', incrementModY: ' + incrementModY);
    console.log('checkForWinDirection1(), setting x to ' + (startX + boundsModX * 1));
    console.log('checkForWinDirection1(), continuing at x >= ' + (startX + boundsModX * 4));
    console.log('checkForWinDirection1(), setting y to ' + (startY + boundsModY * 1));
    console.log('checkForWinDirection1(), continuing at y >= ' + (startY + boundsModY * 4));

    for (x = (startX - boundsModX * 1), y = (startY - boundsModY * 1);
         true; // bounds-check is ensured by 'setCoord.length === 5' and 'validateMoveDataInsideBounds()'
         x = x + incrementModX * 1,     y = y + incrementModY * 1) {

        console.log('checking ' + x + '/' + y + ' -> "' + fieldObj[x][y] + '", piece = ' + piece);

        if (this.validateMoveDataInsideBounds(x, y)) {
            if (fieldObj[x][y] === piece) {
                setCoord.push([x, y, '(1)']);
                this.modifyField(x, y, setCoord.length);
                if (setCoord.length === 5) {
                    return setCoord;
                }
            }
            else {
                console.log('about to call checkForWinDirection2() 1');
                return this.checkForWinDirection2(startX, startY, setCoord, boundsModX, boundsModY, incrementModX, incrementModY);
            }
        }
        else {
            console.log('about to call checkForWinDirection2() 2');
            return this.checkForWinDirection2(startX, startY, setCoord, boundsModX, boundsModY, incrementModX, incrementModY);
        }
    }
    return this.checkForWinDirection2(startX, startY, setCoord, boundsModX, boundsModY, incrementModX, incrementModY);
};

gameSchema.methods.checkForWinDirection2 =
    function checkForWinDirection2(startX, startY, setCoord, boundsModX, boundsModY, incrementModX, incrementModY) {

    var piece = this.getPiece(), // is 'x' or 'o'
        fieldObj = JSON.parse(this.field),
        x,
        y;

    console.log('checkForWinDirection2(), startX: ' + startX + ', boundsModX: ' + boundsModX + ', incrementModX: ' + incrementModX);
    console.log('checkForWinDirection2(), startY: ' + startY + ', boundsModY: ' + boundsModY + ', incrementModY: ' + incrementModY);
    console.log('checkForWinDirection2(), setCoord: ', setCoord);
    console.log('checkForWinDirection2(), setting x to ' + (startX + boundsModX * 1));
    console.log('checkForWinDirection2(), continuing at x =< ' + (startX + boundsModX * 4));
    console.log('checkForWinDirection2(), setting y to ' + (startY + boundsModY * 1));
    console.log('checkForWinDirection2(), continuing at y =< ' + (startY + boundsModY * 4));

    for (x = (startX + boundsModX * 1), y = (startY + boundsModY * 1);
         true; // bounds-check is ensured by 'setCoord.length === 5' and 'validateMoveDataInsideBounds()'
         x = x + incrementModX * -1,    y = y + incrementModY * -1) {

        console.log('checkForWinDirection2() loop, checking: ' + x + '/' + y + ' ...');

        if (this.validateMoveDataInsideBounds(x, y)) {
            if (fieldObj[x][y] === piece) {
                setCoord.push([x, y, '(2)']);
                this.modifyField(x, y, setCoord.length);
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
    return setCoord;
};

/**
 * this debugging method allows to set an arbitrary value at the given coordinates on the field of this game
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @param {number} x
 * @param {number} y
 * @param {string} value
 */
gameSchema.methods.modifyField = function modifyField(x, y, value) {
    var fieldObj = JSON.parse(this.field);
    fieldObj[x][y] = value;
    this.field = JSON.stringify(fieldObj);
};

/**
 * creates a clone of this game and removes all "unnecessary" key-value-pairs before returning it
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @returns {gameSchema.methods}
 */
gameSchema.methods.sanitizeForOutput = function sanitizeForOutput() {
    var gameObj = (JSON.parse(JSON.stringify(this))); // "cloning" this
    gameObj.created_at = undefined;
    gameObj.__v = undefined;
    gameObj._id = undefined;
    return gameObj;
};

mongoose.model('Game', gameSchema);