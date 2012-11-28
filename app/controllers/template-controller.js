module.exports = function(app){
    var fs = require('fs');
    var handlebars = require("handlebars");
    var DateUtils = require('../utils/DateUtils');
    var Template = mongoose.model('Template');
    var Article = mongoose.model('Article');
    function template(req, res, next){

        if(req.session.user){
            if (req.session.user.role.template) {
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

    app.get('/manage/template', template, function(req, res){
        res.render('manage/template', {
            title : '投资一点通-模版'
            ,description: 'template Description'
            ,author: 'miemiedev'
            ,l1: false,l2: false,l3: false,l4: true,l5: false,l6: false
        });
    });

    app.post('/manage/template/save', template, function(req, res){
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

    app.get('/manage/template/remove', template, function(req, res){
        Template.remove({ _id: req.query["_id"] }).exec(function(err,obj){
            res.send('success');
        });
    });

    app.get('/manage/template/list', template, function(req,res){
        Article
            .findOne({})
            .sort('-_id')
            .exec(function (err, article) {
                if(!article){
                    res.send([]);
                    return;
                }
                article = article.toObject();
                article.pubDate = DateUtils.format(article.pubDate,'mm-dd');
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
}
