var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    setError,
    getPlayerData,
    validatePlayerData,
    createPlayer,
    handleError;

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res) {
    var method;
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        method = req.body._method;
        delete req.body._method;
        return method
    }
}));

setError = function(res, errorobj) {
    var errorcode = errorobj.code || 418,
        errortext = errorobj.text || 'unknown error';
    res.status(errorcode);
    res.format({
        json: function() {
            res.json({
                error: errortext
            });
        }
    });

    return;
};

getPlayerData = function(reqBody) {

    console.log('getPlayerData: body:', reqBody);

    return {
        name: reqBody.name,
        email: reqBody.email,
        username: reqBody.username,
        password_1: reqBody.password_1,
        password_2: reqBody.password_2
    };
};

validatePlayerData = function(res, playerData) {

    console.log('playerData', playerData);

    if (typeof playerData.name === 'undefined' ||
        typeof playerData.email === 'undefined'||
        typeof playerData.username === 'undefined' ||
        typeof playerData.password_1 === 'undefined') {

        // @todo better parameter evaluation (entry exists, length, type, ...)
        setError(res, {
            text: 'player "name", "email", "username" and/or "password" not set'
        });
        return false;
    }
    if (playerData.password_1 !== playerData.password_2) {
        setError(res, {
            text: 'passwords do not match'
        });
        return false;
    }
    return true;
};

createPlayer = function(res, playerModel, playerData) {

    playerModel.create(playerData, function (err, player) {

        if (err) {
            console.log('There was a problem adding the information to the database.');
            res.send('There was a problem adding the information to the database.');
        }
        else {
            // Player has been created
            console.log('POST creating new player: ' + player);

            player.passwordx = playerData.password_1;

            player.save(function (err) {
                if (err) {
                    setError(err.toString());
                }

                console.log('password is now ', player.password);

                res.format({
                    json: function() {
                        res.json(player);
                    }
                });

            })
        }
    })
};

router.route('/')
    // GET returns all players
    .get(function(req, res, next) {

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
    })
    // POST a new player
    .post(function(req, res) {

        console.log('POST req.body:', req.body);

        var playerData = getPlayerData(req.body),
            playerModel = mongoose.model('Player'),
            query;

        console.log('playerData', playerData);

        if (!validatePlayerData(res, playerData)) {
            return;
        };

        query = playerModel.where({ username: playerData.username });
        query.findOne(function (err, player) {
            if (err) {
                console.log('There was a problem getting player information from the database.');
                res.send('There was a problem getting player information from the database.');
            }
            if (player) {
                console.log('about to setError');
                setError(res, {
                    text: 'player with username "' + playerData.username + '" already exists'
                });
            }
            else {
                console.log('about to createPlayer', playerData);

                createPlayer(res, playerModel, playerData)
            }
        });

    });

module.exports = router;