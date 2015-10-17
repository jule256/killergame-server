'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), // mongo connection
    bodyParser = require('body-parser'), // parses information from POST
    methodOverride = require('method-override'), // used to manipulate POST
    PlayerRepository = require('../repository/player'),
    ErrorHelper = require('../helper/error'),
    AuthHelper = require('../helper/auth'),
    getList;

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

// route middleware to validate :playerId and add it to the req-object
router.param('playerId', function(req, res, next, playerId) {
    req.playerId = playerId;
    next();
});

router.param('offset', function(req, res, next, offset) {
    req.offset = offset;
    next();
});

router.param('limit', function(req, res, next, limit) {
    req.limit = limit;
    next();
});

router.param('column', function(req, res, next, column) {
    req.column = column;
    next();
});

router.param('direction', function(req, res, next, direction) {
    req.direction = direction;
    next();
});

// actual routes ------

router.route('/:playerId(\\d+)') // (\\d+) ensures to trigger only on numbers
    // GET returns the player with the given id
    .get(function(req, res, next) {
        var playerId = req.playerId;
        PlayerRepository.getPlayerByPlayerId(playerId).then(function(player) {
            // resolve callback
            res.json({
                player: player.sanitizeForOutput()
            });
        }, function(error) {
            // error callback
            ErrorHelper.sendErrorResponse(res, error);
        });
    });

/**
 * handles GET requests to /
 *                         /limit/<limit-value>
 *                         /limit/<limit-value>/offset/<offset-value>
 *                         /limit/<limit-value>/offset/<offset-value>/sort/<sort-column>/<sort-direction>
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
getList = function(req, res, next) {
    var params = PlayerRepository.getPlayerListData(req);
    PlayerRepository.getPlayers(params).then(function(players) {
        // resolve callback
        res.format({
            json: function() {
                res.json({
                    players: players
                });
            }
        });
    }, function(error) {
        // error callback
        ErrorHelper.sendErrorResponse(res, error);
    });
};

router.route('/')
    // GETLIST all players without parameters
    .get(function(req, res, next) {
        getList(req, res, next);
    })
    // POST a new player
    .post(function(req, res, next) {
        var newPlayerData = PlayerRepository.getNewPlayerData(req.body),
            playerModel = mongoose.model('Player');

        PlayerRepository.validateNewPlayerData(newPlayerData).then(function() {
            // resolve callback
            PlayerRepository.createPlayer(playerModel, newPlayerData).then(function(player) {
                // resolve callback
                res.json({
                    player: player.sanitizeForOutput(),
                    token: AuthHelper.createToken(newPlayerData.username, newPlayerData.password_1)
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

//
router.route('/limit/:limit(\\d+)?')
    // GETLIST all players with offset parameter
    .get(function(req, res, next) {
        getList(req, res, next);
    });

router.route('/limit/:limit(\\d+)/offset/:offset(\\d+)?')
    // GETLIST all players with offset AND limit parameter
    .get(function(req, res, next) {
        getList(req, res, next);
    });

router.route('/limit/:limit(\\d+)/offset/:offset/sort/:column(\\w+)/:direction(\\w+)')
    // GETLIST all players with offset AND limit AND sort parameter
    .get(function(req, res, next) {
        getList(req, res, next);
    });

// AuthHelper middleware takes care of token verification ------
router.use(AuthHelper.verifyToken);

// @todo return new token

router.route('/:playerId(\\d+)') // (\\d+) ensures to trigger only on numbers
    // PUT to update a player
    .put(function(req, res) {
        var playerData = PlayerRepository.getPlayerData(req.body, req.playerId),
            playerModel = mongoose.model('Player');

        if (!AuthHelper.isNeedleInHaystack(req.decodedToken.playerId, [ playerData.playerId ])) {
            ErrorHelper.sendErrorResponse(res, {
                code: 403,
                text: 'only own player-data can be updated',
                key: 'player_register_0004'
            });
            return;
        }

        PlayerRepository.validatePlayerData(playerData).then(function() {
            // resolve callback
            PlayerRepository.updatePlayer(playerModel, playerData).then(function(player) {
                // resolve callback
                res.json({
                    player: player.sanitizeForOutput()
                });
            }, function(error) {
                // error callback
                ErrorHelper.sendErrorResponse(res, error);
            });
        }, function(error) {
            // error callback
            ErrorHelper.sendErrorResponse(res, error);
        });
    })
    // DELETE to remove a player
    .delete(function (req, res){
        ErrorHelper.sendErrorResponse(res, {
            code: 404,
            text: 'DELETE /player is not implemented yet',
            key: 'todo_0003'
        });
    });


module.exports = router;
