'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), // mongo connection
    bodyParser = require('body-parser'), // parses information from POST
    methodOverride = require('method-override'), // used to manipulate POST
    GameRepository = require('../repository/game'),
    PlayerRepository = require('../repository/player'),
    ErrorHelper = require('../helper/error'),
    AuthHelper = require('../helper/auth'),
    config = require('../config/config'),
    constants = require('../config/constants'),
    saveGame;

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

// AuthHelper middleware takes care of token verification ------
router.use(AuthHelper.verifyToken);

// accumulating parameters ------

// route middleware to validate :gameId and add it to the req-object
router.param('gameId', function(req, res, next, gameId) {
    req.gameId = gameId;
    next();
});

// actual routes ------

/**
 * handles saving of the given game to prevent duplicated code in the PUT :gameId request
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @param {mongoose.model} game
 * @param {object} moveData
 * @param {object} res
 */
saveGame = function(game, moveData, res) {
    // for debugging/testing (check server's console output!)
    game.printField();

    // saving the game to database
    game.save(function (err) {
        if (err) {
            ErrorHelper.sendErrorResponse(res, err.toString());
            return;
        }
        res.format({
            json: function() {
                res.json({
                    game: game.sanitizeForOutput(),
                    moveData: moveData
                });
            }
        });
    });
};

router.route('/challengee')
    // GET /challenged returns all games in state "prestart" with player as player2
    .get(function(req, res, next) {
        var username = req.decodedToken.username;
        GameRepository.getChallenges(username, constants.player2).then(function(games) {
            // resolve callback
            res.format({
                json: function() {
                    res.json({
                        games: games
                    });
                }
            });
        }, function(error) {
            // error callback
            ErrorHelper.sendErrorResponse(res, error);
        });
    });

router.route('/challenger')
    // GET /challenged returns all games in state "prestart" with player as player1
    .get(function(req, res, next) {
        var username = req.decodedToken.username;
        GameRepository.getChallenges(username, constants.player1).then(function(games) {
            // resolve callback
            res.format({
                json: function() {
                    res.json({
                        games: games
                    });
                }
            });
        }, function(error) {
            // error callback
            ErrorHelper.sendErrorResponse(res, error);
        });
    });

router.route('/accepted')
    // GET /accepted returns all games in state "ready" with player as player1
    .get(function(req, res, next) {
        var username = req.decodedToken.username;
        GameRepository.getChallenges(username, constants.player1, true).then(function (games) {
            // resolve callback
            res.format({
                json: function() {
                    res.json({
                        games: games
                    });
                }
            });
        }, function(error) {
            // error callback
            ErrorHelper.sendErrorResponse(res, error);
        });
    });

router.route('/')
    // GET ALL returns ...
    .get(function(req, res, next) {
        ErrorHelper.sendErrorResponse(res, {
            code: 404,
            text: 'GETLIST /game is not implemented yet',
            key: 'todo_0001'
        });
    })
    // POST create a new game
    .post(function(req, res, next) {
        var username = req.decodedToken.username;
        var newGameData = GameRepository.getNewGameData(username, req.body),
            gameModel = mongoose.model('Game');

        GameRepository.validateNewGameData(newGameData).then(function() {
            // resolve callback
            GameRepository.createGame(gameModel, newGameData).then(function(game) {
                // resolve callback
                res.json({
                    game: game.sanitizeForOutput()
                });
            }, function(error) {
                // error callback
                ErrorHelper.sendErrorResponse(res, error);
            });
        }, function(error) {
            // error callback
            ErrorHelper.sendErrorResponse(res, error);
        });
    });

router.route('/:gameId')
    // GET returns the game with the given id
    .get(function(req, res) {
        var gameId = req.gameId,
            where = {};
        GameRepository.getGame(gameId, where).then(function(game) {
            // resolve callback
            if (!AuthHelper.isNeedleInHaystack(req.decodedToken.username, [ game.player1, game.player2 ])) {
                ErrorHelper.sendErrorResponse(res, {
                    code: 403,
                    text: 'cannot retrieve game of other players',
                    key: 'game_0011'
                });
            }
            else {
                res.json({
                    game: game.sanitizeForOutput()
                });
            }
        }, function(error) {
            // error callback
            ErrorHelper.sendErrorResponse(res, error);
        });
    })
    // PUT to set a game piece
    .put(function(req, res) {
        
        var moveData = GameRepository.getMoveData(req.body, req.gameId, req.decodedToken.username),
            errorData,
            where = { status: { '$ne': 'finished' }};
            
        GameRepository.getGame(moveData.gameId, where, moveData.username).then(function(game) {
            // resolve callback

            // validation of move data
            if (!game.validateMoveData(moveData)) {
                errorData = game.getValidateMoveDataError();
                ErrorHelper.sendErrorResponse(res, errorData);
                return;
            }

            // making the move
            game.makeMove(moveData);

            if (game.checkForWin(moveData)) {
                // this game is won by the active player

                PlayerRepository.getPlayerByUsername(moveData.username).then(function(player) {
                    // resolve callback
                    player.increaseScore();

                    player.save(function (err) {
                        if (err) {
                            ErrorHelper.sendErrorResponse(res, err.toString());
                            return;
                        }
                        // continue code-flow at saveGame()
                        saveGame(game, moveData, res);
                    });
                }, function(error) {
                    // error callback
                    ErrorHelper.sendErrorResponse(res, error);
                });
            }
            else if (game.checkForDraw()) {
                // this game ended draw

                // get player 1 and increase his score
                PlayerRepository.getPlayerByUsername(game.player1).then(function(player1) {
                    // resolve callback
                    player1.increaseScore(config.scoreIncreaseDraw);

                    player1.save(function (err) {
                        if (err) {
                            ErrorHelper.sendErrorResponse(res, {
                                key: 'database_0002',
                                text: 'there was an error writing to the database'
                            });
                            return;
                        }

                        // get player 2 and increase his score
                        PlayerRepository.getPlayerByUsername(game.player2).then(function(player2) {
                            // resolve callback
                            player2.increaseScore(config.scoreIncreaseDraw);

                            player2.save(function (err) {
                                if (err) {
                                    ErrorHelper.sendErrorResponse(res, {
                                        key: 'database_0002',
                                        text: 'there was an error writing to the database'
                                    });
                                    return;
                                }
                                // continue code-flow at saveGame()
                                saveGame(game, moveData, res);
                            });
                        }, function(error) {
                            // error callback
                            ErrorHelper.sendErrorResponse(res, error);
                        });
                    });
                }, function(error) {
                    // error callback
                    ErrorHelper.sendErrorResponse(res, error);
                });
            }
            else {
                // game is not over yet, change to other player

                game.changeActivePlayer();

                // continue code-flow at saveGame()
                saveGame(game, moveData, res);
            }
        }, function(error) {
            // error callback
            ErrorHelper.sendErrorResponse(res, error);
        });
    })
    .delete(function (req, res) {
        ErrorHelper.sendErrorResponse(res, {
            code: 404,
            text: 'DELETE /game is not implemented yet',
            key: 'todo_0002'
        });
    });

router.route('/:gameId/forfeit')
    // PUT to forfeit the game
    .put(function(req, res) {
        var moveData = GameRepository.getMoveData(req.body, req.gameId, req.decodedToken.username),
            otherPlayer,
            where = { status: { '$ne': 'finished' }};

        GameRepository.getGame(moveData.gameId, where, moveData.username).then(function(game) {
            // resolve callback

            // forfeit game
            game.forfeit(moveData);

            otherPlayer =
                game.usernameToPlayerX(moveData.username) === constants.player1 ? constants.player2 : constants.player1;

            PlayerRepository.getPlayerByUsername(game[otherPlayer]).then(function(player) {
                // resolve callback
                player.increaseScore();

                player.save(function (err) {
                    if (err) {
                        ErrorHelper.sendErrorResponse(res, {
                            key: 'database_0002',
                            text: 'there was an error writing to the database'
                        });
                        return;
                    }
                    // continue code-flow at saveGame()
                    saveGame(game, moveData, res);
                });
            }, function(error) {
                // error callback
                ErrorHelper.sendErrorResponse(res, error);
            });
        }, function(error) {
            // error callback
            ErrorHelper.sendErrorResponse(res, error);
        });
    });

router.route('/:gameId/accept')
    // PUT lets the challengee accept the challenge and start the actual game
    .put(function(req, res) {
        var username = req.decodedToken.username,
            where = { status: 'prestart' };

        GameRepository.getGame(req.gameId, where, username).then(function(game) {
            // resolve callback
            game.acceptChallenge(username).then(function() {
                // resolve callback
                // continue code-flow at saveGame()
                saveGame(game, {}, res);
            }, function(error) {
                // error callback
                ErrorHelper.sendErrorResponse(res, error);
            });
        }, function(error) {
            // error callback
            ErrorHelper.sendErrorResponse(res, error);
        });
    });

module.exports = router;
