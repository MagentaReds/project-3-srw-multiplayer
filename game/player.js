"use strict";

//player class hold's the units, is basically just a container class. 
//with some useful methods.

//the array of players is made and held in the server, 
// and referenced/edited by the Game object

class Player {
  constructor(client) {
    this.name=client.name;
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