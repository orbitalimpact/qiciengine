/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 将temp目录下的文件根据配置重新打包
 */

// 游戏工程的路径
var path = require('path');

// 载入文件操作库
var fs = require('fs-extra');

// 重新打包当前编辑器中编辑的场景
var genHTML = function() {
    if (!G.gameRoot) return;
    var currSceneFile = G.config.scene[G.config.editor.currScene];
    var sceneData = {
        data : {}
    };
    if (fs.existsSync(G.gameRoot + currSceneFile)) {
        sceneData = fs.readJsonFileSync(G.gameRoot + currSceneFile);
    }

    M.COMMAND.dispatch('PACK_EDITOR_SCENE', -1, sceneData);

    // 重新生成游戏启动文件
    G.log.debug('switch project and generate game html.');
    M.USER_SCRIPTS.restore();
    M.PROJECT.genGameHTML();
};

G.emitter.on('postInit', genHTML);
G.emitter.on('switchProject', genHTML);

// 在 Scripts 目录下的 js 文件发生变更时，生成模板
G.emitter.on('fileChanged', function(file) {
    if (file.indexOf(path.join(G.gameRoot, 'Scripts')) === 0) {
        var lowerCaseName = file.toLowerCase();
        if (lowerCaseName.slice(-8) === '.js.meta' ||
            lowerCaseName.slice(-3) === '.js') {
            // 重新生成游戏启动文件
            M.USER_SCRIPTS.markJsExtDirty(file);
            G.log.debug('file {0} changed, generate html.', file);
            M.PROJECT.prepareGenGameHTML();
        }
    }
    else if (file.indexOf('.state') != -1)
    {
        G.log.debug('scene {0} changed, generate html.', file);
        M.PROJECT.genGameHTML();
    }
});
