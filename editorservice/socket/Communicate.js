/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 负责提供socket服务
 */
var express = require('express');
var app     = express();
var path    = require('path');

G.app = app;
var clazz = function() {
};
clazz.prototype = {};
clazz.prototype.constructor = clazz;
G.defineModule('COMMUNICATE', clazz);

/**
 * 开始监听端口
 * @method qc.gs.Communicate#listen
 * @param {number} port - 监听的端口号
 */
clazz.prototype.listen = function(port) {
    // deflate 压缩中间件，目前只有音乐文件不进行压缩，其他文件全体压缩
    var compression = require('compression');
    app.use(compression({
        filter: function(req, res) {
            var url = req.url;

            if (url && /\.(mp3|ogg|mp3\.bin|ogg\.bin)$/.test(url.toLowerCase()))
            // 音乐文件
                return false;

            // 其他，全体默认压缩
            return true;
        }
    }));

    var http    = require('http').Server(app);
    var io      = require('socket.io')(http, {
        pingTimeout : 15000,
        pingInterval : 8000
    });

    // 增加 express 中间件 CORS，以允许跨域访问
    var cors = require('cors');
    app.use(cors());

    // http 方式提供直接的访问文件的方式
    var path = require('path');

    app.use('/lib', express.static(path.join(G.editorRoot, '../lib/')));
    app.use('/build', express.static(path.join(G.editorRoot, '../build/')));
    app.use('/Plugins', express.static(path.join(G.editorRoot, '../Plugins/')));
    app.use('/Project.html', express.static(path.join(G.editorRoot, 'Project.html')));

    if (G.gameRoot) {
        this.switchStatic();
    }

    // 监听 remoteLog 远程日志的 post 请求
    var router = express.Router();
    app.use('/remoteLog', router);

    // body parse 中间件
    var bodyParser = require('body-parser');
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(bodyParser.json());
    router.use(bodyParser.text({ type : function(){ return true; }}));

    // 客户端请求 post http://localhost:5002/remoteLog
    router.post('/', function(req, res) {
        var body = req.body;
        var ret = body.match(/:queryCmd:(.*)/)
        if (ret && ret.index === 0)
        {
            // 客户端请求获取脚本指令
            queryCmdFromClient(res, ret[1]);
        }
        else
        {
            console.log('remoteLog' , body);
            res.send("200 OK");
            res.end();
        }
    });

    // 监听端口重复事件以进行重试
    http.on('error', function (e) {
        if (e.code == 'EADDRINUSE') {
            G.log.important('端口{0}被占用，准备尝试端口{1}...', port, port + 1);
            port = port + 1;
            setTimeout(function () {
                http.close();
                http.listen(port);
            }, 100);
        }
    });

    // 获取本地ip地址
    M.COMMUNICATE.host = M.util.getLocalIP();

    // 监听端口，启动服务
    http.listen(port, function() {
        G.log.important('Port = {0}', port);
        M.COMMUNICATE.port = port;

        // 派发成功监听的回调
        G.emitter.emit('serviceOn', {
            port : port
        });
    });

    return io;
};

// 切换静态服务的根目录
clazz.prototype.switchStatic = function() {
    if (!G.gameRoot) return;

    var switchDir = function(dir, key) {
        var newHandle = express.static(dir);
        var stacks = app._router.stack;
        var changed = false;

        for (var i = 0, len = stacks.length; i < len; i++) {
            var stack = stacks[i];
            if (stack.name === 'serveStatic' &&
                stack.handle === M.COMMUNICATE[key]) {
                stack.handle = newHandle;
                changed = true;
                break;
            }
        }

        if (!changed) {
            // 没有找到，直接 use
            app.use(newHandle);
        }
        M.COMMUNICATE[key] = newHandle;
    }

    switchDir(G.gameRoot, 'gameHandler');
    switchDir(path.join(G.gameRoot, 'Temp'), 'tempGameHandler');

    return true;
};
