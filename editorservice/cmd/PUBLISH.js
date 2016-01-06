/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 用户发布游戏
 */
var fs = require('fs-extra');
var path = require('path');

M.COMMAND.registerCmd({
    name : 'PUBLISH',
    main : function(socket, cookie, param) {
        var tsHms = new Date();
        var buildBasePath = path.join('Build', 'ver' +
            tsHms.getFullYear() +
            ("0" + (tsHms.getMonth() + 1)).slice(-2) +
            ("0" + (tsHms.getDate())).slice(-2) +
            ("0" + tsHms.getHours()).slice(-2) +
            ("0" + tsHms.getMinutes()).slice(-2) +
            ("0" + tsHms.getSeconds()).slice(-2));
        var buildPath = buildBasePath;
        var tryTimes = 0, checkDir = false;
        do {
            if (!fs.existsSync(path.join(G.gameRoot, buildPath))) {
                checkDir = true;
                break;
            }
            if (tryTimes++ > 30) break;
            buildPath = buildBasePath + '_' + tryTimes;
        } while (true);

        if (!checkDir) {
            G.log.trace('发布文件名定位异常。');
            return;
        }

        // 开始发布
        var publishResult = M.PROJECT.publishTo(path.join(G.gameRoot, buildPath));
        if (typeof publishResult === 'string') {
            return { 'operRet' : false, 'reason' : publishResult }
        }

        // 打开这个文件夹
        var opener = require('opener');
        opener('file:' + path.join(G.gameRoot, buildPath));

        var targetAddress;
        if (socket && socket.handshake &&
            (targetAddress = socket.handshake.address)) {
            // 确定是本机，打开浏览器
            if (targetAddress.indexOf('::1') >= 0 ||
                targetAddress.indexOf('127.0.0.1') >= 0)
                opener('http://localhost:' + M.COMMUNICATE.port + '/' + buildPath + '/StartGame.html');
        }

        return { 'operRet' : true };
    }
});
