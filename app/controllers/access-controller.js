
module.exports = function(app){
    var handlebars = require("handlebars");
    var dateFormat = require('dateformat');
    var fs = require('fs');
    app.get('/show', function(req, res, next){
        //访问权限
        req.query.tpl = {name:'blue'};
        var url = req.query['url'];
        console.log('request url: ' + url);
        next();
    },function(req, res, next){
       //查找ip位置，入库
        var  ipAddress = req.headers['x-cluster-client-ip'] ;
        if(!ipAddress){
            ipAddress = req.connection.remoteAddress;
        }
        next();
    },function(req, res){
        console.log(req.query['tpl']);
        //渲染模版，返回结果
        var tpl = fs.readFileSync(__dirname.substr(0,__dirname.length-15) + 'static/1tpl/blue/index.html','utf-8');
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
}
