/**
 * @author chenx
 * @date 2016.1.1
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 远程客户端控制台交互模块
 */

var queueCmds = {};

// 缓存客户端的脚本语句，以便客户端来获取
function queueClientCmd(str, clientId)
{
    clientId = clientId || 0;
    queueCmds[clientId] = queueCmds[clientId] || [];
    queueCmds[clientId].push(str);
}
global.p = queueClientCmd;

// 客户端请求获取脚本指令
function queryCmdFromClient(res, clientId)
{
    var cmdList = queueCmds[clientId];
    if (cmdList)
    {
        res.send(JSON.stringify(cmdList))
        res.end();
        queueCmds[clientId] = null;
    }
    else
    {
        res.send('200 OK');
        res.end();
    }
}
global.p = queueClientCmd;
global.queryCmdFromClient = queryCmdFromClient;
