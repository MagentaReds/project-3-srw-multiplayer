
var Game = require("./gameEngine.js");

class GameRoom {
  constructor(http, io, nsp, name) {
    this.name=name;
    this.http=http;
    this.io=io;
    this.name=name;
    this.players = [];
    this.game=null;
    
  }

  makeGame(){
    this.game = new Game(players);
  }

  join(socket) {

  }

  allReady() {
    var arr=this.players;
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
    for(let i=0; i<roomArray.length; ++i)
    if(!roomArray[i])
      return i;
  return -1;
  }
}

//This class will make and manage all socket.io namespaces/rooms and how they itneract with the Game object
class GameInterface {
  constructor(http, io)  {
    //this.test = "test YO";
    this.http = http;
    this.io=io;
    this.nsp=io.of("/game");
    this.rooms= new Array(5);
    this.rooms[0]=new GameRoom(http, io, this.nsp, "Room Alpha");
    this.rooms[1]=new GameRoom(http, io, this.nsp, "Room Beta");
    this.rooms[2]=new GameRoom(http, io, this.nsp, "Room Gamma");
    this.rooms[3]=new GameRoom(http, io, this.nsp, "Room Delta");
    this.rooms[4]=new GameRoom(http, io, this.nsp, "Room Epsilon");
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
      //this.nsp.emit("update rooms", {rooms: this.http.rooms});

      //adding new data to the socket itself


      //joining/leaving the fun!
      socket.on("new player", (cb)=>{
        //this.bindSocketListeners1(socket);
        cb({id:0, msg: `Hello, User with Id${socket.id}`});
      });
      socket.on("disconnect", ()=>{});

      //room listeners
      socket.on("join room", (roomId, cb)=>{this.onJoinRoom(socket, roomId, cb);});
      socket.on("leave room", (cb)=>{});
      socket.on("toggle ready", (cb)=>{});
      
      //game listeners
      socket.on("request actions", (data,cb)=>{});
      socket.on("move", (data,cb)=>{});

    });
  }
  
  bindSocketListeners1(socket) {

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