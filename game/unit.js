"use strict";

var Helpers = require("../config/helpers.js");

var Weapon = require("./weapon.js");

var Status = require("./statesAndFlags.js").unit.status;
var Skill = require("./statesAndFlags.js").pilot.skill;
var Ability = require("./statesAndFlags.js").mech.abilities;
var WepCategory = require("./statesAndFlags.js").weapon.category;
var Spirit = require("./statesAndFlags.js").pilot.spiritCommand;

class Unit {
  constructor(playerId, pilotDb, mechDb, pilotLevel=50) {
    this.name = pilotDb.nickname;
    this.pilotName= pilotDb.name;
    this.mechName = mechDb.name;
    this.mechCodeName = mechDb.mechCodeName;
    this.move = mechDb.move;
    this.pilotLevel=pilotLevel;
    this.weapons = [];
    this.makeWeapons(mechDb);
    this.size = mechDb.size;
    this.terrain = this.combineTerrain(pilotDb.terrain, mechDb.terrain);
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
    this.abilities = [...mechDb.abilities];
    this.owner=playerId;
    this.color="grey";
    this.id;
    this.order=null;
    this.willGain=pilotDb.willGain;
    this.will=100;

    //member variables related to the current game
    this.isAlive=true;
    this.r=-1;
    this.c=-1;
    this.hasMoved=false;

    this.status=[];
    this.skills = new Map();
    this.spirits = new Map();
    this.fillSkillsAndSpirits();
    this.reset();
  }

  reset() {
    this.hp=this.hpMax;
    this.sp=this.spMax;
    this.will=100;
    if(this.skills.has(Skill.resolve))
      this.will=105;
    this.isAlive=true;
    this.hasMoved=false;
    this.status=[];
    this.refillAmmo();
  }

  refillAmmo() {
    this.en=this.enMax;
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

  combineTerrain(ter1, ter2) {
    var res="";
    var temp=0;
    for(let i=0; i<4; ++i) {
      temp=0;
      switch(ter1.charAt(i)) {
        case 'S':
          temp+=4;
          break;
        case 'A':
          temp+=3
          break;
        case 'B':
          temp+=2
          break;
        case 'C':
          temp+=1
          break;
      }
      switch(ter2.charAt(i)) {
        case 'S':
          temp+=4;
          break;
        case 'A':
          temp+=3
          break;
        case 'B':
          temp+=2
          break;
        case 'C':
          temp+=1
          break;
      }
      if(temp===8 || temp===7)
        res+='S';
      else if(temp===6)
        res+='A';
      else if(temp===5 || temp===4)
        res+='B';
      else if(temp===3 || temp===2)
        res+='C';
      else
        res+='D';
    }

    return res;
  }

  getMove(ter='Spc') {
    if(this.stats.includes(Status.net))
      return 0;

    var add=0;
    if(this.skills.has(Skill.infight))
      if(this.skills.get(Skill.infight)>=7)
        add+=2;
      else if(this.skills.get(Skill.infight)>=4)
        add+=1;

    if(this.status.includes(Status.accel))
      add+=3;

    add+=this.move;
    if((ter==='Spc' || ter==='Air') && add>this.en)
      return this.en;
    else
      return add;
  }

  getWeapons() {
    var output=[];
    var temp;
    for (var i = 0; i < this.weapons.length; ++i) {
      temp = {};
      temp.name = this.weapons[i].name;
      temp.damage = this.weapons[i].damage;
      temp.hit = this.weapons[i].hit;
      temp.crit = this.weapons[i].crit;
      temp.range = this.getRange(i);
      temp.props = this.weapons[i].props;
      temp.curAmmo = this.weapons[i].curAmmo;
      temp.maxAmmo = this.weapons[i].maxAmmo;
      temp.en = this.weapons[i].en;
      temp.will = this.weapons[i].will;
      temp.id = i;
      output.push(temp);
    }
    return output;
  }

  getRange(wepId) {
    var arr=[0,0];
    var wep=this.weapons[wepId];
    if(!wep)
      return arr;
    arr[0]=wep.range[0];
    arr[1]=wep.range[1];

    if(this.status.includes(Status.snipe) && !wep.prop.includes('MAP') && wep.range[1]>1)
      arr[1]+=2;

    if(this.skills.has(Skill.gunfight))
      if(this.skills.get(Skill.gunfight)>=7)
        arr[1]+=2;
      else if(this.skills.get(Skill.gunfight)>=4)
        arr[1]+=1;
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

  getSpiritList() {
    var arr=[];
    arr.push(`${this.sp}/${this.spMax}:SP`);
    for(let i=0; i<this.sc.length; ++i)
      arr.push(`${i}: ${this.sc[i][0]} (${this.sc[i][1]})`);

    return arr;
  }

  getStatus() {
    // var obj = []
    // obj.push(this.name);
    // obj.push(`HP:${this.hp}/${this.hpMax}`);
    // obj.push(`EN:${this.en}/${this.enMax}`);
    // obj.push(`SP:${this.sp}/${this.spMax}`);
    // obj.push(`Status: ${this.status.toString()}`);
    // obj.push("Other stuff");
    // return obj;
    var obj = {};
    obj.name=this.name;
    obj.pilotName = this.pilotName;
    obj.mechName = this.mechName;
    obj.hp = this.hp;
    obj.hpMax = this.hpMax;
    obj.en = this.en;
    obj.enMax= this.en;
    obj.sp = this.sp;
    obj.spMax = this.spMax;
    obj.weapons = this.weapons;
    obj.status = this.status;
    obj.mechImg = `/img/mech/${this.mechCodeName}.png`;
    obj.pilotImg = `/img/pilot/${this.name}.png`;
    obj.spirits = this.sc;
    obj.will = this.will;
    return obj;
  }

  hasHitAndAway() {
    return this.skills.has(Skill.hitAway);
  }
  hasAssail() {
    return this.status.includes(Status.assail);
  }
  hasValor() {
    return this.status.includes(Status.valor);
  }
  hasFury() {
    return this.status.includes(Status.fury);
  }
  hasStrike() {
    return this.status.includes(Status.strike) || this.status.includes(Status.attune);
  }
  doesCounterAttack(atkRef) {
    if(this.skills.has(Skill.counter)) {
      // [(Pilot man - Enemy man)/10 + Counter Level]/16
      var chance = ((this.man - atkRef.man)/10 + this.skills.get(Skill.counter))/16;
      return (Math.random() < chance);
    } else
      return false;
  }
  activatesDoubleImage() {
    if(this.abilities.includes(Ability.doubleImage))
      return (this.will>130 && Math.random() < .5);
    else
      return false;
  }
  activatesJammer(wepRef) {
    if(this.abilities.includes(Ability.jammer) && wepRef.cat==="Missile")
      return Math.random() < .5;
    else
      return false;
  }


  terPer(terrain) {
    var index=-1;
    switch(terrain) {
      case "Air":
        index=0;
        break;
      case "Grd":
        index=1;
        break;
      case "Wtr":
        index=2;
        break;
      case "Spc":
        index=3;
        break;
    }
    switch(this.terrain.charAt(index)) {
      case 'S':
        return 1.1;
      case 'A':
        return 1.0;
      case 'B':
        return .9;
      case 'C':
        return .8;
      case 'D':
        return .4;
    }
  }

  sizeAdjust() {
    switch(this.size) {
      case 'LL':
        return 1.4;
      case 'L':
        return 1.2;
      case 'M':
        return 1.0;
      case 'S':
        return 0.8;
    }
  }

  modHit() {
    var res=0;
    var temp;
    if(this.status.includes(Status.focus))
      res+=30;
    if(this.skills.has(Skill.prevail));
      res+=Helpers.getPrevailHEA(this.skills.get(Skill.prevail), this.hp/this.maxHp);
    if(this.skills.has(Skill.telekinesis))
      res+=Helpers.getTKHitEvd(this.skills.get(Skill.telekinesis));
    if(this.skills.has(Skill.genius))
      res+=20;
    if(this.skills.has(Skill.predict) && this.will>110)
      res+=10;

    return res;
  }

  modEvd(defending=false) {
    var res=0;
    if(this.status.includes(Status.focus))
      res+=30;
    if(this.skills.has(Skill.prevail));
      res+=Helpers.getPrevailHEA(this.skills.get(Skill.prevail), this.hp/this.maxHp);
    if(this.skills.has(Skill.telekinesis))
      res+=Helpers.getTKHitEvd(this.skills.get(Skill.telekinesis));
    if(this.skills.has(Skill.genius))
      res+=20;
    if(this.skills.has(Skill.predict) && this.will>=110)
      res+=10;
    if(this.skills.has(Skill.prophesy) && this.will>=130 && defending)
      res+=30;

    return res;
  }

  modCrit() {
    var res=0;
    if(this.skills.has(Skill.genius))
      res+=20;
    if(this.skills.has(Skill.prevail));
      res+=Helpers.getPrevailHEA(this.skills.get(Skill.prevail), this.hp/this.maxHp);
  }

  modDmgFlat(wepCat) {
    var res=0;
    if(this.skills.has(Skill.gunfight) && wepCat==='R')
      res+=Helpers.getFightDmg(this.skills.get(Skill.gunfight));
    if(this.skills.has(Skill.infight) && wepCat==='M')
      res+=Helpers.getFightDmg(this.skills.get(Skill.infight));

    return res;
  }

  modDmgScale(counter=false) {
    var res=1.0;
    if(this.skills.has(Skill.attacker) && this.will>=130)
      res+=.2;
    if(this.skills.has(Skill.revenge) && counter)
      res+=.2;

    return res;
  }

  modDefFlat(wepCat, atkHasFury) {
    if(atkHasFury)
      return 0;

    var res=0;
    if(this.abilities.includes(Ability.beamCoat) && wepCat===WepCategory.energyBeam && this.en>=5)
      res+=900;
    if(this.abilities.includes(Ability.abField) && wepCat===WepCategory.energyBeam && this.en>=10)
      res+=1200;
    if(this.abilities.includes(Ability.eField) && this.will>=120 && this.en>=15)
      res+=1500;
    if(this.abilities.includes(Ability.gWall) && this.will>=120 && this.en>=5)
      res+=800;
    if(this.abilities.includes(Ability.gTerritory) && this.will>=120 && this.en>=15)
      res+=1800;
    if(this.abilities.includes(Ability.tkField) && this.will>=110 && this.en>=5)
      res+=Helpers.getTKField(this.skills.has(Skill.telekinesis));

    return res;
  }

  modDefScale(wepCat) {
    var res=1.0;
    if(this.skills.has(Skill.guard) && this.will>=130)
      res+=.2;

    return res;
  }

  modArmScale() {
    var res=1.0;
    if(this.skills.has(Skill.prevail))
      res+=Helpers.getPrevailHEA(this.skills.get(Skill.prevail), this.hp/this.maxHp);

    return res;
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

  addHp(h) {
    if(this.hp<this.hpMax) {
      if(this.hp+h >this.hpMax)
        this.hp=this.hpMax;
      else
        this.hp+=h;
      return true;
    }
    else
      return false;
  }

  addEn(e) {
    if(this.en<this.enMax) {
      if(this.en+e >this.enMax)
        this.en=this.enMax;
      else
        this.en+=e;
      return true;
    }
    else
      return false;
  }

  addSp(sp) {
    if(this.sp<this.spMax) {
      if(this.sp+sp >this.spMax)
        this.sp=this.spMax;
      else
        this.sp+=sp;
      return true;
    }
    else
      return false;
  }

  addWill(w) {
    if(w<0 && this.will===100)
      return false;
    else if(w>0 && this.will===150)
      return false;

    if(this.will+w < 100)
      this.will=100;
    else if(this.will+w > 150)
      this.will=150;
    else
      this.will

    return true;
  }

  addStatus(sta) {
    var index=this.status.indexOf(sta);
    if(index===-1){
      this.status.push(sta);
      return true;
    } else {
      return false;
    }
  }

  castSC(spiritId, tarUnit) {
    var spirit = this.sc[spiritId];
    if(!spirit || spirit[1]>this.sp)
      return false;

    switch(spirit[0]) {
      case Spirit.valor:
        if(this.addStatus(Status.valor)) {
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.gain:
        if(this.addStatus(Status.gain)) {
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.strike:
        if(this.addStatus(Status.strike)) {
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.zeal:
        if(this.addStatus(Status.zeal)) {
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.trust:
        //other check
        if(tarUnit && tarUnit.owner === this.owner && tarUnit.isAlive) {
          if(tarUnit.addHp(2000)) {
            this.sp-=spirit[1];
            return true;
          } else
            return false;
        } else
          return false;
      case Spirit.rouse:
        //pother ehce
        return false;
      case Spirit.cheer:
      //otherche
        if(tarUnit && tarUnit.owner === this.owner && tarUnit.isAlive)
          if(tarUnit.addStatus(Status.cheer)) {
            this.sp-=spirit[1];
            return true;
          } else
            return false;
        else
          return false;
      case Spirit.attune:
        //othercheck
        if(tarUnit && tarUnit.owner === this.owner && tarUnit.isAlive)
          if(tarUnit.addStatus(Status.strike)) {
            this.sp-=spirit[1];
            return true;
          } else
            return false;
        else
          return false
      case Spirit.vigor:
        let hp30 = Math.floor(this.hp*.3);
        if(this.addHp(hp30)) {
          this.sp-=spirit[1];
            return true;
          } else
            return false;
      case Spirit.faith:
        //do
        if(tarUnit && tarUnit.owner === this.owner && tarUnit.isAlive) {
          if(tarUnit.addHp(100000)){
            this.sp-=spirit[1];
            return true;
          } else
            return false;
        } else
          return false;
      case Spirit.hope:
        //do
        if(tarUnit && tarUnit.owner === this.owner && tarUnit.isAlive) {
          if(tarUnit.addSp(50)){
            this.sp-=spirit[1];
            return true;
          } else
            return false;
        } else
          return false;
      case Spirit.mercy:
        if(this.addStatus(Status.mercy)) {
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.luck:
        if(this.addStatus(Status.luck)) {
        this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.guts:
        //do
        if(this.addHp(100000)){
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.renew:
        //do
        if(tarUnit && tarUnit.owner === this.owner && tarUnit.isAlive) {
          if(tarUnit.refillAmmo()) {
            this.sp-=spirit[1];
            return true;
          } else
            return false;
        } else
          return false;
      case Spirit.assail:
        if(this.addStatus(Status.assail)) {
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.snipe:
        if(this.addStatus(Status.snipe)){
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.bless:
        //do
        if(tarUnit && tarUnit.owner === this.owner && tarUnit.isAlive)
          if(tarUnit.addStatus(Status.luck)) {
            this.sp-=spirit[1];
            return true;
          } else
            return false;
        else
          return false
      case Spirit.guard:
        if(this.addStatus(Status.guard)){
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.spirit:
        //do
        if(this.addWill(10)){
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.enable:
        //do
        return false;
      case Spirit.fury:
        if(this.addStatus(Status.fury)){
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.alert:
        if(this.addStatus(Status.alert)){
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.focus:
        if(this.addStatus(Status.focus)){
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.accel:
        if(this.addStatus(Status.accel)){
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.drive:
        //do
        if(this.addWill(30)){
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.scan:
        //do
        return false;
      case Spirit.resolve:
        if(this.addStatus(Status.resolve)){
          this.sp-=spirit[1];
          return true;
        } else
          return false;
      case Spirit.prayer:
        if(tarUnit && tarUnit.owner === this.owner && tarUnit.isAlive)
          if(tarUnit.addStatus(Status.resolve)){
            this.sp-=spirit[1];
            return true;
          } else
            return false;
        else
          return false
      case Spirit.love:
        //do
        if(this.addStatus(Status.accel)
                || this.addStatus(Status.strike)
                || this.addStatus(Status.alert)
                || this.addStatus(Status.valor)
                || this.addStatus(Status.gain)
                || this.addStatus(Status.luck)) {
          this.sp-=spirit[1];
          return true;
        } else
          return false;

    }
  }

  removeStatus(s) {
    var index = this.status.indexOf(s);
    if(index !== -1)
      this.status.splice(index, 1);
  }

  startTurn() {
    this.addEn(5);

    if(this.skills.has(Skill.morale))
      this.addWill(2);
    if(this.skills.has(Skill.spRegen))
      this.addSp(10);


    this.removeStatus(Status.strike);
    this.removeStatus(Status.assail);
    this.removeStatus(Status.guard);
    this.removeStatus(Status.focus);
    this.removeStatus(Status.resolve);
    this.removeStatus(Status.net);
    this.removeStatus(Status.wepBreak);
    this.removeStatus(Status.armBreak);
    this.removeStatus(Status.spBlock);

  }
  afterAttack(didHit) {
    if(didHit)
      this.addWill(this.willGain[0]);
    else
      this.addWill(this.willGain[1]);

    this.removeStatus(Status.gain);
    this.removeStatus(Status.cheer);
    this.removeStatus(Status.luck);
    this.removeStatus(Status.bless);

    this.removeStatus(Status.valor);
    this.removeStatus(Status.mercy);
    this.removeStatus(Status.snipe);
    this.removeStatus(Status.fury);
  }
  afterDefense(didEvd) {
    if(didEvd)
      this.addWill(this.willGain[2]);
    else
      this.addWill(this.willGain[3]);

    this.removeStatus(Status.gain);
    this.removeStatus(Status.cheer);
    this.removeStatus(Status.luck);
    this.removeStatus(Status.bless);

    this.removeStatus(Status.alert);
  }
  afterTurn() {
    this.removeStatus(Status.attune);
  }

  enemyShotDown() {
    this.addWill(this.willGain[5]);
  }

  allyShotDown() {
    this.addWill(this.willGain[4]);
  }

}

module.exports = Unit;
