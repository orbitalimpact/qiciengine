/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 用户的逻辑脚本维护
 * 数据来源：G.gameFiles
 */
var fs = require('fs-extra');
var path = require('path');
var topo = G.load('misc/toposort.js');
var fsEx = G.load('filesystem/FsExpand');

var clazz = function() {
};
clazz.prototype = {};
clazz.prototype.constructor = clazz;

/**
 * 获取一个脚本依赖(uuid)
 */
clazz.prototype.getDependence = function(script) {
    return G.gameFiles.scriptDependence[script] || [];
};

/**
 * 添加一个脚本依赖(uuid)
 */
clazz.prototype.addDependence = function(script, dependence) {
    // 检查闭环依赖，如果存在则不允许加入
    var dependences = G.gameFiles.scriptDependence;
    if (!topo.canAddEdge(dependences, script, dependence))
        // 不允许增加这条依赖
        return '依赖关系出现环状，无法添加该依赖。';

    if (script === G.gameFiles.entryScript)
        // 不能添加入口文件的依赖
        return '入口文件不能依赖其他脚本。';

    if (!dependences[script]) {
        dependences[script] = [dependence];
    }
    else {
        var index = dependences[script].indexOf(dependence);
        if (index >= 0) return;

        dependences[script].push(dependence);
    }

    // 立刻序列化下
    this.save();

    return true;
};

/**
 * 移除一个脚本依赖(uuid)
 */
clazz.prototype.removeDependence = function(script, dependence) {
    var arr = G.gameFiles.scriptDependence[script];
    if (!arr) return false;

    var index = arr.indexOf(dependence);
    if (index < 0) return false;

    // 删除元素
    arr.splice(index, 1);
    if (arr.length === 0)
        delete G.gameFiles.scriptDependence[script];

    // 立刻序列化下
    this.save();
    return true;
};

/**
 * 设置一个脚本作为入口
 */
clazz.prototype.setAsEntry = function(script) {
    var arr = G.gameFiles.scriptDependence[script];
    if (arr && arr.length)
        return 'Current script relys on other, it can not be used as the entrance.';

    // 设置并立即序列化
    G.gameFiles.entryScript = script;
    this.save();

    return true;
};

/**
 * 当前脚本是否入口
 */
clazz.prototype.isEntry = function(script) {
    // 设置并立即序列化
    return G.gameFiles.entryScript === script;
};

/**
 * 获取某个目录下的脚本，需要按照依赖关系排序
 */
clazz.prototype.getScripts = function(dir) {
    // 收集所有的脚本文件
    var uuid2file = G.gameFiles.uuid2file;

    var scriptFile = {};
    var count = 0;
    for (var uuid in uuid2file) {
        var path = uuid2file[uuid];
        if (path.indexOf(dir) == 0) {
            count++;
            scriptFile[uuid] = path;
        }
    }

    // 返回信息
    var ret = new Array(count);

    // 获取拓扑列表（ [a, b, c] 表示 c 是 0 依赖）
    var topoOrder = topo.toposort(G.gameFiles.scriptDependence);
    var entryPath;
    if (G.gameFiles.entryScript)
        entryPath = scriptFile[G.gameFiles.entryScript];

    // 从第一个开始搞，将依赖最多的逐渐加入队列尾部中
    var cursor = 0;
    var length = topoOrder.length;
    while (cursor < length) {
        var uuid = topoOrder[cursor++];
        var path = scriptFile[uuid];
        if (path) {
            // 相对设置为 0 会比删除快一些
            scriptFile[uuid] = 0;
            // 入队列尾部
            ret[--count] = path;
        }
    }

    // 剩下的全部是 0  依赖的元素
    for (var uuid in scriptFile) {
        var path = scriptFile[uuid];
        if (path) {
            ret[--count] = path;
            if (count <= 0)
                break;
        }
    }

    // entry file 无条件在第一个
    if (entryPath) {
        var pos = ret.indexOf(entryPath);
        if (pos > 0) {
            ret.splice(pos, 1);
            ret.unshift(entryPath);
        }
    }

    // 返回
    return ret;
};

/**
 * 按照脚本依赖，获取所有的逻辑脚本列表
 */
clazz.prototype.getUserScripts = function() {
    // 取得用户自定义脚本，强制在Game/Scripts目录下
    return this.getScripts('Scripts');
};

/**
 * 获取编辑器扩展的脚本列表
 */
clazz.prototype.getEditorExtends = function() {
    // 获取用户的编辑器扩展脚本，强制在Game/Editor目录下
    return this.getScripts('Editor');
};

/**
 * 打印逻辑脚本
 */
clazz.prototype.printLogicScripts = function(publish) {
    var scripts = this.getUserScripts();
    var content = '';
    for (var i in scripts) {
        var s = scripts[i];
        if (!publish) {
            // 后面挂载个随机字符串，确保浏览器不会加载缓存的代码
            s = M.USER_SCRIPTS.addJsExtToDenyCache(s);
        }
        content += "\t\t\t" + "'../" + s + "',\n";
    }
    return content;
};

/**
 * 打印编辑器扩展脚本
 */
clazz.prototype.printEditorExtends = function() {
    var template = '    <script src="__FILE__"></script>\n';
    var scripts = this.getEditorExtends();
    var content = '';
    for (var i in scripts) {
        content += template.replace(/__FILE__/g, '' + scripts[i]);
    }
    return content;
};

// 替换 __LOADING_ASSET_COUNT__
clazz.prototype.replaceLoadingAssetCount = function(content, publish) {

    var assetCount = 1;

    if (!G.config.project.loading)
    {
        if (publish)
        {
            // 发布，则读 entryScene 对应的 state 文件
            var entryScene = G.config.scene.entryScene;
            var scenePath = G.config.scene.scene[entryScene];

            console.log(entryScene, scenePath)
            var fullPath = fsEx.expandPath(path.join(G.gameRoot, scenePath));
            fullPath = fullPath.replace('.bin', '.state');
            console.log('replaceLoadingAssetCount', fullPath);
            var state = fs.readJSONFileSync(fullPath);
            for (var key in state.dependences)
            {
                if (key != "__builtin_resource__")
                    assetCount += 1;
            }
        }
        else
        {
            var fullPath = fsEx.expandPath(path.join(G.gameRoot, 'Temp/scene_editor.state'));
            console.log('replaceLoadingAssetCount', fullPath);
            var state = fs.readJSONFileSync(fullPath);
            for (var key in state.dependences)
            {
                if (key != "__builtin_resource__")
                    assetCount += 1;
            }
        }
    }

    content = content.replace(/__LOADING_ASSET_COUNT__/g, assetCount);

    return content;
}

/**
 * 加工 StartGame/StartScene 模板
 */
clazz.prototype.genTemplateContent = function(content, publish) {
    // uuid to url map
    var urlMapPath;

    if (publish)
        urlMapPath = './Assets/meta/globalUrlMap.js';
    else
        urlMapPath = M.USER_SCRIPTS.addJsExtToDenyCache('./Assets/meta/globalUrlMap.js', true);

    content = content.replace(/__URLMAP_SCRIPTS__/g, "'" + urlMapPath + "',");

    // 生成逻辑脚本（如果有明确指定 userScripts 则直接使用这一份）
    content = content.replace(/__USER_SCRIPTS__/g, this.printLogicScripts(publish));

    // 替换配置文件
    var config = fs.readFileSync(path.join(G.editorRoot, 'Template/html_config.templet.js'), 'utf8');
    content = content.replace(/__CONFIG__/g, config);

    // 所有的场景
    var scenes = '';
    for (var i in G.config.scene.scene) {
        scenes += ',\n            ';

        var s = G.config.scene.scene[i];
        scenes += '"' + i + '"' + ' : "' + s + '"';
    }
    if (publish) {
        // 发布的话，去掉第一个,
        if (scenes.length > 0) scenes = scenes.substr(1);
    }
    content = content.replace(/__SCENE_LIST__/g, scenes);

    // 替换其他数据
    content = content.replace(/__PROJECT_NAME__/g, G.config.project.projectName);
    content = content.replace(/__GAME_NAME__/g, G.config.project.gameName);
    content = content.replace(/__COMPANY_NAME__/g, G.config.project.companyName);
    content = content.replace(/__BUNDLE_IDENTIFIER__/g, G.config.project.bundleIdentifier);
    content = content.replace(/__GAME_INSTANCE__/g, G.config.project.gameInstance);
    content = content.replace(/__FRAMERATE__/g, JSON.stringify(G.config.project.frameRate));
    content = content.replace(/__BACKGROUNDCOLOR__/g, G.config.project.backgroundColor);
    content = content.replace(/__RUNINBACKGROUND__/g, G.config.project.runInBackground);
    content = content.replace(/__ANTIALIAS__/g, G.config.project.antialias);
    content = content.replace(/__TRANSPARENT__/g, G.config.project.transparent);
    content = content.replace(/__RENDERER__/g, G.config.project.renderer);
    content = content.replace(/__ENTRY_SCENE__/g, G.config.scene.entryScene);
    content = content.replace(/__LOADINGPREFAB__/g, G.config.project.loading || '');
    content = content.replace(/{__ver__}/g, G.VERSION);

    var meta = "    <meta name='viewport' content='width=device-width,user-scalable=no'>\n" +
                "    <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent'>\n" +
                "    <meta name='apple-mobile-web-app-capable' content='yes'>\n" +
                "    <meta name='apple-mobile-web-app-title' content='QICI Engine'>\n" +
                "    <link rel='apple-touch-icon' href='../../build/imgs/qici.png'>\n" +
                "    <link rel='apple-touch-startup-image' href='../../build/imgs/qici.png'>\n";

    content = content.replace(/__VIEWPORT__/g, meta);

    if (publish) {
        content = content.replace(/__DEVELOPERMODE__/g, G.config.project.developerMode);
    }

    content = content.replace(/__initResizableGameSize__/g, fs.readFileSync(path.join(G.editorRoot, 'Template/html_initResizableGameSize.templet.js'), 'utf8'));
    content = content.replace(/__INIT_SIMPLE__/g, fs.readFileSync(path.join(G.editorRoot, 'Template/html_init_simple.templet.js'), 'utf8'));

    content = M.USER_SCRIPTS.replaceLoadingAssetCount(content, publish);

    return content;
};

/**
 * 序列化
 */
clazz.prototype.save = function() {
    fs.writeJSONFileSync(G.gameRoot + 'ProjectSetting/script.setting', {
        dependence : G.gameFiles.scriptDependence,
        entry : G.gameFiles.entryScript
    });

    // 重新生成游戏启动文件
    G.log.debug('save script setting, generate html.');
    M.PROJECT.genGameHTML();
};

/**
 * 反序列化
 */
clazz.prototype.restore = function() {
    var jsonData = fs.readJSONFileSync(G.gameRoot + 'ProjectSetting/script.setting') || {};
    G.gameFiles.scriptDependence = jsonData.dependence || {};
    G.gameFiles.entryScript = jsonData.entry;
};

var jsExtMap = {};

/**
 * 为 JS 加入后缀，用于强行防止浏览器缓存
 */
clazz.prototype.addJsExtToDenyCache = function(key, forceRefresh) {
    var rawKey = key;
    key = key.replace(/\\/g, '/');
    var double = /\/\//;
    while (key.match(double))
        key = key.replace(double, '/');

    var extInfo = jsExtMap[key];
    if (extInfo && extInfo.ext && !forceRefresh)
        // 上次的后缀还有效
        return rawKey + '?' + extInfo.ext;

    // 无效，生成新的后缀
    if (!extInfo)
        extInfo = jsExtMap[key] = {};

    // 规则：使用 20151014000000 这种 ext
    // 如果同一秒内连续两次生成，则需要增加后缀 20151014000000_1

    var ext = M.util.formattedTime();
    if (ext === extInfo.baseExt) {
        // 重复了
        extInfo.cookie = 1 + (extInfo.cookie || 0);
    }
    else {
        extInfo.baseExt = ext;
        extInfo.cookie = 0;
    }

    // 如果有 cookie，则拼接为 ext_cookie 形式，否则直接 ext
    // 即同一秒内，只调用一次，则形如 20151014000000
    // 如果2次或以上调用，则形如 20151014000000_2
    extInfo.ext = extInfo.baseExt + (extInfo.cookie ? '_' + (extInfo.cookie + 1) : '');

    return rawKey + '?' + extInfo.ext;
};

/**
 * 清空所有JS extension 记录
 */
clazz.prototype.clearAllJsExt = function() {
    jsExtMap = {};
};

/**
 * 标记 js 为脏，此后 addJsExtToDenyCache 就要全新生成一个
 */
clazz.prototype.markJsExtDirty = function(key) {
    if (!G.gameRoot) return;
    key = path.relative(G.gameRoot, key);
    key = key.replace(/\\/g, '/');
    var double = /\/\//;
    while (key.match(double))
        key = key.replace(double, '/');

    var extInfo = jsExtMap[key];
    if (!extInfo) return;
    delete extInfo.ext;
};

// 定义模块
G.defineModule('USER_SCRIPTS', clazz);
