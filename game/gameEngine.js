"use strict";

var mogoose;

var Map = require("./map.js");
var Player = require("./player.js")

// game engine will keep track of everything.

// Client asks for available actions, engine returns answer.

// Client requests action to take place, 
// engine either accepts it, runs it, and then returns ok.  
// Or returns fail (with msg).

// Design for two players first, then go from there.//

class Game  {
  constructor(clientList) {
    this.map = new Map(50,50);
    this.players=new Array(clientList.length);
    for(var i = 0; i<clientList.length; ++i)
      players[i] = new Player(clientList[i]);

    //first player goes
    this.currentPlayer = 0;
    this.turn =0;
  }
  requestActions(player, x, y) {
    //cases, empty square: skip turn, surrender
    //active unit and is yours: move, attack, spirit commands, status, skip turn.
    //any other unit: status
  }
  

}

module.exports = Game;