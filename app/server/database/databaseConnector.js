/**
 * Created by PC on 19-May-16.
 */
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'bankadmin',
    password: 'bank',
    database: 'itbank'
});

module.exports.querySelect = function(query){
    connection.connect();
    connection.query(query, function(err, rows, fields){
        if(!err) {
            return rows;
        } else {
            console.log("Error performing query");
        }
    });
    connection.end();
};
