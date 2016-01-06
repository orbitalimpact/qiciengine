/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 保存预制
 */
var fs = require('fs-extra');
var fsEx = G.load('filesystem/FsExpand');

M.COMMAND.registerCmd({
    name : 'SAVE_PREFAB',
    main : function(socket, cookie, data) {
        var targetPath = data.path;
        targetPath = targetPath.replace(/.bin$/g, '.prefab');
        var json = data.data;

        // 写入目标文件
        fsEx.writeJSONFileSync(G.gameRoot + targetPath, json);

        // 重新打包下资源
        var watch = G.load('filesystem/Watch');
        watch.exploreDaemon();

        // 返回资源的uuid
        return fs.readJSONFileSync(G.gameRoot + targetPath.substr(0, targetPath.length - 6) + 'bin.meta').uuid;
    }
});
