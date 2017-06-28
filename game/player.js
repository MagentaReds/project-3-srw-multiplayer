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
  }

  isDefeated(){

  }
  isReady() {

  }
  setReady(readyState){

  }
  getUnit(index) {

  }
 
}

module.exports = Player;