"use strict";

var mogoose;

var Promise = require("bluebird");

var Map = require("./map.js");
var Player = require("./player.js")

var Flags = require("./statesAndFlags.js").game.state;

var Helpers = require("../config/helpers.js");

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
  }

  nextTurn() {
     //select first player and unit to go, set flags values as necessry, emit status to clients;
    this.pRef = this.getNextPlayer();
    this.uRef = this.pRef.getNextUnit();
    this.turn++;
    this.posR = this.uRef.r;
    this.posC = this.uRef.c;
    this.oldR = this.uRef.r;
    this.oldC = this.uRef.c;
    this.emptyFlags();
    this.addFlag(Flags.newRound);

    console.log(`It is ${this.pRef.name} Unit's ${this.uRef.name} Turn`);
    console.log(`That means ${this.uRef.name}'s turn!`);
    this.emitMap(); 
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
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
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
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
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
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        if(Helpers.isInArr(posMov, [toR,toC])) {
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
        if(Helpers.isInArr(posMov, [toR,toC])) {
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

  getAttack(playerId, r, c) {
    //will need to mod this to only include/flag weapons that can attack/have available targets
    var sucRes = {success: true, type: "weapons", weapons: this.uRef.weapons, actions:["Targets", "Cancel"]};
    var failRes = {success: false, type: "", weapons:[], actions:[]};
    var failRes2 = {success: false, type: "", weapons:[], actions:["Cancel"]};
    var selUnit = this.map.tiles[r][c];

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        return sucRes;
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return sucRes;
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && this.inFlags(Flags.hasHitAndAway)) {
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

    var selUnit = this.map.tiles[r][c];

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        return sucRes;
      } else if(this.inFlags(Flags.hasMoved) && !this.inFlags(Flags.hasAttacked)){
        return sucRes;
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && this.inFlags(Flags.hasHitAndAway)) {
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

  getStats(playerId, r, c, toR, toC, weaponId) {
    var wepRef = this.uRef.weapons[weaponId];
    var selUnit = this.map.tiles[r][c];
    var tarUnit = this.map.tiles[toR][toC];

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
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && this.inFlags(Flags.hasHitAndAway)) {
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

    var selUnit = this.map.tiles[r][c];
    var tarUnit = this.map.tiles[toR][toC];

    if(this.pRef.id===playerId){
      if(!selUnit) {
        return failRes;
      } else if(selUnit.id !== this.uRef.id || selUnit.owner !== playerId){
        return failRes;
      } else if(this.inFlags(Flags.newRound)) {
        if(this.canAttack(r,c,toR,toC,weaponId,targets)) {
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
      } else if(this.inFlags(Flags.hasAttacked) && !this.inFlags(Flags.hasMoved) && this.inFlags(Flags.hasHitAndAway)) {
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
      } else if(action==="Guard" || action==="Evade") {
        this.resolveAttack2(action, weaponId);
        return sucRes;
      } else
        return failRes;
    } else
      return failRes;
  }

  //can the unit at r,c attack the unit at toR,toC with weapon wepId
  canAttack(r,c,toR,toC,wepId,passedTargets) {
    //console.log("Checking to see if can attack");
    var selUnit = this.map.tiles[r][c];
    var tarUnit = this.map.tiles[toR][toC];
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

    //if no targets are passed in that have been pre built, build our own list
    // if(passedTargets===null || passedTargets===undefined) {
    //   let range = this.map.getPossibleTargets(r,c,wepRef.range[0], wepRef.range[1]);
    //   targets=this.map.getTargets(playerId, range);
    // } else
    //   targets=passedTargets;

    var distance = (Math.abs(r-toR)+Math.abs(c-toC));
    if(distance<wepRef.range[0] || distance>wepRef.range[1])
      return false;
    else 
      return wepRef.canAttack(selUnit, this.inFlags(Flags.hasMoved));

    //if tarUnit's pos is not in targets, return false
    //else (passed all checks so far), return if wepRef has ammo/enough/will en to attack.
    // if(!Helpers.isInArr(targets, [toR,toC]))
    //   return false;
    // else
    //   return wepRef.canAttack(selUnit, this.inFlags(Flags.hasMoved));
  }

  //do all the things to resolve the attack (apply damage, remove ammo/en)
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
  resolveAttack2(action, wepId) {
    console.log("A Full round is almost all over");
    //setting defender's counter attack weapon if they are counter attacking;
    if(action==="Attack")
      this.defWep=wepId;
    this.computeAttack(this.uRef ,wepId, this.defender, this.defWep, action);
    this.removeFlag(Flags.waitingForDef);
    this.checkFlags();
  }

  computeAttack(atkRef, wepAtk, defRef, wepDef, counterType) {
    //if we get here, everything should be copacetic, so just do the cacls, no need to check

    this.inter.emitMessage(`${atkRef.name} is attacking ${defRef.name} with ${atkRef.weapons[wepAtk].name}`);
    this.inter.emitMessage(`${defRef.name} is choosing to ${counterType} on defense!`);

    var hit = this.getHitPercent(this.uRef, this.defender, this.weapon);
    var damage = this.getDamage(this.uRef, this.defender, this.weapon);
    var crit = this.getCritPercent(this.uRef, this.defender, this.weapon);
    
    if(counterType === "Evade")
      hit = Math.floor(hit/2);
    else if(counterType === "Defend")
      damage = Math.floor(damage/2);

    this.applyAttack(this.uRef, this.defender, this.weapon, hit, damage, crit);

    if(counterType==="Attack" && this.defender.isAlive){
      hit = this.getHitPercent(this.defender, this.uRef, this.defWep);
      damage = this.getDamage(this.defender, this.uRef, this.defWep);
      this.applyAttack(this.defender, this.uRef, this.defWep, hit, damage, crit);
    }
      
  }

  applyAttack(atk, def, atkWep, hit, damage, crit) {
    atk.weapons[atkWep].removeAmmo(atk);
    if(Math.floor(Math.random()*100) < hit) {
      if(Math.floor(Math.random()*100) < crit){
        this.inter.emitMessage(`${atk.name} hits ${def.name} for ${Math.floor(damage*1.25)} damage`);
        def.applyDamage(Math.floor(damage*1.25));
      } else {
        this.inter.emitMessage(`${atk.name} hits ${def.name} for ${Math.floor(damage)} damage`);
        def.applyDamage(Math.floor(damage));
      }
    } else {
      this.inter.emitMessage(`${atk.name} misses ${def.name}!`);
    }
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

  //returns either a tuple, or an array of tuples
  getAttackStats(atkRef, defRef, weaponId=null) {
    if(weaponId!==null) {
      if(!atkRef.weapons[weaponId].isMap() || !this.canAttack(atkRef.r, atkRef.c, defRef.r, defRef.c, weaponId, null))
        return [false, 0];
      else
        return [true, this.getHitPercent(atkRef, defRef, weaponId)];
    }
    //tuple of [Boolean, hitPercent]
    var attackStats = new Array(atkRef.weapons.length);
    for(var i=0; i<attackStats.length; ++i) {
      if(atkRef.weapons[i].isMap() || !this.canAttack(atkRef.r, atkRef.c, defRef.r, defRef.c, i, null))
        attackStats[i]=[false, 0];
      else
        attackStats[i] = [true, this.getHitPercent(atkRef, defRef, i)];
    }
    return attackStats;
  }

  getHitPercent(atkRef, defRef, wepId) {
    if(!atkRef || !defRef)
      return 0;

    var wep = atkRef.weapons[wepId];
    if(!wep)
      return 0;

    var distance = (Math.abs(atkRef.r-defRef.r)+Math.abs(atkRef.c-defRef.c));
    if(distance<wep.range[0] || distance>wep.range[1])
      return 0;

    if(defRef.hasAlert())
      return 0;
    if(atkRef.hasStrike())
      return 100;

    //Range Adjust = (5 - Range from Attacker to Defender) x 3
    //1.Base Hit = (Attack Side Pilot Hit/2 + 140) x Attack Side Total Performance Adjustment + Attack Side WP Hit Rate Adjustment + Attack Side Special Skill Adjustment
    //2.Base Evade = (Defense Side Pilot Evade/2 + Defense Side Unit Mobility ) x Defense Side Final Performance Adjustment + Defense Side Special Skill Adjustment
    //3.Final Hit = (1+2) x Defense Side Unit Size Adjustment + Range Adjustment + Command Adjustment - Defense Side Performance
    var rangeAdjust = (5 - distance) * 3;
    var baseHit = (atkRef.hit/2+140) * (1) + wep.hit + (0);
    var baseEvd = (defRef.evd/2 + defRef.mob) * (1) + (0);
    var finalHit = (baseHit-baseEvd) * (1) + rangeAdjust + (0) - (0);

    if(finalHit>100)
      return 100;
    else if(finalHit<0)
      return 0;
    else
      return Math.floor(finalHit);
  }

  getDamage(atkRef, defRef, wepId){
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
    var baseAtk = wep.damage * (pilotStat + atkRef.will) / 200 * (1);
    var baseDef = defRef.armor * (defRef.def+defRef.will)/200 * (1);
    var damage = (baseAtk-baseDef) * (100*(1))/100*(1); 

    if(damage<0)
      return 0;
    else
      return Math.floor(damage);
  }

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

  checkFlags() {
    if(this.inFlags(Flags.turnOver)){
      this.nextTurn();
    }
  }


  moveUnit(r,c,toR,toC) {
    this.map.move(r,c,toR,toC);
    this.posR=toR;
    this.posC=toC;
  }

  emitMap() {
    this.inter.emitMap(this.map.getAsciiMap());
  }

  //put each player's units on the map
  //right now hard coded for just 2 playes an one unit each
  spawnUnits(){
    this.players[0].units[0].setRC(5,2);
    this.players[1].units[0].setRC(5,4);
    this.map.tiles[5][2]=this.players[0].units[0];
    this.map.tiles[5][4]=this.players[1].units[0];
    console.log(this.map.getAsciiMap());
  }
  

}

module.exports = Game;
