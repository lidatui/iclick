
module.exports = function(app){
    var Article = mongoose.model('Article');
    app.get('/redirect', function(req, res){
        var articleId = req.query['id'];
        Article.findById(articleId,function(err, article){
            if(!article){
                res.redirect('/error.html');
                return;
            }
            if(!article.qa){
                res.redirect(article.targetUrl);
                return ;
            }
            if(!req.query['i']){
                if(req.query['r']){
                    res.redirect(req.query['r']);
                }else{
                    res.redirect('/error.html');
                }
                return ;
            }

            var i = new Buffer(req.query['i'], 'base64').toString('utf8');
            console.dir(i);
            res.redirect(article.targetUrl+'?i='+req.query['i']);

        });
    });
};