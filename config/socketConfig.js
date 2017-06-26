

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
          if(joinThisSlot!==-1) {
            socket.player.room=roomId;
            socket.player.slot=joinThisSlot;
            http.rooms[roomId][joinThisSlot]=socket.player;
            console.log(`Socket ID ${socket.player.id} joined room ${roomId}`);
            io.emit("update rooms", {rooms: http.rooms});

            cb({success: true, slot: joinThisSlot, msg: `Player ID ${socket.player.id} joined room ${roomId}`});
          }
          else
            cb({success: false, msg: "Failed to join the room, insufficent space"});
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


function configSocket(http, io){
  http.lastPlayerID = 0;
  //http.playersList = [];

  configChatPage(http, io.of("/testChat"));
  configGame(http, io.of("/game"));

}

module.exports = configSocket;