"use strict";

//player class hold's the units, is basically just a container class. 
//with some useful methods.

//the array of players is made and held in the server, 
// and referenced/edited by the Game object

class Player {
  constructor(client) {
    this.id=client.id;
    this.name=client.name;
    //will need to make a unit.clone utility to kepe things nice a seperate
    this.units=client.units;
    this.currentUnit = -1;
  }

  //need to expand to account for when unit is dead, but testing will ignore for now
  getNextUnit() {
    this.currentUnit++;
    if(this.currentUnit>=this.units.length)
      this.currentUnit=0;

    return this.units[this.currentUnit];
  }

  //returns true if all units are dead
  isDefeated(){
    for(var i=0; i<this.units.length; ++i)
      if(this.units[i].isAlive)
        return false;
    return true;
  }
  isReady() {

  }
  setReady(readyState){

  }
  getUnit(index) {

  }
 
}

module.exports = Player;