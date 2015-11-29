'use strict';

var express = require('express'),
    cors = require('cors'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),

    db = require('./helper/db'), // sets up database connection
    playerModel = require('./model/player'),
    gameModel = require('./model/game'),

    routes = require('./routes/index'),
    register = require('./routes/register'),
    player = require('./routes/player'),
    game = require('./routes/game'),
    login = require('./routes/login'),
    ping = require('./routes/ping'),
    dev = require('./routes/dev'),

    app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', routes);
app.use('/register', register);
app.use('/player', player);
app.use('/game', game);
app.use('/login', login);
app.use('/ping', ping);
app.use('/dev', dev);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace in "development" environment
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);

        console.error('error-message', err.message);
        console.error('error', err);

        res.format({
            json: function() {
                res.json({
                    'error-message': err.message,
                    error: err
                });
            }
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.error('error:', err.message);
});

module.exports = app;
