module.exports = function(app){
    var User = mongoose.model('User');

    function user(req, res, next){
        if(req.session.user){
            if (req.session.user.role.user) {
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

    app.get('/manage/user', user, function(req, res){
        res.render('manage/user', {
            title : '投资一点通-用户管理'
            ,description: 'user Description'
            ,author: 'miemiedev'
            ,l1: false,l2: false,l3: false,l4: false,l5: true,l6: false
        });
    });

    app.post('/manage/user/save', user, function(req, res){
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

    app.get('/manage/user/remove', user, function(req, res){
        User.remove({ _id: req.query["_id"] }).exec(function(err,obj){
            res.send('success');
        });
    });

    app.get('/manage/user/list', user, function(req, res){
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
}