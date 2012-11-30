module.exports = function(app){

    var DateUtils = require('../utils/DateUtils');
    var Access = mongoose.model('Access');
    var Site = mongoose.model('Site');
    var GisHourCount = mongoose.model('GisHourCount');
    var GisDayCount = mongoose.model('GisDayCount');
    var GisInfo = mongoose.model('GisInfo');

    var statistics = function(req, res, next){
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

    var reduceFunc = function(k, vals){
        var total = 0;
        for ( var i=0; i<vals.length; i++ )
            total += vals[i];
        return total;
    }


    app.get('/manage/maps', statistics, function(req, res){

        Site.find({}).sort('companyName').exec(function (err, sites) {
            res.render('manage/maps', {
                title : '投资一点通-访问统计'
                ,description: 'statistics Description'
                ,author: 'miemiedev'
                ,l1: true,l2: false,l3: false,l4: false,l5: false,l6: false
                ,sites: sites
            });
        });
    });

    app.get('/manage/statistics/gisCount', function(req, res){
        var siteId = req.query["siteId"];
        var level = req.query["level"];
        var startDate = new Date(req.query["startDate"]);
        var endDate = new Date ( req.query["endDate"] );

        //临时集合名
        var tempColName = 't_gisCount_'+ new Date().getTime();

        var wait = 1;
        var callback = function(err, model, stats){
            if(!model){
                console.log(err);
                return res.send({
                    items: []
                });
            }
            model.find({},function(err, results){
                var waiting = results.length;
                if(!results || results.length === 0){
                    res.send({items: []});
                    mongoose.connection.collections[tempColName].drop(function(err){
                        //console.log(tempColName +'collection dropped');
                    });
                }
                for(var i=0; i<results.length; i++){
                    (function(t){
                        findCoordinate(results[t]._id,level,function(err,c){
                            results[t].gisInfo = c;
                            if(--waiting == 0){
                                res.send({items: results});
                                mongoose.connection.collections[tempColName].drop(function(err){
                                    //console.log(tempColName +'collection dropped');
                                });
                            }
                        });
                    })(i);
                }
            });

        };

        //如果结束日期是今天就查其他表
        if(DateUtils.format(endDate,'yyyy-mm-dd') === DateUtils.format(new Date(),'yyyy-mm-dd')){
            wait = 3
        }else{
            endDate.setDate(endDate.getDate() +1);
        }

        //区域分组
        var map = function(){
            emit(this.country,this.count);
        };
        if(level == '省'){
            map = function(){
                emit(this.province,this.count);
            }
        }
        if(level == '市'){
            map = function(){
                emit(this.city,this.count);
            }
        }

        //取天表
        var o = {
            map: map,
            reduce: reduceFunc,
            out: tempColName,
            verbose: true,
            query: siteId ? {'site':siteId, 'dataTime': {$gte: startDate,$lt: endDate}}
                : {'dataTime': {$gte: startDate,$lt: endDate}}

        };
        GisDayCount.mapReduce(o,function(err, model, stats){
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
            map: map,
            reduce: reduceFunc,
            out: {reduce: tempColName},//增量放入
            verbose: true,
            query: siteId ? {'site':siteId, 'dataTime': {$gte: startDate,$lt: endDate}}
                : {'dataTime': {$gte: startDate,$lt: endDate}}

        };
        GisHourCount.mapReduce(o,function(err, model, stats){
            if(--wait == 0){
                callback(err,model ,stats);
            }
        });

        //实时查询
        var accessMap = function(){
            if(this.ipInfo && this.ipInfo.country){
                emit(this.ipInfo.country,1);
            }
        }
        if(level == '省'){
            accessMap = function(){
                if(this.ipInfo && this.ipInfo.province){
                    emit(this.ipInfo.province,1);
                }
            }
        }

        if(level == '市'){
            accessMap = function(){
                if(this.ipInfo && this.ipInfo.city){
                    emit(this.ipInfo.city,1);
                }
            }
        }
        var o = {
            map: accessMap,
            reduce: reduceFunc,
            out: {reduce: tempColName},//增量放入
            verbose: true,
            query: siteId ? { 'site._id':mongoose.Types.ObjectId(siteId),  '_id': {$gte: DateUtils.objectId(endDate)}}
                : { '_id': {$gte: DateUtils.objectId(endDate)}}
        };
        Access.mapReduce(o,function(err, model, stats){
            if(--wait == 0){
                callback(err, model, stats);
            }
        });

    });

    var http = require('http');
    function findCoordinate(name, level, callback){
        GisInfo.findOne({name:name,level:level}, function(err, gi){
            if(gi){
                callback(null, gi);
            }else{
                var options = {
                    host: 'maps.google.com',
                    port: 80,
                    path: '/maps/geo?q='+name,
                    method: 'POST'
                };
                http.request(options,function(res) {
                    bodyParser(res, function(data){
                        try{
                            var resultData = JSON.parse(data);
                            var gisInfo = null;
                            if(resultData && resultData.Placemark && resultData.Placemark.length != 0 && resultData.Placemark[0].Point && resultData.Placemark[0].Point.coordinates){
                                var coordinates = resultData.Placemark[0].Point.coordinates;
                                gisInfo = new GisInfo({
                                    name: name,
                                    lng: coordinates[0],
                                    lat: coordinates[1],
                                    level: level
                                });
                                gisInfo.save(function(err){
                                    callback(null, gisInfo);
                                });

                            }else{
                                callback(null, gisInfo)
                            }

                        }catch(err){
                            console.log('problem with request: ' + err.message);
                            callback(err, null);
                        }
                    });
                }).on('error', function(err) {
                        console.log('problem with request: ' + err.message);
                        callback(err, null);
                    }).end();
            }
        });

    }

    function bodyParser(res, next) {
        var b = '';
        res.setEncoding('utf-8');
        res.on('data', function(data) {
            b += data;
        });
        res.on('end', function() {res
            next(b);
        });
    };
}