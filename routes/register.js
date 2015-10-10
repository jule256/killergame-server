'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    PlayerRepository = require('../repository/player'),
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

// route middleware to validate :playerId and add it to the req-object
router.param('playerId', function(req, res, next, playerId) {
    // @todo playerId validation
    req.playerId = playerId;
    next();
});

// actual routes ------

router.route('/')
    // GET returns all players
    .get(function(req, res, next) {

        // @todo rework with limit/filter/offset?

        Auxiliary.sendErrorResponse(res, {
            text: 'GETLIST /register is not implemented yet'
        });
        /*
        mongoose.model('Player').find({}, function (err, players) {
            if (err) {
                return console.error(err);
            }
            else {
                res.format({
                    json: function() {
                        res.json(players);
                    }
                });
            }
        });
        /**/
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
                    player: player.sanitizeForOutput()
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

router.route('/:playerId')
    // GET returns the player with the given id
    .get(function(req, res) {
        var playerId = req.playerId;
        PlayerRepository.getPlayer(playerId).then(function(player) {
            // resolve callback
            res.json({
                player: player.sanitizeForOutput()
            });
        }, function(error) {
            // error callback
            Auxiliary.sendErrorResponse(res, error);
        });
    })
    // PUT to update a player
    .put(function(req, res) {
        var playerData = PlayerRepository.getPlayerData(req.body, req.playerId),
            playerModel = mongoose.model('Player');

        PlayerRepository.validatePlayerData(playerData).then(function() {
            // resolve callback
            PlayerRepository.updatePlayer(playerModel, playerData).then(function(player) {
                // resolve callback
                res.json({
                    player: player.sanitizeForOutput()
                });
            }, function(error) {
                // error callback
                Auxiliary.sendErrorResponse(res, error);
            });
        }, function(error) {
            // error callback
            Auxiliary.sendErrorResponse(res, error);
        });
    })
    .delete(function (req, res){
        Auxiliary.sendErrorResponse(res, {
            text: 'DELETE /player is not implemented yet'
        });
    });

module.exports = router;
