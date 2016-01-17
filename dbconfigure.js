'use strict';

var theDBConfig = require('./config/dbconfig.json');

// console.log("config:" + theConfig["repository"].indexfile);

exports.getConfig = function() {
    return theDBConfig;
}