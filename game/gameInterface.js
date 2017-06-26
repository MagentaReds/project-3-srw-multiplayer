
var Game = require("./gameEngine.js");


class GameInterface {
  constructor(http, io, namespace, clientList)  {
    this.http = http;
    this.io=io;
    this.namespace=namespace;
    this.game = new Game(clientList);

    this.setupListeners();

    namespace.emit("update map", {map: this.game.map.getAsciiMap(), msg: "Updated map!"});
  }

  setupListeners() {
    this.namespace.on("request actions", function(data, cb){
      var response = {
        actions: this.game.requestActions(data.player, data.r, data.c),
        msg: `Action List at ${data.r},${data.c} has been sent`
      };

      cb(response);
    });
  }
}

module.exports = GameInterface;