"use strict";

var Promise = require("bluebird");

var Game = require("./gameEngine.js");
var Client = require("./client.js");

var Helpers = require("../config/teamHelper.js");


//Helper Class to contain information about game Rooms
class GameRoom {
  constructor(http, io, nsp, num, name, gameInter) {
    this.name=name;
    this.roomNum=num;
    this.http=http;
    this.io=io;
    this.nsp=nsp;
    this.gameInter=gameInter;

    this.game=null;
    this.maxPlayers  = 2;

    this.clients = new Array(this.maxPlayers);
  }

  //Instantiates the gameEngine for this room
  makeGame(){
    this.game = new Game(this.clients, this);
  }

  //adds the socket into the clientlist for this room
  join(socket, slot) {
    socket.me.room=this.name;
    socket.me.slot=slot;
    socket.me.roomNum = this.roomNum;
    socket.me.socketId=socket.id;
    this.clients[slot] = socket;
    socket.join(this.name);
    //console.log(this.clients);
  }

  //removes the socket from the slot in this game room
  leave(socket, slot) {
    this.clients[slot]=null;
    socket.me.room=null;
    socket.me.slot=null;
    socket.me.roomNum=null;
    socket.leave(this.name);
    if(this.game)
      if(!this.game.checkGameOver() && !this.game.isDefeated(socket.me.id))
        this.game.playerLeft(socket.me.id);
  }

  //checks to see if all people in the room are ready.
  checkAllReady() {
    var arr=this.clients;
    var count=0;
    for(let i=0; i<arr.length; ++i)
      if(arr[i]){
        ++count;
        if(!arr[i].me.ready)
          return false;
      }

    return count>1;
  }

  //checks to see if there are open slots in the room
  isRoom() {
    for(let i=0; i<this.clients.length; ++i)
    if(!this.clients[i])
      return i;
    return -1;
  }

  //Emits a 'update map' event (the ascii map) to the all sockets/clients in this room
  emitMap(map) {
    console.log(`Sending Map Update to Room ${this.roomNum}`);
    this.nsp.to(this.name).emit("update ascii map", {map: map, msg: "Updated map!"});
  }

  emitRealMap(map) {
    console.log(`Sending Map Update to Room ${this.roomNum}`);
    this.nsp.to(this.name).emit("update map", {map: map, msg: "Updated map!"});
  }

  //Emits a 'room message' event to the all sockets/clients in this room
  emitMessage(msg) {
    console.log(`Sending Message to Room ${this.roomNum}`);
    this.nsp.to(this.name).emit("room message", {msg});
  }

  receiveChat(socketMe, msg) {
    console.log(`Received chat mesage from ${socketMe.name} resending to Room ${this.roomNum}`);
    this.nsp.to(this.name).emit("chat message", {msg: `${socketMe.name}: ${msg.substr(0, 100)}`})
  }

  //Emits a 'get counter' event to the player that is being attacked
  //and sends that player what options they have.
  emitGetCounter(playerId, data) {
    var socketMeRef;
    for(var i=0; i<this.clients.length; ++i)
      if(this.clients[i].me.id===playerId)
        socketMeRef = this.clients[i].me;

    console.log(`Sending 'get counter' to Player ${socketMeRef.name} in Room ${this.roomNum}`);
    this.nsp.to(socketMeRef.socketId).emit("get counter", data);
  }

  //Emits a 'update players' event to the all sockets/clients in this room
  emitPlayersUpdate(data) {
    console.log(`Sending Player Data to Room ${this.roomNum}`);
    this.nsp.to(this.name).emit("update players", data);
  }

  //Emits all the information about each player's stats to everyone in the room. 
  //Usually Done at the start of each round.
  emitAllUnitStats(data) {
    console.log(`Sending All Unit's Stats to Room ${this.roomNum}`);
    this.nsp.to(this.name).emit("updater all info", data);
  }

  gameOver(playerRef) {
    console.log(`The game in Room ${this.roomNum} is over, shutting down room`);
    if(playerRef) {
      this.emitMessage(`The Winner is ${playerRef.name}!`);
    }
    this.emitMessage("The Game is over, shutting down room");

    this.cleanUpRoom();
  }

  cleanUpRoom() {
    this.game=null;
    for(let i=0; i<this.clients.length; ++i){
      if(this.clients[i]) {
        this.clients[i].me.room=null;
        this.clients[i].me.slot=null;
        this.clients[i].me.roomNum=null;
        this.clients[i].leave(this.name);
        this.clients[i]=null;
      }
    }
    this.gameInter.emitRooms();
  }
}

//This class will make and manage all socket.io namespaces/rooms and how they itneract with the Game object
class GameInterface {
  constructor(http, io, testing=true)  {
    //this.test = "test YO";
    this.http = http;
    this.io=io;
    this.nsp=io.of("/game");
    this.mapRooms = this.nsp.adapter.rooms;
    this.rooms= new Array(5);
    this.rooms[0]=new GameRoom(http, io, this.nsp, 0, "Room Alpha", this);
    this.rooms[1]=new GameRoom(http, io, this.nsp, 1, "Room Beta", this);
    this.rooms[2]=new GameRoom(http, io, this.nsp, 2, "Room Gamma", this);
    this.rooms[3]=new GameRoom(http, io, this.nsp, 3, "Room Delta", this);
    this.rooms[4]=new GameRoom(http, io, this.nsp, 4, "Room Epsilon", this);

    //for temp names for clients
    this.uniqueIdCounter = 0;

    //used for testing/dev work, will replace with actual user info later.
    this.testing=testing;
    if(testing) {
      this.tempClientList=null;
      require("../config/gameSetTeams.js")(10).then((clientList)=>{
        this.tempClientList = clientList;
      });
    } else {
      
    }

    this.setNspListeners();
  }

  //Sets most of the event handlers for socket.io
  setNspListeners() {
    //console.log("Setting Listeners");
    this.nsp.on("connection", (socket)=>{
      console.log('A user has connected to the game!');

      this.emitRooms();

      //joining/leaving the fun!
      socket.on("new player", (data, cb)=>{
        if(this.testing) {
          //adding new data to the socket itself
          socket.me = new Client(socket, this.tempClientList[this.uniqueIdCounter]);
          this.uniqueIdCounter++,
          cb({id:socket.me.id, msg: `Hello, ${socket.me.name} with Id: ${socket.me.id}`});
        }
        else {
          console.log(data);
          Helpers.makeUnitsFromTeam(data.id).then(function(client) {
            socket.me = new Client(socket, client);
            //console.log(client);
            cb({id:socket.me.id, msg: `Hello, ${socket.me.name} with Id: ${socket.me.id}`});
          });;
        }
      });
      socket.on("disconnect", ()=>{
        if(!socket.me)
          return;
        if(socket.me.roomNum!==null) {
          this.rooms[socket.me.roomNum].leave(socket, socket.me.slot);
        } 
      });

      //room listeners
      socket.on("join room", (roomId, cb)=>{this.onJoinRoom(socket, roomId, cb);});
      socket.on("leave room", (cb)=>{this.onLeaveRoom(socket, cb)});
      socket.on("toggle ready", (cb)=>{this.onToggleReady(socket, cb)});

      //game listeners
      socket.on("get actions", (data,cb)=>{this.onGetActions(socket, data, cb)});
      socket.on("get move", (data,cb)=>{this.onGetMove(socket, data, cb)});
      socket.on("do move", (data, cb)=>{this.onDoMove(socket, data, cb)});
      socket.on("get spirit", (data,cb)=>{this.onGetSpirit(socket, data, cb)});
      socket.on("do spirit", (data, cb)=>{this.onDoSpirit(socket, data, cb)});
      socket.on("get attack", (data,cb)=>{this.onGetAttack(socket, data, cb)});
      socket.on("get targets", (data,cb)=>{this.onGetTargets(socket, data, cb)});
      socket.on("get stats", (data, cb)=>{this.onGetStats(socket, data, cb)});
      socket.on("get status", (data, cb)=>{this.onGetStatus(socket, data, cb)});
      socket.on("do attack", (data, cb)=>{this.onDoAttack(socket, data, cb)});
      socket.on("do counter", (data, cb)=>{this.onDoCounter(socket, data, cb)});
      socket.on("do cancel", (data, cb)=>{this.onDoCancel(socket, data, cb)});
      socket.on("do standby", (data, cb)=>{this.onDoStandby(socket, data, cb)});
      socket.on("send chat", (data, cb)=>{this.onSendChat(socket, data)});
      socket.on("active unit", (cb)=>{this.onActiveUnit(socket, cb)});
      socket.on("get weapons", (data,cb)=>{this.onGetWeapons(socket, data, cb)});
      socket.on("do surrender", (cb)=>{this.onDoSurrender(socket, cb)});
      socket.on("get allies", (data, cb)=>{this.onGetAllies(socket, data, cb)});
    });
  }

  //Emit room details/updates to all connected sockets in the namespace.
  emitRooms() {
    var data = {rooms:new Array(5)};
    for(var i =0; i<this.rooms.length; ++i) {
      //data.rooms[i] = this.rooms[i].clients;
      data.rooms[i]=new Array(this.rooms[i].clients.length);
      for(var k =0; k<this.rooms[i].clients.length; ++k){
        if(this.rooms[i].clients[k])
          data.rooms[i][k]=this.rooms[i].clients[k].me.name;
      }
    }
    console.log(`Sending Updated details about All Rooms to namespace`);
    this.nsp.emit("update rooms", data);
  }

  //Rest of methods are handlers for each socket.io event type we are listening for.

  //These first few handlers deal with room administration.

  onJoinRoom(socket, roomNum, cb) {
    var room = this.rooms[roomNum];
    var slot = room.isRoom();
    if(socket.me.room!==null) {
      cb({success: false, msg: "You are already in a room, leave current room before joining a new room"});
    } else if(slot===-1) {
      cb({success: false, msg: "Room is full;"});
    } else {
      room.join(socket, slot);
      this.emitRooms();
      cb({success: true, msg: `Welcome to \'${room.name}\'`});
    }
  }

  onLeaveRoom(socket, cb) {
    var room=this.rooms[socket.me.roomNum];
    if(socket.me.room===null) {
      cb({success: false, msg: "You are already not in a room."});
    } else {
      room.leave(socket, socket.me.slot);
      this.emitRooms();
      cb({success: true, msg: `Left \'${room.name}\'`});
    }
  }

  onToggleReady(socket, cb) {
    if(socket.me.ready)
      socket.me.ready=false;
    else if(socket.me.room!==null) {
      socket.me.ready = true;

      var roomNum = socket.me.roomNum;
      if(this.rooms[roomNum].checkAllReady()) {
        this.rooms[roomNum].makeGame();

        var firstPlayer = this.rooms[roomNum].game.pRef.name;
        this.nsp.to(socket.me.room).emit("game start", {first: firstPlayer, msg: `ID${firstPlayer} is the first to go!`});
      }
    }
    cb({ready: socket.me.ready, msg: `You are ${socket.me.ready ? "ready" : "unready"}.`});
  }

  //The rest of these handlers talk to the room's gameEngine and call the related method.
  //Then based send's the gameEngine's response back to the socket.

  onGetActions(socket, data, cb) {
    console.log(`Get Actions requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room)  {
      var response = {
        actions: this.rooms[rNum].game.getActions(socket.me.id, data.r, data.c),
        msg: `Action List at ${data.r},${data.c} has been sent`
      };

      cb(response);
    }
  }

  onGetMove(socket, data, cb){
    console.log(`Get Move requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = {
        success: true,
        type: "Move",
        array: this.rooms[rNum].game.requestMoveTiles(socket.me.id, data.r, data.c),
        msg: `Move array at ${data.r},${data.c} has been sent`
      };

      cb(response);
    }
  }

  onDoMove(socket, data, cb) {
    console.log(`Do Move requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.doMove(socket.me.id, data.r, data.c, data.toR, data.toC);

      cb(response);
    }
  }

  onGetSpirit(socket, data, cb) {
    console.log(`Get Spirit requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.getSpirit(socket.me.id, data.r, data.c);

      cb(response);
    }
  }

  onDoSpirit(socket, data, cb) {
    console.log(`Do Spirit requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.doSpirit(socket.me.id, data.r, data.c, data.toR, data.toC, data.spirit);

      cb(response);
    }
  }

  onGetAttack(socket, data, cb){
    console.log(`Get Attack requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.getAttack(socket.me.id, data.r, data.c);

      cb(response);
    }
  }

  onGetTargets(socket, data, cb){
    console.log(`Get Targets requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.getTargets(socket.me.id, data.r, data.c, data.weapon);

      cb(response);
    }
  }

  onGetStats(socket, data, cb){
    console.log(`Get Stats requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.getStats(socket.me.id, data.r, data.c, data.toR, data.toC, data.weapon);

      cb(response);
    }
  }

  onGetStatus(socket, data, cb){
    console.log(`Get Status requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.getStatus(socket.me.id, data.r, data.c);

      cb(response);
    }
  }

  onDoAttack(socket, data, cb) {
    console.log(`Do Attack requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.doAttack(socket.me.id, data.r, data.c, data.toR, data.toC, data.weapon);

      cb(response);
    }
  }

  onDoCounter(socket, data, cb) {
    console.log(`Do Counter requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.doCounter(socket.me.id, data.action, data.weapon);

      cb(response);
    }
  }

  onDoCancel(socket, data, cb) {
    console.log(`Do Cancel requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.doCancel(socket.me.id, data.r, data.c);

      cb(response);
    }
  }

  onDoStandby(socket, data, cb) {
    console.log(`Do Cancel requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.doStandby(socket.me.id, data.r, data.c);

      cb(response);
    }
  }

  onSendChat(socket, msg) {
    console.log(`Send chat event from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room)
      room.receiveChat(socket.me, msg);
  }

  onActiveUnit(socket, cb) {
    console.log(`Active unit requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.getActiveUnit(socket.me.id);
      cb(response);
    }
  }

  onGetWeapons(socket, data, cb) {
    console.log(`Get Weapons requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.getWeapons(socket.me.id, data.r, data.c);

      cb(response);
    }
  }

  onDoSurrender(socket, cb) {
    console.log(`Do Surrender requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.surrender(socket.me.id);

      cb(response);
    }
  }

  onGetAllies(socket, data, cb) {
    console.log(`Get Allies requested from ${socket.me.name} id: ${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var room=this.rooms[rNum];
    if(room) {
      var response = this.rooms[rNum].game.getAllies(socket.me.id, data.r, data.c);

      cb(response);
    }
  }

}

module.exports = GameInterface;
