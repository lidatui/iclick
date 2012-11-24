
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
            title : '投资一点通-内容管理'
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
            title : '投资一点通-模版'
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
            title : '投资一点通-生成链接'
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
                title : '投资一点通-访问统计'
                ,description: 'statistics Description'
                ,author: 'miemiedev'
                ,l1: true,l2: false,l3: false,l4: false,l5: false,l6: false
                ,sites: acs
            });
        });



    });

    app.get('/manage/statistics/dayCount', function(req, res){
        var startDate = new Date();
        startDate.setMonth(startDate.getMonth() -1);
        var endDate = new Date ();
        endDate.setDate ( endDate.getDate() + 1 );
        startDate = objectIdWithTimestamp(startDate);
        endDate = objectIdWithTimestamp(endDate);

        AccessControl.find({},function(err, acs){
            var acIds = acs.map(function(ac){
                return ac._id;
            });
            var o = {};
            o.map = function () {
                var d = this._id.getTimestamp();
                var month = d.getMonth()+1 < 10 ? '0'+ d.getMonth()+1: d.getMonth()+1;
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
            o.query = { 'accessControl._id':{$in: acIds},'_id': {$gte: startDate,$lt: endDate}};
            Access.mapReduce(o, function (err, results) {
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
            });
        });
    });

    app.get('/manage/statistics/daySiteCount', function(req, res){
        var startDate = new Date(req.query["date"]);
        var endDate = new Date (startDate);
        endDate.setDate ( endDate.getDate() + 1 );
        startDate = objectIdWithTimestamp(startDate);
        endDate = objectIdWithTimestamp(endDate);
        AccessControl.find({},function(err, acs){
            var acIds = acs.map(function(ac){
                return ac._id;
            });
            var o = {
                map: function(){
                    if(this.accessControl){
                        emit(this.accessControl.siteName,1);
                    }
                },
                reduce: function(k, vals){
                    var total = 0;
                    for ( var i=0; i<vals.length; i++ )
                        total += vals[i];
                    return total;
                },
                query: {'accessControl._id':{$in: acIds}, '_id': {$gte: startDate,$lt: endDate}}
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

    app.get('/manage/statistics/gis', function(req, res){
        var siteId = req.query["siteId"];
        var level = req.query["level"];
        var startDate = new Date(req.query["startDate"]);
        var endDate = new Date ( req.query["endDate"] );
        endDate.setDate ( endDate.getDate() + 1 );
        startDate = objectIdWithTimestamp(startDate);
        endDate = objectIdWithTimestamp(endDate);
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
            query: { 'accessControl._id':mongoose.Types.ObjectId(siteId), '_id': {$gte: startDate,$lt: endDate}}
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


    app.get('/manage/statistics/companyCount',  function(req, res){
        var pageSize = req.query["pageSize"] > 0 ? req.query["pageSize"] : 10
            , pageNo = req.query["pageNo"] > 0 ? req.query["pageNo"] : 0;

        var siteId = req.query["siteId"];
        var startDate = new Date(req.query["startDate"]);
        var endDate = new Date ( req.query["endDate"] );
        endDate.setDate ( endDate.getDate() + 1 );
        startDate = objectIdWithTimestamp(startDate);
        endDate = objectIdWithTimestamp(endDate);

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
            out: 'companyCount',
            verbose: true
        };

        if(siteId){
            o.query = { 'accessControl._id':mongoose.Types.ObjectId(siteId), '_id': {$gte: startDate,$lt: endDate}};
        }else{
            o.query = { '_id': {$gte: startDate,$lt: endDate}};
        }
        Access.mapReduce(o, function (err, model, stats){
            AccessControl.find({},function(err, acs){
                var acIds = acs.map(function(ac){
                   return ac._id;
                });
                model
                    .find({'_id.acId': {$in: acIds}})
                    .limit(pageSize)
                    .skip(pageSize * pageNo)
                    .sort('-_id.day')
                    .exec(function (err, results) {

                        var items = [];
                        for(var j=0; j<results.length; j++){
                            for(var i=0; i<acs.length; i++){
                                if(results[j]._id['acId'].toString() == acs[i]._id.toString()){
                                    var item = {
                                        acId: acs[i]._id,
                                        day: results[j]._id['day'],
                                        companyName: acs[i].companyName,
                                        siteName: acs[i].siteName,
                                        count: results[j].value.count
                                    }
                                    items.push(item);
                                }
                            }
                        }
                        model.find({'_id.acId': {$in: acIds}},function(err, totals){
                            var total = {
                                count: 0,
                                total: true
                            };
                            for(var i=0; i<totals.length; i++){
                                total['count'] += totals[i].value.count
                            }
                            items.push(total);
                            model.count({'_id.acId': {$in: acIds}}).exec(function (err, count) {
                                res.send({
                                    items: items
                                    , pageNo: pageNo
                                    , pageSize: pageSize
                                    , totalCount: count
                                });
                            })
                        })
                    })
            });



        });
    });

    app.get('/manage/statistics/companyPages',  function(req, res){
        var siteId = req.query["siteId"];
        var startDate = new Date(req.query["date"]);
        var endDate = new Date (startDate);
        endDate.setDate ( endDate.getDate() + 1 );
        startDate = objectIdWithTimestamp(startDate);
        endDate = objectIdWithTimestamp(endDate);

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
            query: { 'accessControl._id':mongoose.Types.ObjectId(siteId), '_id': {$gte: startDate,$lt: endDate}},
            out: 'companyCount',
            verbose: true
        };
        Access.mapReduce(o, function(err, model, stats){
            model
                .find()
                .sort('-value.count')
                .limit(50)
                .exec(function (err, results) {
                    res.send(results);
                });
        });
    });

    app.get('/manage/user', restrict, user, function(req, res){
        res.render('manage/user', {
            title : '投资一点通-用户管理'
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
            title : '投资一点通-访问记录'
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

        var startDate = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
        var startId = objectIdWithTimestamp(startDate);

        Access
            .find({'_id': {$gte: startId}})
            .limit(pageSize)
            .skip(pageSize * pageNo)
            .sort('-_id')
            .exec(function (err, accesses) {

                Access.count({'_id': {$gte: startId}}).exec(function (err, count) {

                    var results = accesses.map(function(access){
                       return {
                           id: access._id,
                           ip: access.ip,
                           country: access.ipInfo ? access.ipInfo.country : '',
                           province: access.ipInfo ? access.ipInfo.province : '',
                           city: access.ipInfo ? access.ipInfo.city : '',
                           district: access.ipInfo ? access.ipInfo.district : '',
                           isp: access.ipInfo ? access.ipInfo.isp : '',
                           desc: access.ipInfo ? access.ipInfo.desc : '',
                           url: access.pageInfo ? access.pageInfo.resource : '',
                           siteName: access.accessControl ? access.accessControl.siteName : '',
                           os: access.agent ? access.agent.os : access.os,
                           browser: access.agent ? access.agent.family+' '+ access.agent.major+'.'+access.agent.minor+'.'+access.agent.patch : access.browser
                       } ;
                    });

                    res.send({
                        items: results
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