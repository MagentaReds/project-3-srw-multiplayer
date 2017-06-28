$(document).ready(function(){
 var rooms=new Array(5); 
 rooms[0]=new Array(2);
 rooms[1]=new Array(2);
 rooms[2]=new Array(2);
 rooms[3]=new Array(2);
 rooms[4]=new Array(2);

  var socket = io("/game");
  var gameRoom = null;
  var roomSlot = null;
  var id = null;
  var ready=false;

  //client emits
  socket.emit("new player", function(data){
    console.log("Registering new player to server");
    id=data.id;
    $("#greeting").text(data.msg);
  });


  //client listeners
  socket.on("update rooms", function(data){
    console.log("Updating room values and display");
    rooms=data.rooms;
    updateRoomDisplay(rooms);
  });

  socket.on("game start", function(data){
    $("#roomMessageDiv").text("Game is starting!");
    $("#messageDiv").text(data.msg);
  });

  socket.on("update map", function(data){
    $("#mapDiv").text(data.map);
    $("#messageDiv").text(data.msg);
  });

  //jquery listeners
  $(".joinRoom").on("click", function(e){
    console.log("Trying to Join a room");
    e.preventDefault();
    var room=parseInt($(this).attr("data-room"));

    socket.emit("join room", room, function(data){
      if(data.success) {
        gameRoom=room;
        roomSlot=data.slot;
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

  $("#ready").on("click", function(e){
    console.log("Toggleing Ready");
    e.preventDefault();
    var state=$("#ready").attr("data-state");

    socket.emit("toggle ready", function(data){
      ready=data.ready;
      $("#messageDiv").text(data.msg);
    });
  });

  $("#getActions").on("click", function(e){
    console.log("Requesting Actions");
    e.preventDefault();

    var r = parseInt($("#row").val());
    var c = parseInt($("#col").val());

    socket.emit("request actions", {player: id, r, c}, function(data){
      $("#messageDiv").text(data.msg);
      fillActionList(data.actions, socket);
    });
  });

  $(document).on("click", "button.get_Move", function(e){
    e.preventDefault();
    var r = parseInt($("#row").val());
    var c = parseInt($("#col").val());
    var data = {};
    data.player = id;
    data.r=r;
    data.c=c;
    socket.emit("get move tiles", data, function(res){
      if(res.success) {
        $("#arrayName").text(res.type);
        displayArray(res.array);
      }
      $("#messageDiv").text(res.msg);
    });
  });

  $(document).on("click", "button.Move", function(e){
    e.preventDefault();
    var r = parseInt($("#row").val());
    var c = parseInt($("#col").val());
    var toR = parseInt($("#row1").val());
    var toC = parseInt($("#col2").val());
    var data = {};
    data.player = id;
    data.r=r;
    data.c=c;
    data.toR=toR;
    data.toC=toC;
    socket.emit("do move", data, function(res){
      if(res.success) {
      }
      $("#messageDiv").text(res.msg);
    });
  });


});

function fillActionList(act, socket) {
  var ul = $("#actionList");
  ul.empty();
  var li,but,but2
  for(var i=0; i<act.length; ++i){
    li=$("<li>");
    li.text(act[i]);
    li.append($("<br/>"));

    but = $("<button>");
    but.addClass(act[i])
    but.text(act[i]);

    but2 = $("<button>");
    but2.addClass("get_"+act[i])
    but2.text("get "+act[i]);

    li.append(but, but2);
    ul.append(li);
  }
}

function displayArray(array) {
  var ol = $("#viewArray");
  ol.empty();
  for(var i =0; i<array.length; ++i)
    ol.append($("<li>").text(array[i]));
}

function updateRoomDisplay(rooms) {
  var count=0;
  for(var i=0; i<rooms.length; ++i){
    for(var k=0; k<rooms[i].length; ++k) {
      if(rooms[i][k]) {
        $(`#room${i}_slot${k}`).text(rooms[i][k]);
        ++count;
      } else
        $(`#room${i}_slot${k}`).text('_');
    }
    $(`#room${i}Count`).text(count);
    count=0;
  }
} 