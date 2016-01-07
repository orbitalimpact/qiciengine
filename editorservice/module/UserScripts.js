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
 * 获取某个目录下的脚本载入次序信息
 */
clazz.prototype.getScriptOrder = function(dir) {
    if (dir === 'Scripts') return G.gameFiles.logicalScriptOrder || [];
    if (dir === 'Editor') return G.gameFiles.editorScriptOrder || [];
    if (dir === 'Editor/Service') return G.gameFiles.editorServiceScriptOrder || [];
    return [];
};

/**
 * 设置脚本依赖顺序
 */
clazz.prototype.setScriptOrder = function(dir, order) {
    if (!order) order = [];

    G.log.trace('Set script order, path : {0}, order : {1}', dir, order);

    if (dir === 'Scripts') {
        G.gameFiles.logicalScriptOrder = order;
        this.save();

        // 重新生成游戏启动文件
        G.log.debug('save logical script setting, generate html.');
        M.PROJECT.genGameHTML();
    }
    else if (dir === 'Editor') {
        G.gameFiles.editorScriptOrder = order;
        this.save();

        // 重新生成游戏启动文件
        G.log.debug('save editor script setting, generate html.');
        G.emitter.emit('refreshStartupFile');
    }
    else if (dir === 'Editor/Service') {
        G.gameFiles.editorServiceScriptOrder = order;
        this.save();
    }
    else
        return;
};

/**
 * 获取某个目录下的脚本，需要按照依赖关系排序
 */
clazz.prototype.getScripts = function(dir, except) {
    // 收集所有的脚本文件
    var uuid2file = G.gameFiles.uuid2file;

    var order = M.USER_SCRIPTS.getScriptOrder(dir);

    var scriptFile = {};
    var weight, orderLen = order.length;

    for (var uuid in uuid2file) {
        var path = uuid2file[uuid];
        if (path.indexOf(dir) === 0) {
            if (except) {
                // 是否属于排除的对象
                var len = except.length;
                var isException = false;
                while (len-- && !isException) {
                    isException = path.indexOf(except[len]) === 0;
                }
                if (isException) {
                    continue;
                }
            }
            for (weight = 0; weight < orderLen; weight++)
                if (path.indexOf(order[weight]) === 0)
                    break;

            scriptFile[path] = weight;
        }
    }

    // 根据权重排序
    var arr = Object.keys(scriptFile);
    arr.sort(function(key1, key2) {
        return scriptFile[key1] - scriptFile[key2];
    });

    return arr;
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
    return this.getScripts('Editor', ['Editor/Service']);
};

/**
 * 获取后台扩展的脚本列表
 */
clazz.prototype.getServiceExtends = function() {
    return this.getScripts('Editor/Service');
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
    {
        urlMapPath = './Assets/meta/globalUrlMap.js';
        if (G.config.project.appCache)
            content = content.replace(/__MANIFEST__/g, 'manifest="qici.appcache"');
        else
            content = content.replace(/__MANIFEST__/g, '');
    }
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

    content = content.replace(/__DIRTYRECTAGNLES__/g, G.config.project.dirtyRectangles);
    content = content.replace(/__DIRTYRECTAGNLESSHOW__/g, G.config.project.dirtyRectanglesShow);
    content = content.replace(/{__ver__}/g, G.VERSION);
    
    var meta = "    <meta name='viewport' content='width=device-width,user-scalable=no'>\n" +
                "    <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent'>\n" +
                "    <meta name='apple-mobile-web-app-capable' content='yes'>\n" +
                "    <meta name='apple-mobile-web-app-title' content='" + G.config.project.gameName + "'>\n";

    if (publish) {
        meta += "    <link rel='apple-touch-icon' href='http://engine.zuoyouxi.com/qici.png'>\n" +
                "    <link rel='apple-touch-startup-image' href='http://engine.zuoyouxi.com/qici.png'>\n";
    }
    else {
        meta += "    <link rel='apple-touch-icon' href='../../build/imgs/qici.png'>\n" +
                "    <link rel='apple-touch-startup-image' href='../../build/imgs/qici.png'>\n";        
    }

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
 * application cache 的 __PUBLISH_ASSETS__ 替换
 */
clazz.prototype.genCacheAssetsContent = function(content, publish) {
    if (publish)
    {
        // 发布，则读 entryScene 对应的 state 文件，取得依赖的资源文件名
        var entryScene = G.config.scene.entryScene;
        var scenePath = G.config.scene.scene[entryScene];

        var urlList = [ scenePath ];
        var visited = {};

        var findPrefab = function(prefabUrl, type) {
            // 已经访问过的资源
            if (visited[prefabUrl]) return;
            visited[prefabUrl] = true;

            fullPath = fsEx.expandPath(path.join(G.gameRoot, prefabUrl));
            fullPath = fullPath.replace('.bin', type);
            var prefab = fs.readJSONFileSync(fullPath);
            for (var key in prefab.dependences)
            {
                if (key != "__builtin_resource__")
                {
                    var url = G.gameFiles.uuid2file[key];
                    if (url && urlList.indexOf(url) === -1)
                    {
                        if(/\.(mp3|ogg|mp3\.bin|ogg\.bin)$/.test(url.toLowerCase()))
                            M.USER_SCRIPTS.addSoundCache(url, urlList);
                        else
                            urlList.push(url);
                    }

                    if (url.indexOf('prefab') !== -1)
                        // 预制资源还需要取得其依赖的资源
                        findPrefab(url, '.prefab');
                }
            }
        };

        findPrefab(scenePath, '.state');
        if (urlList.length > 0)
        {
            var str = urlList.join('\n');
            content = content.replace(/__PUBLISH_ASSETS__/g, str);
        }
    }

    return content;
}

// sound 文件需要将各个类型都加入 cache 中
clazz.prototype.addSoundCache = function(url, urlList) {
    var prefix = url.match(/(.*)\.(mp3|ogg)/)[1];
    url = prefix + '.mp3';
    if (urlList.indexOf(url) === -1)
        urlList.push(url);
    url = prefix + '.mp3.bin';
    if (urlList.indexOf(url) === -1)
        urlList.push(url);
    url = prefix + '.ogg';
    if (urlList.indexOf(url) === -1)
        urlList.push(url);
    url = prefix + '.ogg.bin';
    if (urlList.indexOf(url) === -1)
        urlList.push(url);
}

/**
 * 序列化
 */
clazz.prototype.save = function() {
    fs.writeJSONFileSync(G.gameRoot + 'ProjectSetting/script.setting', {
        logicalScriptOrder : G.gameFiles.logicalScriptOrder,
        editorScriptOrder : G.gameFiles.editorScriptOrder
    });
};

/**
 * 反序列化
 */
clazz.prototype.restore = function() {
    var jsonData = fs.readJSONFileSync(G.gameRoot + 'ProjectSetting/script.setting') || {};
    G.gameFiles.logicalScriptOrder = jsonData.logicalScriptOrder || [];
    G.gameFiles.editorScriptOrder = jsonData.editorScriptOrder || []
};

/**
 * 确保 unix 风格
 */
clazz.prototype.toUnixPath = function(key) {
    key = key.replace(/\\/g, '/');
    var double = /\/\//;
    while (key.match(double))
        key = key.replace(double, '/');
    return key;
};

var jsExtMap = {};

/**
 * 为 JS 加入后缀，用于强行防止浏览器缓存
 */
clazz.prototype.addJsExtToDenyCache = function(key, forceRefresh) {
    var rawKey = key;
    key = M.USER_SCRIPTS.toUnixPath(key);

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
