/**
 * Created by Iceblaze on 28. 5. 2016.
 */
var config = require('../config');
var db = require("../server/database/dbHandler");
var clientData = require("../server/database/data_objects/clientData");

module.exports.loginFunc = function(app, socket, data){
    var username = data.username;
    var pass = data.password;

    db.login(username, pass, function (result) {
        var response = {};
        if (typeof result == 'object') {
            response = {
                type: "loginSuccess",
                html: {}
            };
            app.render('nav', {title: config.getTitle()}, function (err, html) {
                response.html.nav = html;
            });
            app.render('main', {fullName: result.getFullName()}, function (err, html) {
                response.html.main = html;
            });
            socket.clientID = result.clientID;
        } else {
            response = {
                type: "loginError",
                errorCode: result
            };
        }
        //socket.broadcast.to(socket.id).emit('loginRes', JSON.stringify(response));
        socket.emit('loginRes', JSON.stringify(response));
    });
};