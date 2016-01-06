/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 保存当前场景
 */
var fs = require('fs-extra');
var fsEx = G.load('filesystem/FsExpand');

M.COMMAND.registerCmd({
    name : 'SAVE_CURR_SCENE',
    main : function(socket, cookie, data) {
        // 写入目标文件
        fsEx.writeJSONFileSync(G.gameRoot + 'Temp/scene_editor.state', data.data);

        // 重新打包下资源
        var watch = G.load('filesystem/Watch');
        watch.exploreDaemon();
        return true;
    }
});
