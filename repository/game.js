'use strict';

var mongoose = require('mongoose'), // mongo connection
    Promise = require('bluebird'), // to use promises
    GameRepository;

GameRepository = {
    /**
     * resolves with the game with the given gameId or rejects with an error if something went wrong
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {number} gameId
     * @param {string} status
     * @param {string | undefined} username
     * @returns {bluebird|exports|module.exports}
     */
    getGame: function (gameId, status, username) {
        return new Promise(function (resolve, reject) {
            mongoose.model('Game').findOne({
                gameId: gameId,
                status: {'$ne': status}
            }, function (err, game) {
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
     * extracts the player1 and player2 value from the given reqBody object and returns an
     * object usable for creating a game
     * if reqBody contains fieldWidth or fieldHeight, the according values will be extracted
     * and added to the return object
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {object} reqBody
     * @returns {{player1: string, player2: string}}
     */
    getNewGameData: function(reqBody) {
        return {
            player1: reqBody.player1,
            player2: reqBody.player2,
            fieldWidth: reqBody.fieldWidth || undefined,
            fieldHeight: reqBody.fieldHeight || undefined
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

            // check if given player usernames are identical
            if (gameData.player1 === gameData.player2) {
                reject({
                    text: 'player1 and player2 can\'t be the same'
                });
            }

            // check if both given player usernames are set
            if (typeof gameData.player1 === 'undefined' ||
                typeof gameData.player2 === 'undefined') {

                reject({
                    text: 'player1 and/or player2 username not set'
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
                        text: 'player not found in database'
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
                        text: 'could not create new game'
                    });
                }
                else {
                    // game has been created

                    game.initialize();

                    game.save(function (err) {
                        if (err) {
                            reject({
                                text: 'could not initialize new game'
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
     * extracts the x/y coordinate and the username from the given reqBody object
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
            username: reqBody.username,
            gameId: gameId
        };
    }
};

module.exports = GameRepository;









