# REST API
⚠  Don't forget to add the Header "_Content-Type application/json_" to all your requests.

## Restricted and unrestricted endpoints

Restricted endpoints (marked with a 🔐 below) are only accessable with a token. A token can be obtained by a correct login using the [POST /login endpoint](README.md#endpoint-login) and is basically a long string containing numbers and letters.

To get data from a restricted endpoint, the token has to be send using a custom header:
```
x-access-token: <the token string>
```

Unrestricted endpoints (marked with a 🔓 below) are accessible without the custom `x-access-token` header.

## Error Responses

Possible response error key/text values are outlined in the [list of error response keys](../helper/README.md).

## Endpoints

### Endpoint REGISTER
**🔓 POST /register** creates a new player with the given payload
```
Payload
{
    "name": "<name of the player>",
    "username": "<username of the player>",
    "email": "<email-address of the player>",
    "password_1": "<a-secret-pw>",
    "password_2": "<the-same-secret-pw>"
}
Example {"name": "Spieler 3", "username": "spieler_3", "email": "spieler3@example.com", "password_1": "ein-passwort", "password_2": "ein-passwort"}
```
```
Response
{
    "player": {
        "playerId": <playerId> // the playerId is needed for all player related requests
        "password": "<the hashed secret password>",
        "name": "<name of the player>",
        "email": "<email-address of the player>",
        "username": "<username of the player>",
        "active": true,
        "score": 0
    },
    "token": "<the token usable to access restricted endpoints>"
}
```
---
**🔓 GET /register** lists all players with default offset, default limit, and default sorting

**🔓 GET /register/limit/`<limit-value>`** lists all players with limit `<limit-value>`, default offset and default sorting

**🔓 GET /register/limit/`<limit-value>`/offset/`<offset-value>`** lists all players with limit `<limit-value>`, offset `<offset-value>`, and default sorting

**🔓 GET /register/limit/`<limit-value>`/offset/`<offset-value>`/sort/`<sort-column>`/`<sort-direction>`** lists all players with limit `<limit-value>`, offset `<offset-value>` sorted by `<sort-column>` in direction `<sort-direction>` (can be `asc` or `desc`)
```
Response
{
    "players": [
        {
            "playerId": <playerId> // the playerId is needed for all player related requests
            "password": "<the hashed secret password>",
            "name": "<name of the player>",
            "email": "<email-address of the player>",
            "username": "<username of the player>",
            "active": true,
            "score": <score of the player>
        },
        // further players skipped
    ]
}
```
---
**🔓 GET /register/`<playerId>`** returns data of the player with the id `<playerId>`
```
Response
{
    "player": {
        "playerId": <playerId> // the playerId is needed for all player related requests
        "password": "<the hashed secret password>",
        "name": "<name of the player>",
        "email": "<email-address of the player>",
        "username": "<username of the player>",
        "active": <boolean>, // true or false
        "score": <number> // the current score of the player
    }
}
```
---
**🔐 PUT /register/`<playerId>`** updates the data of the player with the given `<playerId>`
```
Payload
{
    "name": "<name of the player>",
    "email": "<email-address of the player>",
    "password_1": "<a-new-secret-pw>",
    "password_2": "<the-same-new-secret-pw>"
}
Example {"name": "Spieler 3 neu", "email": "spieler3neu@example.com", "password_1": "ein-neues-passwort", "password_2": "ein-neues-passwort"}
```
```
Response
{
    "player": {
        "playerId": <playerId> // the playerId is needed for all player related requests
        "password": "<the hashed secret password>",
        "name": "<name of the player>",
        "email": "<email-address of the player>",
        "username": "<username of the player>",
        "active": <boolean>, // true or false
        "score": <number> // the current score of the player
    }
}
```
---
**🔐 DELETE /register`<playerId>`** deletes the player with the id `<playerId>`(⚠ not implemented yet)
### Endpoint PLAYER
**🔓 GET /player/available** lists all players _not_ in a game with default offset, default limit, and default sorting

**🔓 GET /player/available/limit/`<limit-value>`** lists all players _not_ in a game with limit `<limit-value>`, default offset and default sorting (⚠ not stable yet)

**🔓 GET /player/available/limit/`<limit-value>`/offset/`<offset-value>`** lists all players _not_ in a game with limit `<limit-value>`, offset `<offset-value>`, and default sorting (⚠ not stable yet)

**🔓 GET /player/available/limit/`<limit-value>`/offset/`<offset-value>`/sort/`<sort-column>`/`<sort-direction>`** lists all players _not_ in a game with limit `<limit-value>`, offset `<offset-value>` sorted by `<sort-column>` in direction `<sort-direction>` (can be `asc` or `desc`) (⚠ not stable yet)
```
Response
{
    "players": [
        {
            "playerId": <playerId> // the playerId is needed for all player related requests
            "password": "<the hashed secret password>",
            "name": "<name of the player>",
            "email": "<email-address of the player>",
            "username": "<username of the player>",
            "active": false,
            "score": <score of the player>
        },
        // further players skipped
    ]
}
```
---
### Endpoint GAME
**🔐 POST /game** creates a new game for the *token username* as "player1" and `<usernamePlayer2>` as "player2" with the dimensions of `<fieldWidth>` &times; `<fieldHeight>` (optional)
```
Payload
{
    "player2": "<usernamePlayer2>",
    "fieldWidth": <custom-width-of-the-field>, // Number (default is 10)
    "fieldHeight": <custom-height-of-the-field> // Number (default is 10)
}
Example {"player2": "spieler 2", "fieldWidth": 10, "fieldHeight": 10}
```
```
Response
{
    "game": {
        "player1": "<usernamePlayer1>",
        "player2": "<usernamePlayer2>",
        "field": "[<field>]", // JSON stringified array
        "moveCount": 0,
        "setCoord": [],
        "status": "prestart",
        "result": "",
        "activePlayer": "player1", // the currently active player, can be 'player1' or 'player2'
        "fieldHeight": 10,
        "fieldWidth": 10,
        "gameId": <gameId> // the gameId is needed for all game related requests
    }
}
```
---
**🔐 GET /game/challengee** lists all games in which the *token username* is "player2" ("he or she was challenged") and the status is "prestart" (meaning the challange has not been accepted yet)
```
Response
{
    "games": [
        {
            "player1": "<usernamePlayer1>",
            "player2": "<usernamePlayer2>", // identical to the username encoded in the token
            "field": "[<field>]", // JSON stringified array
            "moveCount": 0,
            "setCoord": [],
            "result": "",
            "status": "prestart",
            "activePlayer": "<usernamePlayer1>",
            "fieldHeight": 10,
            "fieldWidth": 10,
            "gameId": <gameId>
        },
        // further games skipped
    ]
}
```
---
**🔐 GET /game/challenger** lists all games in which the *token username* is "player1" ("he or she challenged somebody") and the status is "prestart" (meaning the challangee has not accepted yet)
```
Response
{
    "games": [
        {
            "player1": "<usernamePlayer1>", // identical to the username encoded in the token
            "player2": "<usernamePlayer2>",
            "field": "[<field>]", // JSON stringified array
            "moveCount": 0,
            "setCoord": [],
            "result": "",
            "status": "prestart",
            "activePlayer": "<usernamePlayer1>",
            "fieldHeight": 10,
            "fieldWidth": 10,
            "gameId": <gameId>
        },
        // further games skipped
    ]
}
```
---
**🔐 GET /game** lists all games (⚠ not implemented yet)

---
**🔐 GET /game/`<gameId>`** returns data of the game with the id `<gameId>`
```
Response
{
    "game": {
        "field": "[<field>]", // JSON stringified array
        "player1": "<usernamePlayer1>",
        "player2": "<usernamePlayer2>",
        "setCoord": [], // will contain the coordinates of the winning set if the game is over
        "status": "<status>", // can be 'prestart', 'inprogress', 'finished'
        "result": "" // can be 'forfeit_player1' or 'forfeit_player2' or 'win_player1' or 'win_player2' or empty
        "activePlayer": "player2", // the currently active player, can be 'player1' or 'player2'
        "fieldHeight": 10,
        "fieldWidth": 10,
        "gameId": <gameId> // the gameId is needed for all game related requests
    }
}
```
---
**🔐 PUT /game/`<gameId>`** puts a piece at the coordinate `<x coordinate>`/`<y coordinate>` for the *token username* in the game with the id `<gameId>`
```
Payload
{
    "x": "<x coordinate>",
    "y": "<y coordinate>"
}
Example {"x": "4", "y": "3"}
```
```
Response
{
    "game": {
        "field": "[<field>]", // JSON stringified array
        "player1": "<usernamePlayer1>",
        "player2": "<usernamePlayer2>",
        "setCoord": [], // will contain the coordinates of the winning set if the game is over
        "status": "<status>", // can be 'inprogress' or 'finished'
        "result": "win_player2" // can be 'win_player1' or 'win_player2' or empty
        "activePlayer": "player2", // the currently active player, can be 'player1' or 'player2'
        "fieldHeight": 10,
        "fieldWidth": 10,
        "gameId": <gameId> // the gameId is needed for all game related requests
    }
    // @todo maybe add "lastMoveData" to the response
}
```
---
**🔐 PUT /game/`<gameId>`/forfeit** forfeits the game with the id `<gameId>` for the player with for the *token username*
```
Payload (none)
```
```
Response
{
    "game": {
        "field": "[<field>]", // JSON stringified array
        "player1": "<usernamePlayer1>",
        "player2": "<usernamePlayer2>",
        "setCoord": [], // will contain the coordinates of the winning set if the game is over
        "status": "finished",
        "result": "forfeit_player2" // can be 'forfeit_player1' or 'forfeit_player2'
        "activePlayer": "player2", // the currently active player, can be 'player1' or 'player2'
        "fieldHeight": 10,
        "fieldWidth": 10,
        "gameId": <gameId> // the gameId is needed for all game related requests
    }
}
```
### Endpoint LOGIN
**🔓 POST /login** returns the auth-token for the player with username `<username>` and password `<password>` if the player exists in database
```
Payload
{
    "username": "<username>",
    "password": "<password>"
}
Example {"username": "spieler_1", "password": "secret-password"}
```
```
Response
{
    "token": "<the-secret-token>"
}
```
---

### Endpoint DEV
**🔓 POST /dev** is a development route you can use to debug/test things
```
Payload
{
    "dev-key": "<dev-value>",
    "test-key": "<test-value>"
}
```
---
**🔓 GET /dev** is a development route you can use to debug/test things




