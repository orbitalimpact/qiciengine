/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 还原动作为 Dragonbones 骨骼动画
 */
var fs = require('fs-extra');
var path = require('path');
var fsEx = G.load('filesystem/FsExpand');

M.COMMAND.registerCmd({
    name : 'REVERT_TO_DRAGONBONES',
    main : function(socket, cookie, data) {
        var dataPath = data.path;
        var srcPath = path.join(G.gameRoot, dataPath);

        if (fsEx.extname(dataPath) !== '.bin') {
            return { operRet : false, reason : '当前资源类型有误，期望 .bin' };
        }

        // 检查 backup 是否存在
        var pathPrefix = srcPath.slice(0, -4);
        if (!fs.existsSync(pathPrefix + '.aniBackup')) {
            return { operRet : false, reason : '动作备份文件不存在，无法恢复。' }
        }

        fs.writeFileSync(pathPrefix + '.ani', fs.readFileSync(pathPrefix + '.aniBackup'));
        return { operRet : true };
    }
});
