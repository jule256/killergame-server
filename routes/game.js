'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), // mongo connection
    bodyParser = require('body-parser'), // parses information from POST
    methodOverride = require('method-override'), // used to manipulate POST
    GameRepository = require('../repository/game'),
    Auxiliary = require('../app/auxiliary');

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
    // @todo gameId validation
    req.gameId = gameId;
    next();
});

// actual routes ------

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
        var moveData = GameRepository.getMoveData(req.body, req.gameId);
        GameRepository.getGame(moveData.gameId, 'finished', moveData.username).then(function(game) {
            // resolve callback

            // validation of move data
            if (!game.validateMoveData(moveData)) {
                Auxiliary.sendErrorResponse(res, {
                    text: game.getValidateMoveDataError()
                });
                return;
            }

            // making the move
            game.makeMove(moveData);

            // @todo check for draw

            if (game.checkForWin(moveData)) {
                console.log('this is a win');

                // @todo handle win
                // @todo increase player's score
            }
            else {
                // game is not over yet, change to other player
                game.changeActivePlayer();
            }

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
                            route: 'PUT /game',
                            game: game.sanitizeForOutput(),
                            moveData: moveData
                        });
                    }
                });
            });
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



