module.exports = function(app){
    var DateUtils = require('../utils/DateUtils');
    var Access = mongoose.model('Access');

    function access(req, res, next){
        if(req.session.user){
            if (req.session.user.role.access) {
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

    app.get('/manage/access',access, function(req, res){
        res.render('manage/access', {
            title : '投资一点通-访问记录'
            ,description: 'access Description'
            ,author: 'miemiedev'
            ,l1: false,l2: false,l3: false,l4: false,l5: false,l6: true
        });
    });

    app.get('/manage/access/removeAll',access, function(req, res){
        Access.remove({}).exec(function(err,obj){
            res.render('manage/access', {
                title : '访问记录'
                ,description: 'access Description'
                ,author: 'miemiedev'
                ,l1: false,l2: false,l3: false,l4: false,l5: false,l6: true
            });
        });
    });

    app.get('/manage/access/list',access, function(req, res){
        var pageSize = req.query["pageSize"] > 0 ? req.query["pageSize"] : 10
            , pageNo = req.query["pageNo"] > 0 ? req.query["pageNo"] : 0;
        var now = DateUtils.now();
        var startDate = new Date(now.getFullYear(),now.getMonth(),now.getDate());
        var startId = DateUtils.objectId(startDate);

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
                            timestamp: access.timestamp,
                            ip: access.ip,
                            country: access.ipInfo ? access.ipInfo.country : '',
                            province: access.ipInfo ? access.ipInfo.province : '',
                            city: access.ipInfo ? access.ipInfo.city : '',
                            district: access.ipInfo ? access.ipInfo.district : '',
                            isp: access.ipInfo ? access.ipInfo.isp : '',
                            desc: access.ipInfo ? access.ipInfo.desc : '',
                            url: access.pageInfo ? access.pageInfo.resource : '',
                            siteName: access.site ? access.site.siteName : '',
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


}