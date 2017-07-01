// code that makes 900 grid-tiles with each row and column's data index stored
for (var r = 0; r < 30; r++) {
	for (var c = 0; c < 30; c++) {
		$("#grid").append(`<li class="grid-square" data-r = "${r}" data-c = "${c}"><div class="blink grid-style" data-r = "${r}" data-c = "${c}"></div></li>`);
	}
}
// .grid-square will handle click events and icons for units will be appended to here
// .grid-style will handle all css coloring and blinking aspects of grid

// hide our JQuery UI
$("#menu").hide();
$("#cancel").hide();
$("#status").hide();
// toggleclass blink for all li.grid-square, otherwise when we wont to show active unit tile, all tiles will start blinking
//$("li.grid-square").toggleClass('blink');
$(".grid-style").toggleClass('blink');

// example location of where an active unit could be
var activeUnit = [];
activeUnit = [5,5];

var activePlayer = 3;
var myId = 3;

var availableWeapons = {
  weapons: [
    {
      id: 1,
      name: "Attack 1",
      range: [1,1],
      dmg: 2000,
      canUse: true
    },
    {
      id: 4,
      name: "Attack Fulls",
      range: [3,7],
      dmg: 1000,
      canUse: false
    }
  ]
}

// console.log(availableWeapons.weapons[1].id);

var availableAttackTiles = [
	[5,4],
	[5,6],
	[4,5],
	[6,5]
];

// and their move space spaces which would be sent in from server
var availableMoveSpaces = [
	[1,6],
	[2,6],
	[2,7],
	[3,6],
	[3,7],
	[3,8],
	[4,4],
	[4,3],
	[4,2],
	[4,1],
	[3,2],
	[3,3],
	[3,4],
	[2,3],
	[2,4],
	[1,4],
	[4,6],
	[4,7],
	[4,8],
	[4,9],
	[5,6],
	[5,7],
	[5,8],
	[5,9],
	[5,10],
	[5,4],
	[5,3],
	[5,2],
	[5,1],
	[5,0],
	[0,5],
	[1,5],
	[2,5],
	[3,5],
	[4,5],
	[6,5],
	[7,5],
	[8,5],
	[9,5],
	[10,5],
	[6,1],
	[6,2],
	[6,3],
	[6,4],
	[6,6],
	[6,7],
	[6,8],
	[6,9],
	[7,2],
	[7,3],
	[7,4],
	[7,6],
	[7,7],
	[7,8],
	[8,3],
	[8,4],
	[8,6],
	[8,7],
	[9,4],
	[9,6]
];

activeUnitFunctionality(activeUnit);


$(`li[data-r=${5}][data-c=${5}]`).append(`<img src=assets/media/icon1.png style="margin:-15px 0px 3px -3px; height:60px;">`);
$(`li[data-r=${5}][data-c=${7}]`).append(`<img src=assets/media/icon1.png style="margin:-15px 0px 3px -3px; height:60px;">`);

function displayActiveTile(locate) {
	// locates active tile where unit will be and colors in tile with green
	$(`div[data-r=${locate[0]}][data-c=${locate[1]}]`).css('background', "#64dd17").css('opacity', "0.5");
}
function blinkActiveTile(locate) {
	// locates active tile where unit will be and blinks tile
	// seperate function because we will want to keep coloring in active tile while not toggling the blink
	$(`div[data-r=${locate[0]}][data-c=${locate[1]}]`).toggleClass('blink');
}
// call these functions on load
// from server we will get an array where the active unit on current turn is located
// in our example case, we have set active unit at [5,5] which is what we set as the argument
// for the displayActiveUnit function
displayActiveTile(activeUnit);
blinkActiveTile(activeUnit);
//console.log($(`li[data-id=${availableWeapons.weapons[0].id}]`).attr("data-id"));

function displayAvailableMoveTiles(locate) {
	// locates and loops through available tiles that active unit can move to, coloring them blue and toggling the CSS blink class
	setTimeout(function(){
		for (var y = 0; y < locate.length; y++) {
			$(`div.grid-style[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "#2196f3").css('opacity', "0.5").toggleClass('blink');
			$(`li.grid-square[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).bind("click", moveToTile);
		}
	}, 5);
}

function hideAvailableMoveTiles(locate) {
	// function that is called by the cancel button to hide and unbind click event available move tiles
	//setTimeout(function(){
		for (var y = 0; y < locate.length; y++) {
			$(`div.grid-style[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "transparent").css('opacity', "1").toggleClass('blink');
			$(`li.grid-square[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).unbind("click");
		}
	//}, 5);
}

function moveToTile() {
	// Each available move tile from the above function will bind to this function
	// clicked tile data will need to be sent to server
	console.log("Request Move Action sent to server");
	console.log([parseInt($(this).attr("data-r")),parseInt($(this).attr("data-c"))]);
}

function moveOptions (e) {
	// function that will be bound to JQuery UI's menu button with the "move" label.
	// use availableMoveSpaces as argument for displayAvailableMoveTiles function and show cancel button as well as bind it to cancelMove function
	// will need request to server to see what the available move spaces are
	displayAvailableMoveTiles(availableMoveSpaces);
	$("#menu").hide();
	$("#status").hide();
	$("#cancel").show().bind("click", cancelMove);
}

function cancelMove (e) {
	hideAvailableMoveTiles(availableMoveSpaces);
	// hide and unbind cancel button so we don't double up on its functionality later on
	$("#cancel").hide();
	$("#cancel").unbind("click");
}

function cancelAttack (e) {
	hideAttackTiles(availableAttackTiles);
	$("#cancel").hide();
	$("#cancel").unbind("click");
}

function displayAttackTiles(locate) {
	setTimeout(function(){
		for (var y = 0; y < locate.length; y++) {
			$(`div.grid-style[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "#d32f2f").css('opacity', "0.5").toggleClass('blink');
			$(`li.grid-square[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).bind("click", attackEnemy);
		}
	}, 5);
}

function hideAttackTiles(locate) {
	for (var y = 0; y < locate.length; y++) {
		$(`div.grid-style[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "transparent").css('opacity', "1").toggleClass('blink');
		$(`li.grid-square[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).unbind("click");
	}
}

function attackEnemy () {
	console.log("Request Attack Action sent to server");
	console.log([parseInt($(this).attr("data-r")),parseInt($(this).attr("data-c"))]);
}

// function that ensures when player clicks on the active unit grid tile, the UI will pop up that shows we can either
// move, attack or use spirit command for the active unit
// function is called when this file is loaded
function activeUnitFunctionality(locate) {
		if (activePlayer === myId) {
			// will need to unbind this when turn is over
			$("#move").bind("click", moveOptions);
			function buildWeaponUi () {
				$("#weapons").empty();
				for (var x = 0; x < availableWeapons.weapons.length; x++) {
					$("#weapons").append(`<li><div class = weapon data="weapon_${availableWeapons.weapons[x].id}">${availableWeapons.weapons[x].name}<div></li>`);
				}
			}
			buildWeaponUi();
	}
}

// clicking on weapon
$(document).on("click", "div.weapon", function(event){
	var data = $(this).attr("data");
	console.log(data);
	$("#menu").hide();
	// need request from server to see what the availableAttackTiles are;
	// var availableAttackTiles = [];
	// availableAttackTiles =[response];
	displayAttackTiles(availableAttackTiles);
	$("#cancel").show().bind("click", cancelAttack);
});

// code for checking and displaying which tile was clicked on
// also the UI for displaying options for clicked grid square should pop up here
function getActions(r,c) {
	var actionLocation = [r,c];
	var response = {};
	if (activePlayer === myId) {
		if (activeUnit[0] == r && activeUnit[1] == c) {
			response.actions = ["Move", "Attack"];
		}
		else {
			response.actions = ["Status"];
		}
	}
	else {
		response.actions = ["Status"];
	}
	console.log(response);
	return response;
}
getActions(5,6);

function enableActions(actions) {
	// var menu = $("#menu");
	// menu.show();
	//for (var i = 0; i < actions.length; i++) {
		// will need to append all menu actions
		//console.log(actions[i]);
		if (actions[0] === "Status") {
			$("#status").show();
			$("#menu").hide();
		}
		if (actions[0] === "Move") {
			$("#menu").show();
			$("#status").hide();
			console.log("hi");
		}
	//}
}


$(document).on("click", "li.grid-square", function(event) {
	// if (activePlayer === myId)
	var dataR = $(this).attr("data-r");
	var dataC = $(this).attr("data-c");
	//console.log([dataR,dataC]);
	var response = getActions(dataR,dataC);

	//socket.emit("getActions", {r: dataR,c: dataC} function(response){fillActions(response.actions)}
	enableActions(response.actions);

	$(`div[data-r=${dataR}][data-c=${dataC}]`).css('background', "#ffb300").css('opacity', "0.5");
	$(document).one("click", "li", function(event) {
		// if next clicked tile is outside the one that was previously clicked on
		if (($(this).attr("data-r")!=dataR) || ($(this).attr("data-c")!=dataC)){
				$(`div[data-r=${dataR}][data-c=${dataC}]`).css('background', "transparent").css('opacity', "1");
			// call this function so it's background doesn't become transparent
			displayActiveTile(activeUnit);
		}
	});
});

// test code to show which grid-square your mouse has rolled on...
// it makes things a little slow, and theres always 1 following, this might not work

// $(document).on("mouseenter", "li", function(event) {
// 	var dataR = $(this).attr("data-r");
// 	var dataC = $(this).attr("data-c");
// 	$(`li[data-r=${dataR}][data-c=${dataC}]`).css('border', "solid 1px #000000");
// 	$(document).on("mouseleave", "li", function(event) {
// 		if (($(this).attr("data-r")!=dataR) || ($(this).attr("data-c")!=dataC)) {
// 			$(`li[data-r=${dataR}][data-c=${dataC}]`).css('border', "dashed 1px grey");
// 		}
// 	})
// });
