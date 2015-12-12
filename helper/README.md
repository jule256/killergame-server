# LIST OF ERROR RESPONSE KEYS

| key                   | text               | meaning                                 |
| :-------------------- |:-------------------| ---------------------------------------:|
| `database_0001`       | there was an error querying the database                 | - |
| `database_0002`       | there was an error writing to the database               | - |
| `database_0003`       | there was an error deleting from the database            | - |
| ``      |  | - |
| `player_register_0001`      | not all necessary data is set                      | - |
| `player_register_0002`      | passwords do not match                             | - |
| `player_register_0003`      | player already exists in database                  | - |
| `player_register_0004`      | only own player-data can be updated                | - |
| ``      |  | - |
| `player_update_0001`      | not all necessary data is set                        | - |
| `player_update_0002`      | email address already exists in database             | - |
| ``      |  | - |
| `player_0001`        | player with id `<playerId>` does not exist                | - |
| `player_0002`        | player with id `<username>` does not exist                | - |
| `player_0003`        | player with the given credentials does not exist          | - |
| ``      |  | - |
| `player_login_0001`  | username and/or password is invalid                       | - |
| ``      |  | - |
| `player_auth_0001`  | token authentication failed                                | - |
| `player_auth_0002`  | no token provided                                          | - |
| ``      |  | - |
| `game_0001`      | game with id "`<gameId>`" does not exist                      | - |
| `game_0002`      | game does not belong to user `<username>`                     | - |
| `game_0003`      | this game is already over                                     | - |
| `game_0004`      | it is not your turn                                           | - |
| `game_0005`      | coordinates are not within bounds                             | - |
| `game_0006`      | slot `<moveData.x>`/`<moveData.y>` cannot be used             | - |
| `game_0007`      | player not found in database                                  | - |
| `game_0008`      | player1 and/or player2 username not set                       | - |
| `game_0009`      | player1 and player2 can't be the same                         | - |
| `game_0010`      | cannot create game for other players                          | - |
| `game_0011`      | cannot retrieve game of other players                         | - |
| `game_0012`      | cannot make move for game of other players                    | - |
| `game_0013`      | cannot forfeit game of other players                          | - |
| `game_0014`      | could not create new game                                     | - |
| `game_0015`      | could not initialize new game                                 | - |
| `game_0016`      | cannot accept challenge of game if user is not the challengee | - |
| `game_0017`      | cannot accept challenge of game if status is not "prestart"   | - |
| `game_0018`      | cannot delete game of other players                           | - |
| `game_0019`      | cannot delete game which is not in status "prestart"          | - |
| ``      |  | - |
| ``      |  | - |
| ``      |  | - |
| ``      |  | - |
| ``      |  | - |
| ``      |  | - |
| ``      |  | - |
| ``      |  | - |
| ``      |  | - |
| ``      |  | - |
| ``      |  | - |
| ``      |  | - |