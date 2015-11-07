# KILLERGAME-SERVER

## basic concept

A detailed description of the available routes can be found in the [routes/README.md file](routes/README.md).

| Player 1 (username _spieler1_)                               |   | Player 2 (username _spieler2_)                                             |
| :------------------------------------------------------------|:-:|---------------------------------------------------------------------------:|
| Login with `POST /login`                                     |   | Login with `POST /login`                                                   |
| list all available players with `GET /player/available`      |   |                                                                            |
| challange _player2_ with `POST /game`                        |   |                                                                            |
| list all games _player1_ is the challenger with `GET /game/challenger` | | list all games _player2_ is challenged with `GET /game/challengee` |
|                                                              |   | accept a challenge with **@todo**                                          |
| list all accepted challenges with `GET /game/accepted`       |   |                                                                            |
| make move with `PUT /game/<gameId>`                          | ↔ | make move with `PUT /game/<gameId>`                                        |
|  _player1_ wins                                      | **End of game A** | _player2_ wins                                                     |
| _player1_ gives up with `PUT /game/<gameId>/forfeit` | **End of game B** | _player2_ gives up with `PUT /game/<gameId>/forfeit`               |
| the game ends draw                                   | **End of game C** | the game ends draw                                                 |

## sources

based on https://github.com/kacole2/express-node-mongo-skeleton

authentication system based on https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens

## maybe

chat: https://scotch.io/tutorials/a-realtime-room-chat-app-using-node-webkit-socket-io-and-mean