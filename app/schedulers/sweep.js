
module.exports = function(){
    var cronJob = require('cron').CronJob;
    new cronJob('0 0 0 * * *', function(){
        console.log('sweep data..');
    },null,true);
}