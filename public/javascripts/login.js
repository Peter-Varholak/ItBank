/**
 * Created by Iceblaze on 20. 5. 2016.
 */
$(function() {
    $("#loginBtn").click(function (event) {
        event.preventDefault();
        
        var errorMessage = $("#errorMessage");
        errorMessage.html("");
        
        var username = $.trim($("#username").val());
        var password = $.trim($("#password").val());
        
        var posting = $.post("/", { username: username, password: password });
        
        posting.done(function( data ) {
            var dataObj = JSON.parse(data);

            if(dataObj.type === 'loginSuccess') {
                $("main").html(dataObj.html);
            } else if(dataObj.type === 'loginError') {
                if(dataObj.errorCode == 1) {
                    errorMessage.html("Invalid username or password");
                } else if(dataObj.errorCode == 2) {
                    errorMessage.html("Your account has been blocked");
                }
            }
        });
    });
});

