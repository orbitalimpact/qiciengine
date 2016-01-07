/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 管理与前端的自定义通讯
 */

var clazz = function() {
    var self = this;

    // 建立事件派发器
    var eventEmitter = require('events').EventEmitter;
    self._emitter = new eventEmitter();
};

clazz.prototype = {};
clazz.prototype.constructor = clazz;

// 向前端发送消息
clazz.prototype.sendData = function(cmd, data) {
    // 更新完成，派发事件给编辑器
    M.COMMAND.broadcast('SERVICE_PIPE_MESSAGE', {
        command: cmd,
        data: data
    });
};

// 添加监听
clazz.prototype.on = function(cmd, listener) {
    var self = this;
    self._emitter.on(cmd, listener);
};

// 移除监听
clazz.prototype.off = function(cmd, listener) {
    var self = this;
    self._emitter.removeListener(cmd, listener);
};

// 触发监听
clazz.prototype.emit = function(cmd, data) {
    var self = this;
    self._emitter.emit(cmd, data);
};

// 定义模块
G.defineModule('SERVICE_PIPE', clazz);
