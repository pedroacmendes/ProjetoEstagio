const mysql = require ('mysql');

var mysqlConnection = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "root",
    database : "pedidos-modelo",
    multipleStatements : true
});

mysqlConnection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = mysqlConnection;