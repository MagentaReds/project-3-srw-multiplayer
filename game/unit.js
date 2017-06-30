"use strict";

var dbMech= require("../models/mech.js");
var dbPilot= require("../models/pilot.js");

var Weapon = require("./weapon.js");

class Unit {
  constructor(playerId, pilotDb, mechDb, pilotLevel=50) {
    this.name = pilotDb.name;
    this.move = mechDb.move;
    this.pilotLevel=pilotLevel;
    this.weapons = [];
    this.makeWeapons(mechDb);
    this.size = mechDb.size;
    this.hp = mechDb.stats[0];
    this.en = mechDb.stats[1],
    this.mob = mechDb.stats[2];
    this.armor = mechDb.stats[4];
    this.mel = Math.floor(pilotDb.stats.mel[0]*pilotLevel+pilotDb.stats.mel[1]);
    this.rng = Math.floor(pilotDb.stats.rng[0]*pilotLevel+pilotDb.stats.rng[1]);
    this.hit = Math.floor(pilotDb.stats.hit[0]*pilotLevel+pilotDb.stats.hit[1]);
    this.evd = Math.floor(pilotDb.stats.evd[0]*pilotLevel+pilotDb.stats.evd[1]);
    this.def = Math.floor(pilotDb.stats.def[0]*pilotLevel+pilotDb.stats.def[1]);
    this.man = Math.floor(pilotDb.stats.man[0]*pilotLevel+pilotDb.stats.man[1]);
    this.sp = Math.floor(pilotDb.stats.sp[0]*pilotLevel+pilotDb.stats.sp[1]);
    this.sc = [...pilotDb.spiritCommands];
    this.pilotSkills = [...pilotDb.pilotSkills];
    this.mechAbilities = [...mechDb.abilities];
    this.r=-1;
    this.c=-1;
    this.owner=playerId;
  }

  makeWeapons(db) {
    for(var i=0; i<db.weapons.length; i++)
      this.weapons.push(new Weapon(db.weapons[i]));
    for(var i=0; i<db.iWeapons.length; i++)
      this.weapons.push(new Weapon(db.iWeapons[i]));  
  }

  hasHitAndAway() {
    for(var i=0; i<this.pilotSkills.length; ++i)
      if(this.pilotSkills[i][0]==="Hit & Away")
        return true;

    return false;
  }

  setRC(r,c) {
    this.r=r;
    this.c=c;
  }
}

module.exports = Unit;