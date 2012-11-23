
module.exports = function(){
    var CronJob = require('cron').CronJob;
    var Access = mongoose.model('Access');

    new CronJob('0 0 0 * * *', function(){
        var startDate = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
        startDate.setFullYear(startDate.getFullYear() - 1);
        var startId = objectIdWithTimestamp(startDate);
        //清理一年前的数据
        Access.remove({'_id': {$lt: startId}},function(err,count){
            if(err) return console.log('sweep lt %s data error!', startDate.toDateString());

            console.log('Sweep lt %s data, count: %s !', startDate.toDateString(),count);
        });
    },null,true);

    function objectIdWithTimestamp(timestamp){
        // Convert string date to Date object (otherwise assume timestamp is a date)
        if (typeof(timestamp) == 'string') {
            timestamp = new Date(timestamp);
        }

        // Convert date object to hex seconds since Unix epoch
        var hexSeconds = Math.floor(timestamp/1000).toString(16);

        // Create an ObjectId with that hex timestamp
        var constructedObjectId = mongoose.Types.ObjectId(hexSeconds + "0000000000000000");

        return constructedObjectId
    }
}