$(document).ready(function(){
 var rooms=new Array(5); //one more than needed
 rooms[0]=null; //dummy room
 rooms[1]=new Array(2);
 rooms[2]=new Array(2);
 rooms[3]=new Array(2);
 rooms[4]=new Array(2);

  var socket = io("/game");
  var gameRoom = null;
  var roomSlot = null;
  var id = null;

  //client emits
  socket.emit("newPlayer", function(data){
    console.log("Registering new player to server");
    id=data.id;
    $("#greeting").text(data.msg);
  });

  //client listeners
  socket.on("update rooms", function(data){
    console.log("Updating room values and display");
    rooms=data.rooms;
    updateRoomDisplay(rooms)
  });

  //jquery listeners
  $(".joinRoom").on("click", function(e){
    console.log("Trying to Join a room");
    e.preventDefault();
    var room=parseInt($(this).attr("data-room"));

    socket.emit("join room", room, function(data){
      if(data.success) {
        gameRoom=room;
        roomSlot=data.slot
      }
      $("#messageDiv").text(data.msg);
    });
  });

  $("#leaveRoom").on("click", function(e){
    console.log("Trying to leave a room");
    e.preventDefault();

    socket.emit("leave room", function(data){
      console.log("Do we get here?");
      if(data.success) {
        gameRoom=null;
        roomSlot=null;
      }
      $("#messageDiv").text(data.msg);
    })
  });

});

function updateRoomDisplay(rooms) {
  let count=0;
  for(let i=1; i<rooms.length; ++i){
    for(let k=0; k<rooms[i].length; ++k) {
      if(rooms[i][k]) {
        $(`#room${i}_slot${k}`).text(rooms[i][k].id);
        ++count;
      } else
        $(`#room${i}_slot${k}`).text('_');
    }
    $(`#room${i}Count`).text(count);
    count=0;
  }
} 