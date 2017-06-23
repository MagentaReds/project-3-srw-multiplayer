for (var r = 0; r < 30; r++) {
	for (var c = 0; c < 30; c++) {
		$("#grid").append(`<li class="ui-state-default" data-r = "${r}" data-c = "${c}"></li>`);
	}
}

$(document).on("mousedown", "li", function(event) {
   var dataR = $(this).attr("data-r");
   var dataC = $(this).attr("data-c");
   var R = parseInt(dataR) - 1;
   $(`li[data-r=${R}][data-c=${dataC}]`).html("^");
   console.log("r: " + dataR);
   console.log("c: " + dataC);
   console.log("====");
});