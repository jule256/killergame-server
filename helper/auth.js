'use strict';

var Jwt = require('jsonwebtoken'),
    Md5 = require('md5'),
    config = require('../config/config'),
    ErrorHelper = require('./error'),
    AuthHelper;

AuthHelper = {
    /**
     * extracts the token (from post, get, header) and verifies it
     * if the token is valid, the given next() function will be executed
     * if the token is not valid, an error will be returned to the user
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {object} req
     * @param {object} res
     * @param {function} next
     */
    verifyToken: function(req, res, next) {
        // extract token from body, query or header
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        if (token) {
            // check token (validity, expiration date)
            Jwt.verify(token, config.tokenHash, function(err, decoded) {
                if (err) {
                    ErrorHelper.sendErrorResponse(res, {
                        code: 403,
                        text: 'token authentication failed',
                        key: 'player_auth_0001'
                    });
                }
                else {
                    // token is valid, go to next middleware
                    req.decoded = decoded;
                    next();
                }
            });
        }
        else {
            // no token provided
            ErrorHelper.sendErrorResponse(res, {
                code: 403,
                text: 'no token provided',
                key: 'player_auth_0002'
            });
        }
    },
    /**
     * takes the given username&password and combines it with the tokenhash to a token.
     * note that the password is stored hashed in the token
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param {String} username
     * @param {String} password
     */
    createToken: function(username, password) {
        return Jwt.sign({
            username: username,
            password: Md5(password + config.passwordHash)
        }, config.tokenHash, {
            expiresIn: 86400 // 24 hours
        });
    }
};

module.exports = AuthHelper;
