"use strict";


//for simpliciy's sake, maps are going to all be in space, with no enviromental stuff
//each "tile" in the map will hold an object of {player, unit} or null if there is no unit there.
//player and unit are just indecies for the respective arrays that are in the game class.

//later on, map will be extended to hold actual tile objects, that can have properties and whatnnot
//like def bonuses, types, if it counts as difficult terrain or not.
//rather than just holding a unit.

class Map {
  constructor(width, height, fileNamme="") {
    this.width = width;
    this.height = height;
    this.tiles=new Array(height);
    for(let i=0; i<height; ++i)
      this.tiles[i] = new Array(width);

    this.getRadius = this.getRadius.bind(this);
    this.isInBounds = this.isInBounds.bind(this);
  }
  //returns an array with the list of available spots and what is in them
  //each element has the form {x,y,objectAtXY}
  //take account of literal edge casses at edges of maps
  getRadius(x,y,r) {
    if(r===0 && this.isInBounds(x,y))
      return [{x:x,y:y, unit:this.tiles[x][y]}];
    
    var array=[];
    //home row x+-r, y
    for(var i=(-1*r); i<=r; ++i)
      if(this.isInBounds(x+i, y))
        array.push({x: x+i ,y: y, unit: this.tiles[x+i][y]});

    //j = 1, 2... r
    //ascending x+-(r-j), y+j
    for(var j=1; j<=r; ++j)
      for(var i=(-1*(r-j)); i<=(r-j); ++i)
        if(this.isInBounds(x+i, y+j))
          array.push({x: x+i ,y: y+j, unit: this.tiles[x+i][y+j]});

    //j = 1, 2... r
    //descending x+-(r-j), y-j
    for(var j=1; j<=r; ++j)
      for(var i=(-1*(r-j)); i<=(r-j); ++i)
        if(this.isInBounds(x+i, y-j))
          array.push({x: x+i ,y: y-j, unit: this.tiles[x+i][y-j]});

    return array;
  }

  isInBounds(x,y) {
    return ((x>=0 && x<this.width) && (y>=0 && y<this.height));
  }

  //get's the possible movement squares from the unit at tile x,y
  //probably solved with recursion to fill out the availbe map tiles
  //will be extended later to account for difficult terrain.
  getPossibleMovement(x,y) {

  }
}

module.exports = Map;