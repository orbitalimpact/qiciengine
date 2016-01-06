/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 请求目录中的目录信息（非递归）
 */
var fsEx = G.load('filesystem/FsExpand');
var fs  = require('fs-extra');
var path = require('path');

// 获取 win 盘符
var getWinDrivesSync = function() {
    var list = [];
    for (var i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
        var driver = String.fromCharCode(i) + ':';
        try {
            if (fs.statSync(driver))
                list.push(driver);
        }
        catch (e) { }
    }
    return list;
};

var listDir = function(dir) {
    // windows 需要特殊处理
    var list, hasChildren;
    if ((dir === '/' || dir === '') && process.platform === 'win32') {
        list = getWinDrivesSync();
        if (!list || !list.length) {
            G.log.trace('no driver detect.');
            return;
        }
    }
    else {
        list = [];
        if (process.platform !== 'win32' && dir[0] !== '/') dir = '/' + dir;
        if (process.platform === 'win32' && dir[dir.length - 1] !== '/') dir = dir + '/';
        fs.readdirSync(dir).forEach(function(fileName) {
            if (fsEx.isHidden(dir, fileName))
                return;
            if (fsEx.skipWhenExplore(dir, fileName))
            // 部分系统路径 explore 时不下发客户端（但是需要做 bin 、meta 生成处理）
                return;
            try {
                var stat = fs.statSync(path.join(dir, fileName));
                if (!stat) return;
                if (!stat.isDirectory()) return;
                list.push(fileName);
            }
            catch (e) { };
        });
    }

    // 组织成期望的格式
    var len = list.length;
    var ret = {
        path : dir,
        sub : list,
        hasChildren : hasChildren = new Array(list.length)
    };

    for (var i = 0; i < len; i++) {
        var subDirPath = path.join(dir, list[i]);
        try {
            var subDirList = fs.readdirSync(subDirPath);
            for (var j = 0, subLen = subDirList.length; j < subLen; j++) {
                var subDirSub = subDirList[j];
                if (!fsEx.isHidden(subDirPath, subDirSub) && !fsEx.skipWhenExplore(subDirPath, subDirSub) &&
                    fs.statSync(path.join(subDirPath, subDirSub)).isDirectory()) {
                    hasChildren[i] = true;
                    break;
                }
            }
            if (!hasChildren[i]) hasChildren[i] = false;
        }
        catch (e) {
            hasChildren[i] = false;
        }
    }
    return ret;
};

M.COMMAND.registerCmd({
    name : 'LIST_DIR',
    main : function(socket, cookie, dir) {
        return listDir(dir);
    }
});
