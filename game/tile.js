class Tile {
  constructor(r,c) {
    this.r=r;
    this.c=c;
    this.unit=null;
    //will fill in other variables later, things like isDifficult terrain, modifiers to hit/evd, hp/en regen, and other stuff.
  }
}

module.exports=Tile;