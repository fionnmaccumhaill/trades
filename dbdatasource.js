'use strict';

var theConfig = require('./dbconfigure.js');
var configJSON = theConfig.getConfig();
var dbHost = configJSON["finance"].host;
var dbUser = configJSON["finance"].user;
var dbPwd = configJSON["finance"].pwd;
var dbName = configJSON["finance"].database;

var mysql      = require('mysql');

module.exports = {
    getConnection: function (aHost, aUser, aPwd, aDatabase) {
        var connection = mysql.createConnection({
            host     : aHost,
            user     : aUser,
            password : aPwd,
            database : aDatabase
        });
        return connection;
    }
};