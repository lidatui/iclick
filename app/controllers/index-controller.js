
module.exports = function(app){
    var User = mongoose.model('User');

    app.get('/', function(req, res){
        res.redirect('/manage/login');
    });
    app.get('/manage/login', function(req, res){


        res.render('login', {
            title : '投资一点通-登陆'
            ,description: 'login Description'
            ,author: 'miemiedev'
        });
    });
    app.post('/manage/login', function(req, res,next){
        User.findOne({loginName: req.body.loginName, loginPwd: req.body.loginPwd}, function(err, user){
            if(user){
                req.session.error = '';
                req.session.user = user;
                res.redirect('/manage/countCharts');
            }else{
                User.count().exec(function (err, count) {
                    if(count){
                        req.session.error = '验证失败，请重新登陆！';
                        res.redirect('/manage/login');
                    }else{
                        var user = new User({
                            loginName: 'admin',
                            loginPwd: 'admin',
                            locked: 0,
                            role:{
                                article: 1,
                                site: 1,
                                template: 1,
                                statistics: 1,
                                user: 1,
                                access: 1
                            }
                        });
                        user.save(function(err){
                            if(err) return next(err);
                            req.session.error = '账号已生成，请重新登陆！';
                            res.redirect('/manage/login');
                        });
                    }
                });

            }
        });

    });

    app.get('/manage/logout', function(req, res){
        req.session.destroy(function(){
            res.redirect('/');
        });
    });
};