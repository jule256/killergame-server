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
    // @todo gameId validation?
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

router.route('/')
    // GET ALL returns ...
    .get(function(req, res, next) {
        // @todo implement
        ErrorHelper.sendErrorResponse(res, {
            code: 404,
            text: 'GETLIST /game is not implemented yet',
            key: 'todo_0001'
        });
    })
    // POST create a new game
    .post(function(req, res, next) {
        var newGameData = GameRepository.getNewGameData(req.body),
            gameModel = mongoose.model('Game');

        if (!AuthHelper.isNeedleInHaystack(req.decodedToken.username, [ newGameData.player1, newGameData.player2 ])) {
            ErrorHelper.sendErrorResponse(res, {
                code: 403,
                text: 'cannot create game for other players',
                key: 'game_0010'
            });
            return;
        }

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
        var gameId = req.gameId;
        GameRepository.getGame(gameId, 'finished').then(function(game) {
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
        var moveData = GameRepository.getMoveData(req.body, req.gameId),
            errorData;

        if (!AuthHelper.isNeedleInHaystack(req.decodedToken.username, [ moveData.username ])) {
            ErrorHelper.sendErrorResponse(res, {
                code: 403,
                text: 'cannot make move for game of other players',
                key: 'game_0012'
            });
            return;
        }

        GameRepository.getGame(moveData.gameId, 'finished', moveData.username).then(function(game) {
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
        var moveData = GameRepository.getMoveData(req.body, req.gameId),
            otherPlayer;

        if (!AuthHelper.isNeedleInHaystack(req.decodedToken.username, [ moveData.username ])) {
            ErrorHelper.sendErrorResponse(res, {
                code: 403,
                text: 'cannot forfeit game of other players',
                key: 'game_0013'
            });
            return;
        }

        GameRepository.getGame(moveData.gameId, 'finished', moveData.username).then(function(game) {
            // resolve callback

            // forfeit game
            game.forfeit(moveData);

            otherPlayer = game.usernameToPlayerX(moveData.username) === 'player1' ? 'player2' : 'player1';

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

module.exports = router;
