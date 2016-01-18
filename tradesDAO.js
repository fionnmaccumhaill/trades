'use strict';

var mysql      = require('mysql');
var theDatasource = require('./dbdatasource.js');
var theDBconstraints = require('./dbconstraints.js');

var tickers;

function getTickerList(aCallback) {
    var connection = theDatasource.getConnection();
    connection.connect(function(err) {
        // connected! (unless `err` is set)
        if(err) console.log("select bad connection");
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
                connection.end();
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
    var connection = theDatasource.getConnection();
    connection.connect(function(err) {
        // connected! (unless `err` is set)
        if(err) console.log("insert bad connection"+err);
    });
    var post  = {ticker: aTicker, trade_date: aDate,
                trade_time: aTime, price: aPrice};
    var query = connection.query('INSERT INTO trades SET ?', post,
                                 function(err, result) {
     //   if(err) console.log(err);
        connection.end();
        // Neat!
    });
    
}

module.exports = {
    getTickers: function (aCallback) {
        var theTickers = getTickerList(aCallback);
    },
    insertQuote: function (aTicker, aDate, aTime, aPrice, aCallback) {
        // check to see if this quote can be inserted in trades table
        if(theDBconstraints.isAllowed(aTicker, aDate, aTime, aPrice)) {
            addQuote(aTicker, aDate, aTime, aPrice, aCallback);
       //     console.log('insert allowed');
        } // else console.log('insert not allowed');
    }
};