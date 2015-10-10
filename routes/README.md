# REST API
![]({{site.baseurl}}/https://cdn2.iconfinder.com/data/icons/diagona/icon/16/050.png) Don't forget to add the Header "_Content-Type application/json_" to your requests.
### Endpoint GAME
**POST /game** creates a new game for <usernamePlayer1> and <usernamePlayer2>
```
Payload
{
    "player1": "<usernamePlayer1>",
    "player2": "<usernamePlayer2>"
}
Example {"player1": "spieler 1", "player2": "spieler 2"}
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
**GET /game** lists all games (not implemented yet)

**GET /game/<gameId>** returns data of the game with the id <gameId>
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
**PUT /game/<gameId>** puts a piece at the coordinate <x coordinate>/<y coordinate> for the username <theUsername> in the game with the id <gameId>
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
**GET /dev** is a development route you can use to debug/test things




