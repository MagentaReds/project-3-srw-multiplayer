var socket = io("/game", {reconnection: false});
var gameRoom = null;
var roomSlot = null;
var id = null;
var ready=false;
// some global game variables below to help alleve server of some duties
var attackTiles = [];
var moveTiles = [];
var currentWeaponId;

var rooms=new Array(5);
rooms[0]=new Array(2);
rooms[1]=new Array(2);
rooms[2]=new Array(2);
rooms[3]=new Array(2);
rooms[4]=new Array(2);

socket.on("update rooms", function(data){
	console.log("Updating room values and display");
	rooms=data.rooms;
	updateRoomDisplay(rooms);
});

socket.on("update map", function(data){
	console.log("Updating map");
	buildGrid(data.map);
	writeMessage(data.msg);
	$("#surrender").hide();
	$("#status").hide();
	$("#endSurrender").hide();
	$("#menu").hide();
	$("#menu2").hide();
	$("#hitAwayAndHasAttackedHasMoved").hide();
	$("#hitAwayAndHasAttacked").hide();
	socket.emit("active unit", function(data){
		displayActiveTile([data.r, data.c]);
		blinkActiveTile([data.r, data.c]);
	});
});

socket.on("game start", function(data1){
	console.log("Game is starting");
	$("#roomDiv").hide();
	$("#gameField").toggleClass("hidden");
	$("#roomMessageDiv").text("Game is starting!");
	$("#messageDiv").text(data1.msg);
	$(".move").bind("click", moveOptions);
	buildWeaponUi();
	socket.emit("active unit", function(data){
		displayActiveTile([data.r, data.c]);
		blinkActiveTile([data.r, data.c]);
	});
});

socket.emit("new player", function(data){
	console.log(data);
})

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

function writeMessage (msg) {
	$("#messageDiv").text(msg);
}

// code that makes 900 grid-tiles with each row and column's data index stored
function buildGrid (map) {
	$("#grid").empty();
	for (var r = 0; r < map.length; r++) {
		for (var c = 0; c < map[0].length; c++) {
			$("#grid").append(`<li class="grid-square" data-r = "${r}" data-c = "${c}"><div class="grid-style" data-r = "${r}" data-c = "${c}"></div></li>`);
			if (map[r][c]) {
				$(`li[data-r=${r}][data-c=${c}]`).append(`<img src=assets/media/${map[r][c]} style="margin:-15px 0px 3px -3px; height:60px;">`);
			}
		}
	}
}

// .grid-square will handle click events and icons for units will be appended to here
// .grid-style will handle all css coloring and blinking aspects of grid

// hide our JQuery UI
$("#menu").hide();
$("#menu2").hide();
$("#cancel").hide();
$("#status").hide();
$("#endSurrender").hide();
$("#surrender").hide();
$("#hitAwayAndHasAttackedHasMoved").hide();
$("#hitAwayAndHasAttacked").hide();
// toggleclass blink for all li.grid-square, otherwise when we wont to show active unit tile, all tiles will start blinking

// example location of where an active unit could be
var activeUnit = [];
activeUnit = [5,2];

var activePlayer = 3;
var myId = 3;

var availableWeapons = {
  weapons: [
    {
      id: 1,
      name: "Attack 1",
      range: [1,1],
      dmg: 2000,
      canUse: true,
			hit: 30,
			ammo: "20/20"
    },
    {
      id: 4,
      name: "Attack Fulls",
      range: [3,7],
      dmg: 1000,
      canUse: false,
			hit: 40,
			ammo: "30/30"
    }
  ]
}

var availableAttackTiles = [
	[5,4],
	[5,6],
	[4,5],
	[6,5]
];

// $(`li[data-r=${5}][data-c=${5}]`).append(`<img src=assets/media/icon1.png style="margin:-15px 0px 3px -3px; height:60px;">`);
// $(`li[data-r=${5}][data-c=${7}]`).append(`<img src=assets/media/icon1.png style="margin:-15px 0px 3px -3px; height:60px;">`);

function displayActiveTile(locate) {
	// locates active tile where unit will be and colors in tile with green
	$(`div[data-r=${locate[0]}][data-c=${locate[1]}]`).css('background', "#64dd17").css('opacity', "0.5");
}
function blinkActiveTile(locate) {
	// locates active tile where unit will be and blinks tile
	// seperate function because we will want to keep coloring in active tile while not toggling the blink
	$(`div[data-r=${locate[0]}][data-c=${locate[1]}]`).addClass('blink');
}
// call these functions on load
// from server we will get an array where the active unit on current turn is located

function displayAvailableMoveTiles(locate) {
	// locates and loops through available tiles that active unit can move to, coloring them blue and toggling the CSS blink class
	var data = {};
	data.player = id;
	socket.emit("active unit", function(data){
		socket.emit("get move", data, function(data){
			if(data.success) {
				// $("#arrayName").text(data.type);
				console.log(data.type);
				moveTiles = data.array;
				setTimeout(function(){
					for (var y = 0; y < data.array.length; y++) {
						$(`div.grid-style[data-r=${data.array[y][0]}][data-c=${data.array[y][1]}]`).css('background', "#2196f3").css('opacity', "0.5").addClass('blink');
						$(`li.grid-square[data-r=${data.array[y][0]}][data-c=${data.array[y][1]}]`).bind("click", moveToTile);
					}
				}, 5);
				setTimeout(function(){
					socket.emit("active unit", function(data){
						displayActiveTile([data.r, data.c]);
						blinkActiveTile([data.r, data.c]);
					});
				}, 50);
			}
			writeMessage(data);
		});
	});
}

function hideAvailableMoveTiles(locate) {
	// function that is called by the cancel button to hide and unbind click event available move tiles
				setTimeout(function(){
					for (var y = 0; y < locate.length; y++) {
						$(`div.grid-style[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "transparent").css('opacity', "1").removeClass('blink');
						$(`li.grid-square[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).unbind("click");
					}
				}, 5);
				// set time out function here so code above doesn't hide active unit green square
				setTimeout(function(){
					socket.emit("active unit", function(data){
						displayActiveTile([data.r, data.c]);
						blinkActiveTile([data.r, data.c]);
					});
				}, 50);
			}

function moveToTile() {
	// Each available move tile from the above function will bind to this function
	// clicked tile data will need to be sent to server
	console.log("Request Move Action sent to server");
	console.log([parseInt($(this).attr("data-r")),parseInt($(this).attr("data-c"))]);
	var toR = parseInt($(this).attr("data-r"));
	var toC = parseInt($(this).attr("data-c"));
	var data = {};
	data.player = id;
	socket.emit("active unit", function(data){
		data.toR=toR;
		data.toC=toC;
		console.log(data);
		socket.emit("do move", data, function(data){
			console.log(data);
			if(data.success) {
				socket.emit("active unit", function(data){
					displayActiveTile([data.r, data.c]);
					blinkActiveTile([data.r, data.c]);
				});
			}
			writeMessage(data);
			console.log(data.actions);
			$("#cancel").hide();
			enableActions(data.actions);
		});
	});
}

function moveOptions (e) {
	// function that will be bound to JQuery UI's menu button with the "move" label.
	// use availableMoveSpaces as argument for displayAvailableMoveTiles function and show cancel button as well as bind it to cancelMoveBeforeDoingMove function
	// will need request to server to see what the available move spaces are
	displayAvailableMoveTiles();
	$("#menu").hide();
	$("#menu2").hide();
	$("#status").hide();
	$("#cancel").show().bind("click", cancelMoveBeforeDoingMove);
}

function cancelMoveBeforeDoingMove (e) {
	// use global varaible moveTiles to pass as argument to hide move tiles so we aren't pinging back to server which tiles to hide
	hideAvailableMoveTiles(moveTiles);
	moveTiles = [];
	// hide and unbind cancel button so we don't double up on its functionality later on
	$("#cancel").hide();
	$("#cancel").unbind("click");
}

$(".cancelMove").on("click", function() {
	socket.emit("active unit", function(data){
		console.log([data.r,data.c]);
		socket.emit("do cancel", {r:data.r, c:data.c}, function (response){
			console.log(response);
			if(response.success) {
				$("#menu2").hide();
				// $("#menu").show();
				socket.emit("active unit", function(data){
				displayActiveTile([data.r, data.c]);
				blinkActiveTile([data.r, data.c]);
				});
			}
		});
	});
});

function cancelAttack (e) {
	hideAttackTiles(attackTiles);
	attackTiles = [];
	$("#cancel").hide();
	$("#cancel").unbind("click");
}

function displayAttackTiles(locate) {
	setTimeout(function(){
		for (var y = 0; y < locate.length; y++) {
			$(`div.grid-style[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "#d32f2f").css('opacity', "0.5").addClass('blink');
			$(`li.grid-square[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).bind("click", attackEnemy);
		}
	}, 5);
	// var data = {};
	// data.player = id;
	// socket.emit("active unit", function(data){
	// 	socket.emit("get attack", data, function(data){
	// 		if(data.success) {
	// 			// $("#arrayName").text(data.type);
	// 			console.log(data.type);
	// 			console.log(data);
	// 			// displayArray(data.array);
	// 			// setTimeout(function(){
	// 			// 	for (var y = 0; y < data.array.length; y++) {
	// 			// 		$(`div.grid-style[data-r=${data.array[y][0]}][data-c=${data.array[y][1]}]`).css('background', "#d32f2f").css('opacity', "0.5").addClass('blink');
	// 			// 		$(`li.grid-square[data-r=${data.array[y][0]}][data-c=${data.array[y][1]}]`).bind("click", attackEnemy);
	// 			// 	}
	// 			// }, 5);
	// 			// setTimeout(function(){
	// 			// 	socket.emit("active unit", function(data){
	// 			// 		displayActiveTile([data.r, data.c]);
	// 			//		blinkActiveTile([data.r, data.c]);
	// 			// 	});
	// 			// }, 50);
	// 		}
	// 		writeMessage(data);
	// 	});
	// });
}

function hideAttackTiles(locate) {
	for (var y = 0; y < locate.length; y++) {
		$(`div.grid-style[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "transparent").css('opacity', "1").removeClass('blink');
		$(`li.grid-square[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).unbind("click");
	}
}

function attackEnemy () {
	console.log("Request Attack Action sent to server");
	var dataToR = parseInt($(this).attr("data-r"));
	var dataToC = parseInt($(this).attr("data-c"));
	console.log(currentWeaponId);
	console.log([dataToR, dataToC]);
	socket.emit("active unit", function(data){
		socket.emit("do attack", {r:data.r, c:data.c, toR: dataToR, toC: dataToC, weapon: currentWeaponId}, function(data){
			if (data.success) {
				console.log(data);
				currentWeaponId = null;
				$("#cancel").hide();
				$("#cancel").unbind("click");
				cancelAttack();
			}
			else if (!data.success) {
				console.log("can't use that weapon");
				console.log(data);
				cancelAttack();
			}
		});
	});
}

socket.on("get counter", function(data){
	console.log(data);
	defendOptions(data);
});


function buildWeaponUi () {
	// function is called at beginning of game
	// will also need to be called as soon as turn is over
	socket.emit("active unit", function(data){
		socket.emit("get weapons", {r:data.r, c:data.c}, function(wepObj){
			console.log(wepObj);
			$(".weapons").empty();
			for (var x = 0; x < wepObj.weapons.length; x++) {
				$(".weapons").append(`<li>
																<div class = "weapon" data="${wepObj.weapons[x].id}">
																	<span class="ui-icon ui-icon-radio-on">
																	</span>
																	${wepObj.weapons[x].name}
																</div>
															</li>`);
			}
			$("#menu").menu("refresh");
			$("#menu2").menu("refresh");
		});
	});
}

// clicking on weapon
$(document).on("click", "div.weapon", function(event){
	var wepId = parseInt($(this).attr("data"));
	currentWeaponId = wepId;
	console.log("WEAPON ID: " + wepId);
	$("#menu").hide();
	$("#menu2").hide();
	socket.emit("active unit", function(data){
		socket.emit("get targets", {id: id, r: data.r, c: data.c, weapon: wepId}, function(response){
			displayAttackTiles(response.range);
			attackTiles = response.range;
		});
	});
	// need request from server to see what the availableAttackTiles are;
	// var availableAttackTiles = [];
	// availableAttackTiles =[response];
	// displayAttackTiles(availableAttackTiles);
	$("#cancel").show().bind("click", cancelAttack);
});

$(".standby").on("click", function(){
	socket.emit("active unit", function(data){
		socket.emit("do standby", {r: data.r, c: data.c}, function(response){
			console.log(response);
		})
	})
})

$(document).on("click", "div.statusDiv", function(event){
	console.log("GET DATA PACKET FROM BACK END");
	$("#mechName").empty();
	$("#mechPic").empty();
	$("#healthNum").empty();
	$("#energyNum").empty();
	$("#pilotPic").empty();
	$("#pilotName").empty();
	$("#pilotWill").empty();
	$("#weaponColumns").empty();
	$("#weaponData").empty();
	$("#statusModal").dialog("open");
	$("#mechName").append("Mech Name");
	var health = parseInt((1500 / 2500)*100);
	var energy = parseInt((100 / 216)*100);
	$("#healthNum").append("HP: 1500 / 2500");
	$( function() {
    $( "#healthBar" ).progressbar({
      value: health
    });
  } );
	$("#energyNum").append("EN: 100 / 216");
	$( function() {
    $( "#energyBar" ).progressbar({
      value: energy
    });
  } );
	$("#pilotName").append("Pilot Name");
	$("#pilotWill").append("Will 100");
	$("#weaponColumns").append("Weapon | Ammo | Dmg | Rng | Hit");
	$("#mechPic").append(`<img src=assets/media/wildwurger-l.png style="margin:-15px 0px 3px -3px; height:115px;">`);
	$("#pilotPic").append(`<img src=assets/media/alfimi.png style="margin:-50px 0px 0px -50px; height:150px;">`);
	for (var x = 0; x < 9; x++) {
		if (availableWeapons.weapons[x] == null)
			$("#weaponData").append(`[ empty weapon slot #${x+1} ]<br>`);
		else
			$("#weaponData").append(`${availableWeapons.weapons[x].name} | ${availableWeapons.weapons[x].ammo} | ${availableWeapons.weapons[x].dmg} | ${availableWeapons.weapons[x].range[0]}~${availableWeapons.weapons[x].range[1]} | +${availableWeapons.weapons[x].hit}<br>`);
	}
});

function defendOptions (data) {
	$("#defendModal").dialog("open");
	$("#defendButton").on("click", function(){
		console.log("SEND DATA DEFEND");
		$("#defendModal").dialog("close");
	});
	$("#attackButton").on("click", function(){
		console.log("SEND DATA ATTACK");
		$("#defendModal").dialog("close");
	});
	$("#evadeButton").on("click", function(){
		socket.emit("do counter", {action: "Evade", weapon: null}, function(data){
			console.log(data);
		});
		console.log("SEND DATA EVADE");
		$("#defendModal").dialog("close");
	});
}

// $(document).ready(function(){
// 	defendOptions();
// });

// code for checking and displaying which tile was clicked on
// also the UI for displaying options for clicked grid square should pop up here
// function getActions(r,c) {
// 	var actionLocation = [r,c];
// 	var response = {};
// 	socket.emit("active unit", function(data){
// 		if (activePlayer === myId) { // <- will need to emit for activePlayer and myId as well
// 			if (data.r == r && data.c == c) {
// 				response.actions = ["Move", "Attack"];
// 			}
// 			else if (/*there is a unit here*/ 5 == r && 7 == c) {
// 				response.actions = ["Status"];
// 			}
// 			else {
// 				response.actions = ["End Turn", "Surrender"];
// 			}
// 		}
// 		else if (/*there is a unit here*/ 5 == r && 7 == c) {
// 			response.actions = ["Status"];
// 		}
// 		else {
// 			response.actions = ["End Turn", "Surrender"];
// 		}
// 		console.log(response);
// 		return response;
// 	});
// }

function enableActions(actions) {
		if (actions === 0) { // click on active unit AS active player, brings up main actions menu
			$("#menu").show();
			$("#menu2").hide();
			$("#endSurrender").hide();
			$("#status").hide();
			$("#surrender").hide();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#hitAwayAndHasAttacked").hide();
		}
		if (actions === 1) { // active unit has moved and can now attack, standby or CANCEL his movement
			$("#endSurrender").hide();
			$("#status").hide();
			$("#menu").hide();
			$("#menu2").show();
			$("#surrender").hide();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#hitAwayAndHasAttacked").hide();
		}
		if (actions === 2) { // active unit has hit away and has attacked, but NOT moved
			$("#hitAwayAndHasAttacked").show();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#menu").hide();
			$("#menu2").hide();
			$("#endSurrender").hide();
			$("#status").hide();
			$("#surrender").hide();
		}
		if (actions === 3) { // active unit has hit away and has attack and has moved
			$("#hitAwayAndHasAttackedHasMoved").show();
			$("#hitAwayAndHasAttacked").hide();
			$("#menu").hide();
			$("#menu2").hide();
			$("#endSurrender").hide();
			$("#status").hide();
			$("#surrender").hide();
		}
		if (actions === 4) { // get status if active player or not
			$("#status").show();
			$("#menu").hide();
			$("#menu2").hide();
			$("#endSurrender").hide();
			$("#surrender").hide();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#hitAwayAndHasAttacked").hide();
		}
		if (actions === 5) { // if you click on an empty square AS an active player, can end turn or surrender
			$("#endSurrender").show();
			$("#menu").hide();
			$("#menu2").hide();
			$("#status").hide();
			$("#surrender").hide();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#hitAwayAndHasAttacked").hide();
		}
		if (actions === 6) { // if you click on an empty square NOT as active player, you can only Surrender
			$("#surrender").show();
			$("#status").hide();
			$("#endSurrender").hide();
			$("#menu").hide();
			$("#menu2").hide();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#hitAwayAndHasAttacked").hide();
		}
}

socket.on("room message", function(data){
	console.log(data.msg);
});

socket.on("chat message", function(data){
	console.log(data.msg);
});

$(document).on("click", "li.grid-square", function(event) {
	// if (activePlayer === myId)
	var dataR = $(this).attr("data-r");
	var dataC = $(this).attr("data-c");
	//console.log([dataR,dataC]);
	// var response = getActions(dataR,dataC);

	socket.emit("get actions", {r: dataR,c: dataC}, function(response){
		console.log(response.actions);
		enableActions(response.actions)
	});

	$(`div[data-r=${dataR}][data-c=${dataC}]`).css('background', "#ffb300").css('opacity', "0.5");
	$(document).one("click", "li", function(event) {
		// if next clicked tile is outside the one that was previously clicked on
		if (($(this).attr("data-r")!=dataR) || ($(this).attr("data-c")!=dataC)){
				$(`div[data-r=${dataR}][data-c=${dataC}]`).css('background', "transparent").css('opacity', "1");
			// call this function so it's background doesn't become transparent
			socket.emit("active unit", function(data){
				displayActiveTile([data.r, data.c]);
				blinkActiveTile([data.r, data.c]);
			});
		}
	});
});
