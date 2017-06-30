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
}

module.exports=Weapon;