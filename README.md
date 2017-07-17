# Super Robot Wars Multiplayer Fan Game
___

This is a fan game (strictly for non profit, educational purpose only, please don't sue us!) based off of Bandai Namco's Super Robot Taisen: Original Generation 2 video game for the Nintendo Game Boy Advance.  

The app was developed using Node.js, Express.js, Mongoose, Ejs, Passport.js, and Bcrypt on the backend. And jQuery, jQuery UI, Bootstrap, and Ejs for the front end.  Socket.io is used as the main method of enabling the game client and game server communicate with each other.

Besides the above mentioned technologies and packages/libraries, the main game engine, the game interface between the engine and socket.io, and the game client has been hand coded to purpose.

This is the result of all the learning and experience the UT Coding Bootcamp powered by TrilogyEd has given us over the past six months.  It may have been ambitious to believe we could code a complex working game in less than a month, but we have gotten close.  Most of the big features we wanted are in, all that is left is a lot of polish and bug fixes.

___
### To run the app
```
npm install
node server.js
```

#### Enviormental variables used
```
MONGODB_URI=mongodb://localhost/project3
POPULATE_MONGODB=true
```
You only need run the server once with ```POPULATE_MONGODB=true``` to initialize the information in the database (unless there is an update to the data in /database or the models in /models).  Afterwards you can set to false or remove it completely and the app will still work.  
___
#### Try it out online!
You can try out the game using one of the test accounts, or make your own account.
The game is hosted on Heroku at: [http://srw-og2-multiplayer.herokuapp.com/](http://srw-og2-multiplayer.herokuapp.com/)

#### How to Play
+ Login or create an account.
+ You can change your team at the profile page, or keep it as the random one assigned to you.
+ Go to the game lobby
+ Join one of the rooms that has space in it and press the ready button.
+ Once everyone in the room is ready, the game will start.
+ Each player will take turns and will be able to move one of their units (the active unit is indicated by the blinking green tile, and is highlighted on the player list on either side of the map.)
+ Clicking on a unit on the map will give you a list of options you do with the unit.
+ If it is your turn, and you click on the active unit for the turn, you'll be given to option to Move, Attack, Spirit Command.
+ Choosing Move will highlight tiles that the unit can move to. Click on one to move the unit to that tile.
+ From here, you can either Attack, Standby, or Cancel
+ Cancel will move your unit back to the starting position.
+ Standby ends your turn.
+ Attack brings a list of weapons.  Clicking on a weapon in the menu will show a list of squares that are in-range of the attack.  If there is an enemy in range, click on it to attack that unit.
+ If the weapon you chose to attack the enemy with can attack, it will bring up a confirmation that gives you some information, the most important being the hit percentage.  Here you can either cancel, to consider your other options or perhaps cast some spirit commands.  If you confirm, a defense menu will show on the enemy player's screen and give them their defense options.
+ Defense options include Attack, Evade, Defend.  Evade halves the hit percent if it is not 100, Defend halves the damage if the attack hits.  Attack will bring up a list of weapons and their hit percentages.  Clicking on one will set that as your defense attack weapon.
+ After the defender chooses a defense action, the game will calculate the results and then move on to the next player and their unit.
+ If the player loses all their units, they are defeated and may freely leave the game, or stay to continue watching and chatting.
+ Surrendering or disconnecting will count as being defeated.
+ The game continues on in this until there is only one player not defeated.  At which point that player is declared the winner, and the game will end and all players still in the room will be sent back to the lobby.


##### Notes about the game.
Each unit is a combination of a pilot and a mech, and both have their own unique stats, abilities, and skills.  Some of which dramatically affect the game or how they move, attack, or defend.  In addition, each pilot has six Spirit Commands that act like spells.  Most of these buff only the unit casting them, increasing their stats in some way, but some can target the unit's allies to heal or buff them instead.

In addition to the base stats of the pilots and mechs, each weapon, yours and the enemies, needs to be taken into account when deciding the best move for your turn.  A weapon might have limited ammo, cost energy to use, or cannot be activated until the pilot's will has increased enough to enable the weapon.  Some weapons can only be used if you have have not moved before attacking, while others can be used both before and after moving.

Viewing the status of the enemy team and your own units will show you a window with all the unit's stats, and is invaluable in learning about what the unit can do.

##### Test Account credentials
```
Account 1: 
  Email: test1@test1.com
  Password: test1
Account 2:
  Email: test2@test2.com
  Password: test2
```
___
#### Notes about the game engine design.
The game engine talks to the game interface which talks to socket.io which sends and receives messages from the client.

The main game engine is event driven and designed to be (or try to be) as interface agnostic as possible.  It receives action requests from the game interface and returns a response object based on the condition and state of the game.  The response object contains at least a success flag and a message, or other data as appropriate.

There are two main categories of action requests, Get and Do.  Get requests are requests just for information (who's turn it is, about the stats of a unit, what is the map at r,c, etc.)  Do requests are requests that will alter the game state in some way.  If a do request is successful, then the state of the game will alter based on what the action was (attacking another unit to will apply damage, moving will update the map and send it everyone, etc.)  

The game engine will also emit information to game interface to send to clients at times.  These are mostly used for map updates, or updates to the a player's unit's stats (updating hit point display, energy, or status).


___
#### Authors (Main Contributions/Tasks)
* Jacob Wallace: Front End Game UI, Game Design, Server/Client Integration
* Zach Zador: User Authentication, Front End Page Design, Express Routes.
* Grant Daniels: Game Design, Game Engine, Server/Client Integration, Data collection, Database Management
___
##### Notes:
All character and mech/robot names and and their images are owned by Bandai Namco Entertainment.