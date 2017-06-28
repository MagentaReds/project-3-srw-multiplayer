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

  $(document).on("submit", "form.Move", function(e){
    e.preventDefault();
    var me = $(this);
    var data = {};
    data.player = id;
    data.r = parseInt(me.r1);
    data.c = parseInt(me.c1);
    data.R = parseInt(me.r2);
    data.C = parseInt(me.c2);
    socket.emit("move", data, function(res){
      if(res.success) {
        
      }
      $("#messageDiv").text(res.msg);
    });
  });


});

function fillActionList(act, socket) {
  var ul = $("#actionList");
  ul.empty();
  var li,p,but,form,in1,in2,in3,in4;
  for(var i=0; i<act.length; ++i){
    li=$("<li>");
    li.text(act[i]);
    li.append($("<br/>"));
    form = $("<form>");
    form.addClass(act[i]);

    in1 = $("<input>");
    in1.attr("type", "number");
    in1.attr("name", "r1");
    in1.attr("placeholder", "From Row");

    in2 = $("<input>");
    in2.attr("type", "number");
    in2.attr("name", "c1");
    in2.attr("placeholder", "From Col");

    in3 = $("<input>");
    in3.attr("type", "number");
    in3.attr("name", "r2");
    in3.attr("placeholder", "To Row");

    in4 = $("<input>");
    in4.attr("type", "number");
    in4.attr("name", "c2");
    in4.attr("placeholder", "To Col");

    but = $("<button>");
    but.attr("data-action", act[i]);
    but.attr("type", "submit");
    but.text("Send Action");

    form.append(in1, in2, in3, in4, but);
    li.append(form);
    ul.append(li);
  }
}

function updateRoomDisplay(rooms) {
  var count=0;
  for(var i=1; i<rooms.length; ++i){
    for(var k=0; k<rooms[i].length; ++k) {
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