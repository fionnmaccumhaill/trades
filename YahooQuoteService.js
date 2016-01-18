'use strict';

// the next lines of code parse the result
// from the yahoo finance web service and puts the
// results in an array (theOutput)
var parse = require('csv-parse');

var theRequest = require('request');
var theTradesDAO = require('./tradesDAO.js');


function runParser(aRequest) {
    var theOutput = [];
    var parser = parse({delimiter: ','});
    parser.write(aRequest);
    parser.on('readable', function() {
        var record = '';
        while(record = parser.read()) {
            theOutput.push(record);
        }
    });
    parser.on('error', function(err) {
        console.log('error:'+err.message);
    });
    parser.end();
    return theOutput;
}

// Yahoo returns a date in the format mm/dd/yyyy
// Mysql needs it in the format yyyy-mm-dd
// the mm and dd fields contain only 1 number 
// if the value is less than 10 (for example 1/4/2016)
function transformDate(aYahooDate) {
    var dateArray = aYahooDate.split("/");
    var mmstr = dateArray[0];
    var ddstr = dateArray[1];
    var yyyystr = dateArray[2];
    if (mmstr.length==1) mmstr = '0' + mmstr;
    if (ddstr.length==1) mmstr = '0' + ddstr;
    return yyyystr+'-'+mmstr+'-'+ddstr;
}

// Yahoo returns a date in the format hh:mmAM
// Mysql needs it in hh:mm:ss with a 24 hour time
function transformTime(aYahooTime) {
    var timeArray = aYahooTime.split(':');
    var ssint = timeArray[1].substring(0, 2);
    var ampm = timeArray[1].substring(2, 4);
    var hhint = parseInt(timeArray[0]);
    if(ampm=='pm' && hhint < 12) hhint = hhint+12;
    var sHh = hhint.toString();
    return sHh+':'+ssint+':00';
}

// Yahoo Quote Options:
// s = symbol
// l1 = last trade
// d1 = last trade date
// t1 = last trade time
// c1 = change
// o = open
// h = high
// g = low
// v = volume
// t8 = 1yr target price
var yahooQuotePrefix = "http://finance.yahoo.com/d/quotes.csv?s=";
var yahooQuoteSuffix = "&f=sl1d1t1c1ohgvt8&e=.csv";

function getUrl(aUrl, aCallback) {
    theRequest({
        url: aUrl,
        json: false
    }, function (error, response, body) {
           if (!error && response.statusCode === 200) {
               aCallback(error, body);
           }
})}

function tradeCallback(aError, aBody) {
    var theOutput = runParser(aBody);
 //   parser.end();
    var outLength = theOutput.length;
    for (var i=0; i<outLength; i++) {
        var ticker, tdate, ttime, price;
        ticker = theOutput[i][0];
        price = theOutput[i][1];
        tdate = transformDate(theOutput[i][2]);
        ttime = transformTime(theOutput[i][3]);
        theTradesDAO.insertQuote(ticker, tdate, ttime, price);
    }
}

function splitTickers(aTickers) {
    // console.log('inside splitTickers');
    var splitArray = [];
    var i,j,temparray,chunk = 10;
    for (i=0,j=aTickers.length; i<j; i+=chunk) {
        temparray = aTickers.slice(i,i+chunk);
     //   console.log(temparray);
        splitArray.push(temparray);
    }
    return splitArray;
}

module.exports = {
    getQuote: function (aTicker) {    // change to accept array of tickers
        var splitArray = splitTickers(aTicker);
        var qURL;
        var splitLength = splitArray.length;
    //    console.log('splitLength:'+splitLength);
        for (var i=0; i<splitLength; i++) {
            qURL = yahooQuotePrefix + splitArray[i] + yahooQuoteSuffix;
            getUrl(qURL, tradeCallback);   
        }
        // var qURL = yahooQuotePrefix + aTicker + yahooQuoteSuffix;
        // getUrl(qURL, tradeCallback);    
    }
};