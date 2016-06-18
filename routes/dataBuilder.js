/**
 * Created by Iceblaze on 30. 5. 2016.
 */
var db = require("../server/database/dbHandler");

module.exports.buildData = function(app, socket, data){
    if(data.content == "accounts"){
        db.getAccountsData(socket.clientID, function (builtData) {
            sendData(data.content, builtData);
        })
    } else if(data.content == "transactions"){
        db.getTransactionsData(socket.clientID, function (builtData) {
            sendData(data.content, builtData);
        })
    } else if(data.content == "loans"){
        db.getLoansData(socket.clientID, function (builtData) {
            sendData(data.content, builtData);
        })
    } else if(data.content == "cards"){
        db.getCardsData(socket.clientID, function (builtData) {
            sendData(data.content, builtData);
        })
    }

    function sendData(type, responseData){
        var data = {
            content: type,
            data: responseData
        };
        socket.emit('responseData', data);
    }
};

module.exports.transactionData = function(app, socket, data){
    db.getTransactions(data.accountId, function (builtData) {
        socket.emit('transactionData', builtData);
    });
};