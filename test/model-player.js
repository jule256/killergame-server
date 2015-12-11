'use strict';

process.env.NODE_ENV = 'test';

var Shortid = require('shortid'),
    expect = require("chai").expect,
    should = require('chai').should(),
    mongoose = require('mongoose'), // mongo connection
    Md5 = require('md5'),
    config = require('../config/config'),
    PlayerModel = require('../model/player'),
    isValidDate,
    newPlayerData,
    playerModel;

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

describe('model/player.js', function() {

    beforeEach(function(done) {
        config.passwordHash = 'oi82s0923&safgh+e.!¨';
        config.scoreIncreaseWin = 3;

        // standard player parameter for the tests
        newPlayerData = {
            name: 'Player One',
            username: 'player-one',
            email: 'player-one@example.com'
        };

        playerModel = mongoose.model('Player');

        done();
    });

    describe('create()', function() {
        it('default values', function(done) {
            playerModel.create(newPlayerData, function (err, player) {
                should.not.exist(err);

                expect(player.playerId).to.equal('');
                expect(player.name).to.equal('Player One');
                expect(player.username).to.equal('player-one');
                expect(player.score).to.equal(0);
                expect(player.created_at).to.be.null;
                expect(player.active).to.be.true;

                done();
            });
        });
    });

    describe('initialize()', function() {
        it('password, playerId, created_at', function (done) {
            playerModel.create(newPlayerData, function (err, player) {
                should.not.exist(err);

                expect(player.playerId).to.equal('');
                expect(player.name).to.equal('Player One');
                expect(player.username).to.equal('player-one');
                expect(player.score).to.equal(0);
                expect(player.created_at).to.be.null;
                expect(player.active).to.be.true;

                player.initialize('some-secret-password');

                expect(player.password).to.equal(Md5('some-secret-password' + config.passwordHash))
                expect(Shortid.isValid(player.playerId)).to.be.true;
                expect(isValidDate(player.created_at)).to.be.true;

                done();
            });
        });
        it('password adapted config', function (done) {
            config.passwordHash = 'another-secret-hash';

            playerModel.create(newPlayerData, function (err, player) {
                should.not.exist(err);

                player.initialize('some-secret-password');

                expect(player.password).to.equal(Md5('some-secret-password' + 'another-secret-hash'))

                done();
            });
        });
    });

    describe('increaseScore()', function() {
        it('default parameters', function (done) {
            playerModel.create(newPlayerData, function (err, player) {
                should.not.exist(err);

                expect(player.score).to.equal(0);

                player.increaseScore(5);

                expect(player.score).to.equal(5);

                player.increaseScore(1);

                expect(player.score).to.equal(6);

                done();
            });
        });
        it('no parameters', function (done) {
            playerModel.create(newPlayerData, function (err, player) {
                should.not.exist(err);

                expect(player.score).to.equal(0);

                player.increaseScore();

                expect(player.score).to.equal(3);

                player.increaseScore(1);

                expect(player.score).to.equal(4);

                done();
            });
        });
        it('no parameters adapted config', function (done) {

            config.scoreIncreaseWin = 5;

            playerModel.create(newPlayerData, function (err, player) {
                should.not.exist(err);

                expect(player.score).to.equal(0);

                player.increaseScore();

                expect(player.score).to.equal(5);

                player.increaseScore(1);

                expect(player.score).to.equal(6);

                done();
            });
        });
    });

    describe('sanitizeForOutput()', function() {
        it('check output', function (done) {
            var sanitized;

            playerModel.create(newPlayerData, function (err, player) {
                should.not.exist(err);

                player.initialize('some-secret-password');

                sanitized = player.sanitizeForOutput();

                expect(sanitized.created_at).to.be.an('undefined');
                expect(sanitized.__v).to.be.an('undefined');
                expect(sanitized._id).to.be.an('undefined');

                done();
            });
        });
    });
});
