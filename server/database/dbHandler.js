/**
 * Created by Iceblaze on 19. 5. 2016.
 */
var mysql = require('mysql');
var dbConnect = require("./databaseConnector");
var dbConst = require('./databaseConstants');
var errors = require('../errorCodes.json');
var clientData = require("./data_objects/clientData");

module.exports.login = function (username, password, callback) {
    var _username = mysql.escape(username);
    var query = "SELECT " + dbConst.tableColumns.clientLogin.USERNAME + ", " +
                dbConst.tableColumns.clientLogin.PASSWORD + ", " +
                dbConst.tableColumns.clientLogin.ACTIVE + ", " +
                dbConst.tableColumns.clients.ARCHIVED +
                " FROM " + dbConst.tableNames.CLIENT_LOGIN +
                " INNER JOIN " + dbConst.tableNames.CLIENTS + " ON " +
                dbConst.tableNames.CLIENT_LOGIN + "." + dbConst.tableColumns.clientLogin.CLIENT_ID + "=" +
                dbConst.tableNames.CLIENTS + "." + dbConst.tableColumns.clients.CLIENT_ID +
                " WHERE " + dbConst.tableColumns.clientLogin.USERNAME + "=" + _username;
    dbConnect.query(query, function(result){
        if(result.length < 1) {
            callback(errors.loginErrors.INVALID_USERNAME.errorCode); // username doesn't exist
        } else {
            var client = result[0];
            console.log(client.archived);
            if(client.archived != 1) {
                if(client.active < 3) {
                    if(client.password === password) {
                        updateLoginRecord(_username, true);
                        query = "SELECT * FROM " + dbConst.viewNames.CLIENT_DATA +
                            " WHERE " + dbConst.viewColumns.clientData.USERNAME + "=" + _username;
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
                        callback(errors.loginErrors.WRONG_PASSWORD.errorCode); // bad password
                    }
                } else {
                    callback(errors.loginErrors.BLOCKED_USERNAME.errorCode); // username blocked
                }
            } else {
                callback(errors.loginErrors.ARCHIVED_CLIENT.errorCode); // client archived
            }            
        }
    });
};

function updateLoginRecord(username, valid) {
    var query1 = "INSERT INTO " + dbConst.tableNames.HISTORY_LOGIN + " (" +
                dbConst.tableColumns.historyLogin.USERNAME + ", " +
                dbConst.tableColumns.historyLogin.LOGIN_DATE + ", " +
                dbConst.tableColumns.historyLogin.VALID_LOGIN +
                ") VALUES (" + username + ", CURRENT_DATE(), " + (valid ? "1" : "0") + ")";
    var query2 = "UPDATE " + dbConst.tableNames.CLIENT_LOGIN +
                 " SET " + dbConst.tableColumns.clientLogin.ACTIVE +
                 "=" + (valid ? "0" : dbConst.tableColumns.clientLogin.ACTIVE + "+1") +
                 " WHERE " + dbConst.tableColumns.clientLogin.USERNAME + " LIKE " + username;

    dbConnect.query(query1, function (result) {
        //console.log(result) add data check
    });
    dbConnect.query(query2, function (result) {
        //console.log(result) add data check
    });
}