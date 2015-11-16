'use strict';

process.env.NODE_ENV = 'test';

var expect = require("chai").expect,
    should = require('chai').should(),
    mongoose = require('mongoose'),
    newGameData,
    gameModel,
    fieldEW1,
    fieldEW2,
    fieldEW3,
    fieldEW4,
    fieldEW5,
    fieldNS1,
    fieldNS2,
    fieldNS3,
    fieldNS4,
    fieldNS5,
    fieldNESW1,
    fieldNESW2,
    fieldNESW3,
    fieldNESW4,
    fieldNESW5,
    fieldNWSE1,
    fieldNWSE2,
    fieldNWSE3,
    fieldNWSE4,
    fieldNWSE5;

describe('model/game.js wth checkForWin()', function() {

    beforeEach(function(done) {
        // standard game parameter for most tests
        newGameData = {
            player1: 'player_1',
            player2: 'player_2',
            fieldWidth: 10,
            fieldHeight: 10
        };

        gameModel = mongoose.model('Game');

        done();
    });

    describe('checkForWin()', function() {
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□□□□□□□□□ 1 -
        // - 2 □□□□□□□□□□ 2 -
        // - 3 □□□□□□□□□□ 3 -
        // - 4 □□□□□o□□□□ 4 -
        // - 5 □Xxxxx□□□□ 5 -
        // - 6 □□□ooo□□□□ 6 -
        // - 7 □□□□□o□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldEW1 = '[["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","x","","","",""],["","","","","","x","o","","",""],["","","","","","x","o","","",""],["","","","","o","x","o","o","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('EAST ► WEST ⟷  Xxxxx', function(done) {
            var moveData = {
                    x: 1,
                    y: 5,
                    username: 'player_1'
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldEW1;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[1,5],[2,5],[3,5],[4,5],[5,5]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□□□□□□□□□ 1 -
        // - 2 □□□□□□□□□□ 2 -
        // - 3 □□□□□□□□□□ 3 -
        // - 4 □□□□□o□□□□ 4 -
        // - 5 □xXxxx□□□□ 5 -
        // - 6 □□□ooo□□□□ 6 -
        // - 7 □□□□□o□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldEW2 = '[["","","","","","","","","",""],["","","","","","x","","","",""],["","","","","","","","","",""],["","","","","","x","o","","",""],["","","","","","x","o","","",""],["","","","","o","x","o","o","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('EAST ► WEST ⟷  xXxxx', function(done) {
            var moveData = {
                    x: 2,
                    y: 5,
                    username: 'player_1'
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldEW2;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[1,5],[2,5],[3,5],[4,5],[5,5]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□□□□□□□□□ 1 -
        // - 2 □□□□□□□□□□ 2 -
        // - 3 □□□□□□□□□□ 3 -
        // - 4 □□□□□o□□□□ 4 -
        // - 5 □xxXxx□□□□ 5 -
        // - 6 □□□ooo□□□□ 6 -
        // - 7 □□□□□o□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldEW3 = '[["","","","","","","","","",""],["","","","","","x","","","",""],["","","","","","x","","","",""],["","","","","","","o","","",""],["","","","","","x","o","","",""],["","","","","o","x","o","o","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('EAST ► WEST ⟷  xxXxx', function(done) {
            var moveData = {
                    x: 3,
                    y: 5,
                    username: 'player_1'
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldEW3;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[1,5],[2,5],[3,5],[4,5],[5,5]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□□□□□□□□□ 1 -
        // - 2 □□□□□□□□□□ 2 -
        // - 3 □□□□□□□□□□ 3 -
        // - 4 □□□□□o□□□□ 4 -
        // - 5 □xxxXx□□□□ 5 -
        // - 6 □□□ooo□□□□ 6 -
        // - 7 □□□□□o□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldEW4 = '[["","","","","","","","","",""],["","","","","","x","","","",""],["","","","","","x","","","",""],["","","","","","x","o","","",""],["","","","","","","o","","",""],["","","","","o","x","o","o","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('EAST ► WEST ⟷  xxxXx', function(done) {
            var moveData = {
                    x: 4,
                    y: 5,
                    username: 'player_1'
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldEW4;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[1,5],[2,5],[3,5],[4,5],[5,5]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□□□□□□□□□ 1 -
        // - 2 □□□□□□□□□□ 2 -
        // - 3 □□□□□□□□□□ 3 -
        // - 4 □□□□□o□□□□ 4 -
        // - 5 □xxxxX□□□□ 5 -
        // - 6 □□□ooo□□□□ 6 -
        // - 7 □□□□□o□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldEW5 = '[["","","","","","","","","",""],["","","","","","x","","","",""],["","","","","","x","","","",""],["","","","","","x","o","","",""],["","","","","","x","o","","",""],["","","","","o","","o","o","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('EAST ► WEST ⟷  xxxxX', function(done) {
            var moveData = {
                    x: 5,
                    y: 5,
                    username: 'player_1'
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldEW5;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[1,5],[2,5],[3,5],[4,5],[5,5]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□o□□□□□□□ 1 -
        // - 2 □□Xooo□□□□ 2 -
        // - 3 □□x□□□□□□□ 3 -
        // - 4 □□x□□□□□□□ 4 -
        // - 5 □□x□□□□□□□ 5 -
        // - 6 □□xo□□□□□□ 6 -
        // - 7 □□□□□□□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNS1 = '[["","","","","","","","","",""],["","","","","","","","","",""],["","o","","x","x","x","x","","",""],["","","o","","","","o","","",""],["","","o","","","","","","",""],["","","o","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('NORTH ► SOUTH ↕ Xxxxx', function(done) {
            var moveData = {
                x: 2,
                y: 2,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNS1;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[2,2],[2,3],[2,4],[2,5],[2,6]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□o□□□□□□□ 1 -
        // - 2 □□xooo□□□□ 2 -
        // - 3 □□X□□□□□□□ 3 -
        // - 4 □□x□□□□□□□ 4 -
        // - 5 □□x□□□□□□□ 5 -
        // - 6 □□xo□□□□□□ 6 -
        // - 7 □□□□□□□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNS2 = '[["","","","","","","","","",""],["","","","","","","","","",""],["","o","x","","x","x","x","","",""],["","","o","","","","o","","",""],["","","o","","","","","","",""],["","","o","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('NORTH ► SOUTH ↕ xXxxx', function(done) {
            var moveData = {
                x: 2,
                y: 3,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNS2;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[2,2],[2,3],[2,4],[2,5],[2,6]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□o□□□□□□□ 1 -
        // - 2 □□xooo□□□□ 2 -
        // - 3 □□x□□□□□□□ 3 -
        // - 4 □□X□□□□□□□ 4 -
        // - 5 □□x□□□□□□□ 5 -
        // - 6 □□xo□□□□□□ 6 -
        // - 7 □□□□□□□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNS3 = '[["","","","","","","","","",""],["","","","","","","","","",""],["","o","x","x","","x","x","","",""],["","","o","","","","o","","",""],["","","o","","","","","","",""],["","","o","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('NORTH ► SOUTH ↕ xxXxx', function(done) {
            var moveData = {
                x: 2,
                y: 4,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNS3;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[2,2],[2,3],[2,4],[2,5],[2,6]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□o□□□□□□□ 1 -
        // - 2 □□xooo□□□□ 2 -
        // - 3 □□x□□□□□□□ 3 -
        // - 4 □□x□□□□□□□ 4 -
        // - 5 □□X□□□□□□□ 5 -
        // - 6 □□xo□□□□□□ 6 -
        // - 7 □□□□□□□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNS4 = '[["","","","","","","","","",""],["","","","","","","","","",""],["","o","x","x","x","","x","","",""],["","","o","","","","o","","",""],["","","o","","","","","","",""],["","","o","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('NORTH ► SOUTH ↕ xxxXx', function(done) {
            var moveData = {
                x: 2,
                y: 5,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNS4;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[2,2],[2,3],[2,4],[2,5],[2,6]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□o□□□□□□□ 1 -
        // - 2 □□xooo□□□□ 2 -
        // - 3 □□x□□□□□□□ 3 -
        // - 4 □□x□□□□□□□ 4 -
        // - 5 □□x□□□□□□□ 5 -
        // - 6 □□Xo□□□□□□ 6 -
        // - 7 □□□□□□□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNS5 = '[["","","","","","","","","",""],["","","","","","","","","",""],["","o","x","x","x","x","","","",""],["","","o","","","","o","","",""],["","","o","","","","","","",""],["","","o","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('NORTH ► SOUTH ↕ xxxxX', function(done) {
            var moveData = {
                x: 2,
                y: 6,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNS5;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[2,2],[2,3],[2,4],[2,5],[2,6]]');

                done();
            });
        });
        //      | | | | |
        //      0 2 4 6 8
        // - 0 X□□□□□□□□□ 0 -
        // - 1 □xo□□□□□□□ 1 -
        // - 2 □□xooo□□□□ 2 -
        // - 3 □□□x□□□□□□ 3 -
        // - 4 □□□□x□□□□□ 4 -
        // - 5 □□□□□□□□□□ 5 -
        // - 6 □□□o□□□□□□ 6 -
        // - 7 □□□□□□□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNESW1 = '[["","","","","","","","","",""],["","x","","","","","","","",""],["","o","x","","","","","","",""],["","","o","x","","","o","","",""],["","","o","","x","","","","",""],["","","o","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('NORTH-WEST ► SOUTH-EAST ⤡ Xxxxx', function(done) {
            var moveData = {
                x: 0,
                y: 0,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNESW1;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[0,0],[1,1],[2,2],[3,3],[4,4]]');

                done();
            });
        });
        //      | | | | |
        //      0 2 4 6 8
        // - 0 x□□□□□□□□□ 0 -
        // - 1 □Xo□□□□□□□ 1 -
        // - 2 □□xooo□□□□ 2 -
        // - 3 □□□x□□□□□□ 3 -
        // - 4 □□□□x□□□□□ 4 -
        // - 5 □□□□□□□□□□ 5 -
        // - 6 □□□o□□□□□□ 6 -
        // - 7 □□□□□□□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNESW2 = '[["x","","","","","","","","",""],["","","","","","","","","",""],["","o","x","","","","","","",""],["","","o","x","","","o","","",""],["","","o","","x","","","","",""],["","","o","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('NORTH-WEST ► SOUTH-EAST ⤡ xXxxx', function(done) {
            var moveData = {
                x: 1,
                y: 1,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNESW2;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[0,0],[1,1],[2,2],[3,3],[4,4]]');

                done();
            });
        });
        //      | | | | |
        //      0 2 4 6 8
        // - 0 x□□□□□□□□□ 0 -
        // - 1 □xo□□□□□□□ 1 -
        // - 2 □□Xooo□□□□ 2 -
        // - 3 □□□x□□□□□□ 3 -
        // - 4 □□□□x□□□□□ 4 -
        // - 5 □□□□□□□□□□ 5 -
        // - 6 □□□o□□□□□□ 6 -
        // - 7 □□□□□□□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNESW3 = '[["x","","","","","","","","",""],["","x","","","","","","","",""],["","o","","","","","","","",""],["","","o","x","","","o","","",""],["","","o","","x","","","","",""],["","","o","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('NORTH-WEST ► SOUTH-EAST ⤡ xxXxx', function(done) {
            var moveData = {
                x: 2,
                y: 2,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNESW3;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[0,0],[1,1],[2,2],[3,3],[4,4]]');

                done();
            });
        });
        //      | | | | |
        //      0 2 4 6 8
        // - 0 x□□□□□□□□□ 0 -
        // - 1 □xo□□□□□□□ 1 -
        // - 2 □□xooo□□□□ 2 -
        // - 3 □□□X□□□□□□ 3 -
        // - 4 □□□□x□□□□□ 4 -
        // - 5 □□□□□□□□□□ 5 -
        // - 6 □□□o□□□□□□ 6 -
        // - 7 □□□□□□□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNESW4 = '[["x","","","","","","","","",""],["","x","","","","","","","",""],["","o","x","","","","","","",""],["","","o","","","","o","","",""],["","","o","","x","","","","",""],["","","o","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('NORTH-WEST ► SOUTH-EAST ⤡ xxxXx', function(done) {
            var moveData = {
                x: 3,
                y: 3,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNESW4;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[0,0],[1,1],[2,2],[3,3],[4,4]]');

                done();
            });
        });
        //      | | | | |
        //      0 2 4 6 8
        // - 0 x□□□□□□□□□ 0 -
        // - 1 □xo□□□□□□□ 1 -
        // - 2 □□xooo□□□□ 2 -
        // - 3 □□□x□□□□□□ 3 -
        // - 4 □□□□X□□□□□ 4 -
        // - 5 □□□□□□□□□□ 5 -
        // - 6 □□□o□□□□□□ 6 -
        // - 7 □□□□□□□□□□ 7 -
        // - 8 □□□□□□□□□□ 8 -
        // - 9 □□□□□□□□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNESW5 = '[["x","","","","","","","","",""],["","x","","","","","","","",""],["","o","x","","","","","","",""],["","","o","x","","","o","","",""],["","","o","","","","","","",""],["","","o","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]';
        it('NORTH-WEST ► SOUTH-EAST ⤡ xxxxX', function(done) {
            var moveData = {
                x: 4,
                y: 4,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNESW5;

                game.makeMove(moveData);
                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[0,0],[1,1],[2,2],[3,3],[4,4]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□□□□□□□□□ 1 -
        // - 2 □□□□□□□□□□ 2 -
        // - 3 □□□□□□□□□□ 3 -
        // - 4 □□□□□□□o□□ 4 -
        // - 5 □□□□□□□□ox 5 -
        // - 6 □□□□□□□□x□ 6 -
        // - 7 □□□□□□oxo□ 7 -
        // - 8 □□□□□□x□□□ 8 -
        // - 9 □□□□□Xo□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNWSE1 = '[["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","o","x","o"],["","","","","o","","","x","",""],["","","","","","o","x","o","",""],["","","","","","x","","","",""]]';
        it('NORTH-EAST ► SOUTH-WEST ⤢ Xxxxx', function(done) {
            var moveData = {
                x: 5,
                y: 9,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNWSE1;

                game.makeMove(moveData);

                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[5,9],[6,8],[7,7],[8,6],[9,5]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□□□□□□□□□ 1 -
        // - 2 □□□□□□□□□□ 2 -
        // - 3 □□□□□□□□□□ 3 -
        // - 4 □□□□□□□o□□ 4 -
        // - 5 □□□□□□□□ox 5 -
        // - 6 □□□□□□□□x□ 6 -
        // - 7 □□□□□□oxo□ 7 -
        // - 8 □□□□□□X□□□ 8 -
        // - 9 □□□□□xo□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNWSE2 = '[["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","","x"],["","","","","","","","o","","o"],["","","","","o","","","x","",""],["","","","","","o","x","o","",""],["","","","","","x","","","",""]]';
        it('NORTH-EAST ► SOUTH-WEST ⤢ xXxxx', function(done) {
            var moveData = {
                x: 6,
                y: 8,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNWSE2;

                game.makeMove(moveData);

                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[5,9],[6,8],[7,7],[8,6],[9,5]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□□□□□□□□□ 1 -
        // - 2 □□□□□□□□□□ 2 -
        // - 3 □□□□□□□□□□ 3 -
        // - 4 □□□□□□□o□□ 4 -
        // - 5 □□□□□□□□ox 5 -
        // - 6 □□□□□□□□x□ 6 -
        // - 7 □□□□□□oXo□ 7 -
        // - 8 □□□□□□x□□□ 8 -
        // - 9 □□□□□xo□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNWSE3 = '[["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","","x"],["","","","","","","","o","x","o"],["","","","","o","","","","",""],["","","","","","o","x","o","",""],["","","","","","x","","","",""]]';
        it('NORTH-EAST ► SOUTH-WEST ⤢ xxXxx', function(done) {
            var moveData = {
                x: 7,
                y: 7,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNWSE3;

                game.makeMove(moveData);

                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[5,9],[6,8],[7,7],[8,6],[9,5]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□□□□□□□□□ 1 -
        // - 2 □□□□□□□□□□ 2 -
        // - 3 □□□□□□□□□□ 3 -
        // - 4 □□□□□□□o□□ 4 -
        // - 5 □□□□□□□□ox 5 -
        // - 6 □□□□□□□□X□ 6 -
        // - 7 □□□□□□oxo□ 7 -
        // - 8 □□□□□□x□□□ 8 -
        // - 9 □□□□□xo□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNWSE4 = '[["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","","x"],["","","","","","","","o","x","o"],["","","","","o","","","x","",""],["","","","","","o","","o","",""],["","","","","","x","","","",""]]';
        it('NORTH-EAST ► SOUTH-WEST ⤢ xxxXx', function(done) {
            var moveData = {
                x: 8,
                y: 6,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNWSE4;

                game.makeMove(moveData);

                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[5,9],[6,8],[7,7],[8,6],[9,5]]');

                done();
            });
        });
        //     | | | | |
        //     0 2 4 6 8
        // - 0 □□□□□□□□□□ 0 -
        // - 1 □□□□□□□□□□ 1 -
        // - 2 □□□□□□□□□□ 2 -
        // - 3 □□□□□□□□□□ 3 -
        // - 4 □□□□□□□o□□ 4 -
        // - 5 □□□□□□□□oX 5 -
        // - 6 □□□□□□□□x□ 6 -
        // - 7 □□□□□□oxo□ 7 -
        // - 8 □□□□□□x□□□ 8 -
        // - 9 □□□□□xo□□□ 9 -
        //     0 2 4 6 8
        //     | | | | |
        fieldNWSE5 = '[["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","","x"],["","","","","","","","o","x","o"],["","","","","o","","","x","",""],["","","","","","o","x","o","",""],["","","","","","","","","",""]]';
        it('NORTH-EAST ► SOUTH-WEST ⤢ xxxxX', function(done) {
            var moveData = {
                x: 9,
                y: 5,
                username: 'player_1'
            };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.field = fieldNWSE5;

                game.makeMove(moveData);

                expect(game.checkForWin(moveData)).to.be.true;
                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('win_player1');
                expect(JSON.stringify(game.setCoord)).to.equal('[[5,9],[6,8],[7,7],[8,6],[9,5]]');

                done();
            });
        });
    });
});
