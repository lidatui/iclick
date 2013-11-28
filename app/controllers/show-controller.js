
module.exports = function(app){
    var DateUtils = require('../utils/DateUtils');
    var http = require('http');
    var handlebars = require("handlebars");
    var dateFormat = require('dateformat');
    var useragent = require('useragent');
    var fs = require('fs');
    var url = require('url');

    var IpInfo = mongoose.model('IpInfo');
    var Access = mongoose.model('Access');
    var Article = mongoose.model('Article');
    var Site = mongoose.model('Site');
    app.get('/show', function(req, res, next){
        var access = new Access();
        req.query['access'] = access;
        //访问权限
        if(!req.query['h']){
            res.jsonp({ result: "<div style='display: none;'>您没有权限访问!</div>" });
            return;
        }
        access.pageInfo = req.query['h'];
        access.timestamp = formatTime(DateUtils.now());
        access.host = getHostname(access.pageInfo.resource);
        Site
            .findById(access.pageInfo.siteId)
            .populate('template')
            .exec(function (err, site) {
                if (err) return next(err);
                if(site){
                    req.query['template'] = site.template;
                    access.site = site;
                    next();
                }else{
                    res.jsonp({ result: "<div style='display: none;'>您没有权限访问!</div>" });
                }
            });

    },function(req, res, next){
       //查找ip位置
        var access = req.query['access'];

        var  ipAddress = req.headers['x-forwarded-for'] ;
        if(!ipAddress){
            ipAddress = req.connection.remoteAddress;
        }

        if(ipAddress == '127.0.0.1' || !ipAddress){
            return next();
        }

        access.ip = ipAddress;
        var ipNum = dot2num(ipAddress);
        IpInfo.findOne({startNum:{ $lte: ipNum},endNum:{$gte: ipNum}}, function(err, ipInfo){
            if(err) return next(err);
            if(ipInfo){
                access.ipInfo = ipInfo;
                next();
            }else{
                var options = {
                    host: 'int.dpool.sina.com.cn',
                    port: 80,
                    path: '/iplookup/iplookup.php?format=json&ip='+ipAddress,
                    method: 'POST'
                };
                http.request(options,function(reqLookup) {
                    bodyParser(reqLookup,function(ipData){
                        try{
                            var ipResult = JSON.parse(ipData);
                            //console.log('ip lookup: %s',ipData);
                            if(ipResult.ret != -1){
                                var newIpInfo = new IpInfo(ipResult);
                                newIpInfo.startNum = dot2num(ipResult.start);
                                newIpInfo.endNum = dot2num(ipResult.end);
                                newIpInfo.save(function(err){
                                    if(err) return next(err);
                                    access.ipInfo = newIpInfo;
                                    next();
                                });
                            }else{
                                next();
                            }
                        }catch (e) {
                            console.log('problem with request: ' + e);
                            next(e);
                        }

                    })
                }).on('error', function(err) {
                    console.log('problem with request: ' + err.message);
                    next(err);
                }).end();
            }
        });
    },function(req, res, next){
        //获得操作系统和浏览器
        var access = req.query['access'];
        var agent = useragent.parse(req.headers['user-agent']);
        access.agent = agent;//'{"family":"Chrome","major":"15","minor":"0","patch":"874","os":"Mac OS X"}'
        next();
    },function(req, res, next){
        //存储
        //console.log('access: %s',req.query['access']);
        var access = req.query['access'];
        access.save(function(err){
            if(err) return next(err);
            next();
        });
    },function(req, res){
        //渲染模版，返回结果
        var selectedTpl = req.query['template'];
        var tpl = fs.readFileSync(__dirname.substr(0,__dirname.length-15) + 'static/tpl/'+selectedTpl.path,'utf-8');
        var template = handlebars.compile(tpl);
        Article
            .findOne({})
            .sort('-_id')
            .exec(function (err, article) {
                if(article){
                    var model = article.toObject();
                    model.basePath = 'http://127.0.0.1:3000';
                    model.pubDate = dateFormat(model.pubDate,'mm-dd');
                    var tu = model.basePath + '/redirect?id='+model._id;
                    if(article.qa){
                        if(req.query['i']){
                            tu += "&i="+new Buffer(new Buffer(req.query['i']).toString('ascii')).toString('base64');
                        }
                        if(req.query['r']){
                            tu += "&r="+req.query['r'];
                        }
                    }
                    model.targetUrl =tu;
                    var result = template(model);
                    res.jsonp({ result: result });
                }else{
                    res.jsonp({ result: '无内容' });
                }
            });

    });

    //IP转数字
    function dot2num(dot) {
        var parts = dot.split(".");
        var res = 0;

        res += (parseInt(parts[0], 10) << 24) >>> 0;
        res += (parseInt(parts[1], 10) << 16) >>> 0;
        res += (parseInt(parts[2], 10) << 8) >>> 0;
        res += parseInt(parts[3], 10) >>> 0;

        return res;
    }
    //数字转IP
    function num2dot(num) {
        var part1 = num & 255;
        var part2 = ((num >> 8) & 255);
        var part3 = ((num >> 16) & 255);
        var part4 = ((num >> 24) & 255);

        return part4 + "." + part3 + "." + part2 + "." + part1;
    }

    function getHostname(str) {
        var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
        var host = str.match(re)[1].toString().toLowerCase();
        if(host.charAt(host.length-1) === '.'){
            host = host.substr(0,host.length-1);
        }
        return host;
    }
    function bodyParser(res, next) {
        var b = '';
        res.setEncoding('utf-8');
        res.on('data', function(data) {
            b += data;
        });
        res.on('end', function() {res
            next(b);
        });
    };

    function formatTime(d){
        var month = d.getMonth()+1 < 10 ? '0'+ (d.getMonth()+1): d.getMonth()+1;
        var date = d.getDate() < 10 ? '0'+ d.getDate(): d.getDate();
        var hour = d.getHours() < 10 ? '0'+ d.getHours(): d.getHours();
        var m = d.getMinutes() < 10 ? '0'+ d.getMinutes(): d.getMinutes();
        var s = d.getSeconds() < 10 ? '0'+ d.getSeconds(): d.getSeconds();
        return d.getFullYear()+'-'+ month +'-'+ date + ' ' +hour+':'+m+':'+s;
    }
}
