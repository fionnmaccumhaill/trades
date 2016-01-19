'use strict';
// var theConfig = require('./configure.js');
// var configJSON = theConfig.getConfig();

// Parse the command line for input parameters
var theArgs = require('minimist')(process.argv.slice(2));
var posArg = theArgs['_'][0];
var singleTicker = theArgs['_'][1];
var dbTickers;
var tickerReloadCount = 0;
var startupSwitch = true;

var theQuoteService = require('./YahooQuoteService');

function runYahoo(aTickers) {
    var currDT = new Date();
    var currMonth = currDT.getMonth()+1;
    console.log(currMonth+'/'+currDT.getDate()+'/'+
                currDT.getFullYear()+' '+ currDT.getHours()+':'+
                currDT.getMinutes());
    tickerReloadCount++;
    if(tickerReloadCount>10) {
        theTradesDAO.getTickers(tickerCallback);
        tickerReloadCount = 0;
    }
    theQuoteService.getQuote(dbTickers);
    setTimeout(runYahoo,60000);
 //   console.log("waiting for the next 60 seconds to pass");
}
function runSingle(aTicker) {
    var tArray = [aTicker];
    theQuoteService.getQuote(tArray);
}

function tickerCallback(err, aTickers) {
    if(!err) {
        dbTickers = aTickers;
   //     console.log(aTickers);
        if(startupSwitch) {
            startupSwitch = false;
            switch (posArg)
            {
                case 'yahoo': runYahoo(dbTickers);
                    break;
                case 'single': runSingle(singleTicker);
                    break;
                default: console.log('bad arg');
            }
        }
        
    } else {
        console.log('error reading tickers');
    }
}

// instead of using hard-coded tickers, create a function to 
// get tickers from the db
var tickers = 'IBM,FB,MS,GS,GE,DIS,EL,ULTA';
var theTradesDAO = require('./tradesDAO.js');
theTradesDAO.getTickers(tickerCallback);
// console.log('ticker count:'+dbTickers.length);