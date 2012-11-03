
module.exports = function(app){
    var Article = mongoose.model('Article');


    app.get('/manage/article', function(req, res){
        res.render('manage/article', {
            title : '内容管理'
            ,description: 'article Description'
            ,author: 'miemiedev'
            ,message: 'hello world!'
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

    app.get('/manage/articles', function(req, res){
        var pageSize = req.query["pageSize"] > 0 ? req.query["pageSize"] : 10
            , pageNo = req.query["pageNo"] > 0 ? req.query["pageNo"] - 1 : 0;

        Article
            .find({})
            .limit(pageSize)
            .skip(pageSize * pageNo)
            .sort('-_id')
            .exec(function (err, articles) {
                articles = articles.map(function(article){
                    var newObj = article.toObject();
                    newObj.rowNum = pageNo * pageSize +articles.indexOf(article)+1;
                    return  newObj;
                });
                Article.count().exec(function (err, count) {
                    res.send({
                        items: articles
                        , pageNo: pageNo+1
                        , pageSize: pageSize
                        , totalCount: count
                    });
                })
            })
    });
};