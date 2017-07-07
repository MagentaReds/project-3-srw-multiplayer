$(document).ready(function() {
    var counter = 0;
    $("#unlock").click(function() {
        var readonly = $('input').attr('readonly');
        if (typeof readonly !== undefined && readonly !== false && counter == 0) {
            $("input").removeAttr("readonly");
            $("select").removeAttr("readonly");
            $("#unlock").after('<button id="save" type="button" class="btn btn-success" onclick=>Save</button>');
            counter++;
            console.log(counter);
        }
    });

    $("#save").click(function() {
        $("#example-email-input").attr('readonly', 'readonly');
    })

    $(document.body).on('click', 'button', function() {
        if (this.id == 'save') {
            $("input").attr('readonly', true);
            $("select").attr("readonly", true);
            $(this).hide();
            counter--;
        }

    });

    $("#example-password-input").on("change keyup paste", function(){
    });

    $.get("/user", function(data, status) {
        $("#email").val(data.email);
        $("#username").val(data.username);
        var teamNum = "val" + data.team;
        $("div.col-10 select").val(teamNum);
    })

});