var GameInterface = require("../game/gameInterface.js");

function configChatPage(http, io) {
  io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('newplayer',function(){
        socket.player = {
            id: http.lastPlayerID++,
        };
        socket.emit("greet", `Hello, User with Id${socket.player.id}`);
        socket.emit('id', socket.player.id);
        socket.broadcast.emit('newplayer',socket.player);

        socket.on("sendChat", function(data){
          console.log("Received chat message, resending to everyone");
          io.emit("chat", data);
        });

        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
        });
    });

    socket.on('test',function(){
        console.log('test received');
    });
  });
}


function configGame(http, io){
  http.rooms=new Array(5); //one more than needed
  http.rooms[0]=null; //dummy room
  http.rooms[1]=new Array(2);
  http.rooms[2]=new Array(2);
  http.rooms[3]=new Array(2);
  http.rooms[4]=new Array(2);

  var games=new Array(5);

  io.on('connection', function(socket){
    console.log('A user has connected to the game!');

    io.emit("update rooms", {rooms: http.rooms});

    socket.on('newPlayer',function(cb){
        //build player object stored in socket
        socket.player = {
            id: http.lastPlayerID++,
            room: null,
            slot: null,
            ready: false
        };
        
        //build additional listeners
        socket.on("join room", function(roomId, cb){
          let joinThisSlot=roomInRoom(http.rooms[roomId]);
          if(joinThisSlot!==-1 && socket.player.room===null) {
            socket.player.room=roomId;
            socket.player.slot=joinThisSlot;
            http.rooms[roomId][joinThisSlot]=socket.player;
            socket.join(`room${roomId}`);
            console.log(`Socket ID ${socket.player.id} joined room ${roomId}`);
            io.emit("update rooms", {rooms: http.rooms});

            cb({success: true, slot: joinThisSlot, msg: `Player ID ${socket.player.id} joined room ${roomId}`});
          }
          else
            cb({success: false, msg: "Failed to join the room, insufficent space"});
        });

        socket.on("ready",  function(cb){
          if(socket.player.ready)
            socket.player.ready=false;
          else if(socket.player.room!==null) {
            socket.player.ready=true;
            var roomNum=socket.player.room;
            var room = http.rooms[roomNum];
            if(checkAllReady(room)) {
              var firstPlayer = http.rooms[roomNum][0].id; 
              io.to(`room${roomNum}`).emit("game start", {first: firstPlayer, msg: `ID${firstPlayer} is the first to go!`});

              //sending the same unitsand client list to each for testing
              require("./gameConfig.js")().then(function(clientList) {
                clientList[0].id = room[0].id;
                clientList[1].id = room[1].id;
                games[roomNum] = new GameInterface(http, io, io.to(`room${roomNum}`), clientList);
              });
              
            }
          }
          cb({ready: socket.player.ready, msg: `You are ${socket.player.ready ? "ready" : "unread"}.`});
        });

        socket.on('disconnect',function(){
          let room=socket.player.room;
          let slot=socket.player.slot;
          http.rooms[room][slot]=null;
          io.emit("update rooms", {rooms: http.rooms});
        });

        socket.on('leave room', function(cb) {
          let room=socket.player.room;
          let slot=socket.player.slot;
          if(room!==null && slot!==null && room!==undefined && slot!==undefined) {
            socket.player.room=null;
            socket.player.slot=null;
            http.rooms[room][slot]=null;
            socket.leave(`room${room}`);
            io.emit("update rooms", {rooms: http.rooms});
            cb({succes:true, msg:`Left room${room}`});
          } else
            cb({succes:false, msg:"You aren't in a room to leave, silly!"});
        });

        cb({id:socket.player.id, msg: `Hello, User with Id${socket.player.id}`});
    });
  });
}

function roomInRoom(roomArray) {
  for(let i=0; i<roomArray.length; ++i)
    if(!roomArray[i])
      return i;
  return -1;
}

function checkAllReady(room) {
  var ready=true;
  for(let i=0; i<room.length; ++i)
    if(!room[i] || !room[i].ready)
      ready = false;
  
  return ready;
}


function configSocket(http, io){
  http.lastPlayerID = 0;
  //http.playersList = [];

  configChatPage(http, io.of("/testChat"));
  configGame(http, io.of("/game"));

}

module.exports = configSocket;