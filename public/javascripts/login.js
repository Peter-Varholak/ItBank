/**
 * Created by Iceblaze on 20. 5. 2016.
 */
var socket;

$(function() {
    socket = io.connect();

    $("#loginBtn").click(function (event) {
        event.preventDefault();
        
        var errorMessage = $("#errorMessage");
        errorMessage.html("");
        
        var username = $.trim($("#username").val());
        var password = $.trim($("#password").val());
        
        socket.emit("login", { username: username, password: password });
        
        socket.on('loginRes', function( data ) {
            var dataObj = JSON.parse(data);

            if(dataObj.type === 'loginSuccess') {
                $("nav").append(dataObj.html.nav);
                $("main").html(dataObj.html.main);
            } else if(dataObj.type === 'loginError') {
                if(dataObj.errorCode == 1) {
                    errorMessage.html("Invalid username or password");
                } else if(dataObj.errorCode == 2) {
                    errorMessage.html("Invalid username or password");
                } else if(dataObj.errorCode == 3) {
                    errorMessage.html("Your account has been blocked");
                } else if(dataObj.errorCode == 4) {
                    errorMessage.html("This account is no longer active");
                }
            }
        });
    });
});
