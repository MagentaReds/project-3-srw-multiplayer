class Weapon {
  constructor(db) {
    this.name=db.name;
    this.type=db.type;
    this.props=db.properties;
    this.damage=db.damage;
    this.range=db.range;
    this.hit=db.hit;
    this.maxAmmo=db.ammo;
    this.curAmmo=db.ammo;
    this.en=db.en;
    this.crit=db.crit;
    this.will=db.will;
    this.cat=db.category;
    this.skill=db.skill;
    this.terrain=db.terrain;
  }

  refill() {
    this.ammo=this.maxAmmo;
  }

  canAttack(uRef, hasMoved) {
    if(uRef.will < this.will)
      return false;
    else if(this.maxAmmo>0 && this.curAmmo===0)
      return false;
    else if(uRef.en < this.en)
      return false;
    else if(hasMoved && !this.props.includes("P") && !uRef.hasAssail())
      return false;
    else
      return true;
  }

  removeAmmo(uRef) {
    if(this.maxAmmo>0)
      this.curAmmo--;
    if(this.en>0)
      uRef.en-=this.en;
  }

  isMap() {
    return this.props.includes("MAP");
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
}

module.exports=Weapon;