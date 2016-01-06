/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 保存 sample 化的骨骼动作
 */
var fs = require('fs-extra');
var path = require('path');
var fsEx = G.load('filesystem/FsExpand');

M.COMMAND.registerCmd({
    name : 'SAMPLE_DRAGON_BONES',
    main : function(socket, cookie, data) {
        var samples = data.samples;
        var dataPath = data.path;
        var srcPath = path.join(G.gameRoot, dataPath);

        if (fsEx.extname(dataPath) !== '.bin') {
            G.log.trace('当前资源类型有误，期望 .bin');
            return;
        }

        // 拷贝旧文件为 backup
        var pathPrefix = srcPath.slice(0, -4);
        try {
            var jsonInfo = fs.readJsonSync(pathPrefix + '.ani', { throws : false });    
        }
        catch(e) {
            G.log.trace('没有找到操作的.ani文件');
        }
        
        if (jsonInfo && jsonInfo.armature && jsonInfo.frameRate) {
            fs.writeFileSync(pathPrefix + '.aniBackup', fs.readFileSync(pathPrefix + '.ani'));
        }

        // 写入动作文件
        fs.writeJSONSync(pathPrefix + '.ani', samples);

        return { operRet : true };
    }
});
