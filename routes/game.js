/* jshint node: true */

'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), // mongo connection
    bodyParser = require('body-parser'), // parses information from POST
    methodOverride = require('method-override'), // used to manipulate POST
    Promise = require('bluebird'), // used to be able to use promises
    setError,
    getNewGameData,
    getMoveData,
    validateNewGameData,
    validateMoveData,
    createGame,
    makeMove,
    sanitizeOutput, // @todo think of a better function name
    getGame;

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res) {
    var method;
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

/**
 * @todo duplicated in every route, needs to be moved to a more central location
 * @author Julian Mollik <jule@creative-coding.net>
 * @param res
 * @param errorobj
 */
setError = function(res, errorobj) {
    var errorcode = errorobj.code || 418,
        errortext = errorobj.text || 'unknown error';
    res.status(errorcode);
    res.format({
        json: function() {
            res.json({
                error: errortext
            });
        }
    });
    return;
};

getNewGameData = function(reqBody) {
    return {
        player1: reqBody.player1,
        player2: reqBody.player2
    };
};

getMoveData = function(reqBody, reqGameId) {
    return {
        x: reqBody.x,
        y: reqBody.y,
        username: reqBody.username,
        gameId: reqGameId
    };
};

// @todo function is too long, split it
validateNewGameData = function(res, gameData) {
    var playerModel = mongoose.model('Player'),
        query;

    return new Promise(function(resolve, reject) {

        // check if given player usernames are identical
        if (gameData.player1 === gameData.player2) {
            setError(res, {
                text: 'player1 and player2 can\'t be the same'
            });
            reject();
        }

        // check if both given player usernames are set
        if (typeof gameData.player1 === 'undefined' ||
            typeof gameData.player2 === 'undefined') {

            setError(res, {
                text: 'player1 and/or player2 username not set'
            });
            reject();
        }

        // check if both players exist in database
        query = playerModel.where({ $or: [{username: gameData.player1}, {username: gameData.player2}]});
        query.find(function (err, players) {
            if (err) {
                res.send('There was a problem getting player information from the database.');
            }

            if (players.length !== 2) {
                setError(res, {
                    text: 'player not found in database'
                });
                reject();
            }
            else {
                // @todo check if one of the players has another active game
                resolve();
            }
        });
    });
};

// @todo function is too long, split it
validateMoveData = function(res, moveData) {
    var gameModel = mongoose.model('Game'),
        query;

    getGame(res, moveData.gameId, 'finished', moveData.username).then(function(game) {
        // resolve callback


    }, function() {
        // error callback
        return;
    });


    return new Promise(function(resolve, reject) {

    });
};

createGame = function(res, gameModel, gameData) {
    gameModel.create(gameData, function (err, game) {
        if (err) {
            console.log('There was a problem adding the information to the database.');
            res.send('There was a problem adding the information to the database.');
        }
        else {
            // game has been created

            game.initialize('test');

            game.save(function (err) {
                if (err) {
                    setError(err.toString());
                }

                console.log('returning game with modified field:', game);

                res.format({
                    json: function() {
                        res.json(sanitizeOutput(game));
                    }
                });
            });
        }
    });
};

makeMove = function(res, gameModel, moveData) {

};

// removes mangoose keys and the created_at key of the given obj and returns it
sanitizeOutput = function(obj) {
    obj.created_at = undefined;
    obj.__v = undefined;
    obj._id = undefined;
    return obj;
};

router.route('/')
    // GET returns ...
    .get(function(req, res, next) {

        console.log('game.js GET', req.body);

        res.format({
            json: function() {
                res.json({
                    route: 'game GET'
                });
            }
        });
        
    })
    // POST create a new game
    .post(function(req, res, next) {
        var newGameData = getNewGameData(req.body),
            gameModel = mongoose.model('Game');

        validateNewGameData(res, newGameData).then(function() {
            // resolve callback
            createGame(res, gameModel, newGameData);
        }, function() {
            // error callback
            return;
        });
    })

// route middleware to validate :username and add it to the req-object
router.param('username', function(req, res, next, username) {
    mongoose.model('Player').findOne({
        username: username
    }, function(err, player) {
        if (!player) {
            setError(res, {
                text: 'player with username "' + username + '" does not exist'
            });
        }
        else {
            req.username = username;
            next();
        }
    });
});
// route middleware to validate :gameId and add it to the req-object
router.param('gameId', function(req, res, next, gameId) {
    // @todo gameId validation
    req.gameId = gameId;
    next();
});

router.route('/:username/:gameId')
    .get(function(req, res) {
        var username = req.username,
            gameId = req.gameId;

        console.log('game.js GET username/gameId');

        getGame(res, gameId, 'finished', username).then(function(game) {
            // resolve callback
            res.json({
                game: sanitizeOutput(game)
            });
        }, function() {
            // error callback
            return;
        });
    });

router.route('/:gameId')
    // PUT to set a game piece
    .put(function(req, res) {

        // CONTINUE HERE
        var moveData = getMoveData(req.body, req.gameId),
            gameModel = mongoose.model('Game');

        validateMoveData(res, moveData).then(function() {
            // resolve callback
            makeMove(res, gameModel, moveData);
        }, function() {
            // error callback
            return;
        });
    });

// auxiliary functions, @todo move to a game-repository?

/**
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @param res
 * @param gameId
 * @param status
 * @param username
 * @returns {bluebird|exports|module.exports}
 */
getGame = function(res, gameId, status, username) {
    return new Promise(function(resolve, reject) {
        mongoose.model('Game').findOne({
            gameId: gameId,
            status: {'$ne': status }
        }, function(err, game) {
            if (!game) {
                setError(res, {
                    text: 'game with id "' + gameId + '" does not exist X'
                });
                reject();
            }
            else if (typeof username !== 'undefined') {
                // check if passed username belongs to the game (if any username was passed)
                if (game.player1 !== username && game.player2 !== username) {
                    setError(res, {
                        text: 'game does not belong to user ' + username
                    });
                    reject();
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
};


module.exports = router;



