"use strict";

var mogoose;

var Map = require("./map.js");
var Player = require("./player.js")

var Flags = require("./statesAndFlags.js").game.state;

// game engine will keep track of everything.

// Client asks for available actions, engine returns answer.

// Client requests action to take place, 
// engine either accepts it, runs it, and then returns ok.  
// Or returns fail (with msg).

// Design for two players first, then go from there.//

class Game  {
  constructor(clientList, inter) {
    this.inter=inter;
    this.map = null;
    this.players=[];
    for(var i = 0; i<clientList.length; ++i)
      if(clientList[i])
        this.players.push(new Player(clientList[i]));

    this.numPlayers=this.players.length;
    //first player goes first
    this.currentPlayer=-1;
    this.pRef = null;
    this.uRef = null;
    this.turn =null;
    this.target = null;
    this.weapon = null;

    this.posR=-1;
    this.posC=-1;
    this.oldR=-1;
    this.oldC=-1;

    this.flags=[];

    this.gameStart(30,30);
  }

  gameStart(r,c,filePath=null) {
    //select first player and unit to go, set flags values as necessry, emit status to clients;
    this.map = new Map(r,c);
    this.pRef = this.getNextPlayer();
    this.uRef = this.pRef.getNextUnit();
    this.turn = 0;
    this.posR = this.uRef.r;
    this.posC = this.uRef.c;
    this.oldR = this.uRef.r;
    this.oldC = this.uRef.c;
    this.addFlag(Flags.newRound);

    this.spawnUnits();
    console.log(`It is ${this.pRef.name} Unit's ${this.uRef.name} Turn`);
    console.log(`That means ${this.uRef.name}'s turn!`);
    this.emitMap(); 
    this.mainLoop();
  }

  //need to expand to account for when unit is dead, but testing will ignore for now
  getNextPlayer() {
    this.currentPlayer++;
    if(this.currentPlayer>=this.players.length)
      this.currentPlayer=0;

    return this.players[this.currentPlayer];
  }

  addFlag(flag) {
    if(!this.flags.includes(flag))
      this.flags.push(flag);
  }

  removeFlag(flag) {
    var index = this.flags.indexOf(flag);
    if(index!==-1)
      this.flags.splice(index, 0);
  }

  emptyFlags() {
    this.flags=[];
  }

  inFlags(...flag) {
    for(var i=0; i<flag.length; ++i)
      if(!this.flags.includes(flag[i]))
        return false;
    return true;
  }

  flagsHasOne(...flag){
    for(var i=0; i<flag.length; ++i)
      if(this.flags.includes(flag[i]))
        return true;
  }

  mainLoop(nextState) {
    if(this.inFlags(Flags.newRound)){

    }
  }

  getActions(playerId, r, c) {
    //need to expand once Spirit commands are introduced
    var selUnit = this.map.tiles[r][c];

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return ["Status", "Skip Turn", "Surrender"];
      } else if(selUnit.id !== this.uRef.id){
        return ["Status"];
      } else if(this.inFlags(Flags.newRound)) {
        return ["Move", "Attack", "Status"];
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return ["Attack", "Standby", "Cancel"];
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && this.inFlags(Flags.hasHitAndAway)) {
        return ["Move", "Standby"];
      } else {
        return [];
      }
    } else if(!selUnit) {
      return ["Surrender"];
    } else {
      return ["Status"];
    }


/*
    //This use a s a reference for states
    //This pattern is used for all getSomething, doSomething requests coming from the client

    //get tile at r,c
    var selUnit = this.map.tiles[r][c];

    //if current players is the player requesting the get
    if(this.pRef.id===playerId){
      //if the r,c square is empty
      if(!selUnit) {
        return ["Status", "Skip Turn", "Surrender"];
      } 
      //if the the tile contains a unit is not the active unit
      else if(selUnit.id !== this.uRef.id){
        return ["Status"];
      } 
      //State1:  if it is the start of a new round (the active unit has not commited any actions)
      else if(this.inFlags(Flags.newRound)) {
        return ["Move", "Attack", "Status"];
      } 
      //State2: if the unit has moved but not attacked yet
      else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return ["Attack", "Standby", "Cancel"];
      } 
      //state3: If the unit has attacked but not moved and has attack and away
      else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && this.inFlags(Flags.hasHitAndAway)) {
        return ["Move", "Standby"];
      } 
      //State4: current Unit is done for the round (or should be if they here to this else)
      else {
        return [];
      }
    } 
    //if selected unit is an empty square (and you are not the current playern requesting)
    else if(!selUnit) {
      return ["Surrender"];
    } 
    //else the tile holds something
    else {
      return ["Status"];
    }
*/

  }

  getMove(playerId, r, c) {
    var sucRes = {success: true, tiles: this.map.getPossibleMovement(r, c, this.uRef.move), actions:["Cancel"]};
    var failRes = {success: false, tiles: [], actions:[]};
    var failRes2 = {success: false, tiles: [], actions:["Cancel"]};
    var selUnit = this.map.tiles[r][c];

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        return sucRes;
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return failRes2;
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && this.inFlags(Flags.hasHitAndAway)) {
        return sucRes;
      } else {
        return failRes;
      }
    } else if(!selUnit) {
      return failRes;
    } else {
      return failRes;
    }
  }

  requestMoveTiles(playerId, r, c){
    return this.map.getPossibleMovement(r, c, this.uRef.move);
  }

  doMove(playerId, r, c, toR, toC) {
    var sucRes = {success: true, actions:["Attack", "Standby", "Cancel"]};
    var sucRes2 = {success: true, actions:["Standby", "Cancel"]};
    var failRes = {success: false, actions:[]};
    var failRes2 = {success: false, actions:["Attack", "Standby","Cancel"]};

    var posMov = this.map.getPossibleMovement(r, c, this.uRef.move);

    var selUnit = this.map.tiles[r][c];

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        if(this.isInArr(posMov, [toR,toC])) {
          this.moveUnit(r,c,toR,toC);
          this.emptyFlags();
          this.addFlag(Flags.hasMoved);
          this.emitMap();
          return sucRes;
        } else{
          return failRes;
        }
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return failRes2;
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && this.inFlags(Flags.hasHitAndAway)) {
        if(this.isInArr(posMov, [toR,toC])) {
          this.moveUnit(r,c,toR,toC);
          this.addFlag(Flags.hasMoved);
          this.emitMap();
          return sucRes2;
        } else{
          return failRes;
        }
      } else {
        return failRes;
      }
    } else if(!selUnit) {
      return failRes;
    } else {
      return failRes;
    }
  }

  // doMove(playerId,r,c,toR,toC) {
  //   if(!this.turnOver && this.pRef.id === playerId
  //     && this.map.tiles[r][c].id === this.uRef.id) 
  //   {
  //     var getPosi = this.map.getPossibleMovement(r,c,this.uRef.move);
  //     if(this.isInArr(getPosi, [toR,toC])) {
  //       this.map.move(r,c,toR,toC);
  //       this.turnOver = true;
  //       return true;
  //     } else
  //       return false;
  //   } else {
  //     return false;
  //   }
  // }

  moveUnit(r,c,toR,toC) {
    this.map.move(r,c,toR,toC);
    this.posR=toR;
    this.posC=toC;
  }

  //custom search funciton cause default javascript has no overloading of comparison operators
  isInArr(arr1, arr2) {
    var a = JSON.stringify(arr1);
    var b = JSON.stringify(arr2);
    return a.indexOf(b) != -1;
  }

  emitMap() {
    this.inter.emitMap(this.map.getAsciiMap());
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
