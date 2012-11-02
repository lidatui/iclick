
module.exports = function(app){
    var http = require('http');
    var handlebars = require("handlebars");
    var dateFormat = require('dateformat');
    var useragent = require('useragent');
    var fs = require('fs');

    var IpInfo = mongoose.model('IpInfo');
    var Access = mongoose.model('Access');
    app.get('/show', function(req, res, next){
        var access = new Access();
        req.query['access'] = access;
        //访问权限
        var url = req.query['url'];
        access.url = url;
        console.log('request url: ' + url);
        next();
    },function(req, res, next){
       //查找ip位置
        var access = req.query['access'];

        var  ipAddress = req.headers['x-cluster-client-ip'] ;
        if(!ipAddress){
            ipAddress = req.connection.remoteAddress;
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
                    reqLookup.on('data', function (ipData) {
                        var ipResult = JSON.parse(ipData);
                        console.log('ip lookup: %s',ipData);
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
                    });
                }).on('error', function(err) {
                    console.log('problem with request: ' + e.message);
                    next(err);
                }).end();
            }
        });
    },function(req, res, next){
        //获得操作系统和浏览器
        var access = req.query['access'];
        var agent = useragent.parse(req.headers['user-agent']);
        access.os = agent.os;
        access.browser = agent.toAgent();
        next();
    },function(req, res, next){
        //存储
        console.log('access: %s',req.query['access']);
        var access = req.query['access'];
        access.save(function(err){
            if(err) return next(err);
            next();
        });
    },function(req, res){
        //渲染模版，返回结果
        var tpl = fs.readFileSync(__dirname.substr(0,__dirname.length-15) + 'static/tpl/blue/index.html','utf-8');
        var template = handlebars.compile(tpl);
        var result = template({
            name:'miemiedev',
            highlight:true,
            title:'哈哈哈',
            pubDate:'08-15',
            basePath: 'http://'+req.host+':3000'
        })
        res.jsonp({ result: result });
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
}
