/**
 * Created by Iceblaze on 19. 5. 2016.
 */
var mysql = require('mysql');
var dbConnect = require("./databaseConnector");
var clientData = require("./data_objects/clientData");

module.exports.login = function (username, password, callback) {
    var _username = mysql.escape(username);
    var query = "SELECT * FROM clientlogin WHERE username=" + _username;
    dbConnect.query(query, function(result){
        if(result.length < 1) {
            callback(-1); // username doesn't exist
        } else {
            var client = result[0];

            if(client.active < 3) {
                if(client.password === password) {
                    updateLoginRecord(_username, true);
                    query = "SELECT * FROM clientdata WHERE username=" + _username;
                    dbConnect.query(query, function(result) {
                        var data = result[0];
                        var clientDataObject = clientData(data.clientID,
                            data.firstName,
                            data.lastName,
                            data.dateOfBirth,
                            data.archived,
                            data.email,
                            data.phone,
                            data.username,
                            data.active);
                        callback(clientDataObject);
                    });
                } else {
                    updateLoginRecord(_username, false);
                    callback(-1); // bad password
                }
            } else {
                callback(-2); // username blocked
            }
        }
    });
};

function updateLoginRecord(username, valid) {
    var query1 = "INSERT INTO historylogin (username, loginDate, validLogin) VALUES (" + username + ", CURRENT_DATE(), " + (valid ? "1" : "0") + ")";
    var query2 = "UPDATE clientlogin SET active = " + (valid ? "0" : "active + 1") + " WHERE username LIKE " + username;

    dbConnect.query(query1, function (result) {
        //console.log(result) add data check
    });
    dbConnect.query(query2, function (result) {
        //console.log(result) add data check
    });
}