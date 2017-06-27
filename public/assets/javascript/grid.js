var grid = [];
var gridCoordinates = [];

$("#menu").hide();
$("#cancel").hide();

// code that makes 900 grid-tiles with each row and column's data index stored
for (var r = 0; r < 30; r++) {
	for (var c = 0; c < 30; c++) {
		$("#grid").append(`<li class="blink" class="grid-square" data-r = "${r}" data-c = "${c}"></li>`);
		gridCoordinates.push([r,c]);
	}
}

$("li").toggleClass('blink');

for (var i = 0; i < 30; i++) {
	grid.push([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0]);
}

var activeUnit = [5,5];

var availableMoveSpaces = [
						// [4,4],
						// [4,3],
						// [4,2],
						// [4,1],
						// [3,2],
						// [3,3],
						// [3,4],
						// [2,3],
						// [2,4],
						// [1,4],
						// [4,6],
						// [4,7],
						// [4,8],
						// [4,9],
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
						[10,5]

];

function displayActiveTile(locate) {
	// locates active tile where unit will be and colors in tile with green
	$(`li[data-r=${locate[0]}][data-c=${locate[1]}]`).css('background', "#64dd17").css('opacity', "0.5");
}
function blinkActiveTile(locate) {
	// locates active tile where unit will be and blinks tile, seperate function because we will want to keep coloring in active tile while not toggling the blink
	$(`li[data-r=${locate[0]}][data-c=${locate[1]}]`).toggleClass('blink');
}
// call these functions on load
displayActiveTile(activeUnit);
blinkActiveTile(activeUnit);
activeUnitFunctionality(activeUnit);

function findActivePlayer() {
	// if statement here that checks socket.io data to see which players turn it is
	// also for testing purposes, binding menu buttons here as well
	$("#move").bind("click", moveUnit);
}
findActivePlayer();

function displayAvailableMoveTiles(locate) {
	// locates and loops through available tiles that active unit can move to, coloring them blue and toggling the CSS blink class
	for (var y = 0; y < availableMoveSpaces.length; y++) {
		$(`li[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "#2196f3").css('opacity', "0.5").toggleClass('blink').bind("click", moveTiles);
	}
}

function hideAvailableMoveTiles(locate) {
	// function that is called by the cancel button to hide and unbind click event available move tiles
	for (var y = 0; y < availableMoveSpaces.length; y++) {
		$(`li[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "transparent").css('opacity', "1").toggleClass('blink').unbind("click");
	}
}

function moveTiles() {
	// Each available move tile from the above function will bind to this function
	// clicked tile data will need to be sent to server
	console.log("Move Action sent to server");
	console.log([parseInt($(this).attr("data-r")),parseInt($(this).attr("data-c"))]);
}

function moveUnit (e) {
	// function that will be bound to JQuery UI's menu button with the "move" label.
	displayAvailableMoveTiles(availableMoveSpaces);
	$("#cancel").show().bind("click", cancelMove);
}

function cancelMove (e) {
	hideAvailableMoveTiles(availableMoveSpaces);
	$("#cancel").hide();
}

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
// displayAvailableMoveTiles(availableMoveSpaces);

// code to display active unit
// from server we will get an array where the active unit on current turn is located
// in our example case, we have set active unit at [5,5] which is what we set as the argument
// for the displayActiveUnit function
// when clicking on this active unit grid tile, UI should pop up that shows we can either
// move or attack with unit. Availabe move spaces will also be sent in from the server as an array of arrays.
// in our example case we set those in availableMoveSpaces variable
function activeUnitFunctionalityTest(locate) {

	// $(`li[data-r=${locate[0]}][data-c=${locate[1]}]`).css('background', "#64dd17").css('opacity', "0.5");
	// below code will display tiles where player is able to move unit
	$(`li[data-r=${locate[0]}][data-c=${locate[1]}]`).on("click", function(){
		$("#menu").show();
		var dataR = $(this).attr("data-r");
		var dataC = $(this).attr("data-c");
		$(document).on("click", "li", function(event) {
			// if next clicked tile is outside the one that was previously clicked on
			if (($(this).attr("data-r")!=dataR) || ($(this).attr("data-c")!=dataC)){
				//$(`li[data-r=${dataR}][data-c=${dataC}]`).css('background', "transparent");
				$("#menu").hide();
			}
		})
		// moving tiles
		// for (var y = 0; y < availableMoveSpaces.length; y++) {
		// 	$(`li[data-r=${availableMoveSpaces[y][0]}][data-c=${availableMoveSpaces[y][1]}]`).bind("click", moveTiles);
		// }
		// function moveTiles (e) {
		// 	if (moveUnit) {
		// 	console.log("Move Action sent to server");
		// 	console.log([parseInt($(this).attr("data-r")),parseInt($(this).attr("data-c"))]);
		// }
		// }
		$("#move").bind("click", moveUnit);
			//$(document).on("click", "li", function(event) {
			function moveUnit (e) {
				displayAvailableMoveTiles(availableMoveSpaces);

				// var moveUnit = true;
				$("#cancel").show();
				//
				$("#cancel").on("click", function() {
					for (var z = 0; z < availableMoveSpaces.length; z++) {
						$(`li[data-r=${availableMoveSpaces[z][0]}][data-c=${availableMoveSpaces[z][1]}]`).css('background', "transparent").css('opacity', "1");
					}
				// 	blinkMoveTiles();
				// 	$("#cancel").hide();
				// 	moveUnit = false;
				// })

				// for (var y = 0; y < availableMoveSpaces.length; y++) {
				// 	$(`li[data-r=${availableMoveSpaces[y][0]}][data-c=${availableMoveSpaces[y][1]}]`).bind("click", moveTiles);
				// }
				var xyz = 0;
				// for (var f = 0; f < gridCoordinates.length; f++) {
				// 	//var arrayCheck = [gridCoordinates[y][0],gridCoordinates[y][1]];
				// 	//console.log(availableMoveSpaces[y]);
				// 		if ((availableMoveSpaces[xyz][0] === gridCoordinates[f][0]) && (availableMoveSpaces[xyz][1] === gridCoordinates[f][1])) {
				// 		//console.log([gridCoordinates[y][0],gridCoordinates[y][1]]);
				// 		//console.log(gridCoordinates[y]);
				// 		console.log([availableMoveSpaces[xyz][0],availableMoveSpaces[xyz][1]])
				// 			console.log("hi");
				// 			xyz++;
				// 		}
				// 		else {
				// 			$(`li[data-r=${gridCoordinates[f][0]}][data-c=${gridCoordinates[f][1]}]`).bind("click", outsideMoveTiles);
				// 		}
				// 	}
					//}
					// else {
					// 	$(`li[data-r=${grid[y][0]}][data-c=${grid[y][1]}]`).bind("click", outsideMoveTiles);
					// 	//console.log($(`li[data-r=${grid[y][0]}][data-c=${grid[y][1]}]`));
					// }
				//}

				// function moveTiles (e) {
				// 	if (moveUnit) {
				// 	console.log("Move Action sent to server");
				// 	console.log([parseInt($(this).attr("data-r")),parseInt($(this).attr("data-c"))]);
				// }
				// }

				function outsideMoveTiles (e) {
					// for (var y = 0; y < availableMoveSpaces.length; y++) {
					// 	$(`li[data-r=${availableMoveSpaces[y][0]}][data-c=${availableMoveSpaces[y][1]}]`).css('background', "transparent").css('opacity', "1").toggleClass('blink');
					// }
					console.log("Can't move there! outside!");
					// $("li").css('background', "transparent");
					// setTimeout(function(){
					// 	displayActiveUnit(activeUnit);
					// }, 500);
					// var moveNotAllowed;
					// for (var x = 0; x < availableMoveSpaces.length; x++) {
					// 	if (availableMoveSpaces.includes([parseInt($(this).attr("data-r")),parseInt($(this).attr("data-c"))])) {
					// 		console.log("hi");
					// 	}
					// 	else {
					// 		moveNotAllowed.push(availableMoveSpaces);
					// 	}
					// }
				}
				//while (moveClicked == true) {
				function blinkMoveTiles () {
					for (var y = 0; y < availableMoveSpaces.length; y++) {
						$(`li[data-r=${availableMoveSpaces[y][0]}][data-c=${availableMoveSpaces[y][1]}]`).toggleClass('blink');
					}
				}
				function colorMoveTiles() {
					for (var y = 0; y < availableMoveSpaces.length; y++) {
						$(`li[data-r=${availableMoveSpaces[y][0]}][data-c=${availableMoveSpaces[y][1]}]`).css('background', "#2196f3").css('opacity', "0.5");
					}
				}
				// colorMoveTiles();
				// blinkMoveTiles();
			//}
				// function bindThis() {
				// 	if (($(this).attr("data-r")!=dataR) || ($(this).attr("data-c")!=dataC)){
				// 		console.log("hi");
				// 	}
				// }
				// $(document).on("click", "li", function(event) {
				// 	return;
				// 	// var moveSpaceCheckArray = [parseInt($(this).attr("data-r")),parseInt($(this).attr("data-c"))];
				// 	// if (availableMoveSpaces.includes(moveSpaceCheckArray)){
				// 	// 	console.log("hi");
				// 	// 	console.log(moveSpaceCheckArray);
				// 	// }
				// 	})
			})
//})
	};
});
}

//activeUnitFunctionality(activeUnit);

// code for seeing which tile was clicked on
// also the UI for displaying options for clicked grid square should pop up here
$(document).on("click", "li", function(event) {
	var dataR = $(this).attr("data-r");
	var dataC = $(this).attr("data-c");
	$(`li[data-r=${dataR}][data-c=${dataC}]`).css('background', "#ffb300").css('opacity', "0.5");
	$(document).on("click", "li", function(event) {
		// if next clicked tile is outside the one that was previously clicked on
		if (($(this).attr("data-r")!=dataR) || ($(this).attr("data-c")!=dataC)){
			$(`li[data-r=${dataR}][data-c=${dataC}]`).css('background', "transparent").css('opacity', "1");
			displayActiveTile(activeUnit);
		}
	});
});

// test code below for locating active unit

// $(document).on("click", "li", function(event) {
// 	var dataR = $(this).attr("data-r");
// 	var dataC = $(this).attr("data-c");
// 	(function blink() {
// 		$(`li[data-r=${dataR}][data-c=${dataC}]`).css('background', "#64dd17").css('opacity', "0.5").fadeOut(500).fadeIn(500, blink);
// 	})();
// 	var R = parseInt(dataR) - 1;
// 	$(`li[data-r=${R}][data-c=${dataC}]`).html("^");
// 	console.log("r: " + dataR);
// 	console.log("c: " + dataC);
// 	console.log("====");
// 	if (grid[dataR][dataC] == 1) {
// 		// i.e. any row and column 27 (because we pushed a 1 there when making grid arrays)
// 		console.log("Actions Interface");
// 		(function blink() {
// 		$(`li[data-r=${dataR-1}][data-c=${dataC}]`).css('background', "#2196f3").css('opacity', "0.5").fadeOut(500).fadeIn(500, blink);
// 		$(`li[data-r=${dataR}][data-c=${dataC-1}]`).css('background', "#2196f3").css('opacity', "0.5").fadeOut(500).fadeIn(500, blink);
// 		$(`li[data-r=${dataR-1}][data-c=${dataC-1}]`).css('background', "#2196f3").css('opacity', "0.5").fadeOut(500).fadeIn(500, blink);
// 	})();
// 	}
// });

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
