/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 重命名
 */
var fsEx = G.load('filesystem/FsExpand');
var fs = require('fs-extra');
var path = require('path');

M.COMMAND.registerCmd({
    name : 'RENAME',
    main : function(socket, cookie, data) {
        var oldFile = G.gameRoot + data.old;
        var newFile = G.gameRoot + data.new;

        var operateFailed = function(errStr) {
            G.log.trace(errStr);
            return {'operRet': false, 'reason': errStr};
        };

        if (!fs.existsSync(oldFile)) {
            // 认为失败
            return operateFailed('不存在文件' + oldFile);
        }

        var stat = fs.statSync(oldFile);
        var isDirectory = stat.isDirectory();

        if (!fsEx.isBin(newFile) &&
            !isDirectory &&
            newFile.toLowerCase().indexOf('@atlas') > 0) {
            // @atlas 目录对于前端显示是 .png/.jpg，期望更名的实际上是 bin 文件
            newFile = newFile.slice(0, -path.extname(newFile).length) + '.bin'
        }

        console.log(oldFile); console.log(newFile);
        if (fsEx.isPredefined(oldFile))
            return operateFailed('源文件为系统预设。');
        if (fsEx.isPredefined(newFile))
            return operateFailed('目标文件为系统预设。');

        // 如果是文件夹，允许重命名
        // 如果是文件，只允许 .bin 文件 / .js 文件重命名
        if (!isDirectory) {
            if (!fsEx.isBin(oldFile) &&
                !fsEx.isJs(oldFile) &&
                !fsEx.skipWhenPack(oldFile, '')) {
                return operateFailed('只允许重命名 bin/js 文件');
            }
            if (fsEx.extname(oldFile) !== fsEx.extname(newFile)) {
                return operateFailed('不允许变更后缀名');
            }
        }

        var metaOld = fsEx.getMetaName(oldFile);
        var metaNew = fsEx.getMetaName(newFile);
        var meta;

        var tryRename = function(oldFile, newFile) {
            try {
                fs.renameSync(oldFile, newFile);
            }
            catch (ex) {
                return ex;
            }
            return true;
        };

        var srcExt = path.extname(oldFile);
        var rawOld = oldFile.slice(0, -srcExt.length);
        var rawNew = newFile.slice(0, -srcExt.length);

        if (fs.existsSync(metaOld)) {
            // 读取 meta 的内容
            meta = fs.readJsonFileSync(metaOld);

            // 首先，重命名对应的 meta
            tryRename(metaOld, metaNew);

            if (G.ASSET.IsSound(oldFile)) {
                // 如果是声音文件特殊处理，其源就是 rawOld，即 a.mp3.bin 对应的源 a.mp3
                if (fs.existsSync(rawOld))
                    tryRename(rawOld, rawNew);
            }
            else {
                // 非声音的资源，需要将组成该资源的子文件，全体改名
                if (meta.source) {
                    for (var idx = 0, len = meta.source.length; idx < len; idx++) {
                        var ext = meta.source[idx];

                        if (fs.existsSync(rawOld + ext))
                            tryRename(rawOld + ext, rawNew + ext);
                    }
                }
            }
        }

        // 尝试重命名 aniBackup 文件
        if (fs.existsSync(rawOld + '.aniBackup'))
            tryRename(rawOld + '.aniBackup', rawNew + '.aniBackup');

        // 最后，修改资源自己本身
        var result = tryRename(oldFile, newFile);

        // 如果是文件夹改名，尝试收集 UUID 生成新的 html 文件
        if (isDirectory) M.PROJECT.genGameHTML();
        if (result === true)
            return { 'operRet' : true };
        else
            return { 'operRet' : false, 'reason' : result.toString() }
    }
});
