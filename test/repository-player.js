'use strict';

process.env.NODE_ENV = 'test';

var mongoose = require('mongoose'), // mongo connection
    Md5 = require('md5'),
    player = require('../model/player'),
    game = require('../model/game'),
    expect = require('chai').expect,
    should = require('chai').should(),
    assert = require('chai').assert,
    config = require('../config/config'),
    PlayerRepository = require('../repository/player');

describe('repository/player.js', function() {

    beforeEach(function(done) {
        config.playerListLimit = 5;
        config.playerListOffset = 0;
        config.playerListColumn = 'score';
        config.playerListDirection = 'desc';
        config.passwordHash = 'oi82s0923&safgh+e.!¨';

        done();
    });

    describe('getOrderbyObject() - private', function() {
        it('regular parameters', function() {
            var column = 'score',
                direction = 'asc';
            expect(PlayerRepository.getOrderbyObject(column, direction)).to.deep.equal({
                score: 1
            });

            column = 'name';
            direction = 'desc';
            expect(PlayerRepository.getOrderbyObject(column, direction)).to.deep.equal({
                name: -1
            });

            column = 'created_at';
            direction = 'asc';
            expect(PlayerRepository.getOrderbyObject(column, direction)).to.deep.equal({
                created_at: 1
            });

            column = 'username';
            direction = 'desc';
            expect(PlayerRepository.getOrderbyObject(column, direction)).to.deep.equal({
                username: -1
            });
        });
        it('wrong parameters', function() {
            var column = 'abcdef',
                direction = 'up';
            expect(PlayerRepository.getOrderbyObject()).to.deep.equal({
                score: -1
            });
        });
        it('no parameters', function() {
            expect(PlayerRepository.getOrderbyObject()).to.deep.equal({
                score: -1
            });
        });
    });

    describe('getAvailablePlayers() - private', function() {
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
                },
                playerDataCreate3 = {
                    name: 'Player Three',
                    username: 'player-three',
                    email: 'player-three@example.com',
                    password_1: 'third-secret-password',
                    password_2: 'third-secret-password',
                    score: 1,
                    playerId: 'izh75D0oG'
                },
                gameModel = mongoose.model('Game'),
                gameDataCreate1 = {
                    "player1": "player-one",
                    "player2": "player-two",
                    "status": "inprogress"
                },
                gameDataCreate2 = {
                    "player1": "player-five",
                    "player2": "player-two",
                    "status": "inprogress"
                },
                gameDataCreate3 = {
                    "player1": "player-one",
                    "player2": "player-three",
                    "status": "finished"
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

                            playerModel.create(playerDataCreate3, function (err, player) {
                                should.not.exist(err);
                                player.initialize(playerDataCreate3.password_1);
                                player.save(function (err) {
                                    should.not.exist(err);

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
                            });
                        });
                    });
                });
            });
        });
        it('regular parameters', function(done) {
            var params = {
                    limit: 10,
                    offset: 0
                },
                sortObj = {
                    score: -1
                };

            PlayerRepository.getAvailablePlayers(params, sortObj, '-created_at -__v -_id').then(function(players) {
                // resolve callback

                assert.isArray(players);
                expect(players.length).to.equal(1);
                expect(players[0].username).to.equal('player-three');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() players failed');

                done();
            });
        });
        it('with username', function(done) {
            var params = {
                    limit: 10,
                    offset: 0
                },
                sortObj = {
                    score: -1
                };

            PlayerRepository.getAvailablePlayers(params, sortObj, '-created_at -__v -_id', 'player-three')
                .then(function(players) {
                    // resolve callback

                    assert.isArray(players);
                    expect(players.length).to.equal(0);

                    done();

                }, function(error) {
                    // error callback
                    assert.notOk(true, 'find() players failed');

                    done();
                });
        });
        it('with username 2', function(done) {
            var params = {
                    limit: 10,
                    offset: 0
                },
                sortObj = {
                    score: -1
                };

            PlayerRepository.getAvailablePlayers(params, sortObj, '-created_at -__v -_id', 'player-one')
                .then(function(players) {
                    // resolve callback

                    assert.isArray(players);
                    expect(players.length).to.equal(1);
                    expect(players[0].username).to.equal('player-three');

                    done();

                }, function(error) {
                    // error callback
                    assert.notOk(true, 'find() players failed');

                    done();
                });
        });
    });

    describe('isPlayerInGame() - private', function() {
        it('regular parameters', function() {
            var games = [
                {
                    player1: 'player_1',
                    player2: 'player_2'
                },
                {
                    player1: 'player_2',
                    player2: 'player_3'
                },
                {
                    player1: 'player_4',
                    player2: 'player_3'
                },
                {
                    player1: 'player_1',
                    player2: 'player_4'
                }
            ];

            expect(PlayerRepository.isPlayerInGame('player_1', games)).to.be.true;
            expect(PlayerRepository.isPlayerInGame('player_2', games)).to.be.true;
            expect(PlayerRepository.isPlayerInGame('player_3', games)).to.be.true;
            expect(PlayerRepository.isPlayerInGame('player_4', games)).to.be.true;
            expect(PlayerRepository.isPlayerInGame('player_5', games)).to.be.false;
        });
        it('missing parameter', function() {
            expect(PlayerRepository.isPlayerInGame('player_1')).to.be.false;
            expect(PlayerRepository.isPlayerInGame()).to.be.false;
        });
    });

    describe('getAllPlayers() - private', function() {
        beforeEach(function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataCreate1 = {
                    name: 'Player One',
                    email: 'player-one@example.com',
                    password_1: 'some-secret-password',
                    password_2: 'some-secret-password',
                    score: 5,
                    playerId: 'NkovQxpxl'
                },
                playerDataCreate2 = {
                    name: 'Player Two',
                    email: 'player-two@example.com',
                    password_1: 'another-secret-password',
                    password_2: 'another-secret-password',
                    score: 3,
                    playerId: 'Io8sNxWlh'
                },
                playerDataCreate3 = {
                    name: 'Player Three',
                    email: 'player-three@example.com',
                    password_1: 'third-secret-password',
                    password_2: 'third-secret-password',
                    score: 1,
                    playerId: 'izh75D0oG'
                };

            // reset database before each getAllPlayers() test
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

                            playerModel.create(playerDataCreate3, function (err, player) {
                                should.not.exist(err);
                                player.initialize(playerDataCreate3.password_1);
                                player.save(function (err) {
                                    should.not.exist(err);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
        it('regular parameters', function(done) {
            var params = {
                    limit: 10,
                    offset: 0
                },
                sortObj = {
                    score: -1
                };

            PlayerRepository.getAllPlayers(params, sortObj, '-created_at -__v -_id').then(function(players) {
                // resolve callback

                assert.isArray(players);
                expect(players.length).to.equal(3);
                expect(players[0].score).to.equal(5);
                expect(players[1].score).to.equal(3);
                expect(players[2].score).to.equal(1);
                expect(players[0].created_at).to.be.undefined;
                expect(players[0].__v).to.be.undefined;
                expect(players[0]._id).to.be.undefined;

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() players failed');

                done();
            });
        });
        it('offset', function(done) {
            var params = {
                    limit: 10,
                    offset: 1
                },
                sortObj = {
                    score: -1
                };

            PlayerRepository.getAllPlayers(params, sortObj, '-created_at -__v -_id').then(function(players) {
                // resolve callback

                assert.isArray(players);
                expect(players.length).to.equal(2);
                expect(players[0].score).to.equal(3);
                expect(players[1].score).to.equal(1);

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() players failed');

                done();
            });
        });
        it('limit', function(done) {
            var params = {
                    limit: 2,
                    offset: 0
                },
                sortObj = {
                    score: -1
                };

            PlayerRepository.getAllPlayers(params, sortObj, '-created_at -__v -_id').then(function(players) {
                // resolve callback

                assert.isArray(players);
                expect(players.length).to.equal(2);
                expect(players[0].score).to.equal(5);
                expect(players[1].score).to.equal(3);

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() players failed');

                done();
            });
        });
        it('sort by score', function(done) {
            var params = {
                    limit: 10,
                    offset: 0
                },
                sortObj = {
                    score: 1
                };

            PlayerRepository.getAllPlayers(params, sortObj, '-created_at -__v -_id').then(function(players) {
                // resolve callback

                assert.isArray(players);
                expect(players.length).to.equal(3);
                expect(players[0].score).to.equal(1);
                expect(players[1].score).to.equal(3);
                expect(players[2].score).to.equal(5);

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() players failed');

                done();
            });
        });
        it('sort by name', function(done) {
            var params = {
                    limit: 10,
                    offset: 0
                },
                sortObj = {
                    name: 1
                };

            PlayerRepository.getAllPlayers(params, sortObj, '-created_at -__v -_id').then(function(players) {
                // resolve callback

                assert.isArray(players);
                expect(players.length).to.equal(3);
                expect(players[0].name).to.equal('Player One');
                expect(players[1].name).to.equal('Player Three');
                expect(players[2].name).to.equal('Player Two');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() players failed');

                done();
            });
        });
        it('no parameters', function(done) {
            PlayerRepository.getAllPlayers().then(function(players) {
                // resolve callback

                assert.notOk(true, 'find() players successful even though it should fail');

                done();

            }, function(error) {
                // error callback
                should.exist(error);

                done();
            });
        });
    });

    //////

    describe('getPlayers()', function() {
        beforeEach(function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataCreate1 = {
                    name: 'Player One',
                    email: 'player-one@example.com',
                    password_1: 'some-secret-password',
                    password_2: 'some-secret-password',
                    score: 5,
                    playerId: 'NkovQxpxl'
                },
                playerDataCreate2 = {
                    name: 'Player Two',
                    email: 'player-two@example.com',
                    password_1: 'another-secret-password',
                    password_2: 'another-secret-password',
                    score: 3,
                    playerId: 'Io8sNxWlh'
                },
                playerDataCreate3 = {
                    name: 'Player Three',
                    email: 'player-three@example.com',
                    password_1: 'third-secret-password',
                    password_2: 'third-secret-password',
                    score: 1,
                    playerId: 'izh75D0oG'
                };

            // reset database before each getPlayers() test
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

                            playerModel.create(playerDataCreate3, function (err, player) {
                                should.not.exist(err);
                                player.initialize(playerDataCreate3.password_1);
                                player.save(function (err) {
                                    should.not.exist(err);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
        it('regular parameters, available false', function(done) {
            var params = {
                    limit: 10,
                    offset: 0,
                    column: 'score',
                    direction: 'desc'
                };

            PlayerRepository.getPlayers(params, false).then(function(players) {
                // resolve callback

                assert.isArray(players);
                expect(players.length).to.equal(3);
                expect(players[0].score).to.equal(5);
                expect(players[1].score).to.equal(3);
                expect(players[2].score).to.equal(1);
                expect(players[0].created_at).to.be.undefined;
                expect(players[0].__v).to.be.undefined;
                expect(players[0]._id).to.be.undefined;

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() players failed');

                done();
            });
        });
        it('offset, available false', function(done) {
            var params = {
                limit: 10,
                offset: 1,
                column: 'score',
                direction: 'desc'
            };

            PlayerRepository.getPlayers(params, false).then(function(players) {
                // resolve callback

                assert.isArray(players);
                expect(players.length).to.equal(2);
                expect(players[0].score).to.equal(3);
                expect(players[1].score).to.equal(1);

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() players failed');

                done();
            });
        });
        it('limit, available false', function(done) {
            var params = {
                limit: 2,
                offset: 0,
                column: 'score',
                direction: 'desc'
            };

            PlayerRepository.getPlayers(params, false).then(function(players) {
                // resolve callback

                assert.isArray(players);
                expect(players.length).to.equal(2);
                expect(players[0].score).to.equal(5);
                expect(players[1].score).to.equal(3);

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() players failed');

                done();
            });
        });
        it('sort by score, available false', function(done) {
            var params = {
                limit: 10,
                offset: 0,
                column: 'score',
                direction: 'asc'
            };

            PlayerRepository.getPlayers(params, false).then(function(players) {
                // resolve callback

                assert.isArray(players);
                expect(players.length).to.equal(3);
                expect(players[0].score).to.equal(1);
                expect(players[1].score).to.equal(3);
                expect(players[2].score).to.equal(5);

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() players failed');

                done();
            });
        });
        it('sort by name', function(done) {
            var params = {
                limit: 10,
                offset: 0,
                column: 'name',
                direction: 'asc'
            };

            PlayerRepository.getPlayers(params, false).then(function(players) {
                // resolve callback

                assert.isArray(players);
                expect(players.length).to.equal(3);
                expect(players[0].name).to.equal('Player One');
                expect(players[1].name).to.equal('Player Three');
                expect(players[2].name).to.equal('Player Two');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'find() players failed');

                done();
            });
        });
        it('no parameters', function(done) {
            PlayerRepository.getPlayers().then(function(players) {
                // resolve callback

                assert.notOk(true, 'find() players successful even though it should fail');

                done();

            }, function(error) {
                // error callback
                should.exist(error);

                done();
            });
        });

        // tests with "available true" are covered by the getAvailablePlayers() tests
    });

    //////

    describe('getBlacklist()', function() {
        it('contents', function() {
            expect(PlayerRepository.getBlacklist()).to.deep.equal([
                'created_at',
                '__v',
                '_id'
            ]);
        });
        it('length', function() {
            expect(PlayerRepository.getBlacklist().length).to.equal(3);
        });
    });

    describe('getBlacklistExcludeString()', function() {
        it('contents', function() {
            expect(PlayerRepository.getBlacklistExcludeString()).to.equal(
                '-created_at -__v -_id'
            );
        });
    });

    describe('getPlayerByPlayerId()', function() {
        beforeEach(function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataCreate = {
                    name: 'Player One',
                    email: 'player-one@example.com',
                    password_1: 'some-secret-password',
                    password_2: 'some-secret-password',
                    score: 5,
                    playerId: 'NkovQxpxl'
                };

            // reset database before each getPlayerByPlayerId() test
            mongoose.connection.db.dropDatabase();

            playerModel.create(playerDataCreate, function (err, player) {
                should.not.exist(err);

                done();
            });
        });
        it('regular parameter', function(done) {
            PlayerRepository.getPlayerByPlayerId('NkovQxpxl').then(function(player) {
                // resolve callback

                should.exist(player);
                expect(player.name).to.equal('Player One');
                expect(player.score).to.equal(5);
                expect(player.email).to.equal('player-one@example.com');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'getPlayerByPlayerId() failed');

                done();
            });
        });
        it('not existing playerId', function(done) {
            PlayerRepository.getPlayerByPlayerId('not-existing').then(function(player) {
                // resolve callback

                assert.notOk(true, 'getPlayerByPlayerId() failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);
                expect(error.text).to.equal('player with id "not-existing" does not exist');
                expect(error.key).to.equal('player_0001');

                done();
            });
        });
        it('no playerId', function(done) {
            PlayerRepository.getPlayerByPlayerId().then(function(player) {
                // resolve callback

                assert.notOk(true, 'getPlayerByPlayerId() failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);
                expect(error.text).to.equal('player with id "undefined" does not exist');
                expect(error.key).to.equal('player_0001');

                done();
            });
        });
    });

    describe('getPlayerByUsername()', function() {
        beforeEach(function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataCreate = {
                    name: 'Player One',
                    username: 'player-one',
                    email: 'player-one@example.com',
                    password_1: 'some-secret-password',
                    password_2: 'some-secret-password',
                    score: 5,
                    playerId: 'NkovQxpxl'
                };

            // reset database before each getPlayerByUsername() test
            mongoose.connection.db.dropDatabase();

            playerModel.create(playerDataCreate, function (err, player) {
                should.not.exist(err);

                done();
            });
        });
        it('regular parameter', function(done) {
            PlayerRepository.getPlayerByUsername('player-one').then(function(player) {
                // resolve callback

                should.exist(player);
                expect(player.name).to.equal('Player One');
                expect(player.username).to.equal('player-one');
                expect(player.score).to.equal(5);
                expect(player.email).to.equal('player-one@example.com');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'getPlayerByUsername() failed');

                done();
            });
        });
        it('not existing username', function(done) {
            PlayerRepository.getPlayerByUsername('not-existing').then(function(player) {
                // resolve callback

                assert.notOk(true, 'getPlayerByUsername() failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);
                expect(error.text).to.equal('player with username "not-existing" does not exist');
                expect(error.key).to.equal('player_0002');

                done();
            });
        });
        it('no username', function(done) {
            PlayerRepository.getPlayerByUsername().then(function(player) {
                // resolve callback

                assert.notOk(true, 'getPlayerByUsername() failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);
                expect(error.text).to.equal('player with username "undefined" does not exist');
                expect(error.key).to.equal('player_0002');

                done();
            });
        });
    });

    describe('getPlayerByUsernameAndPassword()', function() {
        beforeEach(function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataCreate = {
                    name: 'Player One',
                    username: 'player-one',
                    email: 'player-one@example.com',
                    password_1: 'secret-password',
                    password_2: 'secret-password',
                    score: 5,
                    playerId: 'NkovQxpxl'
                };

            // reset database before each getPlayerByUsernameAndPassword() test
            mongoose.connection.db.dropDatabase();

            playerModel.create(playerDataCreate, function (err, player) {
                should.not.exist(err);

                player.initialize(playerDataCreate.password_1);
                player.save(function (err) {
                    should.not.exist(err);

                    done();
                });
            });
        });
        it('regular parameters', function(done) {
            PlayerRepository.getPlayerByUsernameAndPassword('player-one', 'secret-password').then(function(player) {
                // resolve callback

                should.exist(player);
                expect(player.name).to.equal('Player One');
                expect(player.username).to.equal('player-one');
                expect(player.score).to.equal(5);
                expect(player.email).to.equal('player-one@example.com');

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'getPlayerByUsernameAndPassword() failed');

                done();
            });
        });
        it('not existing username', function(done) {
            PlayerRepository.getPlayerByUsernameAndPassword('not-existing', 'secret-password').then(function(player) {
                // resolve callback

                assert.notOk(true, 'getPlayerByUsernameAndPassword() failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);
                expect(error.text).to.equal('player with the provided credentials does not exist');
                expect(error.key).to.equal('player_0003');

                done();
            });
        });
        it('not existing password', function(done) {
            PlayerRepository.getPlayerByUsernameAndPassword('player-one', 'wrong-password').then(function(player) {
                // resolve callback

                assert.notOk(true, 'getPlayerByUsernameAndPassword() failed');

                done();

            }, function(error) {
                // error callback
                should.exist(error);
                expect(error.text).to.equal('player with the provided credentials does not exist');
                expect(error.key).to.equal('player_0003');

                done();
            });
        });
        it('no parameters', function(done) {
            PlayerRepository.getPlayerByUsernameAndPassword().then(function(player) {
                // resolve callback

                assert.notOk(true, 'getPlayerByUsernameAndPassword() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('player with the provided credentials does not exist');
                expect(error.key).to.equal('player_0003');

                done();
            });
        });
    });

    describe('getNewPlayerData()', function() {
        it('regular parameters', function() {
            var reqBody = {
                name: 'Player One',
                email: 'player1@example.com',
                username: 'player_1',
                password_1: 'secret-password',
                password_2: 'secret-password'
            };
            expect(PlayerRepository.getNewPlayerData(reqBody)).to.deep.equal({
                name: 'Player One',
                email: 'player1@example.com',
                username: 'player_1',
                password_1: 'secret-password',
                password_2: 'secret-password'
            });
        });
    });

    describe('getPlayerData()', function() {
        it('regular parameters', function() {
            var reqBody = {
                name: 'Player One',
                email: 'player1@example.com',
                password_1: 'secret-password',
                password_2: 'secret-password'
            };
            expect(PlayerRepository.getPlayerData(reqBody, 'NkovQxpxl')).to.deep.equal({
                name: 'Player One',
                email: 'player1@example.com',
                password_1: 'secret-password',
                password_2: 'secret-password',
                playerId: 'NkovQxpxl'
            });
        });
    });

    describe('getLoginPlayerData()', function() {
        it('regular parameters', function() {
            var reqBody = {
                username: 'player_1',
                password: 'secret-password'
            };
            expect(PlayerRepository.getLoginPlayerData(reqBody)).to.deep.equal({
                username: 'player_1',
                password: 'secret-password'
            });
        });
    });

    describe('validateNewPlayerData()', function() {
        beforeEach(function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataCreate = {
                    name: 'Player One',
                    username: 'player-one',
                    email: 'player-one@example.com',
                    password_1: 'secret-password',
                    password_2: 'secret-password',
                    score: 5,
                    playerId: 'NkovQxpxl'
                };

            // reset database before each validateNewPlayerData() test
            mongoose.connection.db.dropDatabase();

            playerModel.create(playerDataCreate, function (err, player) {
                should.not.exist(err);

                done();
            });
        });
        it('regular parameter', function(done) {
            var playerData = {
                name: 'Player Two',
                email: 'player-two@example.com',
                username: 'player-two',
                password_1: 'classified-password',
                password_2: 'classified-password'
            };
            PlayerRepository.validateNewPlayerData(playerData).then(function() {
                // resolve callback

                assert.ok(true, 'validateNewPlayerData() successful');

                done();

            }, function(error) {
                // error callback

                assert.notOk(true, 'validateNewPlayerData() failed');

                done();
            });
        });
        it('missing name parameter', function(done) {
            var playerData = {
                email: 'player-two@example.com',
                username: 'player-two',
                password_1: 'classified-password',
                password_2: 'classified-password'
            };
            PlayerRepository.validateNewPlayerData(playerData).then(function() {
                // resolve callback

                assert.notOk(true, 'validateNewPlayerData() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('not all necessary data is set');
                expect(error.key).to.equal('player_register_0001');

                done();
            });
        });
        it('missing email parameter', function(done) {
            var playerData = {
                name: 'Player Two',
                username: 'player-two',
                password_1: 'classified-password',
                password_2: 'classified-password'
            };
            PlayerRepository.validateNewPlayerData(playerData).then(function() {
                // resolve callback

                assert.notOk(true, 'validateNewPlayerData() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('not all necessary data is set');
                expect(error.key).to.equal('player_register_0001');

                done();
            });
        });
        it('missing username parameter', function(done) {
            var playerData = {
                name: 'Player Two',
                email: 'player-two@example.com',
                password_1: 'classified-password',
                password_2: 'classified-password'
            };
            PlayerRepository.validateNewPlayerData(playerData).then(function() {
                // resolve callback

                assert.notOk(true, 'validateNewPlayerData() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('not all necessary data is set');
                expect(error.key).to.equal('player_register_0001');

                done();
            });
        });
        it('missing password parameter', function(done) {
            var playerData = {
                name: 'Player Two',
                username: 'player-two',
                email: 'player-two@example.com',
            };
            PlayerRepository.validateNewPlayerData(playerData).then(function() {
                // resolve callback

                assert.notOk(true, 'validateNewPlayerData() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('not all necessary data is set');
                expect(error.key).to.equal('player_register_0001');

                done();
            });
        });
        it('passwords do not match', function(done) {
            var playerData = {
                name: 'Player Two',
                username: 'player-two',
                email: 'player-two@example.com',
                password_1: 'classified-password-x',
                password_2: 'classified-password'
            };
            PlayerRepository.validateNewPlayerData(playerData).then(function() {
                // resolve callback

                assert.notOk(true, 'validateNewPlayerData() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('passwords do not match');
                expect(error.key).to.equal('player_register_0002');

                done();
            });
        });
        it('username is already in database', function(done) {
            var playerData = {
                name: 'Player Two',
                username: 'player-one',
                email: 'player-two@example.com',
                password_1: 'classified-password',
                password_2: 'classified-password'
            };
            PlayerRepository.validateNewPlayerData(playerData).then(function() {
                // resolve callback

                assert.notOk(true, 'validateNewPlayerData() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('player already exists in database');
                expect(error.key).to.equal('player_register_0003');

                done();
            });
        });
    });

    describe('validatePlayerData()', function() {
        beforeEach(function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataCreate1 = {
                    name: 'Player One',
                    username: 'player-one',
                    email: 'player-one@example.com',
                    password_1: 'secret-password',
                    password_2: 'secret-password',
                    score: 5,
                    playerId: 'NkovQxpxl'
                },
                playerDataCreate2 = {
                    name: 'Player Two',
                    username: 'player-two',
                    email: 'player-two@example.com',
                    password_1: 'another-secred-password',
                    password_2: 'another-secret-password',
                    score: 3,
                    playerId: 'uidLt2pJs'
                };

            // reset database before each validatePlayerData() test
            mongoose.connection.db.dropDatabase();

            playerModel.create(playerDataCreate1, function (err, player) {
                should.not.exist(err);

                playerModel.create(playerDataCreate2, function (err, player) {
                    should.not.exist(err);

                    done();
                });
            });
        });
        it('regular parameter', function(done) {
            var playerData = {
                name: 'Player One Updated',
                email: 'player-one@example-updated.com',
                playerId: 'NkovQxpxl'
            };
            PlayerRepository.validatePlayerData(playerData).then(function() {
                // resolve callback

                assert.ok(true, 'validatePlayerData() successful');

                done();

            }, function(error) {
                // error callback

                assert.notOk(true, 'validatePlayerData() failed');

                done();
            });
        });
        it('regular parameter with password', function(done) {
            var playerData = {
                name: 'Player One Updated',
                email: 'player-one@example-updated.com',
                password_1: 'new-secred-password',
                password_2: 'new-secred-password',
                playerId: 'NkovQxpxl'
            };
            PlayerRepository.validatePlayerData(playerData).then(function() {
                // resolve callback

                assert.ok(true, 'validatePlayerData() successful');

                done();

            }, function(error) {
                // error callback

                assert.notOk(true, 'validatePlayerData() failed');

                done();
            });
        });
        it('passwords do not match', function(done) {
            var playerData = {
                name: 'Player One Updated',
                email: 'player-one@example-updated.com',
                password_1: 'new-secred-password-x',
                password_2: 'new-secred-password',
                playerId: 'NkovQxpxl'
            };
            PlayerRepository.validatePlayerData(playerData).then(function() {
                // resolve callback

                assert.notOk(true, 'validatePlayerData() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('passwords do not match');
                expect(error.key).to.equal('player_register_0002');

                done();
            });
        });
        it('missing email parameter', function(done) {
            var playerData = {
                name: 'Player One Updated'
            };
            PlayerRepository.validatePlayerData(playerData).then(function() {
                // resolve callback

                assert.notOk(true, 'validatePlayerData() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('not all necessary data is set');
                expect(error.key).to.equal('player_update_0001');

                done();
            });
        });
        it('missing name parameter', function(done) {
            var playerData = {
                email: 'player-one@example-updated.com',
            };
            PlayerRepository.validatePlayerData(playerData).then(function() {
                // resolve callback

                assert.notOk(true, 'validatePlayerData() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('not all necessary data is set');
                expect(error.key).to.equal('player_update_0001');

                done();
            });
        });
        it('not existing playerId', function(done) {
            var playerData = {
                name: 'Player One Updated',
                email: 'player-one@example-updated.com',
                playerId: 'not-existing'
            };
            PlayerRepository.validatePlayerData(playerData).then(function() {
                // resolve callback

                assert.notOk(true, 'validatePlayerData() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('player with id "not-existing" does not exist');
                expect(error.key).to.equal('player_0001');

                done();
            });
        });
        it('email address not available', function(done) {
            var playerData = {
                name: 'Player One Updated',
                email: 'player-two@example.com',
                playerId: 'NkovQxpxl'
            };
            PlayerRepository.validatePlayerData(playerData).then(function() {
                // resolve callback

                assert.notOk(true, 'validatePlayerData() failed');

                done();

            }, function(error) {
                // error callback

                should.exist(error);
                expect(error.text).to.equal('email address already exists in database');
                expect(error.key).to.equal('player_update_0002');

                done();
            });
        });
    });

    describe('createPlayer()', function() {
        it('regular parameters', function(done) {
            var playerModel = mongoose.model('Player'),
                playerData = {
                    name: 'Player One',
                    username: 'player-one',
                    email: 'player-one@example.com',
                    password_1: 'a-secret-password',
                    password_2: 'a-secret-password'
                };
            PlayerRepository.createPlayer(playerModel, playerData).then(function(player) {
                // resolve callback

                should.exist(player);
                expect(player.name).to.equal('Player One');
                expect(player.username).to.equal('player-one');
                expect(player.score).to.equal(0);
                expect(player.email).to.equal('player-one@example.com');
                expect(player.password).to.equal(Md5('a-secret-password' + config.passwordHash));

                done();

            }, function(error) {
                // error callback

                assert.notOk(true, 'createPlayer() failed');

                done();
            });
        });
        it('regular parameters adapted config', function(done) {
            var playerModel = mongoose.model('Player'),
                playerData = {
                    name: 'Player One',
                    username: 'player-one',
                    email: 'player-one@example.com',
                    password_1: 'a-secret-password',
                    password_2: 'a-secret-password'
                };

            config.passwordHash = 'ABCDEfghi1234';

            PlayerRepository.createPlayer(playerModel, playerData).then(function(player) {
                // resolve callback

                should.exist(player);
                expect(player.name).to.equal('Player One');
                expect(player.username).to.equal('player-one');
                expect(player.score).to.equal(0);
                expect(player.email).to.equal('player-one@example.com');
                expect(player.password).to.equal(Md5('a-secret-password' + 'ABCDEfghi1234'));

                done();

            }, function(error) {
                // error callback

                assert.notOk(true, 'createPlayer() failed');

                done();
            });
        });
    });

    describe('updatePlayer()', function() {

        beforeEach(function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataCreate = {
                    name: 'Player One',
                    email: 'player-one@example.com',
                    password_1: 'some-secret-password',
                    password_2: 'some-secret-password',
                    playerId: 'NkovQxpxl'
                };

            // reset database before each updatePlayer() test
            mongoose.connection.db.dropDatabase();

            playerModel.create(playerDataCreate, function (err, player) {
                should.not.exist(err);
                player.initialize(playerDataCreate.password_1);
                player.save(function (err) {
                    should.not.exist(err);
                    done();
                });
            });
        });
        it('regular parameters', function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataUpdate = {
                    name: 'Player Number One',
                    email: 'player-number-one@example.net',
                    password_1: 'a-new-secret-password',
                    playerId: 'NkovQxpxl'
                };

            PlayerRepository.updatePlayer(playerModel, playerDataUpdate).then(function(player) {
                // resolve callback

                expect(player.name).to.equal('Player Number One');
                expect(player.email).to.equal('player-number-one@example.net');
                expect(player.password).to.equal(Md5('a-new-secret-password' + config.passwordHash))

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'updating player failed');

                done();
            });
        });
        it('regular parameters adapted config', function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataUpdate = {
                    name: 'Player Number One',
                    email: 'player-number-one@example.net',
                    password_1: 'a-new-secret-password',
                    playerId: 'NkovQxpxl'
                };

            config.passwordHash = 'ABCDEfghi1234';

            PlayerRepository.updatePlayer(playerModel, playerDataUpdate).then(function(player) {
                // resolve callback

                expect(player.password).to.equal(Md5('a-new-secret-password' + 'ABCDEfghi1234'))

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'updating player failed');

                done();
            });
        });
        it('regular parameters no password', function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataUpdate = {
                    name: 'Player Number One',
                    email: 'player-number-one@example.net',
                    playerId: 'NkovQxpxl'
                };

            PlayerRepository.updatePlayer(playerModel, playerDataUpdate).then(function(player) {
                // resolve callback

                expect(player.password).to.equal(Md5('some-secret-password' + config.passwordHash))

                done();

            }, function(error) {
                // error callback
                assert.notOk(true, 'updating player failed');

                done();
            });
        });
        it('not existing playerId', function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataUpdate = {
                    name: 'Player Number One',
                    email: 'player-number-one@example.net',
                    playerId: 'not-existing'
                };

            PlayerRepository.updatePlayer(playerModel, playerDataUpdate).then(function(player) {
                // resolve callback
                assert.notOk(true, 'findOne() returned an object even though it should not');

                done();

            }, function(error) {
                // error callback
                expect(error.text).to.equal('player with id "not-existing" does not exist');
                expect(error.key).to.equal('player_0001');

                done();
            });
        });
        it('undefined playerId', function(done) {
            var playerModel = mongoose.model('Player'),
                playerDataUpdate = {
                    name: 'Player Number One',
                    email: 'player-number-one@example.net',
                };

            PlayerRepository.updatePlayer(playerModel, playerDataUpdate).then(function(player) {
                // resolve callback
                assert.notOk(true, 'findOne() returned an object even though it should not');

                done();

            }, function(error) {
                // error callback
                expect(error.text).to.equal('player with id "undefined" does not exist');
                expect(error.key).to.equal('player_0001');

                done();
            });
        });
    });

    describe('getPlayerListData()', function() {
        it('regular parameter', function() {
            var req = {
                limit: 13,
                offset: 7,
                column: 'username',
                direction: 'asc'
            };
            expect(PlayerRepository.getPlayerListData(req)).to.deep.equal({
                limit: 13,
                offset: 7,
                column: 'username',
                direction: 'asc'
            });
        });
        it('missing keys in parameter', function() {
            var req = {
                column: 'username',
                direction: 'asc'
            };
            expect(PlayerRepository.getPlayerListData(req)).to.deep.equal({
                limit: 5,
                offset: 0,
                column: 'username',
                direction: 'asc'
            });
        });
        it('no parameter', function() {
            expect(PlayerRepository.getPlayerListData()).to.deep.equal({
                limit: 5,
                offset: 0,
                column: 'score',
                direction: 'desc'
            });
        });
        it('no parameter and adapted config', function() {

            config.playerListLimit = 22;
            config.playerListOffset = 33;
            config.playerListColumn = 'username';
            config.playerListDirection = 'asc';

            expect(PlayerRepository.getPlayerListData()).to.deep.equal({
                limit: 22,
                offset: 33,
                column: 'username',
                direction: 'asc'
            });
        });
        it('empty parameter and adapted config', function() {

            config.playerListLimit = 22;
            config.playerListOffset = 33;
            config.playerListColumn = 'username';
            config.playerListDirection = 'asc';

            expect(PlayerRepository.getPlayerListData({})).to.deep.equal({
                limit: 22,
                offset: 33,
                column: 'username',
                direction: 'asc'
            });
        });
    });
});
