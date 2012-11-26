
module.exports = function(){
    var CronJob = require('cron').CronJob;
    var Access = mongoose.model('Access');
    console.log('Sweep scheduler loaded...');
    new CronJob('0 0 0 * * *', function(){
        console.log('Sweep scheduler start...');
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
        if (typeof(timestamp) == 'string') {
            timestamp = new Date(timestamp);
        }
        var hexSeconds = Math.floor(timestamp/1000).toString(16);
        var constructedObjectId = mongoose.Types.ObjectId(hexSeconds + "0000000000000000");
        return constructedObjectId
    }
}