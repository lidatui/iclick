
module.exports = function(app){
    var User = mongoose.model('User');

    app.get('/', function(req, res){
        res.redirect('/login');
    });
    app.get('/login', function(req, res){

        console.log(req.session);

        res.render('login', {
            title : '登陆'
            ,description: 'login Description'
            ,author: 'miemiedev'
        });
    });
    app.post('/login', function(req, res){
        console.log(req.body);
        User.findOne({loginName: req.body.loginName, loginPwd: req.body.loginPwd}, function(err, user){
            if(user){
                req.session.error = '';
                req.session.user = user;
                res.redirect('/manage/statistics');
            }else{
                req.session.error = '验证失败，请重新登陆！';
                res.redirect('login');
            }
        });

    });

    app.get('/logout', function(req, res){
        req.session.destroy(function(){
            res.redirect('/');
        });
    });
};