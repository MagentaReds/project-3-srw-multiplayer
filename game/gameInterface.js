
var Game = require("./gameEngine.js");
var Client = require("./client.js");

//var tempConfig = require("../gameConfig")

class GameRoom {
  constructor(http, io, nsp, num, name) {
    this.name=name;
    this.roomNum=num;
    this.http=http;
    this.io=io;
    this.nsp=nsp;
    
    this.game=null;
    this.maxPlayers  = 2;

    this.clients = new Array(this.maxPlayers);
    
    
  }

  makeGame(){
    this.game = new Game(this.clients, this);
    //this.emitMap();
  }

  join(socket, slot) {
    socket.me.room=this.name;
    socket.me.slot=slot;
    socket.me.roomNum = this.roomNum;
    this.clients[slot] = socket.me;
    socket.join(this.name);
    //console.log(this.clients);
  }

  leave(socket, slot) {
    this.clients[slot]=null;
    socket.me.room=null;
    socket.me.slot=null;
    socket.me.roomNum=null;
    socket.leave(this.name);
    if(this.game)
      if(!this.game.isOver() && !this.game.isDefeated(socket.me.id))
        this.game.reset();
  }

  checkAllReady() {
    var arr=this.clients;
    var count=0;
    for(let i=0; i<arr.length; ++i)
      if(arr[i]){
        ++count;
        if(!arr[i].ready)
          return false;
      }
    
    return count>1;
  }

  isRoom() {
    for(let i=0; i<this.clients.length; ++i)
    if(!this.clients[i])
      return i;
    return -1;

    // console.log(Object.keys(this.nsp.adapter.rooms[this.name]));
    // console.log(this.nsp.adapter.rooms["Room Alpha"].sockets);

    // var roomList = this.nsp.adapter.rooms[this.name];
    // if(!roomList || this.nsp.adapter.rooms[this.name].length < this.maxPlayers)
    //   return true;
    // else
    //   return false;
  }

  getActions(playerId,r,c) {
    return this.game.getActions(playerId, r, c);
  }

  emitMap(map) {
    this.nsp.to(this.name).emit("update map", {map: map, msg: "Updated map!"});
  }

  emitMesssage(msg) {
    this.nsp.to(this.name),emit("game message", {msg});
  }
}

//This class will make and manage all socket.io namespaces/rooms and how they itneract with the Game object
class GameInterface {
  constructor(http, io)  {
    //this.test = "test YO";
    this.http = http;
    this.io=io;
    this.nsp=io.of("/game");
    this.mapRooms = this.nsp.adapter.rooms;
    this.rooms= new Array(5);
    this.rooms[0]=new GameRoom(http, io, this.nsp, 0, "Room Alpha");
    this.rooms[1]=new GameRoom(http, io, this.nsp, 1, "Room Beta");
    this.rooms[2]=new GameRoom(http, io, this.nsp, 2, "Room Gamma");
    this.rooms[3]=new GameRoom(http, io, this.nsp, 3, "Room Delta");
    this.rooms[4]=new GameRoom(http, io, this.nsp, 4, "Room Epsilon");

    //for temp names for clients
    this.uniqueIdCounter = 0;

    //used for testing/dev work, will replace with actual user info later.
    this.tempClientList=null;
    require("../config/gameSetTeams.js")(10).then((clientList)=>{
      this.tempClientList = clientList;
    });
    //nsp.emit("update map", {map: this.game.map.getAsciiMap(), msg: "Updated map!"});
    //io.sockets.in(this.room).emit("update map", {map: this.game.map.getAsciiMap(), msg: "Updated map!"});
    //nsp.to(this.room).emit("update map", {map: this.game.map.getAsciiMap(), msg: "Updated map!"});

    //this.setupListeners();

    //Attach this to methods. or not, react has messed me up
    //this.setNspListeners=this.setNspListeners.bind(this);


    this.setNspListeners();

  }

  setNspListeners() {
    //console.log("Setting Listeners");
    this.nsp.on("connection", (socket)=>{
      console.log('A user has connected to the game!');
      
      this.emitRooms();

      //adding new data to the socket itself
      socket.me = new Client(socket, this.tempClientList[this.uniqueIdCounter]);

      this.uniqueIdCounter++,


      //joining/leaving the fun!
      socket.on("new player", (cb)=>{
        //this.bindSocketListeners1(socket);
        // socket.join("Room Alpha");
        
        // console.log(Object.keys(this.nsp.adapter.rooms["Room Alpha"]));
        // console.log(this.nsp.adapter.rooms["Room Alpha"].sockets);
        //cb({id:socket.me.id, msg: `Hello, ${socket.me.name} with Id: ${socket.id} \n\n ${Object.keys(this.nsp.connected)}`});
        cb({id:socket.me.id, msg: `Hello, ${socket.me.name} with Id: ${socket.me.id}`});
      });
      socket.on("disconnect", ()=>{});

      //room listeners
      socket.on("join room", (roomId, cb)=>{this.onJoinRoom(socket, roomId, cb);});
      socket.on("leave room", (cb)=>{this.onLeaveRoom(socket, cb)});
      socket.on("toggle ready", (cb)=>{this.onToggleReady(socket, cb)});
      
      //game listeners
      socket.on("get actions", (data,cb)=>{this.onGetActions(socket, data, cb)});
      socket.on("get move", (data,cb)=>{this.onGetMove(socket, data, cb)});
      socket.on("do move", (data, cb)=>{this.onDoMove(socket, data, cb)});
      socket.on("get attack", (data,cb)=>{this.onGetAttack(socket, data, cb)});
      socket.on("do attack", (data, cb)=>{this.onDoAttack(socket, data, cb)});

    });
  }

  emitRooms() {
    var data = {rooms:new Array(5)};
    for(var i =0; i<this.rooms.length; ++i) {
      //data.rooms[i] = this.rooms[i].clients;
      data.rooms[i]=new Array(this.rooms[i].clients.length);
      for(var k =0; k<this.rooms[i].clients.length; ++k){
        if(this.rooms[i].clients[k])
          data.rooms[i][k]=this.rooms[i].clients[k].name;
      }
    }
    this.nsp.emit("update rooms", data);
  }

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

  onGetActions(socket, data, cb) {
    console.log(`Get Actions requested from id${data.player}`);
    var rNum=socket.me.roomNum;
    var response = {
      actions: this.rooms[rNum].game.getActions(socket.me.id, data.r, data.c),
      msg: `Action List at ${data.r},${data.c} has been sent`
    };

    cb(response);
  }

  onGetMove(socket, data, cb){
    console.log(`Get Move requested from id${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var response = {
      success: true,
      type: "Move",
      array: this.rooms[rNum].game.requestMoveTiles(socket.me.id, data.r, data.c),
      msg: `Move array at ${data.r},${data.c} has been sent`
    };

    cb(response);
  }

  onDoMove(socket, data, cb) {
    console.log(`Do Move requested from id${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var response = this.rooms[rNum].game.doMove(socket.me.id, data.r, data.c, data.toR, data.toC);

    cb(response);
  }

  onGetAttack(socket, data, cb){
    console.log(`Get Attack requested from id${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var response = this.rooms[rNum].game.getAttack(socket.me.id, data.r, data.c);

    cb(response);
  }

  onDoAttack(socket, data, cb) {
    console.log(`Do Attack requested from id${socket.me.id}`);
    var rNum=socket.me.roomNum;
    var response = this.rooms[rNum].game.doAttack(socket.me.id, data.r, data.c, data.toR, data.toC, data.weapon);

    cb(response);
  }
  
  bindSocketListeners1(socket) {

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