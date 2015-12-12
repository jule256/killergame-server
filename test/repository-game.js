'use strict';

process.env.NODE_ENV = 'test';

var mongoose = require('mongoose'), // mongo connection
    expect = require("chai").expect,
    should = require('chai').should(),
    assert = require('chai').assert,
    game = require('../model/game'),
    player = require('../model/player'),
    constants = require('../config/constants'),
    config = require('../config/config'),
    GameRepository = require('../repository/game');

describe('repository/game.js', function() {

    beforeEach(function(done) {
        constants.player1 = 'player1';
        constants.player2 = 'player2';

        done();
    });

    describe('getOrderbyObject() - private', function() {
        it('regular parameters', function() {
            var column = 'player1',
                direction = 'asc';
            expect(GameRepository.getOrderbyObject(column, direction)).to.deep.equal({
                player1: 1
            });

            column = 'player2';
            direction = 'desc';
            expect(GameRepository.getOrderbyObject(column, direction)).to.deep.equal({
                player2: -1
            });

            column = 'created_at';
            direction = 'asc';
            expect(GameRepository.getOrderbyObject(column, direction)).to.deep.equal({
                created_at: 1
            });

            column = 'status';
            direction = 'desc';
            expect(GameRepository.getOrderbyObject(column, direction)).to.deep.equal({
                status: -1
            });
        });
        it('wrong parameters', function() {
            var column = 'abcdef',
                direction = 'up';
            expect(GameRepository.getOrderbyObject()).to.deep.equal({
                created_at: -1
            });
        });
        it('no parameters', function() {
            expect(GameRepository.getOrderbyObject()).to.deep.equal({
                created_at: -1
            });
        });
    });

    describe('getBlacklist()', function() {
        it('contents', function() {
            expect(GameRepository.getBlacklist()).to.deep.equal([
                'created_at',
                '__v',
                '_id'
            ]);
        });
        it('length', function() {
            expect(GameRepository.getBlacklist().length).to.equal(3);
        });
    });

    describe('getBlacklistExcludeString()', function() {
        it('contents', function() {
            expect(GameRepository.getBlacklistExcludeString()).to.equal(
                '-created_at -__v -_id'
            );
        });
    });

    describe('getGame()', function() {
        beforeEach(function(done) {
            var gameModel = mongoose.model('Game'),
                gameDataCreate1 = {
                    player1: 'player-one',
                    player2: 'player-two',
                    status: 'inprogress',
                    gameId: 'NkovQxpxl'
                };

            // reset database before each getGame() test
            mongoose.connection.db.dropDatabase();

            gameModel.create(gameDataCreate1, function (err, game) {
                should.not.exist(err);

                done();
            });
        });
        it('regular parameters', function(done) {
            GameRepository.getGame('NkovQxpxl').then(function(game) {
                // resolve callback

                should.exist(game);
                expect(game.player1).to.equal('player-one');
                expect(game.player2).to.equal('player-two');
                expect(game.status).to.equal('inprogress');
                expect(game.gameId).to.equal('NkovQxpxl');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'findOne() game failed');

                done();
            });
        });
        it('regular parameters with where', function(done) {
            GameRepository.getGame('NkovQxpxl', { status: { '$ne': 'finished' }}).then(function(game) {
                // resolve callback

                should.exist(game);
                expect(game.player1).to.equal('player-one');
                expect(game.player2).to.equal('player-two');
                expect(game.status).to.equal('inprogress');
                expect(game.gameId).to.equal('NkovQxpxl');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'findOne() game failed');

                done();
            });
        });
        it('regular parameters with where and username', function(done) {
            GameRepository.getGame('NkovQxpxl', { status: { '$ne': 'finished' }}, 'player-one').then(function(game) {
                // resolve callback

                should.exist(game);
                expect(game.player1).to.equal('player-one');
                expect(game.player2).to.equal('player-two');
                expect(game.status).to.equal('inprogress');
                expect(game.gameId).to.equal('NkovQxpxl');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'findOne() game failed');

                done();
            });
        });
        it('not existing game id', function(done) {
            GameRepository.getGame('not-existing').then(function(game) {
                // resolve callback

                assert.notOk(true, 'findOne() game failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);

                expect(error.text).to.equal('game with id "not-existing" does not exist');
                expect(error.key).to.equal('game_0001');

                done();
            });
        });
        it('game & username don\'t match', function(done) {
            GameRepository.getGame('NkovQxpxl', {}, 'player-three').then(function(game) {
                // resolve callback

                assert.notOk(true, 'findOne() game failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);

                expect(error.text).to.equal('game does not belong to user player-three');
                expect(error.key).to.equal('game_0002');

                done();
            });
        });
    });

    describe('deleteGame()', function() {
        beforeEach(function(done) {
            var gameModel = mongoose.model('Game'),
                gameDataCreate1 = {
                    player1: 'player-one',
                    player2: 'player-two',
                    status: 'prestart',
                    gameId: 'NkovQxpxl'
                },
                gameDataCreate2 = {
                    player1: 'player-one',
                    player2: 'player-two',
                    status: 'inprogress',
                    gameId: 'du8eLi2xd'
                }

            // reset database before each deleteGame() test
            mongoose.connection.db.dropDatabase();

            gameModel.create(gameDataCreate1, function (err, game) {
                should.not.exist(err);

                gameModel.create(gameDataCreate2, function (err, game) {
                    should.not.exist(err);

                    done();
                });
            });
        });
        it('regular parameters player1', function(done) {
            GameRepository.deleteGame('NkovQxpxl', 'player-one').then(function() {
                // resolve callback

                assert.ok(true, 'findOne() delete game successful');

                done();

            }, function(error) {
                // error callback

                assert.notOk(true, 'findOne() game failed');

                done();
            });
        });
        it('regular parameters player2', function(done) {
            GameRepository.deleteGame('NkovQxpxl', 'player-two').then(function() {
                // resolve callback

                assert.ok(true, 'delete game successful');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'findOne() game failed');

                done();
            });
        });
        it('no username parameter', function(done) {
            GameRepository.deleteGame('NkovQxpxl').then(function() {
                // resolve callback

                assert.notOk(true, 'findOne() game failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);

                expect(error.text).to.equal('cannot delete game of other players');
                expect(error.key).to.equal('game_0018');

                done();
            });
        });
        it('no game id parameter', function(done) {
            GameRepository.deleteGame().then(function() {
                // resolve callback

                assert.notOk(true, 'findOne() game failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);

                expect(error.text).to.equal('no gameId provided');
                expect(error.key).to.equal('game_0020');

                done();
            });
        });
        it('not existing game id', function(done) {
            GameRepository.deleteGame('not-existing').then(function(game) {
                // resolve callback

                assert.notOk(true, 'findOne() game failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);

                expect(error.text).to.equal('game with id "not-existing" does not exist');
                expect(error.key).to.equal('game_0001');

                done();
            });
        });
        it('game & username don\'t match', function(done) {
            GameRepository.deleteGame('NkovQxpxl', 'player-three').then(function(game) {
                // resolve callback

                assert.notOk(true, 'findOne() game failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);

                expect(error.text).to.equal('game does not belong to user player-three');
                expect(error.key).to.equal('game_0002');

                done();
            });
        });
        it('game status', function(done) {
            GameRepository.deleteGame('du8eLi2xd', 'player-one').then(function(game) {
                // resolve callback

                assert.notOk(true, 'findOne() game failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);

                expect(error.text).to.equal('cannot delete game which is not in status "prestart"');
                expect(error.key).to.equal('game_0019');

                done();
            });
        });
    });

    describe('getChallenges()', function() {
        beforeEach(function(done) {
            var gameModel = mongoose.model('Game'),
                gameDataCreate1 = {
                    player1: 'player-one',
                    player2: 'player-two',
                    status: 'ready',
                    gameId: 'NkovQxpxl'
                },
                gameDataCreate2 = {
                    player1: 'player-one',
                    player2: 'player-four',
                    status: 'ready',
                    gameId: '9uhDfLu7S'
                },
                gameDataCreate3 = {
                    player1: 'player-one',
                    player2: 'player-three',
                    status: 'prestart',
                    gameId: 'idjiCe3dX'
                };

            // reset database before each getChallenges() test
            mongoose.connection.db.dropDatabase();

            gameModel.create(gameDataCreate1, function (err, game) {
                should.not.exist(err);

                gameModel.create(gameDataCreate2, function (err, game) {
                    should.not.exist(err);

                    gameModel.create(gameDataCreate3, function (err, game) {
                        should.not.exist(err);

                        done();
                    });
                });
            });
        });
        it('regular parameters: player1 & available=true', function(done) {
            GameRepository.getChallenges('player-one', 'player1', true).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(2);
                expect(games[0].gameId).to.equal('NkovQxpxl');
                expect(games[1].gameId).to.equal('9uhDfLu7S');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('regular parameters: player1 & available=false', function(done) {
            GameRepository.getChallenges('player-one', 'player1', false).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(1);
                expect(games[0].gameId).to.equal('idjiCe3dX');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('regular parameters: player1 & available=undefined', function(done) {
            GameRepository.getChallenges('player-one', 'player1').then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(1);
                expect(games[0].gameId).to.equal('idjiCe3dX');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('regular parameters: player2 & available=true', function(done) {
            GameRepository.getChallenges('player-two', 'player2', true).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(1);
                expect(games[0].gameId).to.equal('NkovQxpxl');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('regular parameters: player2 & available=false', function(done) {
            GameRepository.getChallenges('player-three', 'player2', false).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(1);
                expect(games[0].gameId).to.equal('idjiCe3dX');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('regular parameters: player2 & available=undefined', function(done) {
            GameRepository.getChallenges('player-three', 'player2').then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(1);
                expect(games[0].gameId).to.equal('idjiCe3dX');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('no challenge games: player1 & available=true', function(done) {
            GameRepository.getChallenges('player-five', 'player1', true).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(0);

                done();

            }, function(error) {
                // error callback

                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('no challenge games: player2 & available=true', function(done) {
            GameRepository.getChallenges('player-five', 'player2', true).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(0);

                done();

            }, function(error) {
                // error callback

                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('no challenge games: player1 & available=false', function(done) {
            GameRepository.getChallenges('player-five', 'player1', false).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(0);

                done();

            }, function(error) {
                // error callback

                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('no challenge games: player2 & available=false', function(done) {
            GameRepository.getChallenges('player-five', 'player2', false).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(0);

                done();

            }, function(error) {
                // error callback

                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('wrong playerX parameter', function(done) {
            GameRepository.getChallenges('player-five', 'participant1', true).then(function(games) {
                // resolve callback

                assert.notOk(true, 'find() games failed');

                done();

            }, function(error) {
                // error callback

                assert.ok(true, 'successful');

                done();
            });
        });
        it('wrong playerX parameter', function(done) {
            GameRepository.getChallenges('player-five', 'participant2', true).then(function(games) {
                // resolve callback

                assert.notOk(true, 'find() games failed');

                done();

            }, function(error) {
                // error callback

                assert.ok(true, 'successful');

                done();
            });
        });
    });

    describe('getNewGameData()', function() {
        it('regular parameters', function() {
            var reqBody = {
                player2: 'player-two',
                fieldWidth: 20,
                fieldHeight: 20
            };
            expect(GameRepository.getNewGameData('player-one', reqBody)).to.deep.equal({
                player1: 'player-one',
                player2: 'player-two',
                fieldWidth: 20,
                fieldHeight: 20
            });
        });
        it('without fieldWidth and fieldHeight', function() {
            var reqBody = {
                player2: 'player-two'
            };
            expect(GameRepository.getNewGameData('player-one', reqBody)).to.deep.equal({
                player1: 'player-one',
                player2: 'player-two',
                fieldWidth: config.gameFieldWidth,
                fieldHeight: config.gameFieldHeight
            });
        });
        it('without parameters', function() {
            // @todo: adding the actual expected error-type and -message does not work:
            //        }).to.throw(new TypeError('Cannot read property \'decodedToken\' of undefined'));
            //        and results in AssertionError: expected [Function] to throw
            //       'TypeError: Cannot read property \'decodedToken\' of undefined' but
            //       'TypeError: Cannot read property \'decodedToken\' of undefined' was thrown

            expect(function() {
                GameRepository.getNewGameData();
            }).to.throw();
        });
    });

    describe('validateNewGameData()', function() {
        beforeEach(function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataCreate1 = {
                    name: 'Player One',
                    username: 'player-one',
                    email: 'player-one@example.com',
                    password_1: 'some-secret-password',
                    password_2: 'some-secret-password',
                    score: 5,
                    playerId: 'NkovQxpxl'
                },
                playerDataCreate2 = {
                    name: 'Player Two',
                    username: 'player-two',
                    email: 'player-two@example.com',
                    password_1: 'another-secret-password',
                    password_2: 'another-secret-password',
                    score: 3,
                    playerId: 'Io8sNxWlh'
                };

            // reset database before each getAvailablePlayers() test
            mongoose.connection.db.dropDatabase();

            playerModel.create(playerDataCreate1, function (err, player) {
                should.not.exist(err);
                player.initialize(playerDataCreate1.password_1);
                player.save(function (err) {
                    should.not.exist(err);

                    playerModel.create(playerDataCreate2, function (err, player) {
                        should.not.exist(err);
                        player.initialize(playerDataCreate2.password_1);
                        player.save(function (err) {
                            should.not.exist(err);

                            done();
                        });
                    });
                });
            });
        });

        it('regular parameter', function(done) {
            var newGameData = {
                player1: 'player-one',
                player2: 'player-two'
            };
            GameRepository.validateNewGameData(newGameData).then(function() {
                // resolve callback

                assert.ok(true, 'successful');

                done();

            }, function(error) {
                // error callback

                assert.notOk(true, 'find() failed');

                done();
            });
        });
        it('regular parameter, user not existing', function(done) {
            var newGameData = {
                player1: 'player-three',
                player2: 'player-two'
            };
            GameRepository.validateNewGameData(newGameData).then(function() {
                // resolve callback

                assert.notOk(true, 'find() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('player not found in database');
                expect(error.key).to.equal('game_0007');

                done();
            });
        });
        it('same username', function(done) {
            var newGameData = {
                player1: 'player-four',
                player2: 'player-four'
            };
            GameRepository.validateNewGameData(newGameData).then(function() {
                // resolve callback

                assert.notOk(true, 'find() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('player1 and player2 can\'t be the same');
                expect(error.key).to.equal('game_0009');

                done();
            });
        });
        it('no usernames', function(done) {
            GameRepository.validateNewGameData().then(function() {
                // resolve callback

                assert.notOk(true, 'find() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('player1 and/or player2 username not set');
                expect(error.key).to.equal('game_0008');

                done();
            });
        });
        it('only one username', function(done) {
            var newGameData = {
                player1: 'player-four'
            };
            GameRepository.validateNewGameData(newGameData).then(function() {
                // resolve callback

                assert.notOk(true, 'find() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('player1 and/or player2 username not set');
                expect(error.key).to.equal('game_0008');

                done();
            });
        });
        /**/
    });

    describe('createGame()', function() {
        it('regular parameter', function(done) {
            var gameModel = mongoose.model('Game'),
                newGameData = {
                    player1: 'player-one',
                    player2: 'player-two'
                };

            GameRepository.createGame(gameModel, newGameData).then(function(game) {
                // resolve callback

                assert.ok(true, 'successful');

                done();
            }, function(error) {
                // error callback

                assert.notOk(true, 'save() failed');

                done();
            });
        });
    });

    describe('getMoveData()', function() {
        it('regular parameters', function() {
            var gameId = '12GhdiZ',
                reqBody = {
                    x: 7,
                    y: 8
                };
            expect(GameRepository.getMoveData(reqBody, gameId, 'player-one')).to.deep.equal({
                x: 7,
                y: 8,
                username: 'player-one',
                gameId: '12GhdiZ'
            });
        });
        it('string parameters', function() {
            var gameId = '12GhdiZ',
                reqBody = {
                    x: '7',
                    y: '8'
                };
            expect(GameRepository.getMoveData(reqBody, gameId, 'player-one')).to.deep.equal({
                x: 7,
                y: 8,
                username: 'player-one',
                gameId: '12GhdiZ'
            });
        });
        it('without parameters', function() {
            // @todo: adding the actual expected error-type and -message does not work:
            //        }).to.throw(new TypeError('Cannot read property \'decodedToken\' of undefined'));
            //        and results in AssertionError: expected [Function] to throw
            //       'TypeError: Cannot read property \'decodedToken\' of undefined' but
            //       'TypeError: Cannot read property \'decodedToken\' of undefined' was thrown

            expect(function() {
                GameRepository.getMoveData();
            }).to.throw();
        });
        it('no x coordinate in reqBody parameter', function() {
            var gameId = '12GhdiZ',
                reqBody = {
                    y: 8
                };
            expect(GameRepository.getMoveData(reqBody, gameId, 'player-one')).to.deep.equal({
                x: NaN,
                y: 8,
                username: 'player-one',
                gameId: '12GhdiZ'
            });
        });
        it('no y coordinate in reqBody parameter', function() {
            var gameId = '12GhdiZ',
                reqBody = {
                    x: 7
                };
            expect(GameRepository.getMoveData(reqBody, gameId, 'player-one')).to.deep.equal({
                x: 7,
                y: NaN,
                username: 'player-one',
                gameId: '12GhdiZ'
            });
        });
    });

    describe('getGames()', function() {
        beforeEach(function(done) {
            var gameModel = mongoose.model('Game'),
                gameDataCreate1 = {
                    player1: 'player-one',
                    player2: 'player-two',
                    status: 'inprogress',
                    gameId: 'NkovQxpxl'
                },
                gameDataCreate2 = {
                    player1: 'player-one',
                    player2: 'player-four',
                    status: 'inprogress',
                    gameId: '9uhDfLu7S'
                },
                gameDataCreate3 = {
                    player1: 'player-one',
                    player2: 'player-three',
                    status: 'inprogress',
                    gameId: 'idjiCe3dX'
                },
                gameDataCreate4 = {
                    player1: 'player-one',
                    player2: 'player-five',
                    status: 'inprogress',
                    gameId: 'hepO83I9x'
                };

            // reset database before each getGames() test
            mongoose.connection.db.dropDatabase();

            gameModel.create(gameDataCreate1, function (err, game) {
                should.not.exist(err);

                gameModel.create(gameDataCreate2, function (err, game) {
                    should.not.exist(err);

                    gameModel.create(gameDataCreate3, function (err, game) {
                        should.not.exist(err);

                        gameModel.create(gameDataCreate4, function (err, game) {
                            should.not.exist(err);

                            done();
                        });
                    });
                });
            });
        });
        it('regular parameters', function(done) {
            var gameParams = {
                    column: 'status',
                    direction: 'asc'
                },
                gameWhere = {
                    status: 'inprogress'
                };


            GameRepository.getGames(gameParams, gameWhere).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(4);
                expect(games[0].gameId).to.equal('NkovQxpxl');
                expect(games[1].gameId).to.equal('9uhDfLu7S');
                expect(games[2].gameId).to.equal('idjiCe3dX');
                expect(games[3].gameId).to.equal('hepO83I9x');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('limit', function(done) {
            var gameParams = {
                    limit: 2,
                    column: 'status',
                    direction: 'asc'
                },
                gameWhere = {
                    status: 'inprogress'
                };


            GameRepository.getGames(gameParams, gameWhere).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(2);
                expect(games[0].gameId).to.equal('NkovQxpxl');
                expect(games[1].gameId).to.equal('9uhDfLu7S');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('offset', function(done) {
            var gameParams = {
                    offset: 1,
                    column: 'status',
                    direction: 'asc'
                },
                gameWhere = {
                    status: 'inprogress'
                };


            GameRepository.getGames(gameParams, gameWhere).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(3);
                expect(games[0].gameId).to.equal('9uhDfLu7S');
                expect(games[1].gameId).to.equal('idjiCe3dX');
                expect(games[2].gameId).to.equal('hepO83I9x');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('direction', function(done) {
            var gameParams = {
                    column: 'player2',
                    direction: 'desc'
                },
                gameWhere = {
                    status: 'inprogress'
                };


            GameRepository.getGames(gameParams, gameWhere).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(4);
                expect(games[0].gameId).to.equal('NkovQxpxl');
                expect(games[1].gameId).to.equal('idjiCe3dX');
                expect(games[2].gameId).to.equal('9uhDfLu7S');
                expect(games[3].gameId).to.equal('hepO83I9x');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() games failed');

                done();
            });
        });
        it('where', function(done) {
            var gameParams = {
                    column: 'status',
                    direction: 'asc'
                },
                gameWhere = {
                    status: 'ready'
                };


            GameRepository.getGames(gameParams, gameWhere).then(function(games) {
                // resolve callback

                should.exist(games);
                assert.isArray(games);
                expect(games.length).to.equal(0);

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() games failed');

                done();
            });
        });
    });
});
