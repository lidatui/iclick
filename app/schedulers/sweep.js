
module.exports = function(){
    var DateUtils = require('../utils/DateUtils');
    var CronJob = require('cron').CronJob;
    var Access = mongoose.model('Access');
    console.log('Sweep scheduler loaded...');
    new CronJob('0 0 0 * * *', function(){
        console.log('Sweep scheduler start...');
        var now = DateUtils.now();
        var startDate = new Date(now.getFullYear(),now.getMonth(),now.getDate());
        //startDate.setFullYear(startDate.getFullYear() - 1);
        //startDate.setDate(startDate.getDate() - 3);

        startDate.setTime(startDate.getTime()-30*24*3600*1000);
        var startId = DateUtils.objectId(startDate);
        //清理一年前的数据
        Access.remove({'_id': {$lt: startId}},function(err,count){
            if(err) return console.log('sweep lt %s data error!', startDate.toDateString());

            console.log('Sweep lt %s data, count: %s !', startDate.toDateString(),count);
        });
    },null,true);
}