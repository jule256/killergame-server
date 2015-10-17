'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), // mongo connection
    bodyParser = require('body-parser'), // parses information from POST
    methodOverride = require('method-override'), // used to manipulate POST
    GameRepository = require('../repository/game'),
    PlayerRepository = require('../repository/player'),
    Auxiliary = require('../app/auxiliary'),
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
 * @param {object} moveData
 * @param {object} res
 */
saveGame = function(game, moveData, res) {
    // for debugging/testing (check server's console output!)
    game.printField();

    // saving the game to database
    game.save(function (err) {
        if (err) {
            Auxiliary.sendErrorResponse(res, err.toString());
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

        Auxiliary.sendErrorResponse(res, {
            text: 'GETLIST /game is not implemented yet'
        });
    })
    // POST create a new game
    .post(function(req, res, next) {
        var newGameData = GameRepository.getNewGameData(req.body),
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
                Auxiliary.sendErrorResponse(res, error);
            });
        }, function(error) {
            // error callback
            Auxiliary.sendErrorResponse(res, error);
        });
    });

router.route('/:gameId')
    // GET returns the game with the given id
    .get(function(req, res) {
        var gameId = req.gameId;
        GameRepository.getGame(gameId, 'finished').then(function(game) {
            // resolve callback
            res.json({
                game: game.sanitizeForOutput()
            });
        }, function(error) {
            // error callback
            Auxiliary.sendErrorResponse(res, error);
        });
    })
    // PUT to set a game piece
    .put(function(req, res) {
        var moveData = GameRepository.getMoveData(req.body, req.gameId),
            errorData;
        GameRepository.getGame(moveData.gameId, 'finished', moveData.username).then(function(game) {
            // resolve callback

            // validation of move data
            if (!game.validateMoveData(moveData)) {
                errorData = game.getValidateMoveDataError();
                Auxiliary.sendErrorResponse(res, errorData);
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
                            Auxiliary.sendErrorResponse(res, err.toString());
                            return;
                        }
                        // continue code-flow at saveGame()
                        saveGame(game, moveData, res);
                    });
                }, function(error) {
                    // error callback
                    Auxiliary.sendErrorResponse(res, error);
                });
            }
            else if (game.checkForDraw()) {
                // this game ended draw

                // get player 1 and increase his score
                PlayerRepository.getPlayerByUsername(game.player1).then(function(player1) {
                    // resolve callback
                    player1.increaseScore(1); // @todo get "1" from some sort of application-configuration?

                    player1.save(function (err) {
                        if (err) {
                            Auxiliary.sendErrorResponse(res, err.toString());
                            return;
                        }

                        // get player 2 and increase his score
                        PlayerRepository.getPlayerByUsername(game.player2).then(function(player2) {
                            // resolve callback
                            player2.increaseScore(1); // @todo get "1" from some sort of application-configuration?

                            player2.save(function (err) {
                                if (err) {
                                    Auxiliary.sendErrorResponse(res, err.toString());
                                    return;
                                }
                                // continue code-flow at saveGame()
                                saveGame(game, moveData, res);
                            });
                        }, function(error) {
                            // error callback
                            Auxiliary.sendErrorResponse(res, error);
                        });
                    });
                }, function(error) {
                    // error callback
                    Auxiliary.sendErrorResponse(res, error);
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
            Auxiliary.sendErrorResponse(res, error);
        });
    })
    .delete(function (req, res){
        Auxiliary.sendErrorResponse(res, {
            text: 'DELETE /game is not implemented yet'
        });
    });

module.exports = router;



