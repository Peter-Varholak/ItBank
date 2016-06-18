/**
 * Created by Iceblaze on 19. 5. 2016.
 */
var mysql = require('mysql');
var dbConnect = require("./databaseConnector");
var dbConst = require('./databaseConstants');
var errors = require('../errorCodes.json');
var clientData = require("./data_objects/clientData");
var accountData = require("./data_objects/accountData");
var loanData = require("./data_objects/loanData");
var cardData = require("./data_objects/cardData");
var transactionData = require("./data_objects/transactionData");

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

module.exports.getAccountsData = function (clientId, callback) {
    var query = "SELECT * FROM " + dbConst.tableNames.ACCOUNTS +
                " WHERE " + dbConst.tableColumns.accounts.CLIENT_ID + "=" + clientId;
    dbConnect.query(query, function(result){
        if(result != null) {
            var data = [];
            for(var i = 0; i < result.length; i++){
                data[i] = accountData(result[i].accountID, result[i].balance);
            }
            callback(data);
        }
    });
};

module.exports.getTransactionsData = function (clientId, callback) {
    var query = "SELECT * FROM " + dbConst.tableNames.ACCOUNTS +
        " WHERE " + dbConst.tableColumns.accounts.CLIENT_ID + "=" + clientId;
    dbConnect.query(query, function(result){
        var data = [];
        for(var i = 0; i < result.length; i++){
            data[i] = accountData(result[i].accountID, result[i].balance);
        }
        callback(data);
    });
};

module.exports.getLoansData = function (clientId, callback) {
    var query = "SELECT * FROM " + dbConst.tableNames.LOANS +
        " WHERE " + dbConst.tableColumns.loans.CLIENT_ID + "=" + clientId;
    dbConnect.query(query, function(result){
        if(result != null) {
            var data = [];
            for(var i = 0; i < result.length; i++){
                data[i] = loanData(result[i].amount, result[i].paidAmount, result[i].interest);
            }
            callback(data);
        }
    });
};

module.exports.getCardsData = function (clientId, callback) {
    var query = "SELECT * FROM " + dbConst.tableNames.CARDS +
        " INNER JOIN " + dbConst.tableNames.ACCOUNTS +
        " ON " + dbConst.tableNames.CARDS + "." + dbConst.tableColumns.cards.ACCOUNT_ID + 
        "=" + dbConst.tableNames.ACCOUNTS + "." + dbConst.tableColumns.accounts.ACCOUNT_ID +
        " WHERE " + dbConst.tableColumns.accounts.CLIENT_ID + "=" + clientId;
    dbConnect.query(query, function(result){
        if(result != null) {
            var data = [];
            for (var i = 0; i < result.length; i++) {
                console.log(result);
                data[i] = cardData(result[i].cardID, result[i].accountID, result[i].active);
            }
            callback(data);
        }
    });
};

module.exports.getTransactions = function (accountId, callback) {
    var data = [];

    var query = "SELECT * FROM " + dbConst.tableNames.BANK_TRANSACTIONS +
        " WHERE " + dbConst.tableColumns.bankTransactions.ACCOUNT_ID + "=" + accountId;
    dbConnect.query(query, function(result){
        if(result != null) {
            addData(result);
        }
        
        query = "SELECT * FROM " + dbConst.tableNames.CLIENT_TRANSACTIONS +
            " WHERE " + dbConst.tableColumns.clientTransactions.ACCOUNT_ID + "=" + accountId;
        dbConnect.query(query, function(result){
            if(result != null) {
                addData(result);
            }
            callback(data);
        });
    });    
    
    function addData(result) {
        for (var i = 0; i < result.length; i++) {
            var date = new Date(result[i].transDate);
            data[i] = transactionData(date.getDate() + "." + (parseInt(date.getMonth()) + parseInt(1)) + "." + date.getFullYear(), result[i].value);
        }
    }
};

module.exports.makeTransactions = function (clientId, accountId, recipientAccount, amount) {
    if(accountId != recipientAccount) {

        var query = "SELECT * FROM " + dbConst.tableNames.ACCOUNTS +
            " WHERE " + dbConst.tableColumns.accounts.ACCOUNT_ID + "=" + accountId;
        dbConnect.query(query, function(result) {
            if (result != null && result[0].balance >= amount) {
                query = "SELECT * FROM " + dbConst.tableNames.ACCOUNTS +
                    " WHERE " + dbConst.tableColumns.accounts.ACCOUNT_ID + "=" + recipientAccount;
                dbConnect.query(query, function (result) {
                    if (result != null && result.length > 0) {
                        var now = new Date();
                        var hourDelay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0) - now;
                        while (hourDelay < 0) {
                            hourDelay += 3600000; // add hour
                        }
                        setTimeout(function(){
                            //removing money from user account
                            query = "INSERT INTO " + dbConst.tableNames.CLIENT_TRANSACTIONS +
                                " (" + dbConst.tableColumns.clientTransactions.CLIENT_ID +
                                ", " + dbConst.tableColumns.clientTransactions.ACCOUNT_ID +
                                ", " + dbConst.tableColumns.clientTransactions.TRANSACTION_DATE +
                                ", " + dbConst.tableColumns.clientTransactions.VALUE +
                                ") VALUES ('" + clientId + "', '" + accountId + "', CURRENT_DATE(), '" + (amount * -1) + "')";
                            dbConnect.query(query, function (result) {
                            });

                            query = "UPDATE " + dbConst.tableNames.ACCOUNTS +
                                " SET " + dbConst.tableColumns.accounts.BALANCE + " = " + dbConst.tableColumns.accounts.BALANCE +
                                " - " + amount + " WHERE " + dbConst.tableColumns.accounts.ACCOUNT_ID + " = " + accountId;
                            dbConnect.query(query, function (result) {
                            });

                            //adding money to recipient account
                            query = "INSERT INTO " + dbConst.tableNames.CLIENT_TRANSACTIONS +
                                " (" + dbConst.tableColumns.clientTransactions.CLIENT_ID +
                                ", " + dbConst.tableColumns.clientTransactions.ACCOUNT_ID +
                                ", " + dbConst.tableColumns.clientTransactions.TRANSACTION_DATE +
                                ", " + dbConst.tableColumns.clientTransactions.VALUE +
                                ") VALUES ('" + clientId + "', '" + recipientAccount + "', CURRENT_DATE(), '" + amount + "')";
                            dbConnect.query(query, function (result) {
                            });

                            query = "UPDATE " + dbConst.tableNames.ACCOUNTS +
                                " SET " + dbConst.tableColumns.accounts.BALANCE + " = " + dbConst.tableColumns.accounts.BALANCE +
                                " + " + amount + " WHERE " + dbConst.tableColumns.accounts.ACCOUNT_ID + " = " + recipientAccount;
                            dbConnect.query(query, function (result) {
                            });
                        }, hourDelay);
                    }
                });
            }
        });
    }
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