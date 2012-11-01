
module.exports = function(app){
    var User = mongoose.model('User');

    app.get('/', function(req, res){
        res.render('index', {
            title : 'Index'
            ,description: 'Index Description'
            ,author: 'miemiedev'
            ,message: 'hello world!'
        });
    });
};