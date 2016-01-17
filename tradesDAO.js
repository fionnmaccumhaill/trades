'use strict';

var mysql      = require('mysql');
var theDatasource = require('./dbdatasource.js');

var tickers;

function getTickerList(aCallback) {
    var connection = theDatasource.getConnection();
    connection.connect(function(err) {
        // connected! (unless `err` is set)
        if(err) console.log("bad connection");
    });
    var retValue = [];
    var sql = 'SELECT TICKER, COUNT(*) FROM TRADES ' +
        ' WHERE TRADE_DATE > DATE_SUB(CURDATE(), INTERVAL 47 DAY) ' +
        'GROUP BY TICKER';
    var query = connection.query(sql, function(err, result) {
        if(!err) {
            if (result.length  > 0) {
                tickers = result;
                var rsLength = result.length;
                for (var i = 0; i < rsLength; i++) {
                    retValue.push(tickers[i].TICKER);
                }
                console.log('number of tickers:'+rsLength);
              //  connection.end(function(err) {
            //       console.log("connection closed");
            //    });
                aCallback(err, retValue);
            }
        }
        if(err) {
            console.log("error running sql:"+sql);
        }
    }); 
}

function addQuote(aTicker, aDate, aTime, aPrice, aCallback) {
    // insert quote into trades
}

module.exports = {
    getTickers: function (aCallback) {
        var theTickers = getTickerList(aCallback);
    },
    insertQuote: function (aTicker, aDate, aTime, aPrice, aCallback) {
        addQuote(aTicker, aDate, aTime, aPrice, aCallback);
    }
};