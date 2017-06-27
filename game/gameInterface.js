
var Game = require("./gameEngine.js");


class GameInterface {
  constructor(http, io, nsp, room, clientList)  {
    this.http = http;
    this.io=io;
    this.nsp=nsp;
    this.room=room;
    this.game = new Game(this, clientList);
    //nsp.emit("update map", {map: this.game.map.getAsciiMap(), msg: "Updated map!"});
    //io.sockets.in(this.room).emit("update map", {map: this.game.map.getAsciiMap(), msg: "Updated map!"});
    nsp.to(this.room).emit("update map", {map: this.game.map.getAsciiMap(), msg: "Updated map!"});

    //this.setupListeners();


    // io.on("request actions", (data, cb) => {
    //   console.log(`actions requested from id${data.player}`);
    //   var response = {
    //     actions: this.game.requestActions(data.player, data.r, data.c),
    //     msg: `Action List at ${data.r},${data.c} has been sent`
    //   };

    //   cb(response);
    // });

  }

  makeGame() {

  }

  setupListeners() {
    this.io.to(this.namespace.name).on("request actions", function(data, cb){
      console.log(`actions requested from id${data.player}`);
      var response = {
        actions: this.game.requestActions(data.player, data.r, data.c),
        msg: `Action List at ${data.r},${data.c} has been sent`
      };

      cb(response);
    });

    this.io.on("move", function(data, cb){
      var response ={};

      var didMove = this.game.moveAction(data.player, data.r, data.c, data.R, data.C);
      if(didMove) {
        response.success = true;
        response.msg = `Moved unit from [${data.r},${data.c}] to [${data.R},${data.C}]`;
        namespace.emit("update map", {map: this.game.map.getAsciiMap()});

      } else {
        response.success = false;
        response.msg = "Failed to move unit";
      }

      cb(response);
    });
  }
}

module.exports = GameInterface;