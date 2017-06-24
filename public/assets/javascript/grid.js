var grid = [];

for (var r = 0; r < 30; r++) {
	for (var c = 0; c < 30; c++) {
		$("#grid").append(`<li class="grid-square" data-r = "${r}" data-c = "${c}"></li>`);
	}
}

for (var i = 0; i < 30; i++) {
	grid.push([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0]);
}

activeUnit = [5,5];

availableMoveSpaces = [
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

]
// 'border', "solid 1px #64dd17"

// example grid;

function displayActiveUnit(locate) {
	(function blink() {
		$(`li[data-r=${locate[0]}][data-c=${locate[1]}]`).css('background', "#64dd17").css('opacity', "0.5").fadeOut(500).fadeIn(500, blink);
	})();
	$(`li[data-r=${locate[0]}][data-c=${locate[1]}]`).on("click", function(){
		for (var y = 0; y < availableMoveSpaces.length; y++) {
			(function blink() {
				$(`li[data-r=${availableMoveSpaces[y][0]}][data-c=${availableMoveSpaces[y][1]}]`).css('background', "#2196f3").css('opacity', "0.5").fadeOut(500).fadeIn(500, blink);
				//availableMoveSpaces[y][0][1]
		})();
	}
	})
}
displayActiveUnit(activeUnit);

$(document).on("click", "li", function(event) {
	var dataR = $(this).attr("data-r");
	var dataC = $(this).attr("data-c");
	(function blink() {
		$(`li[data-r=${dataR}][data-c=${dataC}]`).css('background', "#64dd17").css('opacity', "0.5").fadeOut(500).fadeIn(500, blink);
	})();
	var R = parseInt(dataR) - 1;
	$(`li[data-r=${R}][data-c=${dataC}]`).html("^");
	console.log("r: " + dataR);
	console.log("c: " + dataC);
	console.log("====");
	if (grid[dataR][dataC] == 1) {
		console.log("Actions Interface");
		(function blink() {
		$(`li[data-r=${dataR-1}][data-c=${dataC}]`).css('background', "#2196f3").css('opacity', "0.5").fadeOut(500).fadeIn(500, blink);
		$(`li[data-r=${dataR}][data-c=${dataC-1}]`).css('background', "#2196f3").css('opacity', "0.5").fadeOut(500).fadeIn(500, blink);
		$(`li[data-r=${dataR-1}][data-c=${dataC-1}]`).css('background', "#2196f3").css('opacity', "0.5").fadeOut(500).fadeIn(500, blink);
	})();
	}
});

$(document).on("mouseenter", "grid-square", function(event) {
	var dataR = $(this).attr("data-r");
	var dataC = $(this).attr("data-c");
	$(`li[data-r=${dataR}][data-c=${dataC}]`).css('border', "solid 1px #64dd17");
});