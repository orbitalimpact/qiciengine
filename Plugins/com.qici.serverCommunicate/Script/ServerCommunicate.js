/**
 * @author chenx
 * @date 2015.10.15
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 负责与服务器通信，提供 http 与 websocket 两种通信方式
 */

/**
 * 负责处理服务器通信相关逻辑
 * @class qc.ServerCommunicate
 */
var ServerCommunicate = qc.defineBehaviour('qc.ServerCommunicate', qc.Behaviour, function() {

    /**
     * @property {string} url - 服务器url地址
     */
    this.url = '';

    // 缓存 socket 消息处理函数映射
    this._socketCmdMap = {};

    // websocket io 对象
    this.socket = null;

    // 是否已连接
    this.isConnected = false;

    // 连接事件和断开连接事件
    this.onConnect = new Phaser.Signal();
    this.onDisconnect = new Phaser.Signal();
    this.onError = new Phaser.Signal();
}, {
    url : qc.Serializer.STRING,
});

ServerCommunicate.__menu = 'Plugins/ServerCommunicate';

/************************* http begin ********************************/
/**
 * 收到消息回复
 * @param cmd {xhr} - 请求对象
 * @param resCallback {function} - 收到回复的回调函数
 * @param callbackArg {json} - 回调函数参数
 */
ServerCommunicate.prototype.receiveResponse = function(xhr, cmd, resCallback) {

    if (xhr.status == 0)
    {
        this.game.log.trace('消息{0}没有收到回复。', cmd);

        // 出错或没收到回复
        resCallback({ ret : false, reason : 'no response' });
        return;
    } else if(xhr.status != 200)
    {
        this.game.log.trace('消息{0}发送出错。', cmd);

        // 出错或没收到回复
        resCallback({ ret : false, reason : xhr.statusText });
        return;
    }

    var json = window.JSON.parse(xhr.responseText);
    json = json || {};

    this.game.log.trace('消息{0}收到回复:', cmd);
    this.game.log.trace(json);

    // 调用回调
    resCallback(json);
};

/**
 * 发送消息给服务器
 * @param cmd {string} - 消息串
 * @param para {json} - 消息参数
 * @param resCallback {function} - 收到回复的回调函数
 */
ServerCommunicate.prototype.sendMessage = function(cmd, para, resCallback) {
    var xhr = qc.AssetUtil.getXHR();
    var url = this.url + '/cmd';
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    para["cmd"] = cmd;
    xhr.send(window.JSON.stringify(para));

    var _this = this;
    xhr.onload = function(){
        return _this.receiveResponse(xhr, cmd, resCallback);
    }

    xhr.onerror = function(){
        return _this.receiveResponse(xhr, cmd, resCallback);
    }
};


/**
 * 发送消息给服务器
 * 用户自定义消息可通过该接口发送给指定的服务器
 * @param node {qc.Node} - 节点
 * @param cmd {string} - 消息串
 * @param para {json} - 消息参数
 * @param resCallback {function} - 收到回复的回调函数
 */
ServerCommunicate.sendMessage = function(node, cmd, para, resCallback) {
    var serverCommunicate = node.getScript('qc.ServerCommunicate');
    serverCommunicate.sendMessage(cmd, para, resCallback);
};

/**
 * 登录服务器
 * @param node {qc.Node} - 节点
 * @param username {string} - 用户名
 * @param password {string} - 密码
 * @param authInfo {json} - 验证相关信息
 * @param resCallback {function} - 收到回复的回调函数
 */
ServerCommunicate.login = function(node, username, password, authInfo, resCallback) {

    authInfo = authInfo || {};
    authInfo['username'] = username;
    authInfo['password'] = hex_md5(password + 'sdf1!@3fdd8*(+3dfFdkO%$@ffdln');
    console.log(authInfo);

    ServerCommunicate.sendMessage(node, 'LOGIN', authInfo, resCallback);
};

/**
 * 登出服务器
 * @param node {qc.Node} - 节点
 * @param username {string} - 用户名
 * @param password {string} - 密码
 * @param authInfo {json} - 验证相关信息
 * @param saveData {json} - 需要保存的用户数据
 * @param resCallback {function} - 收到回复的回调函数
 */
ServerCommunicate.logout = function(node, username, password, authInfo, saveData, resCallback) {

    authInfo = authInfo || {};
    authInfo['username'] = username;
    authInfo['password'] = hex_md5(password + 'sdf1!@3fdd8*(+3dfFdkO%$@ffdln');
    authInfo['saveData'] = window.JSON.stringify(saveData);
    console.log(authInfo);

    ServerCommunicate.sendMessage(node, 'LOGOUT', authInfo, resCallback);
};
/************************* http end ********************************/

/************************* websocket begin *************************/
/**
 * 对连接 IO 进行消息关注
 * @param cmd {string} - 消息名
 * @param socket {object} - 连接io对象
 */
ServerCommunicate.prototype.registerSocketCmdIO = function(cmd, socket) {
    var self = this;
    socket.on(cmd, function() {
        self.dispatchSocketCommand(cmd, arguments);
    });
}

/**
 * 注册 socket 消息的处理函数
 * @param cmd {string} - 消息名
 * @param func {string} - 处理函数
 */
ServerCommunicate.prototype.registerSocketCmd = function(cmd, func) {
    if (this._socketCmdMap[cmd])
        assert(false, util.format('socket消息(%s)重复注册', cmd));

    this._socketCmdMap[cmd] = func;
}

/**
 *  对 socket 消息进行派发
 * @param cmd {string} - 消息名
 * @param args {array} - 消息参数数组
 */
ServerCommunicate.prototype.dispatchSocketCommand = function(cmd, args) {

    var func = this._socketCmdMap[cmd];
    if (!func)
    {
        this.game.log.error('找不到 socket msg({0})的处理函数', cmd);
        return;
    }

    // 调用消息处理函数
    var argList = [this];
    for (var i = 0; i < args.length; i++)
        argList.push(args[i]);
    func.apply(null, argList);
}

/**
 * 连接 socket 地址
 */
ServerCommunicate.prototype.socketConnect = function(opts) {

    var self = this;
    if (self.socket)
    {
        self.socket.close();
        self.socket = null;
    }

    self.socket = io.connect(self.url, opts);
    self.socket.on('connect', function(){
        self.game.log.trace('connect {0} ok.', self.url);
        self.isConnected = true;
        self.socket = this;

        if (!self.socket.registerDone)
        {
            // 遍历注册的消息处理函数，依次关注
            for (var cmd in self._socketCmdMap)
                self.registerSocketCmdIO(cmd, self.socket);
            self.socket.registerDone = true;
        }

        self.onConnect.dispatch(self);
    });
    self.socket.on('disconnect', function(){
        self.game.log.trace('connection {0} disconnect.', self.url);
        self.socket = null;
        self.isConnected = false;
        self.onDisconnect.dispatch(self);
    });
    self.socket.on('error', function(err){
        self.game.log.trace('connection {0} error: {1}.', self.url, err);
        self.onError.dispatch(self, err);
    });
};

/**
 * 发送 socket 消息
 * @param cmd {string} - 消息名
 * @param arguments - 后续任意个参数
 */
ServerCommunicate.prototype.sendSocketMessage = function(cmd) {

    if (!this.socket || !this.isConnected)
        return;

    // 发送消息
    this.socket.emit.apply(this.socket, arguments);

    return true;
}

/**
 * 注册 socket 消息的处理函数
 * @param node {qc.Node} - 节点
 * @param cmd {string} - 消息名
 * @param opts {mappping} - 可选的参数
 * @param func {string} - 处理函数
 */
ServerCommunicate.socketConnect = function(node, opts) {
    var serverCommunicate = node.getScript('qc.ServerCommunicate');
    serverCommunicate.socketConnect(opts);
};

/**
 * 注册 socket 消息的处理函数
 * @param node {qc.Node} - 节点
 * @param cmd {string} - 消息名
 * @param func {string} - 处理函数
 */
ServerCommunicate.registerSocketCmd = function(node, cmd, func) {

    var serverCommunicate = node.getScript('qc.ServerCommunicate');
    serverCommunicate.registerSocketCmd(cmd, func);

    if (serverCommunicate.isConnected)
        // 已连接，直接关注 socket io
        serverCommunicate.registerSocketCmdIO(cmd, serverCommunicate.socket);
};

/**
 * 发送 socket 消息
 * @param node {qc.Node} - 节点
 * @param cmd {string} - 消息名
 * @param arguments - 后续任意个参数
 */
ServerCommunicate.sendSocketMessage = function(node, cmd) {
    var serverCommunicate = node.getScript('qc.ServerCommunicate');

    var args = [];
    for (var i = 1; i < arguments.length; i++)
        args.push(arguments[i]);

    return serverCommunicate.sendSocketMessage.apply(serverCommunicate, args);
};
/************************* websocket end ***************************/
