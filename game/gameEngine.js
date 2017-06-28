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
  constructor(clientList, inter) {
    this.inter=inter;
    this.map = new Map(30,30);
    this.players=new Array(clientList.length);
    for(var i = 0; i<clientList.length; ++i)
      this.players[i] = new Player(clientList[i]);

    //first player goes first
    this.currentPlayer = 0;
    this.currentUnit = 0;
    this.turn =0;
    this.turnOver = false;

    this.spawnUnits();
    console.log(`It is ${this.players[this.currentPlayer].name} Unit's ${this.currentUnit} Turn`);
    console.log(`That means ${this.players[this.currentPlayer].units[this.currentUnit].name}'s turn!`);
  }
  requestActions(playerId, r, c) {
    //cases, empty square: skip turn, surrender
    //active unit and is yours: move, attack, spirit commands, status, skip turn.
    //any other unit: status

    var tmpPlr = this.players[this.currentPlayer]; 
    if(!this.turnOver && tmpPlr.id === playerId && this.map.tiles[r][c]
      && this.map.tiles[r][c].id === this.players[this.currentPlayer].units[this.currentUnit].id) 
    {
      return ["Move", "Attack", "Status", "Skip Turn"];
    } else {
      return ["Status", "Skip Turn", "Surrender"];
    }
  }

  requestMoveTiles(playerId, r, c){
    var tempPlayer = this.players[this.currentPlayer];
    var tempUnit = this.players[this.currentPlayer].units[this.currentUnit];
    return this.map.getPossibleMovement(r, c, tempUnit.move);
  }

  //returns true if action completes, false if action cannot be done
  doAction(player, action, r, c) {

  }

  doMoveAction(playerId,r,c,toR,toC) {
    if(!this.turnOver && this.players[this.currentPlayer].id === playerId
      && this.map.tiles[r][c].id === this.players[this.currentPlayer].units[this.currentUnit].id) 
    {
      var getPosi = this.map.getPossibleMovement(r,c,this.players[this.currentPlayer].units[this.currentUnit].move);
      if(this.isInArr(getPosi, [toR,toC])) {
        this.map.move(r,c,toR,toC);
        this.turnOver = true;
        return true;
      } else
        return false;
    } else {
      return false;
    }
  }

    //custom search funciton cause default javascript has no overloading of comparison operators
  isInArr(arr1, arr2) {
    var a = JSON.stringify(arr1);
    var b = JSON.stringify(arr2);
    return a.indexOf(b) != -1;
  }

  getWeaponsAction(player, r, c) {

  }

  attackAction(player, r, c, tR, tC) {

  }

  //put each player's units on the map
  //right now hard coded for just 2 playes an one unit each
  spawnUnits(){
    this.players[0].units[0].setRC(15,5);
    this.players[1].units[0].setRC(15,25);
    this.map.tiles[15][5]=this.players[0].units[0];
    this.map.tiles[15][25]=this.players[1].units[0];
    console.log(this.map.getAsciiMap());
  }
  

}

module.exports = Game;
