/**
 * @author chenx
 * @date 2015.10.15
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 负责与服务器通信
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
}, {
    url : qc.Serializer.STRING,
});
ServerCommunicate.__menu = 'Plugins/ServerCommunicate';

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
