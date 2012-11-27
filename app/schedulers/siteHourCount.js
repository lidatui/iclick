
module.exports = function(){
    var CronJob = require('cron').CronJob;
    var Access = mongoose.model('Access');
    var AccessControl = mongoose.model('AccessControl');
    var SiteHourCount = mongoose.model('SiteHourCount');
    console.log('SiteHourCount scheduler loaded...');
    new CronJob('0 0 * * * *', function(){
        console.log('SiteHourCount scheduler start...');
        var startTime = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),new Date().getHours(),0,0);
        startTime.setHours(startTime.getHours() - 1);
        var endTime = new Date(startTime);
        var startId = objectIdWithTimestamp(startTime);
        var endId = objectIdWithTimestamp(endTime);

        var o = {
            map: function(){
                var d = this._id.getTimestamp();
                var month = d.getMonth()+1 < 10 ? '0'+ d.getMonth()+1: d.getMonth()+1;
                var date = d.getDate() < 10 ? '0'+ d.getDate(): d.getDate();
                var hour = d.getHours() < 10 ? '0'+ d.getHours(): d.getHours();
                var time = d.getFullYear()+'-'+ month +'-'+ date + ' ' +hour+':00:00';
                emit({
                    time:time,acId: this.accessControl._id
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
            out: 't_siteHourCount',
            verbose: true
        };

        Access.mapReduce(o, function (err, model, stats){
            AccessControl.find({},function(err, acs){
                var acIds = acs.map(function(ac){
                    return ac._id;
                });
                model
                    .find({'_id.acId': {$in: acIds}}, function(err, results) {

                        for(var j=0; j<results.length; j++){

                            var hourCount = new SiteHourCount({
                                acId: results[j]._id['acId'],
                                time: results[j]._id['time'],
                                count: results[j].value.count
                            });
                            hourCount.save();
                        }
                        console.log('SiteHourCount scheduler done...%s',formatDate(startTime));

                    })
            });
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
    function formatDate(d){
        var month = d.getMonth()+1 < 10 ? '0'+ d.getMonth()+1: d.getMonth()+1;
        var date = d.getDate() < 10 ? '0'+ d.getDate(): d.getDate();
        var hour = d.getHours() < 10 ? '0'+ d.getHours(): d.getHours();
        return d.getFullYear()+'-'+ month +'-'+ date + ' ' +hour+':00:00';
    }
}