/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 删除文件或文件夹
 */
var fsEx = G.load('filesystem/FsExpand');
var fs = require('fs-extra');
var path = require('path');

M.COMMAND.registerCmd({
    name : 'REMOVE',
    main : function(socket, cookie, dir) {
        var fullPath = path.join(G.gameRoot, dir);
        if (!fs.existsSync(fullPath)) {
            // 认为删除成功
            return {'operRet': true};
        }

        if (fsEx.isPredefined(fullPath)) {
            return {'operRet': false, 'reason': '系统预设目录无法删除。'};
        }

        var metaPath = fsEx.getMetaName(fullPath);
        var meta;
        if (fs.existsSync(metaPath)) {
            // 读取 meta 的内容
            meta = fs.readJsonFileSync(metaPath);

            // 首先，删除对应的 meta
            fs.removeSync(metaPath);

            // 声音文件单独处理
            if (G.ASSET.IsSound(fullPath)) {
                var soundFile = fullPath.slice(0, -4);
                if (fs.existsSync(soundFile))
                    fs.removeSync(soundFile);
            }
            else {
                // 其次，需要将组成该资源的子文件，全体删除
                if (meta.source) {
                    var srcExt = path.extname(fullPath);
                    var rawPath = fullPath.slice(0, -srcExt.length);
                    for (var idx = 0, len = meta.source.length; idx < len; idx++) {
                        var ext = meta.source[idx];

                        if (fs.existsSync(rawPath + ext))
                            fs.removeSync(rawPath + ext);
                    }
                }
            }
        }

        // 最后，删除资源自己本身
        fs.removeSync(fullPath);
        return { 'operRet': true};
    }
});
