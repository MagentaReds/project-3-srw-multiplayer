"use strict";


class Client {
  constructor(socket, client) {
    this.socket = socket;
    this.id=client.id;
    this.name=client.name;
    this.units=client.units;

    this.ready=false;
    this.roomNum=null;
    this.slot=null;
    this.room=null;
    this.isAuth=true;
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

module.exports = Client;