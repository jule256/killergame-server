'use strict';

var express = require('express'),
    path = require('path'),
    cors = require('cors'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'); // for better logging

var db = require('./model/db'), // sets up database connection
    playerModel = require('./model/player'),
    gameModel = require('./model/game');

var routes = require('./routes/index'),
    register = require('./routes/register'),
    player = require('./routes/player'),
    game = require('./routes/game'),
    login = require('./routes/login'),
    ping = require('./routes/ping'),
    dev = require('./routes/dev');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log('error-message', err.message);
        console.log('error', err);

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
    console.log('error:', err.message);
});

// for better logging
// app.use(morgan('dev'));

module.exports = app;
