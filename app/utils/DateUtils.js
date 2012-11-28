var dateFormat = require('dateformat');
module.exports = {
    now : function(){
        var localDate = new Date();
        var localTime = localDate.getTime();
        var localOffset= localDate.getTimezoneOffset()*60000;
        var utc = localTime + localOffset;
        return new Date(utc + (3600000*8));
        //return new Date();
    }
    ,offset: function(localDate){
        var localTime = localDate.getTime();
        var localOffset= localDate.getTimezoneOffset()*60000;
        var utc = localTime + localOffset;
        return new Date(utc + (3600000*8))
    }
    , format: function(d, exp){
        return dateFormat(d,exp);
    }
    , objectId: function(timestamp){
        if (typeof(timestamp) == 'string') {
            timestamp = new Date(timestamp);
        }
        console.log(timestamp)
        var localTime = timestamp.getTime();
        var localOffset= timestamp.getTimezoneOffset()*60000;
        var utc = localTime + localOffset;
        timestamp =  new Date(utc - (3600000*8));
        var hexSeconds = Math.floor(timestamp/1000).toString(16);
        var constructedObjectId = mongoose.Types.ObjectId(hexSeconds + "0000000000000000");

        return constructedObjectId
    }
}