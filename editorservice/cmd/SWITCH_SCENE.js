/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 切换到新的场景
 */
var fs = require('fs-extra');

M.COMMAND.registerCmd({
    name : 'SWITCH_SCENE',
    main : function(socket, cookie, scene) {
        // 拷贝文件
        var src = G.gameRoot + 'Assets/state/' + scene + '.state';
        fs.copySync(src, G.gameRoot + 'Temp/scene_editor.state');

        // 保存源 state 的 md5
        var srcState = fs.readFileSync(src, { encoding : 'utf8' });
        G.config.editor.stateMD5 = M.util.calcMD5(srcState);

        // 修改配置信息
        G.config.editor.currScene = scene;
        M.COMMAND.dispatch('UPDATE_EDITOR_SETTINGS', -1, G.config.editor);

        // 重新打包下资源
        var watch = G.load('filesystem/Watch');
        watch.exploreDaemon();
        return true;
    }
});
