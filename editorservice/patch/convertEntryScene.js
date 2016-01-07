/**
 * Created by wudm on 12/8/15.
 */

var MY_FLAG = 3;

var path = require('path');
var fs = require('fs-extra');
var chalk = require('chalk');

/**
 * 修复
 */
var convert = function(dir) {
    var settingPath = path.join(dir, 'ProjectSetting/project.setting');
    var scenePath = path.join(dir, 'ProjectSetting/scene.setting');

    if (!fs.existsSync(settingPath) ||
        !fs.existsSync(scenePath))
        return;

    var projectConf;
    var sceneConf;
    try {
        projectConf = fs.readJsonSync(settingPath, { throws : false });
        sceneConf = fs.readJsonSync(scenePath, { throws : false });
    }
    catch(e) {
        projectConf = null;
        sceneConf = null;
    }
    if (projectConf == null || sceneConf == null) {
        return;
    }

    var toolFlag = projectConf.toolFlag || 0;
    if (toolFlag & (1 << MY_FLAG)) {
        // G.log.trace('目录{0}已经处理过converPrefabForRemoveUrl工具。', dir);
        return;
    }

    // 设置回写
    projectConf.toolFlag = (toolFlag | (1 << MY_FLAG));
    G.load('filesystem/FsExpand').writeJsonSync(settingPath, projectConf);

    // 确保 scene.setting 中的 entryScene
    var entryScene = sceneConf['entityScene'];
    delete sceneConf['entityScene'];
    if (entryScene) sceneConf['entryScene'] = entryScene;
    G.config.scene = sceneConf;

    G.load('filesystem/FsExpand').writeJsonFileSync(scenePath, sceneConf);
};

// 打开工程、切换工程的时候尝试 convert
if (G.gameRoot) convert(G.gameRoot);
G.emitter.on('switchProject', function() {
    convert(G.gameRoot);
});

