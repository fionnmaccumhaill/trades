'use strict';

function checkTime(aTime) {
   // console.log('checkTime:'+aTime);
    var timeArray = aTime.split(':');
    var hh = parseInt(timeArray[0]);
    if(hh>15) return false;
    var mm = parseInt(timeArray[1]);
    if(hh<9) return false;
    if(hh==9 && mm < 30) return false;
   // console.log(timeArray[0]+' '+timeArray[1]+' '+timeArray[2]);
    return true;
}

module.exports = {
    isAllowed: function (aTicker, aDate, aTime, aPrice) {
        var bAllowed = checkTime(aTime);
        if(!bAllowed) return false;
        return true;
    }
};