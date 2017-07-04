"use strict";

var Weapon = require("./weapon.js");

var Status = require("./statesAndFlags").unit.status;
var Skill = require("./statesAndFlags").pilot.skill;
var Ability = require("./statesAndFlags").mech.abilities;

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
    this.armor = mechDb.stats[3];
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
    this.owner=playerId;
    this.willGain=pilotDb.willGain;
    this.will=100;

    //member variables related to the current game
    this.isAlive=true;
    this.r=-1;
    this.c=-1;
    this.hasMoved=false;

    this.status=[];
    this.flags=[];
    this.skills = new Map();
    this.spirits = new Map();
    this.fillSkillsAndSpirits();
  }

  reset() {
    this.hp=this.hpMax;
    this.en=this.enMax;
    this.sp=this.spMax;
    this.will=100;
    this.isAlive=true;
    this.hasMoved=false;
    this.flags=[];
    for(let i=0; i<this.weapons.length; ++i){
      this.weapons[i].refill();
    }

  }

  makeWeapons(db) {
    for(var i=0; i<db.weapons.length; i++)
      this.weapons.push(new Weapon(db.weapons[i]));
    for(var i=0; i<db.iWeapons.length; i++)
      this.weapons.push(new Weapon(db.iWeapons[i]));  
  }
  
  skillLevel(skill) {
    for(let i=0; i<this.pilotSkills.length; ++i)
      if(this.pilotSkills[i][0]===skill)
        return this.pilotSkills[i][1];

    return 0;
  }

  fillSkillsAndSpirits() {
    for(var i=0; i<this.pilotSkills.length; ++i){
      this.skills.set(this.pilotSkills[i][0], this.pilotSkills[i][1]);
    }
    for(let i=0; i<this.sc.length; ++i){
      this.spirits.set(this.sc[i][0], this.sc[i][1]);
    }
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
    return this.skills.has(Skill.hitAway);
  }

  hasFlag(flag) {
    return this.flags.includes(flag);
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