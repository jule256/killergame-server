'use strict';

var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
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

/**
 * handles GET requests to /available/
 *                         /available/limit/<limit-value>
 *                         /available/limit/<limit-value>/offset/<offset-value>
 *                         /available/limit/<limit-value>/offset/<offset-value>/sort/<sort-column>/<sort-direction>
 *
 * @author Julian Mollik <jule@creative-coding.net>
 * @private
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
getList = function(req, res, next) {
    var params = PlayerRepository.getPlayerListData(req);
    PlayerRepository.getPlayers(params, true).then(function(players) {
        // resolve callback
        res.format({
            json: function() {
                res.json({
                    result: players
                });
            }
        });
    }, function(error) {
        // error callback
        ErrorHelper.sendErrorResponse(res, error);
    });
};

// AuthHelper middleware takes care of token verification ------
router.use(AuthHelper.verifyToken);

// actual routes ------

// @todo limit, offset and sort does not work yet because the "join" is done "manually" in the PlayerRepository
//       maybe rework the available-feature using the Player's "active" property instead of a "manual join"

router.route('/available')
    // GETLIST all available players without parameters
    .get(function(req, res, next) {
        getList(req, res, next);
    });

router.route('/available/limit/:limit(\\d+)?')
    // GETLIST all available players with offset parameter
    .get(function(req, res, next) {
        getList(req, res, next);
    });

router.route('/available/limit/:limit(\\d+)/offset/:offset(\\d+)?')
    // GETLIST all available players with offset AND limit parameter
    .get(function(req, res, next) {
        getList(req, res, next);
    });

router.route('/available/limit/:limit(\\d+)/offset/:offset/sort/:column(\\w+)/:direction(\\w+)')
    // GETLIST all available players with offset AND limit AND sort parameter
    .get(function(req, res, next) {
        getList(req, res, next);
    });

module.exports = router;
