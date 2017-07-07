$(document).ready(function() {
    var counter = 0;
    $.get("/user", function(data, status) {
        $("#email").val(data.user.email);
        $("#username").val(data.user.username);
        var teamNum = data.user.team;
        $("div.col-10 select").val(teamNum);
    });
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
        data.email = $("#email").val().trim();
        data.team = parseInt($("#team option:selected").val());
        $.post('/updateaccount', data, function(res) {
            // $.get("/user", function(data, status) {
            //     $("#email").val(data.email);
            //     $("#username").val(data.username);
            //     var teamNum = "val" + data.team;
            //     $("div.col-10 select").val(teamNum);
            // });
        });

    });

});