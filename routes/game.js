'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), // mongo connection
    bodyParser = require('body-parser'), // parses information from POST
    methodOverride = require('method-override'), // used to manipulate POST
    GameReposiory = require('../repository/game'),
    setError; // @todo think of a better function name

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
};

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
        var newGameData = GameReposiory.getNewGameData(req.body),
            gameModel = mongoose.model('Game');

        GameReposiory.validateNewGameData(newGameData).then(function() {
            // resolve callback
            GameReposiory.createGame(gameModel, newGameData).then(function(game) {
                // resolve callback
                res.json({
                    game: game.sanitizeForOutput()
                });
            }, function(error) {
                // error callback
                setError(res, error);
            });
        }, function(error) {
            // error callback
            setError(res, error);
        });
    });

router.route('/:gameId')
    // GET returns a game
    .get(function(req, res) {
        var gameId = req.gameId;
        GameReposiory.getGame(gameId, 'finished').then(function(game) {
            // resolve callback
            res.json({
                game: game
            });
        }, function(error) {
            // error callback
            setError(res, error);
        });
    })
    // PUT to set a game piece
    .put(function(req, res) {
        var moveData = GameReposiory.getMoveData(req.body, req.gameId);
        GameReposiory.getGame(moveData.gameId, 'finished', moveData.username).then(function(game) {
            // resolve callback

            // validation of move data
            if (!game.validateMoveData(moveData)) {
                setError(res, {
                    text: game.getValidateMoveDataError()
                });
                return;
            }

            // making the move
            game.makeMove(moveData);

            game.checkForWin(moveData);

            // saving the game to database
            game.save(function (err) {
                if (err) {
                    setError(err.toString());
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
            setError(res, error);
        });
    });

module.exports = router;



