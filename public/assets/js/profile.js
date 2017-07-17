$(document).ready(function() {
    var counter = 0;
    $("#save").hide();
    $("#unlock").click(function() {
        var readonly = $('input').attr('readonly');
        if (typeof readonly !== undefined && readonly !== false && counter == 0) {
            $("#save").show();
            $("input").removeAttr("readonly");
            $("select").removeAttr("readonly");
            // $("#unlock").after('<button id="save" type="submit" class="btn btn-success">Save</button>');
            counter++;
        }
    });

    // $("#save").click(function() {
    //     $("#example-email-input").attr('readonly', 'readonly');
    // });

    $(document.body).on('click', 'button', function() {
        if (this.id == 'save') {
            $("input").attr('readonly', true);
            $("select").attr("readonly", true);
            $(this).hide();
            counter--;
        }

    });

    $("form").on("submit", function(event) {
        event.preventDefault();
        var data = {};
        data.username = $("#username").val().trim();
        data.email = $("#email").val().trim().toLowerCase();
        data.team = parseInt($("#team option:selected").val());
        data.oldPassword = $("#oldPassword").val().trim()
        data.password = $("#password").val().trim()
        var pass2 = $("#password2").val().trim()
        if(!data.oldPassword){
            fillAndShowModal("Current password required for account changes.");
        }else if(data.oldPassword && data.password!==pass2) {
            fillAndShowModal("New passwords do not match");
        } else if(data.username==="") {
            fillAndShowModal("Username cannot be blank");
        } else if(data.email==="") {
            fillAndShowModal("Email cannot be blank");
        } else {
            $.post('/updateaccount', data, function(res) {
                if(res.success) {
                    fillAndShowModal("Changes made to account");
                    $("#oldPassword").val("");
                    $("#password").val("");
                    $("#password2").val("");
                }
                else
                    fillAndShowModal(res.msg);
            });
        }

    });

    function fillAndShowModal(msg) {
		var modal = $("#resultModal");
		modal.find(".message").text(msg);
		modal.modal("show");
	}

});