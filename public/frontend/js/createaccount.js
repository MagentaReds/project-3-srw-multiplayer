$(document).ready(function() {
	console.log("IN CREATE ACCOUNT JS");
	$("form").on("submit", function(event) {
		event.preventDefault();
		var data = {};
		data.username = $("#username").val().trim();
		data.email = $("#email").val().trim();
		data.password = $("#password").val().trim();
		$.post('/createaccount', data, function(res) {
			console.log(res);
			if (res.success) {
				console.log("successful");
				window.location.href = '/login';
			} else {
				console.log("ERROR IN CREATEACCOUNT.JS");
			}
		});
	})
});