'use strict';

var mysql      = require('mysql');
var theDatasource = require('./dbdatasource.js');
var theDBconstraints = require('./dbconstraints.js');

var tickers;

function getStatistics(aCallback) {
    var connection = theDatasource.getConnection();
    connection.connect(function(err) {
        // connected! (unless `err` is set)
        if(err) console.log("select bad connection");
    });
    // var retValue = [];
    var sql = 'SELECT COUNT(DISTINCT TICKER) as tickercnt, ' +
        ' MAX(TRADE_DATE) as maxtdate, MIN(TRADE_DATE) as mintdate, ' +
        ' (SELECT COUNT(*) FROM FINANCE.TRADES ' +
        '   WHERE TRADE_DATE = (SELECT MAX(TRADE_DATE) FROM ' +
        '     FINANCE.TRADES_DAILY)) as tradescnt ' +
        '  FROM finance.trades ';
    var query = connection.query(sql, function(err, result) {
        if(!err) {
            if (result.length  > 0) {
                var retValue = [];
                retValue['tickercnt'] = result[0].tickercnt;
                retValue['maxtdate'] = result[0].maxtdate;
                retValue['mintdate'] = result[0].mintdate;
                retValue['tradescnt'] = result[0].tradescnt;
            //    console.log('number of tickers:'+rsLength);
                connection.end();
                aCallback(err, retValue);
            }
        }
        if(err) {
            console.log("error running sql:"+sql);
        }
    }); 
}
function getTickerList(aCallback) {
    var connection = theDatasource.getConnection();
    connection.connect(function(err) {
        // connected! (unless `err` is set)
        if(err) console.log("select bad connection");
    });
    var retValue = [];
    var sql = 'SELECT TICKER, COUNT(*) FROM trades ' +
        ' WHERE TRADE_DATE > DATE_SUB(CURDATE(), INTERVAL 5 DAY) ' +
        'GROUP BY TICKER';
    var query = connection.query(sql, function(err, result) {
        if(!err) {
            if (result.length  > 0) {
                tickers = result;
                var rsLength = result.length;
                for (var i = 0; i < rsLength; i++) {
                    retValue.push(tickers[i].TICKER);
                }
        //        console.log('number of tickers:'+rsLength);
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
    getStats: function (aCallback) {
        getStatistics(aCallback);
        // var theTickers = getTickerList(aCallback);
    },
    insertQuote: function (aTicker, aDate, aTime, aPrice, aCallback) {
        // check to see if this quote can be inserted in trades table
        if(theDBconstraints.isAllowed(aTicker, aDate, aTime, aPrice)) {
            addQuote(aTicker, aDate, aTime, aPrice, aCallback);
        } // else console.log('insert not allowed');
    }
};