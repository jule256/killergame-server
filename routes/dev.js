/* jshint node: true */

'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    Promise = require('bluebird'),
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
    var promise = new Promise();

    if (param === 2) {
        promise.resolve('param was 2');
    }
    else {
        promise.reject('param was not 2');
    }

    return promise;
};

router.route('/')
    // GET
    .get(function(req, res, next) {
        var param = 2;

        aFunction(2).then(function(result) {
            res.format({
                json: function() {
                    res.json({
                        route: 'GET /dev',
                        promise: 'resolved',
                        result: result
                    });
                }
            });
        }, function(result) {
            res.format({
                json: function() {
                    res.json({
                        route: 'GET /dev',
                        promise: 'rejected',
                        result: result
                    });
                }
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

module.exports = router;