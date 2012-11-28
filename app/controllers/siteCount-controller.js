
module.exports = function(app){
    var DateUtils = require('../utils/DateUtils');
    var Access = mongoose.model('Access');
    var Site = mongoose.model('Site');


    function statistics(req, res, next){
        if(req.session.user){
            if (req.session.user.role.statistics) {
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


    app.get('/manage/siteCount', statistics, function(req, res){

        Site.find({}).sort('companyName').exec(function (err, sites) {
            res.render('manage/siteCount', {
                title : '投资一点通-访问统计'
                ,description: 'statistics Description'
                ,author: 'miemiedev'
                ,l1: true,l2: false,l3: false,l4: false,l5: false,l6: false
                ,sites: sites
            });
        });
    });



    app.get('/manage/statistics/siteCount',  function(req, res){
        var pageSize = req.query["pageSize"] > 0 ? req.query["pageSize"] : 10
            , pageNo = req.query["pageNo"] > 0 ? req.query["pageNo"] : 0;

        var siteId = req.query["siteId"];
        var startDate = new Date(req.query["startDate"]);
        var endDate = new Date ( req.query["endDate"] );
        endDate.setDate ( endDate.getDate() + 1 );
        startDate = DateUtils.objectId(startDate);
        endDate = DateUtils.objectId(endDate);

        var o = {
            map: function(){
                emit({
                    day:this.timestamp.substr(0,10),site: this.site._id
                },{count: 1});
            },
            reduce: function(k, vals){
                var total = 0;
                vals.forEach(function(v) {
                    total += v['count'];
                });
                return {count: total};
            },
            out: 't_siteCount',
            verbose: true
        };

        if(siteId){
            o.query = { 'site._id':mongoose.Types.ObjectId(siteId), '_id': {$gte: startDate,$lt: endDate}};
        }else{
            o.query = { '_id': {$gte: startDate,$lt: endDate}};
        }
        Access.mapReduce(o, function (err, model, stats){
            if(!model){
                return res.send({
                    items: []
                    , pageNo: pageNo
                    , pageSize: pageSize
                    , totalCount: 0
                });

            }
            Site.find({},function(err, sites){
                var siteIds = sites.map(function(site){
                   return site._id;
                });
                model
                    .find({'_id.site': {$in: siteIds}})
                    .limit(pageSize)
                    .skip(pageSize * pageNo)
                    .sort('-_id.day')
                    .exec(function (err, results) {

                        var items = [];
                        for(var j=0; j<results.length; j++){
                            for(var i=0; i<sites.length; i++){
                                if(results[j]._id['site'].toString() == sites[i]._id.toString()){
                                    var item = {
                                        siteId: sites[i]._id,
                                        day: results[j]._id['day'],
                                        companyName: sites[i].companyName,
                                        siteName: sites[i].siteName,
                                        count: results[j].value.count
                                    }
                                    items.push(item);
                                }
                            }
                        }
                        model.find({'_id.site': {$in: siteIds}},function(err, totals){
                            var total = {
                                count: 0,
                                total: true
                            };
                            for(var i=0; i<totals.length; i++){
                                total['count'] += totals[i].value.count
                            }
                            items.push(total);
                            model.count({'_id.site': {$in: siteIds}}).exec(function (err, count) {
                                res.send({
                                    items: items
                                    , pageNo: pageNo
                                    , pageSize: pageSize
                                    , totalCount: count
                                });
                            })
                        })
                    })
            });
        });
    });

    app.get('/manage/statistics/sitePage',  function(req, res){
        var siteId = req.query["siteId"];
        var startDate = new Date(req.query["date"]);
        var endDate = new Date (startDate);
        endDate.setDate ( endDate.getDate() + 1 );
        startDate = DateUtils.objectId(startDate);
        endDate = DateUtils.objectId(endDate);

        var o = {
            map: function(){
                if(this.pageInfo){
                    emit({
                        url:this.pageInfo.resource
                    },{count: 1});
                }

            },
            reduce: function(k, vals){
                var total = 0;
                vals.forEach(function(v) {
                    total += v['count'];
                });
                return {count: total};
            },
            query: { 'site._id':mongoose.Types.ObjectId(siteId), '_id': {$gte: startDate,$lt: endDate}},
            out: 't_sitePageCount',
            verbose: true
        };
        Access.mapReduce(o, function(err, model, stats){
            if(!model){
                return res.send([]);
            }
            model
                .find()
                .sort('-value.count')
                .limit(50)
                .exec(function (err, results) {
                    res.send(results);
                });
        });
    });



};