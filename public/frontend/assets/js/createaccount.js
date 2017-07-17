$(document).ready(function() {
	$("form").on("submit", function(event) {
		event.preventDefault();
		var data = {};
		data.username = $("#username").val().trim();
		data.email = $("#email").val().trim().toLowerCase();
		data.password = $("#password").val().trim();
		var pass2 = $("#password2").val().trim();
		if(data.password !== pass2){
			console.log(data.password, pass2)
			fillAndShowModal("Passwords do not match.");
		} else if(!data.username) {
			fillAndShowModal("Username cannot be empty");
		} else if(!data.email) {
			fillAndShowModal("Email cannot be empty");
		} else if(!data.password) {
			fillAndShowModal("Password cannot be empty");
		}
		else {
			$.post('/createaccount', data, function(res) {
				console.log(res);
				if (res.success) {
					console.log("successful");
					fillAndShowModal("Account created successfully. Close modal to go to login page.");
					$("#resultModal").on("hide.bs.modal", function() {
						window.location.href = '/login';
					});
					
				} else {
					console.log("ERROR IN CREATEACCOUNT.JS");
					fillAndShowModal(res.msg);
				}
			});
		}
	});

	function fillAndShowModal(msg) {
		var modal = $("#resultModal");
		modal.find(".message").text(msg);
		modal.modal("show");
	}
});