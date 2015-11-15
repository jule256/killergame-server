'use strict';

process.env.NODE_ENV = 'test';

var expect = require("chai").expect,
    app = require("../app"),
    GameRepository = require('../repository/game');

describe('repository/game.js', function() {

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
                score: -1
            });
        });
        it('no parameters', function() {
            expect(GameRepository.getOrderbyObject()).to.deep.equal({
                score: -1
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
        it('requires database - @todo', function() {
            expect(true).to.be.true;
        });
    });

    describe('getChallenges()', function() {
        it('requires database - @todo', function() {
            expect(true).to.be.true;
        });
    });

    describe('getNewGameData()', function() {
        it('regular parameters', function() {
            var reqBody = {
                decodedToken: {
                    username: 'player_1'
                },
                player2: 'player_2',
                fieldWidth: 20,
                fieldHeight: 20
            };
            expect(GameRepository.getNewGameData(reqBody)).to.deep.equal({
                player1: 'player_1',
                player2: 'player_2',
                fieldWidth: 20,
                fieldHeight: 20
            });
        });
        it('without fieldWidth and fieldHeight', function() {
            var reqBody = {
                decodedToken: {
                    username: 'player_1'
                },
                player2: 'player_2'
            };
            expect(GameRepository.getNewGameData(reqBody)).to.deep.equal({
                player1: 'player_1',
                player2: 'player_2',
                fieldWidth: undefined,
                fieldHeight: undefined
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
        it('requires database - @todo', function() {
            expect(true).to.be.true;
        });
    });

    describe('createGame()', function() {
        it('requires database - @todo', function() {
            expect(true).to.be.true;
        });
    });

    describe('getMoveData()', function() {
        it('regular parameters', function() {
            var gameId = '12GhdiZ',
                reqBody = {
                    decodedToken: {
                        username: 'player_1'
                    },
                    x: 7,
                    y: 8
                };
            expect(GameRepository.getMoveData(reqBody, gameId)).to.deep.equal({
                x: 7,
                y: 8,
                username: 'player_1',
                gameId: '12GhdiZ'
            });
        });
        it('string parameters', function() {
            var gameId = '12GhdiZ',
                reqBody = {
                    decodedToken: {
                        username: 'player_1'
                    },
                    x: '7',
                    y: '8'
                };
            expect(GameRepository.getMoveData(reqBody, gameId)).to.deep.equal({
                x: 7,
                y: 8,
                username: 'player_1',
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
        it('without gameId parameter', function() {
            var reqBody = {
                    decodedToken: {
                        username: 'player_1'
                    },
                    x: '7',
                    y: '8'
                };
            expect(GameRepository.getMoveData(reqBody)).to.deep.equal({
                x: 7,
                y: 8,
                username: 'player_1',
                gameId: undefined
            });
        });
        it('no x coordinate in reqBody parameter', function() {
            var gameId = '12GhdiZ',
                reqBody = {
                    decodedToken: {
                        username: 'player_1'
                    },
                    y: 8
                };
            expect(GameRepository.getMoveData(reqBody, gameId)).to.deep.equal({
                x: NaN,
                y: 8,
                username: 'player_1',
                gameId: '12GhdiZ'
            });
        });
        it('no y coordinate in reqBody parameter', function() {
            var gameId = '12GhdiZ',
                reqBody = {
                    decodedToken: {
                        username: 'player_1'
                    },
                    x: 7
                };
            expect(GameRepository.getMoveData(reqBody, gameId)).to.deep.equal({
                x: 7,
                y: NaN,
                username: 'player_1',
                gameId: '12GhdiZ'
            });
        });
    });

    describe('getGames()', function() {
        it('requires database - @todo', function() {
            expect(true).to.be.true;
        });
    });
});
