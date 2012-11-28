module.exports = function(app){
    var Site = mongoose.model('Site');

    function site(req, res, next){

        if(req.session.user){
            if (req.session.user.role.site) {
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

    app.get('/manage/site', site, function(req, res){
        res.render('manage/site', {
            title : '投资一点通-生成链接'
            ,description: 'site Description'
            ,author: 'miemiedev'
            ,l1: false,l2: false,l3: true,l4: false,l5: false,l6: false
        });
    });

    app.post('/manage/site/save', site, function(req, res){
        Site.findById(req.body._id,function(err,site){
            if(!site){
                site = new Site(req.body);
            }else{
                site.set(req.body);
            }
            site.save(function(err){
                res.send('success');
            });
        });
    });

    app.get('/manage/site/remove', site, function(req, res){
        Site.remove({ _id: req.query["_id"] }).exec(function(err,obj){
            res.send('success');
        });
    });

    app.get('/manage/site/list', site, function(req, res){

        var pageSize = req.query["pageSize"] > 0 ? req.query["pageSize"] : 10
            , pageNo = req.query["pageNo"] > 0 ? req.query["pageNo"] : 0;

        Site
            .find({})
            .limit(pageSize)
            .skip(pageSize * pageNo)
            .sort('-_id')
            .populate('template')
            .exec(function (err, acs) {
                Site.count().exec(function (err, count) {
                    res.send({
                        items: acs
                        , pageNo: pageNo
                        , totalCount: count
                    });
                })
            })
    });
}