$(document).ready(function() {
    $("#unlock").click(function() {
        $("input").removeAttr("readonly");
        $("#unlock").after('<button id="save" type="button" class="btn btn-success" onclick=>Save</button>');
    });

    $("#save").click(function() {
        $("#example-email-input").attr('readonly', 'readonly');
    })

    $(document.body).on('click', 'button', function() {
        if (this.id == 'save') {
            $("input").attr('readonly', true);
            $(this).hide();
        }
    });

});