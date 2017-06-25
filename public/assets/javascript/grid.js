var grid = [];

for (var r = 0; r < 30; r++) {
	for (var c = 0; c < 30; c++) {
		$("#grid").append(`<li class="grid-square" data-r = "${r}" data-c = "${c}"></li>`);
	}
}

for (var i = 0; i < 30; i++) {
	grid.push([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0]);
}

var activeUnit = [5,5];

var availableMoveSpaces = [
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

// code to display active unit
// from server we will get an array where the active unit on current turn is located
// in our example case, we have set active unit at [5,5] which is what we set as the argument
// for the displayActiveUnit function
// when clicking on this active unit grid tile, UI should pop up that shows we can either
// move or attack with unit. Availabe move spaces will also be sent in from the server as an array of arrays.
// in our example case we set those in availableMoveSpaces variable
function displayActiveUnit(locate) {
	(function blink() {
		$(`li[data-r=${locate[0]}][data-c=${locate[1]}]`).css('background', "#64dd17").css('opacity', "0.5").fadeOut(500).fadeIn(500, blink);
	})();
	// below code will display tiles where player is able to move unit
	$(`li[data-r=${locate[0]}][data-c=${locate[1]}]`).on("click", function(){
		for (var y = 0; y < availableMoveSpaces.length; y++) {
			(function blink() {
				$(`li[data-r=${availableMoveSpaces[y][0]}][data-c=${availableMoveSpaces[y][1]}]`).css('background', "#2196f3");//.css('opacity', "0.5").fadeOut(500).fadeIn(500, blink);
				//availableMoveSpaces[y][0][1]
		})();
	}
	});
};

displayActiveUnit(activeUnit);

// code for seeing which tile was clicked on
// also the UI for displaying options for clicked grid square should pop up here
$(document).on("click", "li", function(event) {
	var dataR = $(this).attr("data-r");
	var dataC = $(this).attr("data-c");
	$(`li[data-r=${dataR}][data-c=${dataC}]`).css('background', "#ffb300").css('opacity', "0.5");
	$(document).on("click", "li", function(event) {
		if (($(this).attr("data-r")!=dataR) || ($(this).attr("data-c")!=dataC)){
			$(`li[data-r=${dataR}][data-c=${dataC}]`).css('background', "transparent");
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