
module.exports = function(){
    var DateUtils = require('../utils/DateUtils');
    var CronJob = require('cron').CronJob;
    var Access = mongoose.model('Access');
    var Site = mongoose.model('Site');
    var GisHourCount = mongoose.model('GisHourCount');
    console.log('GisHourCount scheduler loaded...');
    new CronJob('0 0 * * * *', function(){
        console.log('GisHourCount scheduler start...');
        var now = DateUtils.now();
        var startTime = new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),0,0);
        var endTime = new Date(startTime);
        startTime.setHours(startTime.getHours() - 1);

        var startId = DateUtils.objectId(startTime);
        var endId = DateUtils.objectId(endTime);
        var o = {
            map: function(){
                emit({
                    time:this.timestamp.substr(0,13)+':00:00',site: this.site._id,
                    country: this.ipInfo ? this.ipInfo.country : '',
                    province: this.ipInfo ? this.ipInfo.province : '',
                    city: this.ipInfo ? this.ipInfo.city : ''
                },{count: 1});
            },
            reduce: function(k, vals){
                var total = 0;
                vals.forEach(function(v) {
                    total += v['count'];
                });
                return {count: total};
            },
            query: { '_id': {$gte: startId,$lt: endId}},
            out: 't_gisHourCount',
            verbose: true
        };

        Access.mapReduce(o, function (err, model, stats){
            if(!model){
                return;
            }
            Site.find({},function(err, sites){
                var siteIds = sites.map(function(site){
                    return site._id;
                });
                model
                    .find({'_id.site': {$in: siteIds}}, function(err, results) {
                        console.log('GisHourCount count: %s',results.length);
                        for(var j=0; j<results.length; j++){

                            var hourCount = new GisHourCount({
                                site: results[j]._id['site'],
                                country: results[j]._id['country'],
                                province: results[j]._id['province'],
                                city: results[j]._id['city'],
                                dataTime: new Date(results[j]._id['time']),
                                count: results[j].value.count
                            });
                            hourCount.save(function(err, r){
                                //console.log(r);
                            });
                        }
                        console.log('GisHourCount scheduler done...%s',DateUtils.format(startTime,'yyyy-mm-dd HH:MM:ss'));

                    })
            });
        });

    },null,true);


}