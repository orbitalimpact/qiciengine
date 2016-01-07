/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 工程管理相关
 */
var fs = require('fs-extra');
var path = require('path');

var clazz = function() {
};
clazz.prototype = {};
clazz.prototype.constructor = clazz;

var recentRecordNumber = 15;

// 创建一个工程
clazz.prototype.createProject = function(dir) {
    var errorRoutine = function(errorMsg, e) {
        if (e == null) {
            G.log.trace(errorMsg);
            return errorMsg;
        }
        else {
            G.log.error(errorMsg, e);
            return errorMsg + e;
        }
    };
    var fsEx = G.load('filesystem/FsExpand');

    // 必须是绝对路径
    if (!path.isAbsolute(dir))
        return errorRoutine('Project Directory must be a absolute path.');

    // 确保格式为目录方式
    dir = path.join(dir, '/');

    try {
        // 首先，如果存在目录，必须要空目录
        if (fs.existsSync(dir)) {
            // 确保是一个目录
            var stat = fs.statSync(dir);
            if (!stat || !stat.isDirectory())
                return errorRoutine('Not a directory.');

            // 确保是空目录
            var subFiles = fs.readdirSync(dir);
            for (var i = 0, len = subFiles.length; i < len; i++) {
                var fileName = subFiles[i];
                if (fsEx.isHidden(dir, fileName) ||
                    fsEx.skipWhenExplore(dir, fileName))
                    continue;

                // 非空目录
                return errorRoutine('Project Directory must be empty.');
            }
        }
        else {
            // 创建文件夹
            if (!fs.ensureDirSync(dir)) {
                return errorRoutine('Create directory failed.');
            }
        }

        // 切换目录
        var openResult = this.openProject(dir, true);
        if (openResult !== true) return openResult;

        // 尝试创建几个资源二级目录
        ['atlas', 'audio', 'excel', 'font', 'prefab', 'raw', 'sprite', 'state', 'texture'].forEach(function(p) {
            var dirFullPath = path.join(dir, 'Assets', p);
            fs.ensureDirSync(dirFullPath);
        });

        return true;
    }
    catch (e) {
        return errorRoutine('throw exception.', e);
    }
};

// 打开一个工程
clazz.prototype.openProject = function(dir, createFlag) {
    var errorRoutine = function(errorMsg, e) {
        if (e == null) {
            G.log.trace(errorMsg);
            return errorMsg;
        }
        else {
            G.log.error(errorMsg, e);
            return errorMsg + e;
        }
    };

    // 必须是绝对路径
    if (!path.isAbsolute(dir))
        return errorRoutine('请输入工程的全路径。');

    // 确保格式为目录形态
    dir = path.join(dir, '/');

    try {
        // 简单的进行验证，确保路径存在
        if (!fs.existsSync(dir) ||
            !fs.statSync(dir).isDirectory())
            return errorRoutine('目标' + dir + '不是一个有效目录。');

        // 检查是否有 ProjectSetting/project.setting
        if (createFlag !== true &&
            (!fs.existsSync(path.join(dir, 'ProjectSetting')) ||
             !fs.existsSync(path.join(dir, 'ProjectSetting/project.setting'))))
            return errorRoutine('不存在project.setting，认为不是有效工程。');

        // 生成新工程的配置

        // 取消对之前目录的监听
        G.fsWatcher.forEach(function(fsWatcher) {
            fsWatcher.close();
        });

        G.gameRoot = dir;

        // 增加对新路径的监听
        G.watch.watchDir(G.gameRoot);

        M.USER_SCRIPTS.clearAllJsExt();

        // 切换静态监听
        M.COMMUNICATE.switchStatic();

        this.recordRecentOpen(dir);

        // 派发成功切换工程的事件
        G.emitter.emit('preSwitchProject');
        G.emitter.emit('switchProject');

        // 返回成功
        return true;
    }
    catch (e) {
        return errorRoutine('打开工程异常，异常原因：', e);
    }
};

// 发布工程到指定目录
clazz.prototype.publishTo = function(dstDir) {
    var buildify = require('buildify');
    var fsEx = G.load('filesystem/FsExpand');

    if (!G.gameRoot) return '无效工程。';

    if (!G.config.scene.scene || !Object.keys(G.config.scene.scene).length)
        return '场景列表为空，无法发布游戏，请通过菜单工程-设置进行编辑。';

    // G.log.trace('强行刷新下uuid2file。');
    G.gameFiles.refresh();

    // 收集插件列表
    var pluginScripts = M.PLUGIN_SCRIPTS.getPluginScripts();

    // 收集文件列表
    var userScripts = M.USER_SCRIPTS.getUserScripts();
    var ver = G.config.project.version;

    // 校验 ver
    if (!ver || (!/^\d[\d\.]*\d$/.test(ver) && !/^\d$/.test(ver)))
        return '版本号信息有误，期望[0-9]跟.组成，请在菜单设置中设置版本号。';

    // 1. 写入所有user scripts到一个文件中
    var debugJSPath = 'js/game-scripts-debug-' + ver + '-' + G.uuid() + '.js';
    var miniJSPath = 'js/game-scripts-mini-' + ver + '.js';

    // 确保 js 目录存在
    fs.ensureDirSync(path.join(dstDir, 'js'));

    var packTemplatePath = 'Template/ScriptPackTemplate.js';

    // 生成混淆后的内容，写入文件
    buildify(G.gameRoot)
        .setDir(path.dirname(M.PLUGIN_SCRIPTS.pluginsRoot))
        .concat(pluginScripts)
        .setDir(G.gameRoot)
        .concat(userScripts)
        .setDir(G.editorRoot)
        .wrap(packTemplatePath, { version : ver })
        .setDir(dstDir)
        .save(debugJSPath)
        .uglify()
        .save(miniJSPath);

    // 2. 根据 Publish.templet.html 生成 StartGame.html
    // 读取模板文件
    var content = fs.readFileSync(G.editorRoot + 'Template/Publish.templet.html', 'utf8');

    // 替换脚本文件
    content = content.replace(/__PUBLISH_USER_SCRIPTS__/g, miniJSPath);

    // 替换插件文件
    content = M.PLUGIN_SCRIPTS.genTemplateContent(content, true);

    // 写入目标文件
    fs.writeFileSync(path.join(dstDir, 'StartGame.html'),
        M.USER_SCRIPTS.genTemplateContent(content, true));

    // 3. 复制所有的 bin/ttf 到 Build 下

    // 遍历 Game/Assets 文件夹
    var explorePath = function(dir, targetDir) {
        if (!fs.existsSync(dir))
            return;
        var list = fs.readdirSync(dir);
        for (var i = 0, len = list.length; i < len; i++) {
            var subPath = list[i];
            var fullPath = path.join(dir, subPath);
            var stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // 如果是 xx@atlas 无视该路径
                if (subPath.indexOf('@atlas') >= 0) continue;
                explorePath(path.join(dir, subPath), path.join(targetDir, subPath));
            }
            else {
                var ext = path.extname(subPath).toLowerCase();
                var needExploreRaw = fsEx.needExploreRawFile(dir);
                if (!needExploreRaw &&
                    ['.bin', '.eot', '.ttf', '.svg', '.woff', '.ttc', '.mp3', '.ogg', '.js', '.css'].indexOf(ext) < 0) continue;

                // 拷贝本文件
                fs.ensureDirSync(targetDir);
                var content = fs.readFileSync(fullPath);
                fs.writeFileSync(path.join(targetDir, subPath), content);
            }
        }
    };
    explorePath(path.join(G.gameRoot,'Assets'), path.join(dstDir, 'Assets'));

    var pluginAssets = M.PLUGIN_SCRIPTS.getPluginAssets();
    var len = pluginAssets.length;
    while (len--) {
        var relativePath = path.relative(M.PLUGIN_SCRIPTS.pluginsRoot, pluginAssets[len]);
        explorePath(pluginAssets[len], path.join(dstDir, 'Plugins', relativePath));
    }

    return true;
};

// 获取最近打开的工程列表
clazz.prototype.getRecentOpen = function() {
    // 获取配置信息
    var conf;
    try {
        conf = fs.readJsonSync(path.join(G.editorRoot, 'project.setting'), { throws : false });    
    }
    catch(e) {
        conf = null;
    }
    if (!conf) return [];
    if (!conf.recentOpen) return [];
    return conf.recentOpen;
};

// 设置最近打开的工程列表
clazz.prototype.setRecentOpen = function(recentOpen) {
    // 获取配置信息
    var conf;
    try {
        conf = fs.readJsonSync(path.join(G.editorRoot, 'project.setting'), { throws : false });    
    }
    catch (e) {
        conf = null;
    }
    
    if (!conf) conf = {};
    conf.recentOpen = recentOpen;
    G.load('filesystem/FsExpand').writeJsonSync(path.join(G.editorRoot, 'project.setting'), conf);
};

// 记录最近打开的工程列表
clazz.prototype.recordRecentOpen = function(dir) {
    // 获取 project 设置
    var conf;
    try {
        conf = fs.readJsonSync(path.join(G.editorRoot, 'project.setting'), { throws : false });    
    }
    catch (e) {
        conf = null;
    }
    var recentOpen;
    if (!conf) {
        conf = {};
        recentOpen = [];
    }
    else {
        recentOpen = conf.recentOpen;
        if (!recentOpen) recentOpen = [];
    }

    // 将新的 path 放在 list 的头部
    var index = recentOpen.indexOf(dir);


    if (index >= 0) {
        recentOpen.splice(index, 1);
        recentOpen.splice(0, 0, dir);
    }
    else {
        recentOpen.splice(0, 0, dir);
        if (recentOpen.length > recentRecordNumber)
            recentOpen = recentOpen.slice(0, recentRecordNumber);
    }

    // 回写保存
    conf.recentOpen = recentOpen;
    G.load('filesystem/FsExpand').writeJsonSync(path.join(G.editorRoot, 'project.setting'), conf);
};

// 生成game html文件
clazz.prototype.genGameHTML = function() {
    // G.log.trace('强行刷新下uuid2file。');
    G.gameFiles.refresh();

    M.COMMAND.dispatch('START_GAME_HTML', -1);
    M.COMMAND.dispatch('START_SCENE_HTML', -1);
    M.COMMAND.dispatch('PREVIEW_GAME_HTML', -1);
};

// file change 的时候异步生成游戏 html，该函数会聚合同一时间的请求为一次
clazz.prototype.prepareGenGameHTML = function() {
    // 尝试去获取整个文件夹的信息
    var self = M.PROJECT;
    var tick = new Date().getTime();

    if (tick - self._fileChangeMutex < 100 &&
        self._timeoutID)
        // 已经处于加载中，删除之前的 timer 延后生成
        clearTimeout(self._timeoutID);

    self._fileChangeMutex = tick;
    self._timeoutID = setTimeout(function() {
        delete self._fileChangeMutex;
        delete self._timeoutID;
        self.genGameHTML();
    }, 100);
};

// 定义模块
G.defineModule('PROJECT', clazz);
