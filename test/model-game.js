'use strict';

process.env.NODE_ENV = 'test';

var Shortid = require('shortid'),
    merge = require('merge'), // to merge two objects
    expect = require("chai").expect,
    should = require('chai').should(),
    assert = require('chai').assert,
    mongoose = require('mongoose'), // mongo connection
    constants = require('../config/constants'),
    GameModel = require('../model/game'),
    isValidDate,
    newGameData,
    gameModel;

isValidDate = function(d) {
    if (Object.prototype.toString.call(d) === "[object Date]") {
        if (isNaN(d.getTime())) {
            return false;
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
};

describe('model/game.js', function() {

    beforeEach(function(done) {
        constants.token.player1 = 'x';
        constants.token.player2 = 'o';
        constants.status.inprogress = 'inprogress';
        constants.status.finished = 'finished';
        constants.status.prestart = 'prestart';
        constants.status.ready = 'ready';
        constants.result.draw = 'draw';
        constants.player1 = 'player1';
        constants.player2 = 'player2';

        // standard game parameter for most tests
        newGameData = {
            player1: 'player_1',
            player2: 'player_2',
            fieldWidth: 3,
            fieldHeight: 3
        };

        gameModel = mongoose.model('Game');

        done();
    });

    describe('create()', function() {
        it('default values', function(done) {
            var newGameData1 = {
                    player1: 'player_1',
                    player2: 'player_2'
                };

            gameModel.create(newGameData1, function (err, game) {
                should.not.exist(err);
                expect(Shortid.isValid(game.gameId)).to.be.true;
                expect(game.field).to.equal('');
                expect(game.fieldWidth).to.equal(10);
                expect(game.fieldHeight).to.equal(10);
                expect(game.activePlayer).to.equal('player1');
                expect(game.status).to.equal('prestart');
                expect(game.result).to.equal('');
                expect(isValidDate(game.created_at)).to.be.true; // @todo check if there is a better solution
                assert.isArray(game.setCoord);
                expect(game.setCoord.length).to.equal(0);
                expect(game.moveCount).to.equal(0);
                expect(game.player1).to.equal('player_1');
                expect(game.player2).to.equal('player_2');

                done();
            });
        });
        it('field width and height', function(done) {
            var newGameData1 = merge(newGameData, {
                    fieldWidth: 20,
                    fieldHeight: 20
                });

            gameModel.create(newGameData1, function (err, game) {
                should.not.exist(err);
                expect(game.fieldWidth).to.equal(20);
                expect(game.fieldHeight).to.equal(20);
                done();
            });
        });
    });

    describe('getPiece() - private', function() {
        it('regular parameter', function() {
            expect(GameModel.getPiece('player1')).to.equal('x');
            expect(GameModel.getPiece('player2')).to.equal('o');
        });
        it('adapted constants', function() {

            constants.token.player1 = 'u';
            constants.token.player2 = 'e';

            expect(GameModel.getPiece('player1')).to.equal('u');
            expect(GameModel.getPiece('player2')).to.equal('e');
        });
        it('without parameter', function() {
            expect(GameModel.getPiece()).to.equal('o');
        });
        it('invalid parameter', function() {
            expect(GameModel.getPiece('player3000')).to.equal('o');
        });
    });

    describe('sortByPosition() - private', function() {
        it('sorting', function() {
            var input = [[2,4],[2,2],[2,6],[2,5],[1,2]];
            input.sort(GameModel.sortByPosition);

            expect(JSON.stringify(input)).to.equal('[[1,2],[2,2],[2,4],[2,5],[2,6]]');
        });
    });

    describe('initialize()', function() {
        it('field contents', function (done) {
            var fieldObj;

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);
                expect(game.fieldWidth).to.equal(3);
                expect(game.fieldHeight).to.equal(3);

                game.initialize();

                expect(game.field).to.equal('[["","",""],["","",""],["","",""]]');

                fieldObj = JSON.parse(game.field);
                expect(fieldObj).to.deep.equal([
                        [ '', '', ''],
                        [ '', '', ''],
                        [ '', '', '']
                    ]
                );
                done();
            });
        });
    });

    describe('makeMove()', function() {
        it('move count and status', function (done) {
            var moveData = {
                    x: 1,
                    y: 2
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.makeMove(moveData);

                expect(game.moveCount).to.equal(1);
                expect(game.status).to.equal('inprogress');

                done();
            });
        });
        it('move count and status adapted constants', function (done) {
            var moveData = {
                    x: 1,
                    y: 2
                };

            constants.status.inprogress = 'game-is-on';

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.makeMove(moveData);

                expect(game.status).to.equal('game-is-on');

                done();
            });
        });
        it('piece position', function (done) {
            var moveData1 = {
                    x: 1,
                    y: 2
                },
                moveData2 = {
                    x: 1,
                    y: 1
                },
                moveData3 = {
                    x: 0,
                    y: 1
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.makeMove(moveData1);
                expect(game.field).to.equal('[["","",""],["","","x"],["","",""]]');

                game.makeMove(moveData2);
                expect(game.field).to.equal('[["","",""],["","x","x"],["","",""]]');

                game.makeMove(moveData3);
                expect(game.field).to.equal('[["","x",""],["","x","x"],["","",""]]');

                done();
            });
        });
    });

    describe('changeActivePlayer()', function() {
        it('active player', function (done) {
            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.changeActivePlayer();
                expect(game.activePlayer).to.equal('player2');

                game.changeActivePlayer();
                expect(game.activePlayer).to.equal('player1');

                done();
            });
        });
        it('active player adapted constants', function (done) {

            constants.player1 = 'player-number-one';
            constants.player2 = 'player-number-two';

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                // because gameSchema.activePlayer is executed before changing the constants, we have to cheat here ...
                game.activePlayer = 'player-number-one';

                game.changeActivePlayer();
                expect(game.activePlayer).to.equal('player-number-two');

                game.changeActivePlayer();
                expect(game.activePlayer).to.equal('player-number-one');

                done();
            });
        });
    });

    describe('validateMoveData() & getValidateMoveDataError()', function() {
        it('valid parameter', function (done) {
            var moveData = {
                    x: 1,
                    y: 2,
                    username: 'player_1'
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                expect(game.validateMoveData(moveData)).to.be.true;
                expect(game.getValidateMoveDataError()).to.deep.equal({
                    text: '',
                    key: ''
                });

                done();
            });
        });
        it('game status finished', function (done) {
            var moveData = {
                    x: 1,
                    y: 2,
                    username: 'player_1'
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.status = 'finished';

                expect(game.validateMoveData(moveData)).to.be.false;
                expect(game.getValidateMoveDataError()).to.deep.equal({
                    text: 'this game is already over',
                    key: 'game_0003'
                });

                done();
            });
        });
        it('game status finished adapted constants', function (done) {
            var moveData = {
                    x: 1,
                    y: 2,
                    username: 'player_1'
                };

            constants.status.finished = 'game-is-finished';

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.status = 'game-is-finished';

                expect(game.validateMoveData(moveData)).to.be.false;
                expect(game.getValidateMoveDataError()).to.deep.equal({
                    text: 'this game is already over',
                    key: 'game_0003'
                });

                done();
            });
        });
        it('wrong active player', function (done) {
            var moveData = {
                    x: 1,
                    y: 2,
                    username: 'player_2'
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                expect(game.validateMoveData(moveData)).to.be.false;
                expect(game.getValidateMoveDataError()).to.deep.equal({
                    text: 'it is not your turn',
                    key: 'game_0004'
                });

                done();
            });
        });
        it('coordinates out of bounds', function (done) {
            var moveData = {
                    x: 10,
                    y: 20,
                    username: 'player_1'
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                expect(game.validateMoveData(moveData)).to.be.false;
                expect(game.getValidateMoveDataError()).to.deep.equal({
                    text: 'coordinates are not within bounds',
                    key: 'game_0005'
                });

                done();
            });
        });
        it('slot already used', function (done) {
            var moveData = {
                    x: 1,
                    y: 1,
                    username: 'player_1'
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.field = '[["","",""],["","x",""],["","",""]]';

                expect(game.validateMoveData(moveData)).to.be.false;
                expect(game.getValidateMoveDataError()).to.deep.equal({
                    text: 'slot 1/1 cannot be used',
                    key: 'game_0006'
                });

                done();
            });
        });
    });

    describe('validateMoveDataPlayer()', function() {
        it('valid parameter', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                expect(game.validateMoveDataPlayer('player_1')).to.be.true;
                expect(game.validateMoveDataPlayer('player_2')).to.be.false;

                game.activePlayer = 'player2';

                expect(game.validateMoveDataPlayer('player_1')).to.be.false;
                expect(game.validateMoveDataPlayer('player_2')).to.be.true;

                done();
            });
        });
        it('valid parameter adapted constants', function (done) {

            constants.player1 = 'player-number-one';
            constants.player2 = 'player-number-two';

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                // because gameSchema.activePlayer is executed before changing the constants, we have to cheat here ...
                game.activePlayer = 'player-number-one';

                expect(game.validateMoveDataPlayer('player_1')).to.be.true;
                expect(game.validateMoveDataPlayer('player_2')).to.be.false;

                game.activePlayer = 'player-number-two';

                expect(game.validateMoveDataPlayer('player_1')).to.be.false;
                expect(game.validateMoveDataPlayer('player_2')).to.be.true;

                done();
            });
        });
    });

    describe('validateMoveDataInsideBounds()', function() {
        it('valid parameters', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                expect(game.validateMoveDataInsideBounds(1, 1)).to.be.true;
                expect(game.validateMoveDataInsideBounds(2, 2)).to.be.true;
                expect(game.validateMoveDataInsideBounds(0, 2)).to.be.true;

                done();
            });
        });
        it('invalid parameters', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                expect(game.validateMoveDataInsideBounds(10, 10)).to.be.false;
                expect(game.validateMoveDataInsideBounds(-1, -1)).to.be.false;

                done();
            });
        });
    });

    describe('validateMoveDataSlotAvailable()', function() {
        it('valid parameters', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                expect(game.validateMoveDataSlotAvailable(1, 1)).to.be.true;
                expect(game.validateMoveDataSlotAvailable(2, 2)).to.be.true;
                expect(game.validateMoveDataSlotAvailable(0, 2)).to.be.true;

                done();
            });
        });
        it('invalid parameters', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.field = '[["o","",""],["","x",""],["","o",""]]';

                expect(game.validateMoveDataSlotAvailable(1, 1)).to.be.false;
                expect(game.validateMoveDataSlotAvailable(0, 0)).to.be.false;
                expect(game.validateMoveDataSlotAvailable(2, 1)).to.be.false;

                done();
            });
        });
    });

    describe('finishGame()', function() {
        it('valid parameters', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.finishGame('draw');

                expect(game.status).to.equal('finished');
                expect(game.result).to.equal('draw');
                assert.isArray(game.setCoord);
                expect(game.setCoord.length).to.equal(0);

                done();
            });
        });
        it('valid parameters adapted constants', function (done) {

            constants.status.finished = 'game-is-finished';
            constants.result.draw = 'game-ended-draw';

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.finishGame('game-ended-draw');

                expect(game.status).to.equal('game-is-finished');
                expect(game.result).to.equal('game-ended-draw');

                done();
            });
        });
        it('width coordinates', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();
                game.finishGame('draw', [ [0, 0], [1, 1], [2, 2] ]);

                assert.isArray(game.setCoord);
                expect(game.setCoord.length).to.equal(3);
                expect(game.setCoord[0]).to.deep.equal([0, 0]);
                expect(game.setCoord[1]).to.deep.equal([1, 1]);
                expect(game.setCoord[2]).to.deep.equal([2, 2]);

                done();
            });
        });
    });

    describe('usernameToPlayerX()', function() {
        it('valid parameters', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                expect(game.usernameToPlayerX('player_1')).to.equal('player1');
                expect(game.usernameToPlayerX('player_2')).to.equal('player2');

                done();
            });
        });
        it('valid parameters adapted constants', function (done) {

            constants.player1 = 'player-number-one';
            constants.player2 = 'player-number-two';

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                expect(game.usernameToPlayerX('player_1')).to.equal('player-number-one');
                expect(game.usernameToPlayerX('player_2')).to.equal('player-number-two');

                done();
            });
        });
    });

    describe('checkForDraw()', function() {
        it('move count', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.moveCount = 5;
                expect(game.checkForDraw()).to.be.false;

                game.moveCount = 99;
                expect(game.checkForDraw()).to.be.false;

                expect(game.result).not.to.equal('draw');

                game.moveCount = 9;
                expect(game.checkForDraw()).to.be.true;

                expect(game.result).to.equal('draw');

                done();
            });
        });
    });

    describe('forfeit()', function() {
        it('player1', function (done) {
            var moveData = {
                    x: 1,
                    y: 2,
                    username: 'player_1'
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.forfeit(moveData);
                expect(game.result).to.equal('forfeit_player1');
                expect(game.status).to.equal('finished');
                assert.isArray(game.setCoord);
                expect(game.setCoord.length).to.equal(0);

                done();
            });
        });
        it('player2', function (done) {
            var moveData = {
                    x: 1,
                    y: 2,
                    username: 'player_2'
                };

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.forfeit(moveData);
                expect(game.result).to.equal('forfeit_player2');
                expect(game.status).to.equal('finished');
                assert.isArray(game.setCoord);
                expect(game.setCoord.length).to.equal(0);

                done();
            });
        });
    });

    describe('acceptChallenge()', function() {
        it('valid parameter', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.acceptChallenge('player_2').then(function() {
                    // resolve callback
                    expect(game.status).to.equal('ready');
                    done();
                }, function(error) {
                    // error callback
                    should.not.exist(error);
                    done();
                });

            });
        });
        it('valid parameter adapted constants', function (done) {

            constants.status.prestart = 'game-is-prestart';
            constants.status.ready = 'game-is-ready';

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.status = 'game-is-prestart';

                game.acceptChallenge('player_2').then(function() {
                    // resolve callback
                    expect(game.status).to.equal('game-is-ready');
                    done();
                }, function(error) {
                    // error callback
                    should.not.exist(error);
                    done();
                });
            });
        });
        it('invalid player', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.status = 'prestart';

                game.acceptChallenge('another-cool-player').then(function() {
                    // resolve callback
                    assert.notOk(true, 'failed');

                    done();
                }, function(error) {
                    // error callback
                    should.exist(error);
                    expect(error.text).to.equal('cannot accept challenge of game if user is not the challengee');
                    expect(error.key).to.equal('game_0016');

                    done();
                });
            });
        });
        it('invalid game status', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.status = 'finished';

                game.acceptChallenge('player_2').then(function() {
                    // resolve callback
                    assert.notOk(true, 'failed');
                    done();
                }, function(error) {
                    // error callback
                    should.exist(error);
                    expect(error.text).to.equal('cannot accept challenge of game if status is not "prestart"');
                    expect(error.key).to.equal('game_0017');
                    done();
                });
            });
        });
        it('invalid game status adapted constants', function (done) {

            constants.status.prestart = 'game-is-prestart';

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.status = 'finished';

                game.acceptChallenge('player_2').then(function() {
                    // resolve callback
                    assert.notOk(true, 'failed');
                    done();
                }, function(error) {
                    // error callback
                    should.exist(error);
                    expect(error.text).to.equal('cannot accept challenge of game if status is not "prestart"');
                    expect(error.key).to.equal('game_0017');
                    done();
                });
            });
        });
    });

    describe('sanitizeForOutput()', function() {
        it('check output', function (done) {
            var sanitized;

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                sanitized = game.sanitizeForOutput();

                expect(sanitized.created_at).to.be.an('undefined');
                expect(sanitized.__v).to.be.an('undefined');
                expect(sanitized._id).to.be.an('undefined');

                done();
            });
        });
    });

    describe('modifyField()', function() {
        it('valid parameters', function (done) {

            gameModel.create(newGameData, function (err, game) {
                should.not.exist(err);

                game.initialize();

                game.modifyField(1, 1, 'R');
                expect(game.field).to.equal('[["","",""],["","R",""],["","",""]]');

                game.modifyField(1, 1, 'P');
                game.modifyField(0, 1, 'Q');
                expect(game.field).to.equal('[["","Q",""],["","P",""],["","",""]]');

                done();
            });
        });
    });
});

















