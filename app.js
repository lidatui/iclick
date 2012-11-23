
/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , http = require('http')
  , io = require('socket.io')
  , path = require('path');


var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    // Fork workers.
    var fPid;
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();
        if(i===0){
            worker.send('I am first!');
            fPid = worker.process.pid;
        }
    }

    cluster.on('exit', function(worker, code, signal) {
        var exitCode = worker.process.exitCode;
        console.log('worker ' + worker.process.pid + ' died ('+exitCode+'). restarting...');

        var newWorker = cluster.fork();
        if(fPid === worker.process.pid){
            newWorker.send('I am alive again!');
            fPid = newWorker.process.pid;
        }
    });
} else if (cluster.isWorker){
    var app = express();
    var sessionStore = require('./db-session');

    app.configure(function(){
        app.set('port', process.env.PORT || 3000);
        app.set('views', __dirname + '/app/views');
        app.set('view engine', 'jade');
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.cookieParser('your secret here'));
        app.use(express.session({
            secret: 'iclicksession',
            maxAge: new Date(Date.now() + 3600000),
            store: sessionStore
        }));
        app.use(express.static(path.join(__dirname, '/static')));
        app.use(function(req, res, next){
            res.locals.session = req.session;
            next();
        });
    });


    require('./db-connect');

    // models
    var models_path = __dirname + '/app/models'
        , model_files = fs.readdirSync(models_path)
    model_files.forEach(function (file) {
        if(file.lastIndexOf('.js') == file.length - 3){
            require(models_path+'/'+file)
        }
    })

    // controllers
    var controllers_path = __dirname + '/app/controllers'
        , controller_files = fs.readdirSync(controllers_path);
    controller_files.forEach(function (file) {
        if(file.lastIndexOf('.js') == file.length - 3){
            require(controllers_path+'/'+file)(app);
        }

    })

    //defined very last
    app.use(function(err, req, res, next){
        console.error(err.stack);
        res.send(500, 'Something broke!');
    });

    var server = http.createServer(app).listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
    });

    //Setup Socket.IO
    var io = io.listen(server);
    io.sockets.on('connection', function(socket){
        console.log('Client Connected');
        socket.on('message', function(data){
            socket.broadcast.emit('server_message',data);
            socket.emit('server_message',data);
        });
        socket.on('disconnect', function(){
            console.log('Client Disconnected.');
        });
    });

    process.on('message', function(msg) {
        // schedulers
        var schedulers_path = __dirname + '/app/schedulers'
            , scheduler_files = fs.readdirSync(schedulers_path)
        scheduler_files.forEach(function (file) {
            if(file.lastIndexOf('.js') == file.length - 3){
                require(schedulers_path+'/'+file)()
            }
        })
        console.log('Scheduler started...');
    });


}

