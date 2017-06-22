"use strict";

class Map {
  constructor(height, width, fileNamme="") {
    this.tiles=new Array(height);
    for(let i=0; i<height; ++i)
      this.tiles[i] = new Array(width);
  }
}

module.exports = Map;