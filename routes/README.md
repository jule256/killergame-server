GAME

POST /game
   Payload: {"player1": "<usernamePlayer1>", "player2": "<usernamePlayer2>"}
   -> creates a new game for <usernamePlayer1> and <usernamePlayer2>
   
   {"player1": "spieler 1", "player2": "spieler 2"}
   
GET /game (not implemented yet)
   -> lists all games

GET /game/<gameId>
   -> returns data of the game with the id <gameId>

PUT /game/<gameId>
   Payload: {"x": "<x coordinate>", "y": "<y coordinate>", "username": "<theUsername>"}
   -> puts a piece at the coordinate x/y for the username <theUsername> in the game with the id <gameId>

   {"x": "4", "y": "3", "username": "spieler 1"}



DEV

GET /dev
   -> development route
       
POST http://127.0.0.1:3000/dev
   Payload: {"dev-key": "dev-value"}
   -> development route