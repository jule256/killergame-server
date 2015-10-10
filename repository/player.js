'use strict';

var mongoose = require('mongoose'), // mongo connection
    Promise = require('bluebird'), // to use promises
    PlayerRepository;

PlayerRepository = {
    /**
     * resolves with the player with the given playerId or rejects with an error if something went wrong
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {number} playerId
     * @returns {bluebird|exports|module.exports}
     */
    getPlayer: function (playerId) {
        return new Promise(function (resolve, reject) {
            mongoose.model('Player').findOne({ playerId: playerId }, function (err, player) {
                if (!player) {
                    reject({
                        text: 'player with id "' + playerId + '" does not exist',
                        key: 'player_0001'
                    });
                }
                else {
                    resolve(player);
                }
            });
        });
    },
    /**
     * extracts the player-data from reqBody object and returns it (used for new players)
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {object} reqBody
     * @returns {{name: string, email: string, username: string, password_1: string, password_2: string}}
     */
    getNewPlayerData: function(reqBody) {
        return {
            name: reqBody.name,
            email: reqBody.email,
            username: reqBody.username,
            password_1: reqBody.password_1,
            password_2: reqBody.password_2
        };
    },
    /**
     * extracts the player-data from reqBody object and returns it (used for existing players)
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {object} reqBody
     * @param {number} playerId
     * @returns {{name: string, email: string, password_1: string, password_2: string}}
     */
    getPlayerData: function(reqBody, playerId) {
        return {
            name: reqBody.name,
            email: reqBody.email,
            password_1: reqBody.password_1,
            password_2: reqBody.password_2,
            playerId: playerId
        };
    },
    /**
     * resolves if the given playerData is valid and otherwise rejects with an error (used for new players)
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param playerData
     * @returns {bluebird|exports|module.exports}
     */
    validateNewPlayerData: function(playerData) {
        var playerModel = mongoose.model('Player'),
            query;

        return new Promise(function(resolve, reject) {

            // check if playerData is complete
            if (typeof playerData.name === 'undefined' ||
                typeof playerData.email === 'undefined'||
                typeof playerData.username === 'undefined' ||
                typeof playerData.password_1 === 'undefined') {

                reject({
                    text: 'not all necessary data is set',
                    key: 'player_register_0001'
                });
            }

            // check if the two passwords match
            if (playerData.password_1 !== playerData.password_2) {
                reject({
                    text: 'passwords do not match',
                    key: 'player_register_0002'
                });
            }

            // check if the email-address is still available
            query = playerModel.where({ $or: [{username: playerData.username}, {email: playerData.email}]});
            query.find(function (err, players) {
                if (err) {
                    reject({
                        text: 'there was an error querying the database',
                        key: 'database_0001'
                    });
                }

                if (players.length > 0) {
                    reject({
                        text: 'player already exists in database',
                        key: 'player_register_0003'
                    });
                }
                else {
                    resolve();
                }
            });
        });
    },
    /**
     * resolves if the given playerData is valid and otherwise rejects with an error (used for existing players)
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param playerData
     * @returns {bluebird|exports|module.exports}
     */
    validatePlayerData: function(playerData) {
        var playerModel = mongoose.model('Player'),
            query;

        return new Promise(function(resolve, reject) {

            // check if playerData is complete
            if (typeof playerData.name === 'undefined' ||
                typeof playerData.email === 'undefined') {

                reject({
                    text: 'not all necessary data is set',
                    key: 'player_update_0001'
                });
            }

            // check if a password was given
            if (typeof playerData.password_1 !== 'undefined') {
                // if a password were submitted, check if both are equal
                if (playerData.password_1 !== playerData.password_2) {
                    reject({
                        text: 'passwords do not match',
                        key: 'player_register_0002'
                    });
                }
            }

            // check if the player exists in database
            playerModel.findOne({ playerId: playerData.playerId }, function (err, player) {
                if (err) {
                    reject({
                        text: 'there was an error querying the database',
                        key: 'database_0001'
                    });
                }
                else if (!player) {
                    reject({
                        text: 'player with id "' + playerData.playerId + '" does not exist',
                        key: 'player_0001'
                    });
                }
                else {
                    // check if the username and email are still available
                    query = playerModel.where({
                        email: playerData.email,
                        playerId: { $ne: playerData.playerId }
                    });
                    query.find(function (err, players) {
                        if (err) {
                            reject({
                                text: 'there was an error querying the database',
                                key: 'database_0001'
                            });
                        }

                        if (players.length > 0) {
                            reject({
                                text: 'email address already exists in database',
                                key: 'player_update_0002'
                            });
                        }
                        else {
                            resolve();
                        }
                    });
                }
            });
        });
    },
    /**
     * resolves if creating a new player with the given playerData was successful and otherwise rejects with an error
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {mongoose.model} playerModel
     * @param {object} playerData
     * @returns {bluebird|exports|module.exports}
     */
    createPlayer: function(playerModel, playerData) {
        return new Promise(function(resolve, reject) {
            playerModel.create(playerData, function (err, player) {
                if (err) {
                    reject({
                        text: 'there was an error writing to the database',
                        key: 'database_0002'
                    });
                }
                else {
                    // player has been created

                    player.initialize(playerData.password_1);

                    player.save(function (err) {
                        if (err) {
                            reject({
                                text: 'there was an error writing to the database',
                                key: 'database_0002'
                            });
                        }
                        else {
                            resolve(player);
                        }
                    });
                }
            });
        });
    },
    /**
     * resolves if updating the player with the given playerData was successful and otherwise rejects with an error
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {mongoose.model} playerModel
     * @param {object} playerData
     * @returns {bluebird|exports|module.exports}
     */
    updatePlayer: function(playerModel, playerData) {
        return new Promise(function(resolve, reject) {
            playerModel.findOne({ playerId: playerData.playerId }, function (err, player) {
                if (err) {
                    reject({
                        text: 'there was an error querying the database',
                        key: 'database_0001'
                    });
                }
                else if (!player) {
                    // this should actually never be the case, since we called validatePlayerData() before
                    reject({
                        text: 'player with id "' + playerData.playerId + '" does not exist',
                        key: 'player_0001'
                    });
                }
                else {
                    player.name = playerData.name;
                    player.email = playerData.email;

                    if (typeof playerData.password_1 !== 'undefined') {
                        // user wants to change his password
                        player.passwordx = playerData.password_1;
                    }

                    player.save(function (err) {
                        if (err) {
                            reject({
                                text: 'there was an error writing to the database',
                                key: 'database_0002'
                            });
                        }
                        else {
                            resolve(player);
                        }
                    });
                }
            });
        });
    }
};

module.exports = PlayerRepository;
