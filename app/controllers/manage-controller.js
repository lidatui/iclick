
module.exports = function(app){
    var fs = require('fs');
    var handlebars = require("handlebars");
    var dateFormat = require('dateformat');
    var Article = mongoose.model('Article');
    var Template = mongoose.model('Template');
    var AccessControl = mongoose.model('AccessControl');
    var User = mongoose.model('User');

    app.get('/manage/article', function(req, res){
        res.render('manage/article', {
            title : '内容管理'
            ,description: 'article Description'
            ,author: 'miemiedev'
            ,l1: false,l2: true,l3: false,l4: false,l5: false
        });
    });

    app.post('/manage/article/save', function(req, res){
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

    app.get('/manage/article/remove', function(req, res){
        var id = req.query["_id"];
        Article.remove({ _id: id }).exec(function(err,obj){
            res.send('success');
        });
    });

    app.get('/manage/article/list', function(req, res){
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







    app.get('/manage/template', function(req, res){
        res.render('manage/template', {
            title : '模版'
            ,description: 'template Description'
            ,author: 'miemiedev'
            ,l1: false,l2: false,l3: false,l4: true,l5: false
        });
    });

    app.post('/manage/template/save', function(req, res){
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

    app.get('/manage/template/remove', function(req, res){
        Template.remove({ _id: req.query["_id"] }).exec(function(err,obj){
            res.send('success');
        });
    });

    app.get('/manage/template/list', function(req,res){
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






    app.get('/manage/accessControl', function(req, res){
        res.render('manage/accessControl', {
            title : '访问控制'
            ,description: 'accessControl Description'
            ,author: 'miemiedev'
            ,l1: false,l2: false,l3: true,l4: false,l5: false
        });
    });

    app.post('/manage/accessControl/save', function(req, res){
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

    app.get('/manage/accessControl/remove', function(req, res){
        AccessControl.remove({ _id: req.query["_id"] }).exec(function(err,obj){
            res.send('success');
        });
    });

    app.get('/manage/accessControl/list', function(req, res){

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



    app.get('/manage/statistics', function(req, res){
        res.render('manage/statistics', {
            title : '访问统计'
            ,description: 'statistics Description'
            ,author: 'miemiedev'
            ,l1: true,l2: false,l3: false,l4: false,l5: false
        });
    });

    app.get('/manage/user', function(req, res){
        res.render('manage/user', {
            title : '访问统计'
            ,description: 'user Description'
            ,author: 'miemiedev'
            ,l1: false,l2: false,l3: false,l4: false,l5: true
        });
    });

    app.post('/manage/user/save', function(req, res){
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

    app.get('/manage/user/remove', function(req, res){
        User.remove({ _id: req.query["_id"] }).exec(function(err,obj){
            res.send('success');
        });
    });

    app.get('/manage/user/list', function(req, res){
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
};