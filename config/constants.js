'use strict';

module.exports = {

    // game status constants
    status: {
        prestart: 'prestart',
        ready: 'ready',
        inprogress: 'inprogress',
        finished: 'finished'
    },

    // game result constants
    result: {
        'default': '',
        draw: 'draw',
        win_player1: 'win_player1',
        win_player2: 'win_player2',
        forfeit_player1: 'forfeit_player1',
        forfeit_player2: 'forfeit_player2'
    },

    // player constants
    player1: 'player1',
    player2: 'player2',

    // token constants
    token: {
        player1: 'x',
        player2: 'o'
    }
};