module.exports = function(app){
    var Article = mongoose.model('Article');

    function article(req, res, next){

        if(req.session.user){
            if (req.session.user.role.article) {
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

    app.get('/manage/article',article, function(req, res){
        res.render('manage/article', {
            title : '投资一点通-内容管理'
            ,description: 'article Description'
            ,author: 'miemiedev'
            ,l1: false,l2: true,l3: false,l4: false,l5: false,l6: false
        });
    });

    app.post('/manage/article/save',article, function(req, res){
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

    app.get('/manage/article/remove', article, function(req, res){
        var id = req.query["_id"];
        Article.remove({ _id: id }).exec(function(err,obj){
            res.send('success');
        });
    });

    app.get('/manage/article/list', article, function(req, res){
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
}