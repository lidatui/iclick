
module.exports = function(){
    var DateUtils = require('../utils/DateUtils');
    var CronJob = require('cron').CronJob;
    var Access = mongoose.model('Access');
    var Site = mongoose.model('Site');
    var SiteDayCount = mongoose.model('SiteDayCount');
    console.log('SiteDayCount scheduler loaded...');
    new CronJob('0 0 0 * * *', function(){
        console.log('SiteDayCount scheduler start...');
        var now = DateUtils.now();
        var startDate = new Date(now.getFullYear(),now.getMonth(),now.getDate());
        startDate.setDate(startDate.getDate() - 1);
        var startId = DateUtils.objectId(startDate);
        var endDate = new Date(now.getFullYear(),now.getMonth(),now.getDate());
        var endId = DateUtils.objectId(endDate);

        var o = {
            map: function(){
                emit({
                    time:this.timestamp.substr(0,10),site: this.site._id
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
            out: 't_siteDayCount',
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
                        console.log('SiteDayCount count: %s',results.length);
                        for(var j=0; j<results.length; j++){

                            var dayCount = new SiteDayCount({
                                site: results[j]._id['site'],
                                dataTime: new Date(results[j]._id['time']),
                                count: results[j].value.count
                            });
                            dayCount.save(function(err, r){
                                //console.log(r);
                            });
                        }
                        console.log('SiteDayCount scheduler done...%s',DateUtils.format(startDate,'yyyy-mm-dd'));

                    })
            });
        });

    },null,true);

}