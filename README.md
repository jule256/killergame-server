# KILLERGAME-SERVER

## Setup

### Node modules

Install the dependencies with

```
<machine>:<killergame-folder> <username>$ npm install
```

### MongoDB

Make sure you got a running [MongoDB](https://www.mongodb.org/) on your system.

Then adapt the `default` case of the `getConnectionString()` method in the file [config/config.db.js](config/config.db.js) to fit your system's settings.

### Start

Start the _Killergame-Server_ with

```
<machine>:<killergame-folder> <username>$ npm start
```

You can check if the server is up and running by accessing the `ping` endpoint with a REST Client (e.g. [the RESTClient Addon for Firefox](https://addons.mozilla.org/De/firefox/addon/restclient/)):

```
GET http://127.0.0.1:3000/ping
```
```
Response
    {
        "pong": true,
        "ip": "<your ip address>",
        "time": <current timestamp>
    }
```

Check the [routes/README.md file](routes/README.md) for a more detailled description of the various endpoints.

### Test

Run the UnitTests with

```
<machine>:<killergame-folder> <username>$ npm test
```

## basic concept

A detailed description of the available routes can be found in the [routes/README.md file](routes/README.md).

| Player 1 (username _spieler1_)                               |   | Player 2 (username _spieler2_)                                               |
| :------------------------------------------------------------|:-:|-----------------------------------------------------------------------------:|
| Login with `POST /login`                                     |   | Login with `POST /login`                                                     |
| list all available players with `GET /player/available`      |   |                                                                              |
| challenge _spieler2_ with `POST /game`                       |   |                                                                              |
| list all games _spieler1_ is the challenger with `GET /game/challenger` | | list all games _spieler2_ is challenged with `GET /game/challengee` |
|                                                              |   | accept a challenge with `PUT /game/<gameId>/accept`                          |
| list all accepted challenges with `GET /game/accepted`       |   |                                                                              |
| make move with `PUT /game/<gameId>`                        | **→** | waiting _spieler1_'s move by querying `GET /game/<gameId>`                 |
| **↑**                                                        |   | **↓**                                                                        |
| waiting _spieler2_'s move by querying `GET /game/<gameId>` | **←** | make move with `PUT /game/<gameId>`                                        |
|  _spieler1_ wins                                      | **End of game A** | _spieler2_ wins                                                     |
| _spieler1_ gives up with `PUT /game/<gameId>/forfeit` | **End of game B** | _spieler2_ gives up with `PUT /game/<gameId>/forfeit`               |
| the game ends draw                                    | **End of game C** | the game ends draw                                                  |

## sources

based on https://github.com/kacole2/express-node-mongo-skeleton

authentication system based on https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens

unit testing based on https://semaphoreci.com/community/tutorials/getting-started-with-node-js-and-mocha

## maybe

~~chat: https://scotch.io/tutorials/a-realtime-room-chat-app-using-node-webkit-socket-io-and-mean~~