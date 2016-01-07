/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 拓展插件，用于管理项目和插件系统的服务拓展
 */
var fsEx = G.load('filesystem/FsExpand');
var fs = require('fs-extra');
var path = require('path');

var clazz = function() {
    var self = this;

    // 保存当前所有载入的模块
    self.externalModules = [];

    // 在项目切换时，需要切换环境中的服务器拓展
    G.emitter.on('switchProject', self.onSwitchProject.bind(self));
    G.emitter.on('fileChanged', self.onFileChanged.bind(self));

    // 载入当前生效的拓展模块
    self.loadAllModule();
};

clazz.prototype = {};
clazz.prototype.constructor = clazz;

// 项目切换时
clazz.prototype.onSwitchProject = function() {
    var self = this;

    self.loadAllModule();
};

// 使用的插件产生变化时
clazz.prototype.onEffectivePluginsChanged = function() {
    var self = this;

    self.loadAllModule();
};

// 文件发生变化时
clazz.prototype.onFileChanged = function(file) {
    var self = this,
        moduleChanged = false,
        len = self.externalModules.length;

    while (len--) {
        if (file.indexOf(self.externalModules[len]) === 0) {
            moduleChanged = true;
            break;
        }
    }

    if (moduleChanged) {
        self.loadAllModule();
    }
};

// 清理当前依赖
clazz.prototype.unloadModule = function(moduleDir) {
    var module = require('module');
    var allCacheModule = Object.keys(module._cache);
    var len = allCacheModule.length;
    while (len--) {
        var path = allCacheModule[len];
        if (path.indexOf(moduleDir) === 0) {
            var mod = module._cache[path];
            if (mod && mod.destruct)
                mod.destruct();
            delete module._cache[path];
        }
    }
};

// 载入项目中的配置
clazz.prototype.loadProjectModule = function() {
    var self = this;
    var externalModulesPath = path.join(G.gameRoot, 'Editor/Service');
    self.externalModules.push(externalModulesPath);
    var serviceExtend = M.USER_SCRIPTS.getServiceExtends();
    try {
        for (var idx = 0, len = serviceExtend.length;
            idx < len; ++idx) {
            var fullPath = path.join(G.gameRoot, serviceExtend[idx]);
            self.load(fullPath);
        }
    }
    catch(ex) {
        G.log.trace('Load on module failed: ' + externalModulesPath);
        G.log.trace(ex);
    }
};

// 载入插件中的配置
clazz.prototype.loadPluginModule = function() {
    var self = this;
    var plugins = M.PLUGIN_SCRIPTS.getEffectivePlugin();
    var len = plugins.length;
    while (len--) {
        if (!fs.existsSync(plugins[len].serviceRoot))
            continue;
        self.externalModules.push(plugins[len].serviceRoot);
        try {
            self.loadDir(plugins[len].serviceRoot);
        }
        catch(ex) {
            G.log.trace('Load on module failed: ' + plugins[len].serviceRoot);
            G.log.trace(ex);
        }
    }
};

// 载入所有模块
clazz.prototype.loadAllModule = function() {
    var self = this;
    // 清理之前载入的模块
    self.clearAllModule();

    if (!G.gameRoot)
        return;
    try {
        self.loadProjectModule();
        self.loadPluginModule();
    }
    catch(e) {
        G.log.trace('Load on module failed');
        G.log.trace(e);
    }
};

// 清理当前项目所有引用的依赖
clazz.prototype.clearAllModule = function() {
    var self = this,
        len = self.externalModules.length;

    while (len--) {
        self.unloadModule(self.externalModules[len]);
    }

    self.externalModules = [];
};

// 载入一个代码文件
clazz.prototype.load = function(file) {
    return require(file);
};

// 载入一个目录下的所有js代码
clazz.prototype.loadDir = function(dir) {
    var fullDir = path.join(G.editorRoot, dir);
    if (!fs.existsSync(dir)) {
        return;
    }
    var list = fs.readdirSync(dir);
    var fsEx = G.load('filesystem/FsExpand');
    for (var i in list) {
        if (path.extname(list[i]).toLowerCase() !== '.js') continue;

        var p = path.join(dir, list[i]);
        var stat = fs.statSync(p);
        if (stat.isDirectory()) continue;

        // 载入
        require(p);
    }
};

// 载入编辑器已有的拓展模块
clazz.prototype.loadExistModule = function(moduleName) {
    return require(path.join(G.editorRoot, '../node_modules', moduleName));
};

// 定义模块
G.defineModule('EXTERNAL_MODULES', clazz);
