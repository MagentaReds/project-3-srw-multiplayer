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
    console.log("Game is start");
    $("#roomMessageDiv").text("Game is starting!");
    $("#messageDiv").text(data.msg);
  });

  socket.on("update map", function(data){
    console.log("Map has been updated");
    $("#mapDiv").text(data.map);
    $("#messageDiv").text(data.msg);
  });

  socket.on("get counter", function(data) {
    console.log("You are being attacked! Choose a defense action!");
    $("#messageDiv").text("Choose a Counter action!");
    displayWeapons2(data.weapons, data.stats);
    fillCounterList(data.actions);
  });

  socket.on("room message", function(data){
    console.log(data.msg);
    $("#roomMessageDiv").text(data.msg);
    var p = $("<p>");
    var strong =$("<strong>");
    strong.text(data.msg);
    $("#chatDisplay").append(p.append(strong));
  });

  socket.on("chat message", function(data){
    console.log(data.msg);
    var p = $("<p>");
    p.text(data.msg);
    $("#chatDisplay").append(p);
    $("#chatDisplay").scrollTop($("#chatDisplay")[0].scrollHeight);
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
      writeMessage(data);
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
      writeMessage(data);
    })
  });

  $("#ready").on("click", function(e){
    console.log("Toggling Ready");
    e.preventDefault();
    var state=$("#ready").attr("data-state");

    socket.emit("toggle ready", function(data){
      ready=data.ready;
      writeMessage(data);
    });
  });

  $("#getActions").on("click", function(e){
    console.log("Requesting Actions");
    e.preventDefault();

    var r = parseInt($("#row").val());
    var c = parseInt($("#col").val());

    socket.emit("get actions", {player: id, r, c}, function(data){
      writeMessage(data);
      fillActionList(data.actions);
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
    socket.emit("get move", data, function(data){
      if(data.success) {
        $("#arrayName").text(data.type);
        displayArray(data.array);
      }
      writeMessage(data);
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
    socket.emit("do move", data, function(data){
      console.log(data);
      if(data.success) {
      }
      writeMessage(data);
      fillActionList(data.actions);
    });
  });

  $(document).on("click", "button.get_Attack", function(e){
    e.preventDefault();
    var r = parseInt($("#row").val());
    var c = parseInt($("#col").val());
    var data = {};
    data.player = id;
    data.r=r;
    data.c=c;
    socket.emit("get attack", data, function(data){
      console.log(data);
      if(data.success) {
        $("#arrayName").text(data.type);
        fillActionList(data.actions);
        displayWeapons(data.weapons);
      }
      writeMessage(data);
    });
  });

  $(document).on("click", "button.Cancel", function(e){
    e.preventDefault();
    var r = parseInt($("#row").val());
    var c = parseInt($("#col").val());
    var data = {};
    data.player = id;
    data.r=r;
    data.c=c;
    socket.emit("do cancel", data, function(data){
      console.log(data);
      if(data.success) {
        
      }
      writeMessage(data);
    });
  });

  $(document).on("click", "button.Standby", function(e){
    e.preventDefault();
    var r = parseInt($("#row").val());
    var c = parseInt($("#col").val());
    var data = {};
    data.player = id;
    data.r=r;
    data.c=c;
    socket.emit("do standby", data, function(data){
      console.log(data);
      if(data.success) {
        
      }
      writeMessage(data);
    });
  });


  $(document).on("click", "button.Attack", function(e){
    e.preventDefault();
    var r = parseInt($("#row").val());
    var c = parseInt($("#col").val());
    var toR = parseInt($("#row1").val());
    var toC = parseInt($("#col2").val());
    var weapon = parseInt($("#weapon").val())
    var data = {};
    data.player = id;
    data.r=r;
    data.c=c;
    data.toR=toR;
    data.toC=toC;
    data.weapon=weapon;
    socket.emit("do attack", data, function(data){
      console.log(data);
      if(data.success) {
      }
      writeMessage(data);
    });
  });

  $(document).on("click", "button.get_Targets", function(e){
    e.preventDefault();
    var r = parseInt($("#row").val());
    var c = parseInt($("#col").val());
    var weapon = parseInt($("#weapon").val())
    var data = {};
    data.player = id;
    data.r=r;
    data.c=c;
    data.weapon = weapon;
    socket.emit("get targets", data, function(data){
      console.log(data);
      if(data.success) {
        $("#arrayName").text("Targets/Range");
        fillActionList(data.actions);
        displayArray([...data.targets, "I AM A BREAK", ...data.range]);
      }
      writeMessage(data);
    });
  });

  $(document).on("click", "button.get_Stats", function(e){
    e.preventDefault();
    var r = parseInt($("#row").val());
    var c = parseInt($("#col").val());
    var toR = parseInt($("#row1").val());
    var toC = parseInt($("#col2").val());
    var weapon = parseInt($("#weapon").val())
    var data = {};
    data.player = id;
    data.r=r;
    data.c=c;
    data.toR=toR;
    data.toC=toC;
    data.weapon = weapon;
    socket.emit("get stats", data, function(data){
      console.log(data);
      if(data.success) {
        $("#arrayName").text("Targets/Range");
        fillActionList(data.actions);
        displayArray([...data.targets, "I AM A BREAK", ...data.range]);
      }
      writeMessage(data);
    });
  });

  $(document).on("click", ".counterAction", function(e){
    e.preventDefault();
    var action=$(this).attr("data-action");
    var weapon=parseInt($(".counterWeapon_Attack").val());
    var data ={action, weapon};
    socket.emit("do counter", data, function(data){
      console.log(data);
      if(data.success) {
        $(".counterAction").empty();
      }
      writeMessage(data);
    });
  });

  $(document).on("submit", "#chatForm", function(e){
    e.preventDefault();
    var msg = $("#chatInput").val().trim();
    socket.emit("send chat", msg);
    $("#chatInput").val("");
  });

});

function writeMessage(data) {
  console.log(`Server Response: ${data.msg}`);
  $("#messageDiv").text(data.msg);
}

function fillActionList(act) {
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

function fillCounterList(act) {
  var ul = $("#counterList");
  ul.empty();
  var li,but,input;
  for(var i=0; i<act.length; ++i){
    li=$("<li>");
    li.text(act[i]);
    li.append($("<br/>"));

    input=$("<input>");
    input.addClass("counterWeapon_"+act[i]);
    input.attr("type", "number");

    but = $("<button>");
    but.addClass("counterAction");
    but.text(act[i]);
    but.attr("data-action", act[i]);


    li.append(input, but);
    ul.append(li);
  }
}

function displayArray(array) {
  var ol = $("#viewArray");
  ol.empty();
  for(var i =0; i<array.length; ++i)
    ol.append($("<li>").text(array[i]));
}

function displayWeapons(array) {
  var ol = $("#viewArray");
  ol.empty();
  for(var i =0; i<array.length; ++i)
    ol.append($("<li>").text(`${array[i].name}, ${array[i].range}, ${array[i].damage}`));
}

function displayWeapons2(array, stats) {
  var ol = $("#viewArray");
  ol.empty();
  for(var i =0; i<array.length; ++i)
    if(stats[i][0])
      ol.append($("<li>").text(`${array[i].name}, ${array[i].range}, ${array[i].damage}, ${stats[i][1]}`));
    else
      ol.append($("<del>").append($("<li>").text(`${array[i].name}, ${array[i].range}, ${array[i].damage}, ${stats[i][1]}`)));
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