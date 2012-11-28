module.exports = function(app){

    var DateUtils = require('../utils/DateUtils');
    var Access = mongoose.model('Access');
    var Site = mongoose.model('Site');

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

    app.get('/manage/statistics/gis', function(req, res){
        var siteId = req.query["siteId"];
        var level = req.query["level"];
        var startDate = new Date(req.query["startDate"]);
        var endDate = new Date ( req.query["endDate"] );
        endDate.setDate ( endDate.getDate() + 1 );
        startDate = DateUtils.objectId(startDate);
        endDate = DateUtils.objectId(endDate);
        var o = {
            map: function(){
                if(this.ipInfo && this.ipInfo.country){
                    emit(this.ipInfo.country,1);
                }
            },
            reduce: function(k, vals){
                var total = 0;
                for ( var i=0; i<vals.length; i++ )
                    total += vals[i];
                return total;
            },
            query: { 'site._id':mongoose.Types.ObjectId(siteId), '_id': {$gte: startDate,$lt: endDate}}
        };

        if(level == '省'){
            o.map = function(){
                if(this.ipInfo && this.ipInfo.province){
                    emit(this.ipInfo.province,1);
                }
            }
        }

        if(level == '市'){
            o.map = function(){
                if(this.ipInfo && this.ipInfo.city){
                    emit(this.ipInfo.city,1);
                }
            }
        }

        Access.mapReduce(o, function(err, results){
            var waiting = results.length;
            if(!results || results.length === 0){
                res.send({items: results});
            }
            for(var i=0; i<results.length; i++){
                (function(t){
                    findCoordinate(results[t]._id,level,function(err,c){
                        results[t].gisInfo = c;
                        if(--waiting == 0){
                            res.send({items: results});
                        }
                    });
                })(i);
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