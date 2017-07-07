"use strict";

var mogoose;

var Promise = require("bluebird");

var Map = require("./map.js");
var Player = require("./player.js")

var Flags = require("./statesAndFlags.js").game.flags;
var Status = require("./statesAndFlags.js").unit.status;
var Skill = require("./statesAndFlags.js").pilot.skill;
var Ability = require("./statesAndFlags.js").mech.abilities;
var WepCategory = require("./statesAndFlags.js").weapon.category;
var Spirit = require("./statesAndFlags.js").pilot.spiritCommand;

var Helpers = require("../config/helpers.js");

//game Game engine class, runs the entire game.
class Game  {
  constructor(clientList, inter) {
    this.inter=inter;
    this.map = null;
    this.players=[];
    for(var i = 0; i<clientList.length; ++i)
      if(clientList[i]) {
        this.players.push(new Player(clientList[i].me));
      }

    this.numPlayers=this.players.length;
    this.winner=null;
    //first player goes first
    this.currentPlayer=-1;
    this.pRef = null;
    this.uRef = null;
    this.turn = null;
    this.target = null;
    this.weapon = null;
    this.defender = null;
    this.defWep = null;

    //things needed to be set to fully resolve an attack
    //target (targets (eventually if/when we get map weapons and chain attacks going))
    //defender
    //attacking weapon
    //defending action
    //defending weapon
    //Supports (Off/Def) (eventually)

    this.posR=-1;
    this.posC=-1;
    this.oldR=-1;
    this.oldC=-1;

    this.flags=[];
    this.unitFlags=[];

    this.gameStart(30,30);
  }

  //Set's up anything else in the game that the constructor doesn't do when first made.
  gameStart(r,c,filePath=null) {
    //select first player and unit to go, set flags values as necessry, emit status to clients;
    this.map = new Map(r,c);
    this.spawnUnits();
    this.turn = 0;
    this.nextTurn(false);
  }

  //Called to advanced the game one turn, selects a new player and new unit to be the active ones.
  nextTurn(setOldMove=true) {
     //select first player and unit to go, set flags values as necessry, emit status to clients;
    if(setOldMove)
      this.uRef.hasMoved=false;
    this.pRef = this.getNextPlayer();
    this.uRef = this.pRef.getNextUnit();
    this.turn++;
    this.posR = this.uRef.r;
    this.posC = this.uRef.c;
    this.oldR = this.uRef.r;
    this.oldC = this.uRef.c;
    this.emptyFlags();
    this.addFlag(Flags.newRound);
    this.uRef.startTurn();

    console.log(`It is ${this.pRef.name} Unit's ${this.uRef.name} Turn`);
    this.emitMap();
  }

  //Returns the player to go next;
  //need to expand to account for when unit is dead, but testing will ignore for now
  getNextPlayer() {
    this.currentPlayer++;
    if(this.currentPlayer>=this.players.length)
      this.currentPlayer=0;

    return this.players[this.currentPlayer];
  }

  //adds a flag to the flags array
  addFlag(flag) {
    if(!this.flags.includes(flag))
      this.flags.push(flag);
  }

  //removes the flag from the array if it exists in it
  removeFlag(flag) {
    var index = this.flags.indexOf(flag);
    if(index!==-1)
      this.flags.splice(index, 0);
  }

  //removes all flags from the flags array
  emptyFlags() {
    this.flags=[];
  }

  //checks to see if all flags are in the flags array
  inFlags(...flag) {
    for(var i=0; i<flag.length; ++i)
      if(!this.flags.includes(flag[i]))
        return false;
    return true;
  }

  //checks to see if at least one flag is in the flags array
  flagsHasOne(...flag){
    for(var i=0; i<flag.length; ++i)
      if(this.flags.includes(flag[i]))
        return true;
  }

  //GameInterface to Game method: returns a response based on the games state and which socket called it
  //returns list of options that a player can do at that map tile
  getActions(playerId, r, c) {
    //need to expand once Spirit commands are introduced
    var selUnit = this.map.getUnit(r,c);

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return 5; // empty square and active player
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return 4; // active player but not active unit
      } else if(this.inFlags(Flags.newRound)) {
        return 0; // active player and active unit
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return 1; // active player after unit has moved
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        return 2; // hit away, have attack and now can move
      } else if(this.inFlags(Flags.hasAttacked) && this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        return 3; // hit away, have attacked and have moved
      }
    } else if(!selUnit) {
      return 6; // empty square and NOT active player
    } else {
      return 4; // not active player and unit is in square
    }


/*
    //This use a s a reference for states
    //This pattern is used for all getSomething, doSomething requests coming from the client

    //get tile at r,c
    var selUnit = this.map.getUnit(r,c);

    //if current players is the player requesting the get
    if(this.pRef.id===playerId){
      //if the r,c square is empty
      if(!selUnit) {
        return ["Status", "Skip Turn", "Surrender"];
      }
      //if the the tile contains a unit is not the active unit
      else if(selUnit.id !== this.uRef.id  || selUnit.owner !== playerId){
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
      else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
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

  //GameInterface to Game method: returns a response based on the games state and which socket called it
  //returns a response that contains the list of possible squares a unit may move to
  getMove(playerId, r, c) {
    var sucRes = {success: true, tiles: this.map.getPossibleMovement(r, c, this.uRef.move), actions:["Cancel"]};
    var failRes = {success: false, tiles: [], actions:[]};
    var failRes2 = {success: false, tiles: [], actions:["Cancel"]};
    var selUnit = this.map.getUnit(r,c);

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        return sucRes;
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return failRes2;
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
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

  //GameInterface to Game method:
  //returns a list move squares that a unit at r,c can move to, no checking game state
  requestMoveTiles(playerId, r, c){
    return this.map.getPossibleMovement(r, c, this.uRef.move);
  }

  //GameInterface to Game method: returns a response based on the games state and which socket called it
  //Tries to move the unit, and then returns a success and then list of actions that can be taken aftwards
  doMove(playerId, r, c, toR, toC) {
    var sucRes = {success: true, actions:1, msg: `${this.uRef.name} has from ${r},${c} to ${toR},${toC}`}; // ["Attack", "Standby", "Cancel"]
    var sucRes2 = {success: true, actions:3, msg: `${this.uRef.name} has from ${r},${c} to ${toR},${toC}`}; // ["Standby", "Cancel"]
    var failRes = {success: false, actions:[], msg: `Cannot move this square`};
    var failRes2 = {success: false, actions:1, msg: `${this.uRef.name} has already moved this turn`}; // ["Attack", "Standby","Cancel"]

    var posMov = this.map.getPossibleMovement(r, c, this.uRef.move);

    var selUnit = this.map.getUnit(r,c);

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        if(Helpers.isInArr(posMov, [toR,toC])) {
          this.moveUnit(r,c,toR,toC);
          this.emptyFlags();
          this.addFlag(Flags.hasMoved);
          this.uRef.setRC(toR, toC);
          this.uRef.hasMoved=true;
          this.emitMap();
          return sucRes;
        } else{
          return failRes;
        }
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return failRes2;
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        if(Helpers.isInArr(posMov, [toR,toC])) {
          this.moveUnit(r,c,toR,toC);
          this.addFlag(Flags.hasMoved);
          this.uRef.setRC(toR, toC);
          this.uRef.hasMoved=true;
          this.emitMap();
          this.addFlag(Flags.turnOver);
          this.checkFlags();
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

  getSpirit(playerId, r, c) {
    var selUnit = this.map.getUnit(r,c);

    if(!selUnit) {
      return {success:false, spirits:[], msg: "Target square is empty"};
    } else {
      var sucRes = {success:true, spirits:selUnit.getSpiritList(), msg: `${selUnit.name}'s spirit command list`};
      return sucRes;
    }

  }

  doSpirit(playerId, r, c, toR, toC, spiritId) {
    var sucRes = {success: true, actions:[], msg:"Successfully cast spirit command"};
    var failRes = {success: false, actions:[], msg:"Cannot alter this square"};
    var failRes2 = {success: false, actions:[], msg:"Failed to cast spirit command"};

    if(this.inFlags(Flags.waitingForDef) || this.inFlags(Flags.turnOver)){
      return failRes2;
    }

    var selUnit = this.map.getUnit(r,c);
    var tarUnit = this.map.getUnit(toR,toC);

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        var didCast = selUnit.castSC(spiritId, tarUnit);
        if(didCast)
          return sucRes;
        else
          return failRes2;
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return failRes2;
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        return failRes2;
      } else if(this.inFlags(Flags.hasAttacked) && this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        return failRes2;
      }
    } else if(!selUnit) {
      return failRes;
    } else {
      return failRes;
    }
  }

  doCancel(playerId, r, c) {
    var sucRes = {success: true, actions:[], msg:"You have cancel!"};
    var sucRes2 = {success: true, actions:[], msg:"Nothing to cancel"};
    var failRes = {success: false, actions:[], msg:"Cannot cancel this square"};
    var failRes2 = {success: false, actions:[], msg:"Nothing to cancel"};

    if(this.inFlags(Flags.waitingForDef) || this.inFlags(Flags.turnOver)){
      return failRes2;
    }

    var selUnit = this.map.getUnit(r,c);

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        return sucRes2;
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        console.log(this.posR, this.posC, this.oldR, this.oldC)
        this.map.move(this.posR, this.posC, this.oldR, this.oldC);
        selUnit.setRC(this.oldR, this.oldC);
        selUnit.hasMoved=false;
        this.posR=this.oldR;
        this.posC=this.oldC;
        this.emitMap();
        this.emptyFlags();
        this.addFlag(Flags.newRound);
        return sucRes;
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        return sucRes2
      } else if(this.inFlags(Flags.hasAttacked) && this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        this.map.move(this.posR, this.posC, this.oldR, this.oldC);
        selUnit.setRC(this.oldR, this.oldC);
        selUnit.hasMoved=false;
        this.posR=this.oldR;
        this.posC=this.oldC;
        this.emitMap();
        this.removeFlag(Flags.hasMoved);
        return sucRes;
      }
    } else if(!selUnit) {
      return failRes;
    } else {
      return failRes;
    }
  }


  doStandby(playerId, r, c) {
    var sucRes = {success: true, actions:[], msg:"Unit has stoodby, turn over!"};
    var failRes = {success: false, actions:[], msg:"Cannot standby this square"};
    var failRes2 = {success: false, actions:[], msg:"Cannot Sstandby at this time"};

    if(this.inFlags(Flags.waitingForDef) || this.inFlags(Flags.turnOver)){
      return failRes2;
    }

    var selUnit = this.map.getUnit(r,c);

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        return failRes2;
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        this.addFlag(Flags.turnOver);
        this.checkFlags();
        return sucRes;
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        return failRes2;
      } else if(this.inFlags(Flags.hasAttacked) && this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        this.addFlag(Flags.turnOver);
        this.checkFlags();
        return sucRes;
      }
    } else if(!selUnit) {
      return failRes;
    } else {
      return failRes;
    }
  }

  //GameInterface to Game method: returns a response based on the games state and which socket called it
  //returns a list of weapons and actions the unit can do aftwards
  getAttack(playerId, r, c) {
    //will need to mod this to only include/flag weapons that can attack/have available targets
    var sucRes = {success: true, type: "weapons", weapons: this.uRef.weapons, actions:["Targets", "Cancel"]};
    var failRes = {success: false, type: "", weapons:[], actions:[]};
    var failRes2 = {success: false, type: "", weapons:[], actions:["Cancel"]};
    var selUnit = this.map.getUnit(r,c);

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        return sucRes;
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return sucRes;
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        return failRes2;
      } else {
        return failRes;
      }
    } else if(!selUnit) {
      return failRes;
    } else {
      return failRes;
    }
  }

  //GameInterface to Game method: returns a response based on the games state and which socket called it
  //returns an array of all possible tiles the weapon can target, and all valid tragets within that range
  getTargets(playerId, r, c, weaponId) {
    var wepRef = this.uRef.weapons[weaponId];
    var range, targets;
    if(wepRef) {
      range = this.map.getPossibleTargets(r,c,wepRef.range[0], wepRef.range[1]);
      targets = this.map.getTargets(playerId, range);
    }

    var sucRes = {success: true, range: range, targets: targets, actions:["Stats"]};
    var failRes = {success: false, range: [], targets: [], actions:[]};
    var failRes2 = {success: false, range: [], targets: [], actions:["Cancel"]};

    var selUnit = this.map.getUnit(r,c);

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        return sucRes;
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return sucRes;
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        return failRes2;
      } else {
        return failRes;
      }
    } else if(!selUnit) {
      return failRes;
    } else {
      return failRes;
    }
  }

  //GameInterface to Game method: returns a response based on the games state and which socket called it
  //Returns hit statstic about a specific weapon when target a unit at toR, toC
  getStats(playerId, r, c, toR=0, toC=0, weaponId) {
    var wepRef = this.uRef.weapons[weaponId];
    var selUnit = this.map.getUnit(r,c);
    var tarUnit = this.map.getUnit(toR,toC);

    if(!selUnit || !tarUnit) {
      return {success: false, actions:[]};
    }

    var sucRes = {success: true, stats: this.getAttackStats(selUnit, tarUnit, null), actions:["Stats"]};
    var failRes = {success: false, actions:[]};
    var failRes2 = {success: false, actions:["Cancel"]};


    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        return sucRes;
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return sucRes;
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        return failRes2;
      } else {
        return failRes;
      }
    } else if(!selUnit) {
      return failRes;
    } else {
      return failRes;
    }
  }

  getWeapons(playerId, r, c, weaponId) {
    var wepRef = this.uRef.weapons[weaponId];
    var selUnit = this.map.getUnit(r,c);

    if(!selUnit) {
      return {success: false, weapons:[]};
    }
    else {
      return {success: true, weapons: selUnit.getWeapons()}
    }

  }

  getStatus(playerId, r, c) {
    var selUnit = this.map.getUnit(r,c);

    if(!selUnit) {
      return {success: false, msg:"Target square is empty"};
    }

    var sucRes = {success: true, status: selUnit.getStatus(), msg:`${selUnit.name}'s stats have been sent!`};
    return sucRes;

  }

  //GameInterface to Game method: returns a response based on the games state and which socket called it
  //tries to actually attack the unit at toR, toC with the weapon, erturns true or false if the attack fails or not
  doAttack(playerId, r, c, toR, toC, weaponId) {
    var wepRef = this.uRef.weapons[weaponId];
    var range, targets;
    if(wepRef) {
      range = this.map.getPossibleTargets(r,c,wepRef.range[0], wepRef.range[1]);
      targets = this.map.getTargets(playerId, range);
    }

    var sucRes = {success: true, actions:[]};
    var failRes = {success: false, actions:[]};
    var failRes2 = {success: false, actions:[]};

    var selUnit = this.map.getUnit(r,c);
    var tarUnit = this.map.getUnit(toR,toC);

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        if(this.canAttack(r,c,toR,toC,weaponId)) {
          this.emptyFlags();
          this.addFlag(Flags.hasAttacked);
          if(this.uRef.hasHitAndAway())
            this.addFlag(Flags.hasHitAndAway);
          else
            this.addFlag(Flags.turnOver);
          this.resolveAttack(selUnit, weaponId, tarUnit);
          return sucRes;
        } else {
          return failRes;
        }
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        if(this.canAttack(r,c,toR,toC,weaponId,targets)) {
          this.addFlag(Flags.hasAttacked);
          this.addFlag(Flags.turnOver);
          this.resolveAttack(selUnit, weaponId, tarUnit);
          return sucRes;
        } else {
          return failRes;
        }
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && selUnit.hasHitAndAway()) {
        return failRes2;
      } else {
        return failRes;
      }
    } else if(!selUnit) {
      return failRes;
    } else {
      return failRes;
    }
  }

  //GameInterface to Game method: returns a response based on the games state and which socket called it
  //tries to set defense action, returns sucRes if it is accepted, failRes otherwise
  doCounter(playerId, action, weaponId) {
    var wepRef = this.defender.weapons[weaponId];

    var sucRes = {success: true, actions:[]};
    var failRes = {success: false, actions:[]};


    if(this.defender.owner===playerId){
      if(action==="Attack"){
        if(this.canAttack(this.defender.r, this.defender.c, this.uRef.r, this.uRef.c, weaponId)) {
          this.resolveAttack2(action, weaponId);
          return sucRes;
        } else
          return failRes;
      } else if(action==="Defend" || action==="Evade") {
        this.resolveAttack2(action, weaponId);
        return sucRes;
      } else
        return failRes;
    } else
      return failRes;
  }

  //can the unit at r,c attack the unit at toR,toC with weapon wepId
  canAttack(r,c,toR,toC,wepId) {
    //console.log("Checking to see if can attack");
    var selUnit = this.map.getUnit(r,c);
    var tarUnit = this.map.getUnit(toR,toC);
    var targets;

    var wepRef;

    //if unit at r,c or toR,toC don't exist, return false
    //else set wepRef to selUnit's weapon wepId
    if(!selUnit || !tarUnit)
      return false;
    else
      wepRef=selUnit.weapons[wepId];

    //if Weapon does not exist, return false
    if(!wepRef)
      return false;

    var distance = (Math.abs(r-toR)+Math.abs(c-toC));
    if(distance<wepRef.range[0] || distance>wepRef.range[1])
      return false;
    else
      return wepRef.canAttack(selUnit, selUnit.hasMoved);
  }

  //do all the things to resolve the attack (apply damage, remove ammo/en)
  //starts the attack resolution
  resolveAttack(atk, wepId, def) {
    //This flag is set, use it to halt any other messages from being processed besides do counter from defending unit's player
    this.addFlag(Flags.waitingForDef);
    this.addFlag(Flags.hasAttacked);
    //set defender unit
    this.defender=def;
    //set attacking weapon
    this.weapon=wepId;
    //emit message to defending unit's player about what they want to do.
    this.getDefenseAction(def, atk);
  }

  //is called when the defender chooses a defense action
  //finishes the attack resolution
  resolveAttack2(action, wepId) {
    console.log("A Full round is almost all over");
    //setting defender's counter attack weapon if they are counter attacking;
    if(action==="Attack")
      this.defWep=wepId;
    this.computeAttack(this.uRef ,this.weapon, this.defender, this.defWep, action);
    this.removeFlag(Flags.waitingForDef);
    this.checkFlags();
  }

  //Gets hit percentage/damage/crit percent from other methods to send to applyAttack
  //emits messages about what is happening
  computeAttack(atkRef, wepAtk, defRef, wepDef, counterType) {
    //if we get here, everything should be copacetic, so just do the cacls, no need to check

    this.inter.emitMessage(`${atkRef.name} is attacking ${defRef.name} with ${atkRef.weapons[wepAtk].name}`);
    this.inter.emitMessage(`${defRef.name} is choosing to "${counterType}" on defense!`);

    if(counterType==="Attack" && defRef.doesCounterAttack(atkRef)) {
      this.inter.emitMessage(`${defRef.name} Counters and attacks first!`);
      this.computeAttackHelper2(counterType);
      this.computeAttackHelper1(counterType);
    } else if(counterType==="Attack") {
      this.computeAttackHelper1(counterType);
      this.computeAttackHelper2(counterType);
    } else
      this.computeAttackHelper1(counterType);
  }

  computeAttackHelper1(counterType) {
    var hit = this.getHitPercent(this.uRef, this.defender, this.weapon);
    var damage = this.getDamage(this.uRef, this.defender, this.weapon);
    var crit = this.getCritPercent(this.uRef, this.defender, this.weapon);

    if(counterType === "Evade" && !this.uRef.hasStrike())
      hit = Math.floor(hit/2);
    else if(counterType === "Defend")
      damage = Math.floor(damage/2);

    this.applyAttack(this.uRef, this.defender, this.weapon, hit, damage, crit);
    this.checkAliveness(this.defender, false, this.uRef);
    this.checkPlayer(this.defender.owner);
  }

  computeAttackHelper2(counterType) {
    if(counterType==="Attack" && this.defender.isAlive){
      var hit = this.getHitPercent(this.defender, this.uRef, this.defWep, undefined, true);
      var damage = this.getDamage(this.defender, this.uRef, this.defWep, undefined, true);
      var crit = this.getCritPercent(this.defender, this.uRef, this.defWep);
      this.applyAttack(this.defender, this.uRef, this.defWep, hit, damage, crit);
      this.checkAliveness(this.uRef, true, this.defender);
      this.checkPlayer(this.uRef.owner);
    }
  }

  //removes ammo/en from unit attacking, and applies damage to defender if it hits
  //emits messages about what is happening
  applyAttack(atk, def, atkWep, hit, damage, crit) {
    var didHit=false;
    atk.weapons[atkWep].removeAmmo(atk);
    if(Math.floor(Math.random()*100) < hit) {
      if(!atk.hasFury() && !atk.hasStrike() && def.activatesDoubleImage()) {
        this.inter.emitMessage(`${def.name} activates Double Image! ${atk.name} misses.`);
        didHit=false;
      } else if(!atk.hasFury() && !atk.hasStrike() && def.activatesJammer(atk.weapons[atkWep])){
        this.inter.emitMessage(`${def.name} activates Jammer! ${atk.name} misses.`);
        didHit=false;
      } else if(Math.floor(Math.random()*100) < crit){
        this.inter.emitMessage(`${atk.name} hits ${def.name} for ${Math.floor(damage*1.25)} damage`);
        def.applyDamage(Math.floor(damage*1.25));
        didHit=true;
      } else {
        this.inter.emitMessage(`${atk.name} hits ${def.name} for ${Math.floor(damage)} damage`);
        def.applyDamage(Math.floor(damage));
        didHit=true;
      }
    } else {
      this.inter.emitMessage(`${atk.name} misses ${def.name}!`);
      didHit=false;
    }
    atk.afterAttack(didHit);
    def.afterDefense(!didHit);
  }

  getActiveUnit(playerId) {
    return {
              r: this.uRef.r,
              c: this.uRef.c
          };
  }

  //emit defense options to the defender player
  //actioncs ["Attack", "Evade", "Defend"]
  //later on will get  also get options if there are Off.Supp and Off.Def Units around, get teir data too
  //Will also send all availb eweapons that they can Attack with.
  getDefenseAction(def, atk) {
    var attackStats = this.getAttackStats(def, atk);

    var data = {actions: ["Attack", "Evade", "Defend"], weapons:def.weapons, stats:attackStats};
    this.inter.emitGetCounter(def.owner, data);
  }

  //returns either a tuple, or an array of tuples tha
  //first in the tuple is a Boolean if the weapon can target the def unit
  //second in the tuple is the actualy hit percetange of that weapon against the enemy unit
  getAttackStats(atkRef, defRef, weaponId=null) {
    if(weaponId!==null) {
      if(!atkRef.weapons[weaponId].isMap() || !this.canAttack(atkRef.r, atkRef.c, defRef.r, defRef.c, weaponId))
        return [false, 0];
      else
        return [true, this.getHitPercent(atkRef, defRef, weaponId)];
    }
    //tuple of [Boolean, hitPercent]
    var attackStats = new Array(atkRef.weapons.length);
    for(var i=0; i<attackStats.length; ++i) {
      if(atkRef.weapons[i].isMap() || !this.canAttack(atkRef.r, atkRef.c, defRef.r, defRef.c, i))
        attackStats[i]=[false, 0];
      else
        attackStats[i] = [true, this.getHitPercent(atkRef, defRef, i)];
    }
    return attackStats;
  }

  //caculates the hit percentage based off the attacking and defending units stats and the weapon used
  getHitPercent(atkRef, defRef, wepId, ter="Spc", counter=false) {
    if(!atkRef || !defRef)
      return 0;

    var wep = atkRef.weapons[wepId];
    if(!wep)
      return 0;

    var distance = (Math.abs(atkRef.r-defRef.r)+Math.abs(atkRef.c-defRef.c));
    if(distance<wep.range[0] || distance>wep.range[1])
      return 0;

    if(defRef.status.includes(Status.alert))
      return 0;
    if(atkRef.status.includes(Status.strike) || atkRef.status.includes(Status.attune))
      return 100;

    //Range Adjust = (5 - Range from Attacker to Defender) x 3
    //1.Base Hit = (Attack Side Pilot Hit/2 + 140) x Attack Side Total Performance Adjustment + Attack Side WP Hit Rate Adjustment + Attack Side Special Skill Adjustment
    //2.Base Evade = (Defense Side Pilot Evade/2 + Defense Side Unit Mobility ) x Defense Side Final Performance Adjustment + Defense Side Special Skill Adjustment
    //3.Final Hit = (1+2) x Defense Side Unit Size Adjustment + Range Adjustment + Command Adjustment - Defense Side Performance
    var rangeAdjust = (5 - distance) * 3;
    var baseHit = (atkRef.hit/2+140) * (atkRef.terPer(ter)) + wep.hit + (atkRef.modHit());
    var baseEvd = (defRef.evd/2 + defRef.mob) * (defRef.terPer(ter)) + (defRef.modEvd(!counter));
    var finalHit = (baseHit-baseEvd) * (defRef.sizeAdjust()) + rangeAdjust + (0) - (0);
    // console.log(`${atkRef.name} attacking`);
    // console.log(atkRef.terPer(ter), atkRef.modHit());
    // console.log(defRef.terPer(ter), defRef.modEvd(!counter));
    // console.log(defRef.sizeAdjust());
    // console.log(baseHit, baseEvd, finalHit);

    if(finalHit>100)
      return 100;
    else if(finalHit<0)
      return 0;
    else
      return Math.floor(finalHit);
  }

  //caculates the damage based off the attacking and defending units stats and the weapon used
  getDamage(atkRef, defRef, wepId, ter="Spc", counter=false){
    if(!atkRef || !defRef)
      return 0;

    var wep = atkRef.weapons[wepId];
    if(!wep)
      return 0;

    var distance = (Math.abs(atkRef.r-defRef.r)+Math.abs(atkRef.c-defRef.c));
    if(distance<wep.range[0] || distance>wep.range[1])
      return 0;


    // 1.Base Attack = WP Attack x (Attack Side Pilot Melee/Ranged + Attack Side Pilot Will)/200 x Attack Side WP Performance Adjustment
    // 2.Base Defense = Defense Side Armor x (Defense Side Pilot Defense + Defense Side Pilot will)/200 x Defense Side Unit Size Adjustment
    // 3.Damage = (1-2) x (100 * Defense Side Performance Adjustment)/100 x Special Skill Adjustment
    var pilotStat = atkRef.getAttackStat(wep.type);
    var baseAtk = (wep.damage + atkRef.modDmgFlat(wep.cat) ) * (pilotStat + atkRef.will) / 200 * (wep.terPer(ter));
    var baseDef = (defRef.armor * defRef.modArmScale()) * (defRef.def + defRef.will) / 200 * (defRef.sizeAdjust());
    var damage = (baseAtk - baseDef) * (100 * (defRef.terPer(ter))) / 100 * (atkRef.modDmgScale() * defRef.modDefScale());
    // console.log(baseAtk, baseDef, damage);
    damage = damage - defRef.modDefFlat(wep.cat, atkRef.hasFury());
    // console.log(damage);

    if(atkRef.hasValor())
      damage = damage*2;

    if(damage<0)
      return 0;
    else
      return Math.floor(damage);
  }

  //caculates the crit percentage based off the attacking and defending units stats and the weapon used
  getCritPercent(atk, def, atkWep) {
    if(!atk || !def)
      return 0;

    var wep = atk.weapons[atkWep];
    if(!wep)
      return 0;

    var distance = (Math.abs(atk.r-def.r)+Math.abs(atk.c-def.c));
    if(distance<wep.range[0] || distance>wep.range[1])
      return 0;

    var chance  = atk.man - def.man + wep.crit;

    if(chance>100)
      return 100;
    else if(chance<0)
      return 0;
    else
      return Math.floor(chance);
  }

  playerEnemyShotDown(atkUnit) {
    var player;
    for(let i=0; i<this.players.length; ++i) {
      if(this.players[i].id === atkUnit.owner){
        this.players[i].enemyShotDown(atkUnit.id);
        atkUnit.enemyShotDown();
      }
    }
  }

  playerAllyShotDown(unit) {
    var player;
    for(let i=0; i<this.players.length; ++i) {
      if(this.players[i].id === unit.owner){
        this.players[i].allyShotDown(unit.id);
      }
    }
  }

  checkAliveness(unit, isCurrentUnit, atkUnit) {
    if(!unit.isAlive) {
      this.inter.emitMessage(`${unit.name} has been shot down!`);
      this.map.setUnit(unit.r, unit.c, null);
      this.inter.emitMap(this.map.getAsciiMap());

      this.playerEnemyShotDown(atkUnit)
      this.playerAllyShotDown(unit);
    }

    if(isCurrentUnit) {
      this.addFlag(Flags.turnOver);
    }
  }

  //Checks the flags, and advances the game based off them.
  checkFlags() {
    if(this.inFlags(Flags.turnOver)){
      this.uRef.afterTurn();
      this.checkGameOver();
      if(this.inFlags(Flags.gameOver)) {
        this.inter.gameOver(this.winner);
      } else{
        this.nextTurn();
      }
    }
  }

  checkPlayer(playerId) {
    var temp = null;
    for(let i=0; i<this.players.length; ++i)
      if(this.players[i].id===playerId) {
        temp=this.players[i];
        //console.log("Found player", temp.name, temp.id);
      }


    if(temp && temp.isDefeated()) {
      this.inter.emitMessage(`${temp.name} has been defeated!`);
    }
  }

  checkGameOver() {
    var playersOk  = [];
    for(let i=0; i<this.players.length; ++i){
      if(!this.players[i].isDefeated() && !this.players[i].hasSurrendered)
        playersOk.push(i);
    }

    if(playersOk.length===1) {
      this.winner=this.players[playersOk[0]];
      this.addFlag(Flags.gameOver);
    } else if(playersOk.length===0) {
      this.winnner=null;
      this.addFlag(Flags.gameOver);
    }
  }

  //Moves a unit from r,c, to toR, toC
  moveUnit(r,c,toR,toC) {
    this.map.move(r,c,toR,toC);
    this.posR=toR;
    this.posC=toC;

  }

  //emits the ascrii map
  emitMap() {
    // this.inter.emitMap(this.map.getAsciiMap());
    console.log("in game engine");
    this.inter.emitRealMap(this.map.getRealMap());
  }


  //put each player's units on the map
  //right now hard coded for just 2 playes an one unit each
  spawnUnits(){
    this.players[0].units[0].setRC(5,2);
    this.players[1].units[0].setRC(5,4);
    this.map.setUnit(5, 2, this.players[0].units[0]);
    this.map.setUnit(5, 4, this.players[1].units[0]);
    console.log(this.map.getAsciiMap());
  }


}

module.exports = Game;
