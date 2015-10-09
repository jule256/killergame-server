/* jshint node: true */

'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    Promise = require('bluebird'),
    GameReposiory = require('../repository/game'),
    aFunction;

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

aFunction = function(param) {
    return new Promise(function(resolve, reject) {


        if (param === 2) {
            resolve('param was 2');
        }
        else {
            reject('param was not 2');
        }

    });
};

// route middleware to validate :gameId and add it to the req-object
router.param('gameId', function(req, res, next, gameId) {
    // @todo gameId validation
    req.gameId = gameId;
    next();
});

router.route('/')
    // GET
    .get(function(req, res, next) {
        var game1,
            game2;

        GameReposiory.getGame(1444340075724, 'finished', 'spieler 1').then(function(game) {
            // resolve callback
            game1 = game;
            game2 = game.sanitizeForOutput();

            res.json({
                game1: game1,
                game2: game2
            });
        }, function(error) {
            // error callback
            res.json({
                status: 'failed'
            });
        });


    })
    // POST
    .post(function(req, res) {
        res.format({
            json: function() {
                res.json({
                    route: 'POST /dev',
                    payload: req.body
                });
            }
        });
    });

router.route('/:gameId')
    // PUT
    .put(function(req, res) {
        res.format({
            json: function() {
                res.json({
                    route: 'PUT /dev',
                    payload: this.gameId
                });
            }
        });

    });

module.exports = router;