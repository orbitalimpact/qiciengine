/**
 * Created by wudm on 12/8/15.
 */

var MY_FLAG = 4;

var pathLib = require('path');
var fs = require('fs-extra');
var chalk = require('chalk');

/**
 * 修复
 */
var convert = function(dir) {
    var settingPath = pathLib.join(dir, 'ProjectSetting/project.setting');
    var scriptPath = pathLib.join(dir, 'ProjectSetting/script.setting');

    if (!fs.existsSync(settingPath) ||
        !fs.existsSync(scriptPath))
        return;

    var projectConf;
    var scriptConf;
    try {
        projectConf = fs.readJsonSync(settingPath, { throws : false });
        scriptConf = fs.readJsonSync(scriptPath, { throws : false });
    }
    catch(e) {
        projectConf = null;
        scriptConf = null;
    }
    if (projectConf == null || scriptConf == null) {
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

    // 确保 script.setting 中的 entryscript
    var dependence = scriptConf['dependence'];
    var entry = scriptConf['entry'];
    delete scriptConf['dependence'];
    delete scriptConf['entry'];

    // 收集所有的脚本文件
    G.gameFiles.refresh();
    var uuid2file = G.gameFiles.uuid2file;

    var scriptFile = {};
    var count = 0;
    for (var uuid in uuid2file) {
        var path = uuid2file[uuid];
        if (path.indexOf('Scripts/') == 0) {
            count++;
            scriptFile[uuid] = path;
        }
    }

    // 返回信息
    var ret = [];

    // 获取拓扑列表（ [a, b, c] 表示 c 是 0 依赖）
    var topo = G.load('misc/toposort.js');
    var topoOrder = topo.toposort(dependence);
    var cursor = 0;
    var length = topoOrder.length;
    while (cursor < length) {
        var uuid = topoOrder[cursor++];
        var path = scriptFile[uuid];
        if (path) {
            scriptFile[uuid] = 0;
            ret.unshift(path);
        }
    }

    var entryPath;
    if (entry) {
        entryPath = uuid2file[entry];
        if (entryPath) {
            var pos = ret.indexOf(entryPath);
            if (pos > 0)
                ret.splice(pos, 1);

            ret.unshift(entryPath);
        }
    }
    // 写入并回写
    scriptConf['logicalScriptOrder'] = G.gameFiles.logicalScriptOrder = ret;

    // 如果 ret 值有效，需要重新生成启动脚本
    if (ret && ret.length) M.PROJECT.genGameHTML();

    G.load('filesystem/FsExpand').writeJsonFileSync(scriptPath, scriptConf);
};

// 打开工程、切换工程的时候尝试 convert
if (G.gameRoot) convert(G.gameRoot);
G.emitter.on('switchProject', function() {
    convert(G.gameRoot);
});


