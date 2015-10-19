'use strict';

var mongoose = require('mongoose'), // mongo connection
    Promise = require('bluebird'), // to use promises
    md5 = require('md5'),
    config = require('../config/config'),
    PlayerRepository;

/**
 * model values which should NOT be delivered in responses
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @type {string[]}
 */
var blacklist = ['created_at', '__v', '_id'];

PlayerRepository = {
    /**
     * returns the blacklist of the player model
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
     * resolves with the player with the given playerId or rejects with an error if something went wrong
     *
     * @todo maybe merge all getPlayerBy*() functions
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {Number} playerId
     * @returns {bluebird|exports|module.exports}
     */
    getPlayerByPlayerId: function(playerId) {
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
     * resolves with the player with the given username or rejects with an error if something went wrong
     *
     * @todo maybe merge all getPlayerBy*() functions
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {String} username
     * @returns {bluebird|exports|module.exports}
     */
    getPlayerByUsername: function(username) {
        return new Promise(function (resolve, reject) {
            mongoose.model('Player').findOne({ username: username }, function (err, player) {
                if (!player) {
                    reject({
                        text: 'player with username "' + username + '" does not exist',
                        key: 'player_0002'
                    });
                }
                else {
                    resolve(player);
                }
            });
        });
    },

    /**
     * resolves with the player with the given username/password or rejects
     *
     * @todo maybe merge all getPlayerBy*() functions
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param username
     * @param password
     * @returns {bluebird|exports|module.exports}
     */
    getPlayerByUsernameAndPassword: function(username, password) {
        var passwordx = md5(password + config.passwordHash);
        return new Promise(function (resolve, reject) {
            mongoose.model('Player').findOne({
                username: username ,
                password: passwordx
            }, function (err, player) {
                if (!player) {
                    reject();
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
     * extracts username and password from the given req-object and returns it (used for login)
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {object} reqBody
     * @returns {{username: {String}, password: {String}}}
     */
    getLoginPlayerData: function(reqBody) {
        return {
            username: reqBody.username,
            password: reqBody.password
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
    },

    /**
     * extracts offset, limit, sort-column and sort-directon from the given req object and returns it
     * not found parameters will be supplemented by the default values from the config
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {object} req
     * @returns {{limit: (*|number), offset: (*|number), column: (*|string), direction: (*|string)}}
     */
    getPlayerListData: function(req) {
        return {
            limit: req.limit || config.playerListLimit,
            offset: req.offset || config.playerListOffset,
            column: req.column || config.playerListColumn,
            direction: req.direction || config.playerListDirection
        };
    },

    /**
     * takes the given sort parameters, checks them for validity and returns them as either a
     * default sort object (if validation failed) or tranforms them to a mongoos query usable
     * object and returns that
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @private
     * @param column
     * @param direction
     * @returns {object}
     */
    getOrderbyObject: function(column, direction) {
        var sortObj = {};

        if (config.playerListWhitelistValue.indexOf(column.toLowerCase()) === -1 || // check if column-name is valid
            config.playerListWhitelistOrder.indexOf(direction.toLowerCase()) === -1) { // check if sort-order is valid
            return {
                score: -1
            };
        }

        sortObj[column] = direction.toLowerCase() === 'asc' ? 1 : -1;

        return sortObj;
    },

    /**
     * queries the player table with the given limit, offset and sort paramters and resolves with a
     * sanitized array with player-objects or rejects with an error, if any
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {object} params
     * @returns {bluebird|exports|module.exports}
     */
    getPlayers: function(params) {
        var sortObj = this.getOrderbyObject(params.column, params.direction),
            blacklistExclude = this.getBlacklistExcludeString();

        return new Promise(function(resolve, reject) {
            mongoose.model('Player').find({}, blacklistExclude, {
                limit: params.limit,
                skip: params.offset,
                sort: sortObj
            }, function (err, players) {
                if (err) {
                    reject({
                        text: 'there was an error querying the database',
                        key: 'database_0001'
                    });
                }
                else {
                    resolve(players);
                }
            });
        });
    }
};

module.exports = PlayerRepository;
