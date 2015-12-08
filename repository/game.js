'use strict';

var mongoose = require('mongoose'), // mongo connection
    Promise = require('bluebird'), // to use promises
    merge = require('merge'), // to merge two objects
    config = require('../config/config'),
    constants = require('../config/constants');

/**
 * model values which should NOT be delivered in responses
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @type {string[]}
 */
var blacklist = ['created_at', '__v', '_id'];

/**
 * takes the given sort parameters, checks them for validity and returns them as either a
 * default sort object (if validation failed) or tranforms them to a mongoos query usable
 * object and returns that
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @param {string} column
 * @param {string} direction
 * @returns {object}
 */
var getOrderbyObject = function(column, direction) {
    var sortObj = {};

    if (typeof column === 'undefined' || typeof direction === 'undefined') {
        return {
            created_at: -1
        };
    }

    if (config.gameListWhitelistValue.indexOf(column.toLowerCase()) === -1 || // check if column-name is valid
        config.gameListWhitelistOrder.indexOf(direction.toLowerCase()) === -1) { // check if sort-order is valid
        return {
            score: -1
        };
    }

    sortObj[column] = direction.toLowerCase() === 'asc' ? 1 : -1;

    return sortObj;
},

GameRepository = {
    /**
     * returns the blacklist of the game model
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @returns {string[]}
     */
    getBlacklist: function() {
        return blacklist;
    },

    /**
     * creates a mongoose usable exclude string out of the blacklist and returns it
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @returns {string}
     */
    getBlacklistExcludeString: function() {
        return '-' + blacklist.join(' -');
    },

    /**
     * resolves with the game with the given gameId or rejects with an error if something went wrong
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {number} gameId
     * @param {object} [where]
     * @param {string} [username]
     * @returns {bluebird|exports|module.exports}
     */
    getGame: function(gameId, where, username) {
        var where = merge(where, { gameId: gameId }); // jshint ignore:line

        return new Promise(function (resolve, reject) {
            mongoose.model('Game').findOne(where, function (err, game) {
                if (!game) {
                    reject({
                        text: 'game with id "' + gameId + '" does not exist',
                        key: 'game_0001'
                    });
                }
                else if (typeof username !== 'undefined') {
                    // check if passed username belongs to the game (if any username was passed)
                    if (game.player1 !== username && game.player2 !== username) {
                        reject({
                            text: 'game does not belong to user ' + username,
                            key: 'game_0002'
                        });
                    }
                    else {
                        resolve(game);
                    }
                }
                else {
                    resolve(game);
                }
            });
        });
    },

    /**
     * resolves with all games where the given username is playerX (being "player1" or "player2") and the
     * status is "ready" (if parameter accepted is true) or "prestart" (if parameter accepted is false)
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {String} username
     * @param {String} playerX
     * @param {Boolean} [accepted]
     * @returns {bluebird|exports|module.exports}
     */
    getChallenges: function(username, playerX, accepted) {
        var blacklistExclude = this.getBlacklistExcludeString(),
            where = {
                status: accepted ? constants.status.ready : constants.status.prestart
            };
        return new Promise(function (resolve, reject) {
            if (playerX !== constants.player1 && playerX !== constants.player2) {
                reject();
            }
            where[playerX] = username;
            mongoose.model('Game').find(where, blacklistExclude, null, function (err, games) {
                if (err) {
                    reject({
                        text: 'there was an error querying the database',
                        key: 'database_0001'
                    });
                }
                else {
                    resolve(games);
                }
            });
        });
    },

    /**
     * extracts player1 from the token and the player2 value both from the given reqBody object and returns an
     * object usable for creating a game
     * if reqBody contains fieldWidth or fieldHeight, the according values will be extracted
     * and added to the return object. Otherwise default values from the config will be used
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {object} reqBody
     * @returns {{player1: string, player2: string}}
     */
    getNewGameData: function(username, reqBody) {
        return {
            player1: username,
            player2: reqBody.player2,
            fieldWidth: reqBody.fieldWidth || config.gameFieldWidth,
            fieldHeight: reqBody.fieldHeight || config.gameFieldHeight
        };
    },

    /**
     * resolves if the given gameData is valid and otherwise rejects with an error
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {object} gameData
     * @returns {bluebird|exports|module.exports}
     */
    validateNewGameData: function(gameData) {
        var playerModel = mongoose.model('Player'),
            query;

        return new Promise(function(resolve, reject) {

            // check if both given player usernames are set
            if (typeof gameData === 'undefined' ||
                typeof gameData.player1 === 'undefined' ||
                typeof gameData.player2 === 'undefined') {

                reject({
                    text: 'player1 and/or player2 username not set',
                    key: 'game_0008'
                });
            }

            // check if given player usernames are identical
            if (gameData.player1 === gameData.player2) {
                reject({
                    text: 'player1 and player2 can\'t be the same',
                    key: 'game_0009'
                });
            }

            // check if both players exist in database
            query = playerModel.where({ $or: [{username: gameData.player1}, {username: gameData.player2}]});
            query.find(function (err, players) {
                if (err) {
                    reject({
                        text: 'there was an error querying the database',
                        key: 'database_0001'
                    });
                }

                if (players.length !== 2) {
                    reject({
                        text: 'player not found in database',
                        key: 'game_0007'
                    });
                }
                else {
                    // @todo check if one of the players has another active game
                    resolve();
                }
            });
        });
    },

    /**
     * resolves if creating a new game with the given gameData was successful and otherwise rejects with an error
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {mongoose.model} gameModel
     * @param {object} gameData
     * @returns {bluebird|exports|module.exports}
     */
    createGame: function(gameModel, gameData) {
        return new Promise(function(resolve, reject) {
            gameModel.create(gameData, function (err, game) {
                if (err) {
                    reject({
                        text: 'could not create new game',
                        key: 'game_0014'
                    });
                }
                else {
                    // game has been created
                    game.initialize();
                    game.save(function (err) {
                        if (err) {
                            reject({
                                text: 'could not initialize new game',
                                key: 'game_0015'
                            });
                        }
                        else {
                            resolve(game);
                        }
                    });
                }
            });
        });
    },

    /**
     * extracts the x/y coordinate and the token-username from the given reqBody object
     * and combines it with the given gameId to a return object
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {object} reqBody
     * @param {number} gameId
     * @returns {{x: number, y: number, username: string, gameId: number}}
     */
    getMoveData: function(reqBody, gameId) {
        return {
            x: +reqBody.x, // parse to int
            y: +reqBody.y, // parse to int
            //username: req.decodedToken.username,
            gameId: gameId
        };
    },

    /**
     * queries the game table with the given limit, offset and sort paramters and resolves with a
     * sanitized array with game-objects or rejects with an error, if any
     *
     * the games can be restricted with the where parameter
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {object} params
     * @param {object} [where]
     * @returns {bluebird|exports|module.exports}
     */
    getGames: function(params, where) {
        var sortObj = getOrderbyObject(params.column, params.direction),
            blacklistExclude = this.getBlacklistExcludeString(),
            where = where || {}; // jshint ignore:line

        return new Promise(function(resolve, reject) {
            mongoose.model('Game').find(where, blacklistExclude, {
                limit: params.limit,
                skip: params.offset,
                sort: sortObj
            }, function (err, games) {
                if (err) {
                    reject({
                        text: 'there was an error querying the database',
                        key: 'database_0001'
                    });
                }
                else {
                    resolve(games);
                }
            });
        });
    }
};

if (process.env.NODE_ENV === 'test') {
    // in environment "test", also export private functions
    GameRepository = merge(GameRepository, {
        getOrderbyObject: getOrderbyObject
    });
}

module.exports = GameRepository;
