/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 指令分发处理
 */
var fs = require('fs-extra');
var path = require('path');
var clazz = function() {
    /**
     * @property {object} _cmds - 所有的消息处理指令
     * @private
     */
    this._cmds = {};
};
clazz.prototype = {};
clazz.prototype.constructor = clazz;
G.defineModule('COMMAND', clazz);

/**
 * 模块初始化
 * @internal
 */
clazz.prototype.init = function() {
    // 取得游戏的配置信息
    var self = this;
    var config;
    try {
        config = fs.readJsonSync(path.join(G.editorRoot, 'project.setting'), { throws : false }) || {};
    }
    catch (e) {
        config = {};
    }

    G.loadDir('cmd');

    // 监听端口，开始提供服务
    var io = M.COMMUNICATE.listen(config.nodePort || 5002);
    self._io = io;
    io.on('connection', function(socket) {
        G.log.trace('New connection.');
        socket.on('disconnect', function() {
            G.log.trace('Disconnect.');
        });

        // 注册所有的命令
        for (var cmd in self._cmds) {
            self._registerCmdToIO(cmd, socket);
        }

        // 通知有连接接入
        G.emitter.emit('newConnection', socket);
        G.beConnnected = true;
    });
};

/**
 * 注册一个消息处理器
 * @param cmd
 * @internal
 */
clazz.prototype.registerCmd = function(cmd) {
    if (typeof cmd.main !== 'function' || typeof cmd.name !== 'string')
        throw new Error('消息处理器未正确定义。');

    if (this._cmds[cmd.name])
        G.log.error('消息处理器{0}已经存在了！', cmd.name);

    this._cmds[cmd.name] = cmd;
};

/**
 * 反馈消息给客户端
 */
clazz.prototype.sendMessage = function(socket, cmd, cookie, paras) {
    if (!socket) {
        return;
    }
    socket.emit(cmd, cookie, paras);
};

/**
 * 发送消息给所有的客户端
 */
clazz.prototype.broadcast = function(cmd, paras) {
    this._io.emit(cmd, paras);
};

/**
 * 注册一个消息处理回调
 * @param cmd
 * @private
 */
clazz.prototype._registerCmdToIO = function(cmd, socket) {
    var self = this;
    socket.on(cmd, function(cookie, data) {
        self.dispatch(socket, cmd, cookie, data);
    });
}

/**
 * 执行一个指令
 */
clazz.prototype.dispatch = function() {
    var self = this;
    var args = arguments;
    var argIndex = 0, socket, cmd, cookie, data;

    if (typeof(args[0]) !== 'string') {
        socket = args[argIndex++];
    }
    cmd    = args[argIndex++];
    cookie = args[argIndex++];
    data   = args[argIndex++];

    var agent = self._cmds[cmd];

    // 处理之
    try {
        G.log.trace('-----> {0}', cmd);
        var result = agent.main.call(agent, socket, cookie, data, function(result) {
            if (cookie >= 0 && socket && result !== undefined) {
                this.sendMessage(socket, 'OPERATION_DONE', cookie, result);
            }
        });
        if (cookie >= 0 && socket && result !== undefined) {
            this.sendMessage(socket, 'OPERATION_DONE', cookie, result);
        }
    }
    catch(ex) {
        G.log.error('cmd：{0}，exception：{1}', cmd, ex);
    }
};
