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
}

module.exports=Weapon;