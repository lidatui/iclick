
module.exports = function(app){

    var fs = require('fs');
    var handlebars = require("handlebars");
    var dateFormat = require('dateformat');
    var Article = mongoose.model('Article');
    var Template = mongoose.model('Template');
    var AccessControl = mongoose.model('AccessControl');
    var User = mongoose.model('User');
    var Access = mongoose.model('Access');
    var IpInfo = mongoose.model('IpInfo');
    var GisInfo = mongoose.model('GisInfo');

    function restrict(req, res, next) {
        if (req.session.user) {
            next();
        } else {
            req.session.error = '您的登陆状态已过期，请重新登录!';
            res.redirect('/login');
        }
    }

    function article(req, res, next){
        if (req.session.user.role.article) {
            next();
        } else {
            req.session.error = '无此权限!';
            res.redirect('/login');
        }
    }

    function template(req, res, next){
        if (req.session.user.role.template) {
            next();
        } else {
            req.session.error = '无此权限!';
            res.redirect('/login');
        }
    }

    function user(req, res, next){
        if (req.session.user.role.user) {
            next();
        } else {
            req.session.error = '无此权限!';
            res.redirect('/login');
        }
    }

    function accessControl(req, res, next){
        if (req.session.user.role.accessControl) {
            next();
        } else {
            req.session.error = '无此权限!';
            res.redirect('/login');
        }
    }

    function access(req, res, next){
        if (req.session.user.role.access) {
            next();
        } else {
            req.session.error = '无此权限!';
            res.redirect('/login');
        }
    }

    function statistics(req, res, next){
        if (req.session.user.role.statistics) {
            next();
        } else {
            req.session.error = '无此权限!';
            res.redirect('/login');
        }
    }



    app.get('/manage/article', restrict, article, function(req, res){
        res.render('manage/article', {
            title : '内容管理'
            ,description: 'article Description'
            ,author: 'miemiedev'
            ,l1: false,l2: true,l3: false,l4: false,l5: false,l6: false
        });
    });

    app.post('/manage/article/save', restrict, article, function(req, res){
        Article.findById(req.body._id,function(err,article){
            if(!article){
                article = new Article(req.body);
            }else{
                article.set(req.body);
            }
            article.save(function(err){
                res.send('success');
            });
        });
    });

    app.get('/manage/article/remove', restrict, article, function(req, res){
        var id = req.query["_id"];
        Article.remove({ _id: id }).exec(function(err,obj){
            res.send('success');
        });
    });

    app.get('/manage/article/list', restrict, article, function(req, res){
        var pageSize = req.query["pageSize"] > 0 ? req.query["pageSize"] : 10
            , pageNo = req.query["pageNo"] > 0 ? req.query["pageNo"] : 0;

        Article
            .find({})
            .limit(pageSize)
            .skip(pageSize * pageNo)
            .sort('-_id')
            .exec(function (err, articles) {
                Article.count().exec(function (err, count) {
                    res.send({
                        items: articles
                        , pageNo: pageNo
                        , pageSize: pageSize
                        , totalCount: count
                    });
                })
            })
    });







    app.get('/manage/template', restrict, template, function(req, res){
        res.render('manage/template', {
            title : '模版'
            ,description: 'template Description'
            ,author: 'miemiedev'
            ,l1: false,l2: false,l3: false,l4: true,l5: false,l6: false
        });
    });

    app.post('/manage/template/save', restrict, template, function(req, res){
        Template.findById(req.body._id,function(err,tpl){
            if(!tpl){
                tpl = new Template(req.body);
            }else{
                tpl.set(req.body);
            }
            tpl.save(function(err){
                res.send('success');
            });
        });
    });

    app.get('/manage/template/remove', restrict, template, function(req, res){
        Template.remove({ _id: req.query["_id"] }).exec(function(err,obj){
            res.send('success');
        });
    });

    app.get('/manage/template/list', restrict, template, function(req,res){
        Article
            .findOne({})
            .sort('-_id')
            .exec(function (err, article) {
                article = article.toObject();
                article.pubDate = dateFormat(article.pubDate,'mm-dd');
                Template.find({}, function(err, tpls){
                    tpls = tpls.map(function (tpl) {
                        var item = tpl.toObject();
                        var path = __dirname.substr(0,__dirname.length-15) + 'static/tpl/'+item.path;
                        console.log(path);
                        var tplContent = fs.readFileSync(path,'utf-8');
                        var template = handlebars.compile(tplContent);
                        item.preView = template(article);
                        return item;
                    });
                    res.send(tpls);
                });
            });
    });






    app.get('/manage/accessControl', restrict, accessControl, function(req, res){
        res.render('manage/accessControl', {
            title : '访问控制'
            ,description: 'accessControl Description'
            ,author: 'miemiedev'
            ,l1: false,l2: false,l3: true,l4: false,l5: false,l6: false
        });
    });

    app.post('/manage/accessControl/save', restrict, accessControl, function(req, res){
        AccessControl.findById(req.body._id,function(err,ac){
            if(!ac){
                ac = new AccessControl(req.body);
            }else{
                ac.set(req.body);
            }
            ac.save(function(err){
                res.send('success');
            });
        });
    });

    app.get('/manage/accessControl/remove', restrict, accessControl, function(req, res){
        AccessControl.remove({ _id: req.query["_id"] }).exec(function(err,obj){
            res.send('success');
        });
    });

    app.get('/manage/accessControl/list', restrict, accessControl, function(req, res){

        var pageSize = req.query["pageSize"] > 0 ? req.query["pageSize"] : 10
            , pageNo = req.query["pageNo"] > 0 ? req.query["pageNo"] : 0;

        AccessControl
            .find({})
            .limit(pageSize)
            .skip(pageSize * pageNo)
            .sort('-_id')
            .exec(function (err, acs) {
                Template.find({}, function(err, tpls){

                    acs = acs.map(function(ac){
                        var item = ac.toObject();
                        for(var i=0; i< tpls.length; i++){
                            if(item.template.toString() === tpls[i]._id.toString()){
                                item.templateName = tpls[i].name;
                                return item;
                            }
                        }
                    });
                    AccessControl.count().exec(function (err, count) {
                        res.send({
                            items: acs
                            , pageNo: pageNo
                            , totalCount: count
                        });
                    })
                });
            })
    });

    app.get('/manage/statistics', restrict, statistics, function(req, res){

        AccessControl.find({}).sort('companyName').exec(function (err, acs) {
            res.render('manage/statistics', {
                title : '访问统计'
                ,description: 'statistics Description'
                ,author: 'miemiedev'
                ,l1: true,l2: false,l3: false,l4: false,l5: false,l6: false
                ,sites: acs
            });
        });



    });

    app.get('/manage/statistics/dayCount', restrict, statistics, function(req, res){
        var o = {};
        o.map = function () {
            var d = this._id.getTimestamp();
            var month = d.getMonth() < 10 ? '0'+ d.getMonth(): d.getMonth();
            var date = d.getDate() < 10 ? '0'+ d.getDate(): d.getDate();
            var result = d.getFullYear()+'-'+ month +'-'+ date;
            emit(result, 1);
        }
        o.reduce = function (k, vals) {
            var total = 0;
            for ( var i=0; i<vals.length; i++ )
                total += vals[i];
            return total;
        }
        o.out = 'dayCount';
        o.verbose = true;
        Access.mapReduce(o, function (err, model, stats) {
            model.count().exec(function (err, count) {
                count = count < 10 ? 10 : count;
                model.find({})
                    .limit(10)
                    .skip(count - 10)
                    .sort('_id')
                    .exec(function (err, results) {
                        var date = [];
                        var data = [];
                        for(var i=0; i< results.length; i++){
                            date.push(results[i]._id);
                            data.push(results[i].value);
                        }
                        res.send({
                            categories: date
                            , data: data
                        });
                    });
            });

        })
    });

    app.get('/manage/statistics/gis', restrict, statistics, function(req, res){
        var startDate = new Date(req.query["date"]);
        var acId = req.query["siteId"];
        var level = req.query["level"];
        var endDate = new Date ( startDate );
        endDate.setDate ( startDate.getDate() + 1 );
        startDate = objectIdWithTimestamp(startDate);
        endDate = objectIdWithTimestamp(endDate);
        var o = {
            map: function(){
                if(this.ipInfo && this.ipInfo.province){
                    emit(this.ipInfo.province,1);
                }
            },
            reduce: function(k, vals){
                var total = 0;
                for ( var i=0; i<vals.length; i++ )
                    total += vals[i];
                return total;
            },
            query: { 'accessControl._id': mongoose.Types.ObjectId(acId), '_id': {$gte: startDate,$lt: endDate}}
        };

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


    app.get('/manage/statistics/companyCount', restrict, statistics, function(req, res){
        var pageSize = req.query["pageSize"] > 0 ? req.query["pageSize"] : 10
            , pageNo = req.query["pageNo"] > 0 ? req.query["pageNo"] : 0;

        var o = {
            map: function(){
                var d = this._id.getTimestamp();
                var month = d.getMonth() < 10 ? '0'+ d.getMonth(): d.getMonth();
                var date = d.getDate() < 10 ? '0'+ d.getDate(): d.getDate();
                var day = d.getFullYear()+'-'+ month +'-'+ date;
                emit({
                    day:day, host: this.host
                },{count: 1});
            },
            reduce: function(k, vals){
                var total = 0;
                vals.forEach(function(v) {
                    total += v['count'];
                });
                return {count: total};
            },
            out: 'companyCount',
            verbose: true
        };
        Access.mapReduce(o, function (err, model, stats){
            model
                .find({})
                .limit(pageSize)
                .skip(pageSize * pageNo)
                .sort('-_id.day')
                .exec(function (err, results) {
                    AccessControl.find({},function(err, acs){
                        var items = [];
                        for(var i=0; i<acs.length; i++){
                            for(var j=0; j<results.length; j++){
                                if(results[j]._id['host'].indexOf(acs[i].host) != -1){
                                    var item = {
                                        day: results[j]._id['day'],
                                        host: results[j]._id['host'],
                                        companyName: acs[i].companyName,
                                        count: results[j].value.count
                                    }
                                    items.push(item);
                                }
                            }
                        }
                        model.count().exec(function (err, count) {
                            res.send({
                                items: items
                                , pageNo: pageNo
                                , pageSize: pageSize
                                , totalCount: count
                            });
                        })
                    });
                })



        });
    });

    app.get('/manage/user', restrict, user, function(req, res){
        res.render('manage/user', {
            title : '访问统计'
            ,description: 'user Description'
            ,author: 'miemiedev'
            ,l1: false,l2: false,l3: false,l4: false,l5: true,l6: false
        });
    });

    app.post('/manage/user/save', restrict, user, function(req, res){
        User.findById(req.body._id,function(err,user){
            if(!user){
                user = new User(req.body);
            }else{
                user.set(req.body);
            }
            user.save(function(err){
                res.send('success');
            });
        });
    });

    app.get('/manage/user/remove', restrict, user, function(req, res){
        User.remove({ _id: req.query["_id"] }).exec(function(err,obj){
            res.send('success');
        });
    });

    app.get('/manage/user/list', restrict, user, function(req, res){
        var pageSize = req.query["pageSize"] > 0 ? req.query["pageSize"] : 10
            , pageNo = req.query["pageNo"] > 0 ? req.query["pageNo"] : 0;

        User
            .find({})
            .limit(pageSize)
            .skip(pageSize * pageNo)
            .sort('-_id')
            .exec(function (err, users) {
                User.count().exec(function (err, count) {
                    res.send({
                        items: users
                        , pageNo: pageNo
                        , pageSize: pageSize
                        , totalCount: count
                    });
                })
            })
    });

    app.get('/manage/access',restrict,access, function(req, res){
        res.render('manage/access', {
            title : '访问记录'
            ,description: 'access Description'
            ,author: 'miemiedev'
            ,l1: false,l2: false,l3: false,l4: false,l5: false,l6: true
        });
    });

//    app.get('/manage/access/removeAll',restrict,access, function(req, res){
//        Access.remove({}).exec(function(err,obj){
//            res.render('manage/access', {
//                title : '访问记录'
//                ,description: 'access Description'
//                ,author: 'miemiedev'
//                ,l1: false,l2: false,l3: false,l4: false,l5: false,l6: true
//            });
//        });
//    });

    app.get('/manage/access/list',restrict,access, function(req, res){
        var pageSize = req.query["pageSize"] > 0 ? req.query["pageSize"] : 10
            , pageNo = req.query["pageNo"] > 0 ? req.query["pageNo"] : 0;
        Access
            .find({})
            .limit(pageSize)
            .skip(pageSize * pageNo)
            .sort('-_id')
            .exec(function (err, accesses) {

                Access.count().exec(function (err, count) {
                        res.send({
                            items: accesses
                            , pageNo: pageNo
                            , totalCount: count
                            , pageSize: pageSize
                        });
                    })

            })
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
                    res.setEncoding('utf8');
                    res.on('data', function (data) {
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

    function objectIdWithTimestamp(timestamp)
    {
        // Convert string date to Date object (otherwise assume timestamp is a date)
        if (typeof(timestamp) == 'string') {
            timestamp = new Date(timestamp);
        }

        // Convert date object to hex seconds since Unix epoch
        var hexSeconds = Math.floor(timestamp/1000).toString(16);

        // Create an ObjectId with that hex timestamp
        var constructedObjectId = mongoose.Types.ObjectId(hexSeconds + "0000000000000000");

        return constructedObjectId
    }
};