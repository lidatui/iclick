
module.exports = function(){
    var CronJob = require('cron').CronJob;
    var Access = mongoose.model('Access');
    var AccessControl = mongoose.model('AccessControl');
    var DayCount = mongoose.model('DayCount');
    console.log('DayCount scheduler loaded...');
    new CronJob('0 * * * * *', function(){
        console.log('DayCount scheduler start...');
        var startDate = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
        startDate.setDate(startDate.getDate() - 1);
        var startId = objectIdWithTimestamp(startDate);
        var endDate = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
        var endId = objectIdWithTimestamp(endDate);

        var o = {
            map: function(){
                var d = this._id.getTimestamp();
                var month = d.getMonth()+1 < 10 ? '0'+ d.getMonth()+1: d.getMonth()+1;
                var date = d.getDate() < 10 ? '0'+ d.getDate(): d.getDate();
                var day = d.getFullYear()+'-'+ month +'-'+ date;
                emit({
                    day:day,acId: this.accessControl._id
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
            out: 'dayCount',
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

                            var dayCount = new DayCount({
                                acId: results[j]._id['acId'],
                                day: results[j]._id['day'],
                                count: results[j].value.count
                            });
                            dayCount.save();
                        }
                        console.log('DayCount scheduler done...%s',formatDate(startDate));

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
        return d.getFullYear()+'-'+ month +'-'+ date;
    }
}