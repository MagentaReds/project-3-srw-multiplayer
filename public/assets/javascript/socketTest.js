$(document).ready(function(){
  var socket = io();
  var myId=null;
  socket.emit("newplayer");

  socket.on("greet",function(data){
    console.log(data);
    $("#greeting").text(data);
  });
  socket.on("id", function(data){
    myId=data;
  });
  socket.on("chat", function(data){
    console.log("we getting ere");
    $("#chatBox").append($("<div>").text(data));
  });

  $("#chatForm").on("submit", function(e){
    e.preventDefault();
    var msg=$("#chatInput").val().trim();
    $("#chatInput").val("");
    if(myId!==null)
      socket.emit("sendChat", `${myId}: ${msg}`);
  });
});