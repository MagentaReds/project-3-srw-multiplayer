for (var y = 29; y >= 0; y--) {
	for (var x = 0; x < 30; x++) {
		$("#selectable").append(`<li class="ui-state-default" data-x = "${x}" data-y = "${y}"></li>`);
	}
}