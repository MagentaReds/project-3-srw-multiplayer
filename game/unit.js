"use strict";

var Weapon = require("./weapon.js");

var Flags = require("./statesAndFlags").unit.status;

class Unit {
  constructor(playerId, pilotDb, mechDb, pilotLevel=50) {
    this.name = pilotDb.name;
    this.move = mechDb.move;
    this.pilotLevel=pilotLevel;
    this.weapons = [];
    this.makeWeapons(mechDb);
    this.size = mechDb.size;
    this.hp = mechDb.stats[0];
    this.hpMax = mechDb.stats[0];
    this.en = mechDb.stats[1],
    this.enMax = mechDb.stats[1],
    this.mob = mechDb.stats[2];
    this.armor = mechDb.stats[4];
    this.mel = Math.floor(pilotDb.stats.mel[0]*pilotLevel+pilotDb.stats.mel[1]);
    this.rng = Math.floor(pilotDb.stats.rng[0]*pilotLevel+pilotDb.stats.rng[1]);
    this.hit = Math.floor(pilotDb.stats.hit[0]*pilotLevel+pilotDb.stats.hit[1]);
    this.evd = Math.floor(pilotDb.stats.evd[0]*pilotLevel+pilotDb.stats.evd[1]);
    this.def = Math.floor(pilotDb.stats.def[0]*pilotLevel+pilotDb.stats.def[1]);
    this.man = Math.floor(pilotDb.stats.man[0]*pilotLevel+pilotDb.stats.man[1]);
    this.sp = Math.floor(pilotDb.stats.sp[0]*pilotLevel+pilotDb.stats.sp[1]);
    this.spMax = Math.floor(pilotDb.stats.sp[0]*pilotLevel+pilotDb.stats.sp[1]);
    this.sc = [...pilotDb.spiritCommands];
    this.pilotSkills = [...pilotDb.pilotSkills];
    this.mechAbilities = [...mechDb.abilities];
    this.r=-1;
    this.c=-1;
    this.owner=playerId;
    this.willGain=pilotDb.willGain;
    this.will=100;

    this.isAlive=true;

    this.flags=[];
    this.checkSkills();
  }

  makeWeapons(db) {
    for(var i=0; i<db.weapons.length; i++)
      this.weapons.push(new Weapon(db.weapons[i]));
    for(var i=0; i<db.iWeapons.length; i++)
      this.weapons.push(new Weapon(db.iWeapons[i]));  
  }

  getAttackStat(type) {
    switch(type) {
      case "M":
        return this.mel;
      case "R":
        return this.rng;
      default:
        return 0;
    }
  }

  hasHitAndAway() {
    for(var i=0; i<this.pilotSkills.length; ++i)
      if(this.pilotSkills[i][0]==="Hit & Away")
        return true;

    return false;
  }

  hasFlag(flag) {
    return this.flags.includes(flag);
  }

  hasAssail(){
    return this.flags.includes(Flags.assail);
  }

  hasAlert(){
    return this.flags.includes(Flags.alert);
  }

  hasStrike(){
    return this.flags.includes(Flags.strike);
  }

  //checks the pilot's skills, and does stuff based off them;
  checkSkills() {

  }

  //returns maximum movement in squares
  //assume we are flying/in space for now, will make generic later
  getMove(air=true) {
    var result=this.move;
    if(this.hasFlag(Flags.accel))
      result+=2;
    
    if(air)
      if(this.en<result)
        return this.en;
    
    return result;
  }

  setRC(r,c) {
    this.r=r;
    this.c=c;
  }

  applyDamage(dmg) {
    this.hp-=dmg;
    if(this.hp<0)
      this.isAlive=false;
  }

}

module.exports = Unit;