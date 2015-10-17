/* jshint node: true */

'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    Promise = require('bluebird'),
    Jwt = require('jsonwebtoken'), // used to create, sign, and verify tokens
    PlayerRepository = require('../repository/player'),
    ErrorHelper = require('../helper/error'),
    AuthHelper = require('../helper/auth'),
    config = require('../config/config');

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

router.route('/')
    // POST
    .post(function(req, res) {
        var loginData = PlayerRepository.getLoginPlayerData(req.body);
        PlayerRepository.getPlayerByUsernameAndPassword(loginData.username, loginData.password).then(function(player) {
            // resolve callback
            res.format({
                json: function() {
                    res.json({
                        token: AuthHelper.createToken(player.username, player.playerId, player.password)
                    });
                }
            });
        }, function() {
            // error callback
            ErrorHelper.sendErrorResponse(res, {
                code: 403,
                text: 'player_login_0001',
                key: 'username and/or password is invalid'
            });
        });
    });

module.exports = router;
