
module.exports = function(app){
    var DateUtils = require('../utils/DateUtils');
    var Access = mongoose.model('Access');
    var Site = mongoose.model('Site');
    var SiteDayCount = mongoose.model('SiteDayCount');
    var SiteHourCount = mongoose.model('SiteHourCount');


    var statistics = function (req, res, next){
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


    app.get('/manage/siteCount', statistics, function(req, res){

        Site.find({}).sort('companyName').exec(function (err, sites) {
            res.render('manage/siteCount', {
                title : '投资一点通-访问统计'
                ,description: 'statistics Description'
                ,author: 'miemiedev'
                ,l1: true,l2: false,l3: false,l4: false,l5: false,l6: false
                ,sites: sites
            });
        });
    });

    var reduceFunc = function(k, vals){
        var total = 0;
        vals.forEach(function(v) {
            total += v['count'];
        });
        return {count: total};
    }

    app.get('/manage/statistics/siteCount',  function(req, res){
        var pageSize = req.query["pageSize"] > 0 ? req.query["pageSize"] : 10
            , pageNo = req.query["pageNo"] > 0 ? req.query["pageNo"] : 0;

        var siteId = req.query["siteId"];
        var startDate = new Date(req.query["startDate"]);
        var endDate = new Date ( req.query["endDate"] );

        //临时集合名
        var tempColName = 't_siteCount_'+ new Date().getTime();

        var wait = 1;
        var callback = function(err, model, stats){
            if(!model){
                console.log(err);
                return res.send({
                    items: []
                    , pageNo: pageNo
                    , pageSize: pageSize
                    , totalCount: 0
                });

            }
//            console.log(err);
//            console.log(model);
//            console.log(stats);
            var o = {
                map: function(){
                    emit({day:this._id.day, site: this._id.site},{count: this.value.count});
                },
                reduce: reduceFunc,
                out: tempColName,
                verbose: true
            };
            model.mapReduce(o, function(err, model, stats){
                if(!model){
                    console.log(err);
                    return res.send({
                        items: []
                        , pageNo: pageNo
                        , pageSize: pageSize
                        , totalCount: 0
                    });

                }
                Site.find({},function(err, sites){
                    var siteIds = sites.map(function(site){
                        return site._id;
                    });
                    model
                        .find({'_id.site': {$in: siteIds}})
                        .limit(pageSize)
                        .skip(pageSize * pageNo)
                        .sort('-_id.day')
                        .exec(function (err, results) {

                            var items = [];
                            for(var j=0; j<results.length; j++){
                                for(var i=0; i<sites.length; i++){
                                    if(results[j]._id['site'].toString() == sites[i]._id.toString()){
                                        var item = {
                                            siteId: sites[i]._id,
                                            day: results[j]._id['day'],
                                            companyName: sites[i].companyName,
                                            siteName: sites[i].siteName,
                                            count: results[j].value.count
                                        }
                                        items.push(item);
                                    }
                                }
                            }
                            model.find({'_id.site': {$in: siteIds}},function(err, totals){
                                var total = {
                                    count: 0,
                                    total: true
                                };
                                for(var i=0; i<totals.length; i++){
                                    total['count'] += totals[i].value.count
                                }
                                items.push(total);
                                model.count({'_id.site': {$in: siteIds}}).exec(function (err, count) {
                                    res.send({
                                        items: items
                                        , pageNo: pageNo
                                        , pageSize: pageSize
                                        , totalCount: count
                                    });
                                    mongoose.connection.collections[tempColName].drop(function(err){
                                        //console.log(tempColName +'collection dropped');
                                    });
                                })
                            })
                        })
                });
            });
        };
        //如果结束日期是今天就查其他表
        if(DateUtils.format(endDate,'yyyy-mm-dd') === DateUtils.format(new Date(),'yyyy-mm-dd')){
            wait = 3
        }else{
            endDate.setDate(endDate.getDate() +1);
        }

        //取天表
        var o = {
            map: function(){
                var d = this.dataTime;
                var month = d.getMonth()+1 < 10 ? '0'+ d.getMonth()+1: d.getMonth()+1;
                var date = d.getDate() < 10 ? '0'+ d.getDate(): d.getDate();
                var day = d.getFullYear()+'-'+ month +'-'+ date;
                emit({day:day,site: this.site},{count: this.count});
            },
            reduce: reduceFunc,
            out: tempColName,
            verbose: true,
            query: siteId ? {'site':siteId, 'dataTime': {$gte: startDate,$lt: endDate}}
                    : {'dataTime': {$gte: startDate,$lt: endDate}}

        };
        SiteDayCount.mapReduce(o,function(err, model, stats){
            if(--wait == 0){
                callback(err, model, stats);
            }
        });

        if(wait === 1){
            return;
        }

        //取小时表
        startDate = new Date(endDate);
        var now = DateUtils.now();
        endDate = new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),0,0);
        var o = {
            map: function(){
                var d = this.dataTime;
                var month = d.getMonth()+1 < 10 ? '0'+ d.getMonth()+1: d.getMonth()+1;
                var date = d.getDate() < 10 ? '0'+ d.getDate(): d.getDate();
                var day = d.getFullYear()+'-'+ month +'-'+ date;
                emit({
                    day:day,site: this.site
                },{count: this.count});
            },
            reduce: reduceFunc,
            out: {reduce: tempColName},//增量放入
            verbose: true,
            query: siteId ? {'site':siteId, 'dataTime': {$gte: startDate,$lt: endDate}}
                : {'dataTime': {$gte: startDate,$lt: endDate}}
        };
        SiteHourCount.mapReduce(o,function(err, model, stats){
            if(--wait == 0){
                callback(err,model ,stats);
            }
        });

        var o = {
            map: function(){
                emit({
                    day:this.timestamp.substr(0,10),site: this.site._id
                },{count: 1});
            },
            reduce: reduceFunc,
            out: {reduce: tempColName},//增量放入
            verbose: true,
            query: siteId ? { 'site._id':mongoose.Types.ObjectId(siteId), '_id': {$gte: DateUtils.objectId(endDate)}}
                : { '_id': {$gte: DateUtils.objectId(endDate)}}
        };
        Access.mapReduce(o,function(err, model, stats){
            if(--wait == 0){
                callback(err, model, stats);
            }
        });

    });

    app.get('/manage/statistics/sitePage',  function(req, res){
        var siteId = req.query["siteId"];
        var startDate = new Date(req.query["date"]);
        var endDate = new Date (startDate);
        endDate.setDate ( endDate.getDate() + 1 );
        startDate = DateUtils.objectId(startDate);
        endDate = DateUtils.objectId(endDate);

        var o = {
            map: function(){
                if(this.pageInfo){
                    emit({
                        url:this.pageInfo.resource
                    },{count: 1});
                }

            },
            reduce: function(k, vals){
                var total = 0;
                vals.forEach(function(v) {
                    total += v['count'];
                });
                return {count: total};
            },
            query: { 'site._id':mongoose.Types.ObjectId(siteId), '_id': {$gte: startDate,$lt: endDate}},
            out: 't_sitePageCount',
            verbose: true
        };
        Access.mapReduce(o, function(err, model, stats){
            if(!model){
                console.log(err);
                return res.send([]);
            }
            model
                .find()
                .sort('-value.count')
                .limit(50)
                .exec(function (err, results) {
                    res.send(results);
                });
        });
    });

};