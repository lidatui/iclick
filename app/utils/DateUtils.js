var dateFormat = require('dateformat');
module.exports = {
    now : function(){
        return new Date();
    }
    , format: function(d, exp){
        return dateFormat(d,exp);
    }
    , objectId: function(timestamp){
        if (typeof(timestamp) == 'string') {
            timestamp = new Date(timestamp);
        }

        var hexSeconds = Math.floor(timestamp/1000).toString(16);
        var constructedObjectId = mongoose.Types.ObjectId(hexSeconds + "0000000000000000");
        return constructedObjectId
    }
}