// code that makes 900 grid-tiles with each row and column's data index stored
for (var r = 0; r < 30; r++) {
	for (var c = 0; c < 30; c++) {
		$("#grid").append(`<li class="blink" class="grid-square" data-r = "${r}" data-c = "${c}"></li>`);
	}
}
// hide our JQuery UI
$("#menu").hide();
$("#cancel").hide();
// toggleclass blink for all li, otherwise when we wont to show active unit tile, all tiles will start blinking
$("li").toggleClass('blink');
// toggles blink for these menu buttons otherwise, they will keep blinking
$("#moveLi").toggleClass('blink');
$("#attackLi").toggleClass('blink');
$("#spiritLi").toggleClass('blink');
$("#cancelMoveLi").toggleClass('blink');

// example location of where an active unit could be
var activeUnit = [5,5];

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

function displayActiveTile(locate) {
	// locates active tile where unit will be and colors in tile with green
	$(`li[data-r=${locate[0]}][data-c=${locate[1]}]`).css('background', "#64dd17").css('opacity', "0.5");
}
function blinkActiveTile(locate) {
	// locates active tile where unit will be and blinks tile
	// seperate function because we will want to keep coloring in active tile while not toggling the blink
	$(`li[data-r=${locate[0]}][data-c=${locate[1]}]`).toggleClass('blink');
}
// call these functions on load
// from server we will get an array where the active unit on current turn is located
// in our example case, we have set active unit at [5,5] which is what we set as the argument
// for the displayActiveUnit function
displayActiveTile(activeUnit);
blinkActiveTile(activeUnit);
activeUnitFunctionality(activeUnit);
findActivePlayer();

function findActivePlayer() {
	// if statement here that checks socket.io data to see which players turn it is
	// also for testing purposes, binding menu buttons here as well
	$("#move").bind("click", moveOptions);
	$("#attack").bind("click", attackOptions);
}

function displayAvailableMoveTiles(locate) {
	// locates and loops through available tiles that active unit can move to, coloring them blue and toggling the CSS blink class
	setTimeout(function(){
		for (var y = 0; y < locate.length; y++) {
			$(`li[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "#2196f3").css('opacity', "0.5").toggleClass('blink').bind("click", moveToTile);
		}
	}, 5);
}

function hideAvailableMoveTiles(locate) {
	// function that is called by the cancel button to hide and unbind click event available move tiles
	//setTimeout(function(){
		for (var y = 0; y < locate.length; y++) {
			$(`li[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "transparent").css('opacity', "1").toggleClass('blink').unbind("click");
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
			$(`li[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "#d32f2f").css('opacity', "0.5").toggleClass('blink').bind("click", attackEnemy);
		}
	}, 5);
}

function hideAttackTiles(locate) {
	for (var y = 0; y < locate.length; y++) {
		$(`li[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "transparent").css('opacity', "1").toggleClass('blink').unbind("click");
	}
}

function attackOptions() {
	// need request from server to see what options are
	displayAttackTiles(availableAttackTiles);
	$("#cancel").show().bind("click", cancelAttack);
}

function attackEnemy () {
	console.log("Request Attack Action sent to server");
	console.log([parseInt($(this).attr("data-r")),parseInt($(this).attr("data-c"))]);
}

// function that ensures when player clicks on the active unit grid tile, the UI will pop up that shows we can either
// move, attack or use spirit command for the active unit
// function is called when this file is loaded
function activeUnitFunctionality(locate) {
	$(`li[data-r=${locate[0]}][data-c=${locate[1]}]`).on("click", function(){
		$("#menu").show();
		var dataR = $(this).attr("data-r");
		var dataC = $(this).attr("data-c");
		$(document).on("click", "li", function(event) {
			// if next tile clicked is outside the one that was previously clicked on
			if (($(this).attr("data-r")!=dataR) || ($(this).attr("data-c")!=dataC)){
				$("#menu").hide();
			}
		});
	});
}

// code for checking and displaying which tile was clicked on
// also the UI for displaying options for clicked grid square should pop up here
$(document).on("click", "li", function(event) {
	var dataR = $(this).attr("data-r");
	var dataC = $(this).attr("data-c");
	//console.log([dataR,dataC]);
	$(`li[data-r=${dataR}][data-c=${dataC}]`).css('background', "#ffb300").css('opacity', "0.5");
	$(document).on("click", "li", function(event) {
		// if next clicked tile is outside the one that was previously clicked on
		if (($(this).attr("data-r")!=dataR) || ($(this).attr("data-c")!=dataC)){
			// test code to fix bug where moving tiles color dissappear because of background transparent code
			// if (moving){
			// 	console.log("hi");
			// 	$(`li[data-r=${dataR}][data-c=${dataC}]`).css('background', "transparent").css('opacity', "1");
			// 	for (var y = 0; y < availableMoveSpaces.length; y++) {
			// 		$(`li[data-r=${availableMoveSpaces[y][0]}][data-c=${availableMoveSpaces[y][1]}]`).css('background', "#2196f3").css('opacity', "0.5");
			// 	}
			// }
			//else {
		// 	if (moving){
		// 		for (var x = 0; x < availableMoveSpaces.length; x++) {
		// 			if ((availableMoveSpaces[x][0] === dataR) && (availableMoveSpaces[x][1] === dataC)){
		// 				console.log("hi");
		// 				$(`li[data-r=${dataR}][data-c=${dataC}]`).css('background', "#2196f3").css('opacity', "0.5");
		// 			}
		// 		else {
		// 			$(`li[data-r=${dataR}][data-c=${dataC}]`).css('background', "transparent").css('opacity', "1");
		// 		}
		// 	}
		// }
		// 	else {
				$(`li[data-r=${dataR}][data-c=${dataC}]`).css('background', "transparent").css('opacity', "1");
			//}
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
