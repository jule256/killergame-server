# REST API
⚠  Don't forget to add the Header "_Content-Type application/json_" to your requests.

**@todo:** documentation of responses in case of errors

### Endpoint REGISTER
**POST /register** creates a new player with the given payload
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
	    }
    }
```
---
**GET /register** lists all players with default offset, default limit, and default sorting

**GET /register/limit/`<limit-value>`** lists all players with limit `<limit-value>`, default offset and default sorting

**GET /register/limit/`<limit-value>`/offset/`<offset-value>`** lists all players with limit `<limit-value>`, offset `<offset-value>`, and default sorting

**GET /register/limit/`<limit-value>`/offset/`<offset-value>`/sort/`<sort-column>`/`<sort-direction>`** lists all players with limit `<limit-value>`, offset `<offset-value>` sorted by `<sort-column>` in direction `<sort-direction>` (can be `asc` or `desc`)
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
	        [...]
	        {
	        	"playerId": <playerId> // the playerId is needed for all player related requests
		        "password": "<the hashed secret password>",
		        "name": "<name of the player>",
		        "email": "<email-address of the player>",
		        "username": "<username of the player>",
		        "active": true,
		        "score": <score of the player>
	        },
	    ]
    }
```
---
**GET /register/`<playerId>`** returns data of the player with the id `<playerId>`
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
**PUT /register/`<playerId>`** updates the data of the player with the given `<playerId>`
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
        "game": {
            "field": "[<field>]", // JSON stringified array
            "player1": "<usernamePlayer1>",
            "player2": "<usernamePlayer2>",
            "setCoord": [], // will contain the coordinates of the winning set if the game is over
            "status": "<status>", // can be 'inprogress' or 'finished'
            "activePlayer": "player2", // the currently active player, can be 'player1' or 'player2'
            "fieldHeight": 10,
            "fieldWidth": 10,
            "gameId": <gameId> // the gameId is needed for all game related requests
        }
        // @todo maybe add "lastMoveData" to the response
    }
```
---
**DELETE /register`<playerId>`** deletes the player with the id `<playerId>`(not implemented yet)
### Endpoint GAME
**POST /game** creates a new game for `<usernamePlayer1>` and `<usernamePlayer2>` with the dimensions of `<fieldWidth>` &times; `<fieldHeight>` (optional)
```
Payload
{
    "player1": "<usernamePlayer1>",
    "player2": "<usernamePlayer2>",
    "fieldWidth": <custom-width-of-the-field>, // Number (default is 10)
    "fieldHeight": <custom-height-of-the-field> // Number (default is 10)
}
Example {"player1": "spieler 1", "player2": "spieler 2", "fieldWidth": 10, "fieldHeight": 10}
```
```
Response
    {
        "game": {
            "field": "[<field>]", // JSON stringified array
            "player1": "<usernamePlayer1>",
            "player2": "<usernamePlayer2>",
            "setCoord": [], // will contain the coordinates of the winning set if the game is over
            "status": "prestart",
            "activePlayer": "player1", // the currently active player, can be 'player1' or 'player2'
            "fieldHeight": 10,
            "fieldWidth": 10,
            "gameId": <gameId> // the gameId is needed for all game related requests
        }
    }
```
---
**GET /game** lists all games (not implemented yet)
---
**GET /game/`<gameId>`** returns data of the game with the id `<gameId>`
```
Response
    {
        "game": {
            "field": "[<field>]", // JSON stringified array
            "player1": "<usernamePlayer1>",
            "player2": "<usernamePlayer2>",
            "setCoord": [], // will contain the coordinates of the winning set if the game is over
            "status": "<status>", // can be 'prestart', 'inprogress', 'finished'
            "activePlayer": "player2", // the currently active player, can be 'player1' or 'player2'
            "fieldHeight": 10,
            "fieldWidth": 10,
            "gameId": <gameId> // the gameId is needed for all game related requests
        }
    }
```
---
**PUT /game/`<gameId>`** puts a piece at the coordinate `<x coordinate>`/`<y coordinate>` for the username `<theUsername>` in the game with the id `<gameId>`
```
Payload
{
    "x": "<x coordinate>",
    "y": "<y coordinate>",
    "username": "<theUsername>"
}
Example {"x": "4", "y": "3", "username": "spieler 1"}
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
            "activePlayer": "player2", // the currently active player, can be 'player1' or 'player2'
            "fieldHeight": 10,
            "fieldWidth": 10,
            "gameId": <gameId> // the gameId is needed for all game related requests
        }
        // @todo maybe add "lastMoveData" to the response
    }
```
### Endpoint DEV
**POST /dev** is a development route you can use to debug/test things
```
Payload
{
    "dev-key": "<dev-value>",
    "test-key": "<test-value>"
}
```
---
**GET /dev** is a development route you can use to debug/test things




