module.exports = function(app){
    var DateUtils = require('../utils/DateUtils');
    var Access = mongoose.model('Access');
    var Site = mongoose.model('Site');
    var SiteDayCount = mongoose.model('SiteDayCount');
    var SiteHourCount = mongoose.model('SiteHourCount');

    function statistics(req, res, next){
        if(req.session.user){
            if (req.session.user.role.statistics) {
                next();
            } else {
                req.session.error = '无此权限!';
                res.redirect('/');
            }
        }else {
            req.session.error = '您的登陆状态已过期，请重新登录!';
            res.redirect('/');
        }
    }

    app.get('/manage/countCharts', statistics, function(req, res){
        res.render('manage/countCharts', {
            title : '投资一点通-访问统计'
            ,description: 'statistics Description'
            ,author: 'miemiedev'
            ,l1: true,l2: false,l3: false,l4: false,l5: false,l6: false
        });
    });

    app.get('/manage/statistics/dayCount', function(req, res){

        var list = [];
        function callback(){
            //合并相同天的记录
            var results = [];
            for(var i=0; i<list.length; i++){
                var r = null;
                for(var j=0; j<results.length; j++){
                    if(list[i]._id === results[j]._id){
                        r = results[j];
                    }
                }
                if(r){
                    r.value += list[i].value;
                }else{
                    results.push(list[i]);
                }

            }
            //从小到大排序
            results.sort(function(a,b){
                if (a['_id'] < b['_id']) return -1;
                if (a['_id'] > b['_id']) return 1;
                return 0;
            });

            var date = [];
            var data = [];
            for(var i=0; i< results.length; i++){
                date.push(results[i]._id);
                data.push(results[i].value);
            }
            res.send({
                categories: date
                , data: data
                , step: date / 8
            });
        }


        Site.find({},function(err, sites){
            var siteIds = sites.map(function(site){
                return site._id;
            });

            var wait = 3;

            var now = DateUtils.now();
            var startDate = new Date(now.getFullYear(),now.getMonth(),now.getDate());
            var endDate = new Date (startDate);
            startDate.setMonth(startDate.getMonth() -1);
            startDate.setDate(startDate.getDate() +1);

            //取天表
            var o = {
                map : function (){
                    var d = this.dataTime;
                    var month = d.getMonth()+1 < 10 ? '0'+ d.getMonth()+1: d.getMonth()+1;
                    var date = d.getDate() < 10 ? '0'+ d.getDate(): d.getDate();
                    var time = d.getFullYear()+'-'+ month +'-'+ date;

                    emit(time, this.count);
                }
                , reduce: function (k, vals) {
                    var total = 0;
                    for ( var i=0; i<vals.length; i++ )
                        total += vals[i];
                    return total;
                }
                , query : {
                    'site':{$in: siteIds}
                    , 'dataTime': {$gte: startDate,$lt: endDate}
                }
            };
            SiteDayCount.mapReduce(o, function(err, dayCounts){
                dayCounts = dayCounts ? dayCounts : [];
                for(var i=0; i< dayCounts.length; i++){
                    list.push(dayCounts[i]);
                }
                if(--wait == 0){
                    callback();
                }
            });


            //取小时表
            startDate = new Date(endDate);
            endDate = new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),0,0);

            o.query = {
                'site':{$in: siteIds}
                , 'dataTime': {$gte: startDate,$lt: endDate}
            };
            SiteHourCount.mapReduce(o, function(err, results){
                results = results ? results : [];
                for(var i=0; i< results.length; i++){
                    list.push(results[i]);
                }
                if(--wait == 0){
                    callback();
                }
            });


            //小时以后
            var o = {
                map : function (){
                    emit(this.timestamp.substr(0,10), 1);
                }
                , reduce: function (k, vals) {
                    var total = 0;
                    for ( var i=0; i<vals.length; i++ )
                        total += vals[i];
                    return total;
                }
                , query : {
                    'site._id':{$in: siteIds}
                    , '_id': {$gte: DateUtils.objectId(endDate)}}
            };
            Access.mapReduce(o, function (err, results) {
                results = results ? results : [];
                for(var i=0; i< results.length; i++){
                    list.push(results[i]);
                }
                if(--wait == 0){
                    callback();
                }
            });
        });
    });

    app.get('/manage/statistics/daySiteCount', function(req, res){
        var startDate = new Date(req.query["date"]);
        var endDate = new Date (startDate);
        endDate.setDate ( endDate.getDate() + 1 );
        startDate = DateUtils.objectId(startDate);
        endDate = DateUtils.objectId(endDate);
        Site.find({},function(err, sites){
            var siteIds = sites.map(function(site){
                return site._id;
            });
            var o = {
                map: function(){
                    if(this.site){
                        emit(this.site.siteName,1);
                    }
                },
                reduce: function(k, vals){
                    var total = 0;
                    for ( var i=0; i<vals.length; i++ )
                        total += vals[i];
                    return total;
                },
                query: {'site._id':{$in: siteIds}, '_id': {$gte: startDate,$lt: endDate}}
            };
            Access.mapReduce(o, function (err, results) {
                var data = [];
                for(var i=0; i< results.length; i++){
                    data.push([results[i]._id, results[i].value]);
                }
                res.send({
                    data: data
                });
            });
        });

    });
}