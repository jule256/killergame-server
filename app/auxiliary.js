'use strict';

var mongoose = require('mongoose'), // mongo connection
    Auxiliary;

Auxiliary = {
    /**
     * adds an error to the given res object and sets the response
     * errorObj: {
     *     errorCode: <the response status code>, default 418
     *     errorText: <an informative error text>
     *     errorKey: <a error key constant>
     * }
     *
     * @author Julian Mollik <jule@creative-coding.net>
     * @public
     * @param res
     * @param {object} errorObj
     */
    sendErrorResponse: function(res, errorObj) {
        var errorCode = errorObj.code || 418,
            errorText = errorObj.text || 'unknown error',
            errorKey = errorObj.key || '?';
        res.status(errorCode);
        res.format({
            json: function() {
                res.json({
                    error: errorText,
                    key: errorKey
                });
            }
        });
    }
};

module.exports = Auxiliary;









