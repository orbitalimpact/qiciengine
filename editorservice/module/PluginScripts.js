/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 插件的逻辑脚本维护
 * 数据来源：G.gameFiles
 */
var fsEx = G.load('filesystem/FsExpand');
var fs = require('fs-extra');
var topo = G.load('misc/toposort.js');
var jsZip = require('jszip');
var path = require('path');

var clazz = function() {
    var self = this;
    self.pluginsRoot = path.join(G.editorRoot,"../Plugins");
    self.collectPlugins();
    G.emitter.on('preSwitchProject', function() {
        self.reloadEffectivePlugins();
        G.watch.watchDir(self.pluginsRoot, 'Plugins');
    });
    G.emitter.on('fileChanged', function(file) {
        if (file.indexOf('Plugins') >= 0) {
            var lowerCaseName = file.toLowerCase();
            if (lowerCaseName.slice(-8) === '.js.meta' ||
                lowerCaseName.slice(-3) === '.js') {
                M.USER_SCRIPTS.markJsExtDirty(fsEx.getVirtualPath(file));
                self.collectPlugins();
                G.log.debug('plugin {0} changed, generate html.', file);
                M.PROJECT.prepareGenGameHTML();
                G.emitter.emit('refreshStartupFile');
            }
        }
    });
    G.watch.watchDir(self.pluginsRoot, 'Plugins');
};
clazz.prototype = {};
clazz.prototype.constructor = clazz;

/**
 * 比较版本号
 * @param v1
 * @param v2
 * @returns {number}
 */
clazz.prototype.compareVersion = function(v1, v2) {
    var one = v1.split('.');
    var two = v2.split('.');
    var max = Math.max(one.length, two.length);
    for (var idx = 0; idx < max; ++idx) {
        var diff = (parseInt(one[idx]) || 0) - (parseInt(two[idx]) || 0);
        if (diff !== 0)
            return diff < 0 ? -1 : 1;
    }
    return 0;
};

/**
 * 搜集所有存在的插件
 * @param dir
 */
clazz.prototype.collectPlugins = function() {
    // 读取整个插件目录的资源
    var self = this;
    var collectJS = function(dir, except) {
        var files = [];
        if (!fs.existsSync(dir)) {
            return files;
        }
        var list = fs.readdirSync(dir);
        list.forEach(function(subPath) {
            var fullPath = path.join(dir, subPath);
            var stat;

            try { stat = fs.statSync(fullPath); } catch (e) { return; }
            if (!stat) return;
            // 隐藏文件不收集
            if (fsEx.isHidden(dir, subPath)) return;

            if (stat.isDirectory()) {
                var tmp = collectJS(fullPath, except);
                (tmp.length > 0) && Array.prototype.push.apply(files, tmp);
            }
            else if (fsEx.extname(fullPath) === '.js') {
                if (except.indexOf(fullPath) < 0)
                    files.push(fullPath);
            }
        });
        return files;
    };

    var sortByDependece = function(col, rootPath, dependence) {
        // 排序
        var ret=  col.sort(function(a, b) {
            var shortA = fsEx.toUnixFileName(path.relative(rootPath, a));
            var shortB = fsEx.toUnixFileName(path.relative(rootPath, b));
            return dependence.indexOf(shortA) < dependence.indexOf(shortB);
        });
        return ret;
    };

    var searchPlugin = function(dir) {
        var plugins = [];
        var list = fs.readdirSync(dir);
        list.forEach(function(subPath) {
            // 隐藏文件不收集
            if (fsEx.isHidden(dir, subPath)) return;

            var fullPath = path.join(dir, subPath);
            var stat;

            try { stat = fs.statSync(fullPath); } catch (e) { return; }
            if (!stat) return;

            if (stat.isDirectory()){
                var tmp = searchPlugin(fullPath);
                if (tmp.length > 0)
                    Array.prototype.push.apply(plugins, tmp);
            }
            else if (fsEx.extname(fullPath) === '.plugin') {
                var plugin;
                // 创建插件
                try {
                    plugin = fs.readJSONFileSync(fullPath) || {};
                }
                catch (e) {
                    G.log.trace('Collect plugins error:' + e);
                    return;
                }

                plugin.root = path.dirname(fullPath);
                plugin.virtualRoot = path.join('Plugins', plugin.id);
                plugin.editorRoot = path.join(dir, plugin.editorRoot || "Editor" );
                plugin.scriptRoot = path.join(dir, plugin.scriptRoot || "Script");
                plugin.assetRoot = path.join(dir, plugin.assetRoot || "Assets");

                plugin.editorFiles = plugin.editorFiles || [];
                plugin.scriptFiles = plugin.scriptFiles || [];
                plugin.editorFiles.forEach(function(value, idx){
                    plugin.editorFiles[idx] = path.join(dir, plugin.editorFiles[idx]);
                });
                plugin.scriptFiles.forEach(function(value, idx){
                    plugin.scriptFiles[idx] = path.join(dir, plugin.scriptFiles[idx]);
                });

                // 对当前脚本依赖整理个依赖排序
                scriptDependence = topo.toposort(plugin.scriptDependence);

                var col = collectJS(plugin.editorRoot, plugin.editorFiles);
                col.length > 0 && Array.prototype.push.apply(plugin.editorFiles,
                    sortByDependece(col, plugin.editorRoot, scriptDependence));

                col = collectJS(plugin.scriptRoot, plugin.scriptFiles);
                col.length > 0 && Array.prototype.push.apply(plugin.scriptFiles,
                    sortByDependece(col, plugin.scriptRoot, scriptDependence));

                plugin.editorFiles.forEach(function(value, idx){
                    if (plugin.editorFiles[idx].indexOf("://") < 0) {
                        plugin.editorFiles[idx] = path.relative(path.dirname(self.pluginsRoot), plugin.editorFiles[idx]);
                    }
                });
                plugin.scriptFiles.forEach(function(value, idx){
                    if (plugin.scriptFiles[idx].indexOf("://") < 0) {
                        plugin.scriptFiles[idx] = path.relative(path.dirname(self.pluginsRoot), plugin.scriptFiles[idx]);
                    }
                });
                plugins.push(plugin);
            }
        });
        return plugins;
    };

    // 搜集所有插件
    var allPlugins = searchPlugin(self.pluginsRoot);
    var plugins = {};
    var dependencies = {};
    for (var key in allPlugins) {
        var plugin = allPlugins[key];
        try {
            if (plugins[plugin.id]) {
                // 取高版本使用
                if (self.compareVersion(plugin, plugins[plugin.id]) <= 0) {
                    continue;
                }
            }
            plugins[plugin.id] = plugin;
        }
        catch (e) {
            G.log.trace('Collect plugins error:' + e);
            continue;
        }
    }
    self.plugins = plugins;
    self.reloadEffectivePlugins();

};

// 载入当前使用的插件
clazz.prototype.reloadEffectivePlugins = function() {
    var self = this;
    // 获取所有生效插件
    var effectivePlugins;
    try {
        effectivePlugins = fs.readJSONFileSync(G.gameRoot + 'ProjectSetting/plugin.setting', {throws : false} ) || {};
    }
    catch(e) {
        effectivePlugins = {};
    }

    // 老版本数组结构的生效插件需要转化为结构类型
    if (Array.isArray(effectivePlugins)) {
        var old = effectivePlugins;
        effectivePlugins = {};
        old.forEach(function(el) {
            effectivePlugins[el] = {};
        });
    }
    var dependencies = {};
    var externalDependencies = {};
    for (var el in effectivePlugins) {
        var plugin = self.plugins[el];
        var dependence = [];
        if (plugin) {
            Array.prototype.push.apply(dependence, plugin.dependence);
            var variable = effectivePlugins[el].variable || {};
            for (var key in plugin.variable) {
                if (!variable[key]) {
                    variable[key] = plugin.variable[key].default || '';
                }

            }
            var dependencieList = externalDependencies[el] = [];
            plugin.external && plugin.external.forEach(function(el) {
                dependencieList.push(self.formatString(el, variable));
            });
        }
        dependencies[el] = dependence;
    }
    // 生成依赖的拓扑图
    var topoList = topo.toposort(dependencies);
    self.effectivePlugins = {};

    var len = topoList.length;
    while (len--) {
        var id = topoList[len];
        if (effectivePlugins[id]) {
            self.effectivePlugins[id] = effectivePlugins[id];
        }
    }
    self.externalDependencies = externalDependencies;
    self.refreshVirtualPath();
};

/**
 * 刷新虚拟目录
 */
clazz.prototype.refreshVirtualPath = function() {
    var self = this;
    fsEx.clearVirtualPath('plugins');
    var plugin;
    for (var pluginId in self.effectivePlugins) {
        if (!(plugin = self.plugins[pluginId])) continue;
        fsEx.mapVirtualPath('plugins', path.join(G.gameRoot, plugin.virtualRoot), plugin.root);
    }

    //派发事件给客户端
    M.COMMAND.broadcast('FILE_CHANGED', {
        event: null,
        fileName: '/Plugins',
        exist: null
    });
};

/**
 * 保存生效的插件信息
 */
clazz.prototype.saveEffectivePlugins = function(effective) {
    var self = this;
    if (effective) {
        self.effectivePlugins = effective;
    }
    fs.writeJSONFileSync(G.gameRoot + 'ProjectSetting/plugin.setting', self.effectivePlugins);

    // 重新生成游戏启动文件
    G.log.debug('save plugins, generate html.');
    M.PROJECT.genGameHTML();

    G.emitter.emit('refreshStartupFile');
    self.refreshVirtualPath();
};

/**
 * 获取指定插件的脚本信息
 */
clazz.prototype.getPluginScript = function(id) {
    var self = this,
        plugin = self.plugins[id];

    if (plugin) {
        var editor = [];
        var script = [];
        plugin.editorFiles.forEach(function(el) {
            editor.push(M.USER_SCRIPTS.addJsExtToDenyCache(el));
        });
        plugin.scriptFiles.forEach(function(el){
            script.push(M.USER_SCRIPTS.addJsExtToDenyCache(el));
        });
        return {
            editor : editor,
            script : script,
            external : plugin.external,
            variable : plugin.variable,
        };
    }
    else {
        return {
            editor : [],
            script : [],
            external : [],
            variable : []
        };
    }
};


/**
 * 获取当前的插件信息
 */
clazz.prototype.getPluginInfo = function() {
    var self = this,
        allPlugin = {};
    self.collectPlugins();
    for (var key in self.plugins) {
        allPlugin[key] = {
            name: self.plugins[key].name,
            version: self.plugins[key].version,
            variable : self.plugins[key].variable
        };
    }
    return {
        plugins : allPlugin,
        effective : self.effectivePlugins
    };
};

/**
 * 按照脚本依赖，获取所有的资源路径列表
 */
clazz.prototype.getPluginAssets = function() {
    var self = this,
        plugin = null,
        assets = [];
    for (var pluginId in self.effectivePlugins) {
        if (!(plugin = self.plugins[pluginId])) continue;
        assets.push(plugin.assetRoot);
    }
    return assets;
};

/**
 * 按照脚本依赖，获取所有的逻辑脚本列表
 */
clazz.prototype.getPluginScripts = function() {
    var self = this,
        plugin = null,
        scripts = [];
    for (var pluginId in self.effectivePlugins) {
        if (!(plugin = self.plugins[pluginId])) continue;
        Array.prototype.push.apply(scripts, plugin.scriptFiles);
    }
    return scripts;
};

/**
 * 获取生效中的插件
 */
clazz.prototype.getEffectivePlugin = function() {
    var self = this,
        plugin = null,
        plugins = [];
    for (var pluginId in self.effectivePlugins) {
        if (!(plugin = self.plugins[pluginId])) continue;
        plugins.push(plugin);
    }
    return plugins;
};

/**
 * 按插件组获取所有逻辑脚本
 * @return {[type]} [description]
 */
clazz.prototype.getPluginScriptGroup = function() {
    var self = this,
        plugin = null,
        scripts = [];
    for (var pluginId in self.effectivePlugins) {
        if (!(plugin = self.plugins[pluginId])) continue;
        scripts[pluginId] = plugin.scriptFiles;
    }
    return scripts;
};

/**
 * 获取编辑器扩展的脚本列表
 */
clazz.prototype.getEditorExtends = function() {
    var self = this,
        plugin = null,
        scripts = [];
    // 取得用户自定义脚本，强制在Game/Scripts目录下
    for (var pluginId in self.effectivePlugins) {
        if (!(plugin = self.plugins[pluginId])) continue;
        Array.prototype.push.apply(scripts, plugin.editorFiles);
    }
    return scripts;
};

/**
 * 按插件分组获取编辑器扩展的脚本列表
 */
clazz.prototype.getEditorExtendsGroup = function() {
    var self = this,
        plugin = null,
        scripts = [];
    // 取得用户自定义脚本，强制在Game/Scripts目录下
    for (var pluginId in self.effectivePlugins) {
        if (!(plugin = self.plugins[pluginId])) continue;
        scripts[pluginId] = plugin.editorFiles;
    }
    return scripts;
};

/**
 * 打印逻辑脚本
 */
clazz.prototype.printLogicScripts = function(publish) {
    var scripts = this.getPluginScriptGroup();
    var content = '';
    for (var i in scripts) {
        var pluginScripts = scripts[i];
        var len = pluginScripts.length;
        while (len-- > 0) {
            var s = pluginScripts[len];
            if (!publish) {
                // 后面挂载个随机字符串，确保浏览器不会加载缓存的代码
                s = M.USER_SCRIPTS.addJsExtToDenyCache(s);
            }
            content = "\t\t\t[" + "'../" + s.replace(/\\/g,'/') + "', '" + i + "'],\n" + content;
        }
    }
    return content;
};

/**
 * 打印外部引用脚本
 * @param publish
 * @returns {string}
 */
clazz.prototype.printExternalDependenceScripts = function(publish) {
    var self = this;
    var scripts = self.externalDependencies;
    var content = '';
    for (var i in scripts) {
        var pluginScripts = scripts[i];
        var len = pluginScripts.length;
        while (len-- > 0) {
            var s = pluginScripts[len];
            // 外部引用脚本不需要添加随机字符串
            if (s.indexOf("://") > 0) {
                content += "\t\t\t[" + "'" + s + "', '" + i + "'],\n";
            }
            else {
                s = M.USER_SCRIPTS.addJsExtToDenyCache(s);
                content = "\t\t\t[" + "'../" + s.replace(/\\/g,'/') + "', '" + i + "'],\n" + content;
            }
        }
    }
    return content;
};

/**
 * 打印编辑器扩展脚本
 */
clazz.prototype.printEditorExtends = function() {
    var template = '    <script src="__FILE__" plugin_id="__PLUGIN_ID__"></script>\n';
    var scripts = this.getEditorExtendsGroup();
    var content = '';
    for (var i in scripts) {
        var pluginScripts = scripts[i];
        var len = pluginScripts.length;
        while (len-- > 0) {
            var s = pluginScripts[len];
            s = M.USER_SCRIPTS.addJsExtToDenyCache(s);
            temp = template.replace(/__FILE__/g, '' + s.replace(/\\/g,'/'));
            temp = temp.replace(/__PLUGIN_ID__/g, i);
            content = temp + content;

        }
    }
    return content;
};

/**
 * 加工 StartGame/StartScene 模板
 */
clazz.prototype.genTemplateContent = function(content, publish) {
    // 添加参数定义
    var variables = {};
    for (var key in this.effectivePlugins) {
        variables[key] = this.effectivePlugins[key].variable;
    }
    content = content.replace(/__PLUGIN_VARIABLES__/g, '\t\t_pluginVariables_=' + JSON.stringify(variables, null, '\t'));

    content = content.replace(/__EXTERNAL_PLUGINS_SCRIPTS__/g, this.printExternalDependenceScripts(publish));
    content = content.replace(/__PLUGINS_SCRIPTS__/g, this.printLogicScripts(publish));
    return content;
};

/**
 * 像服务器查询插件下载地址
 * @param pluginId
 * @param session
 * @param context
 */
clazz.prototype.queryPluginDownloadAddress = function(pluginId, session, callback, context) {
    context = context || this;
    var delayQuery = function(context, e) {
        setTimeout(context.queryPluginDownloadAddress, 20000, pluginId, session, callback, context);
    };
    var queryAddress = 'http://127.0.0.1/pluginAddress.php?pluginId=' + pluginId + '&session=' + session;
    http.get(queryAddress, function(res) {
        res.on('data', function(data) {
            try {
                var json = data.toString();
                var pluginInfo = JSON.parse(json);
                if (callback)
                    callback(pluginInfo);
            }
            catch (e) {
                delayQuery(context, e);
            }
        });
    }).on('error', function(e) {
        delayQuery(context, e);
    });
};

/**
 * 下载文件到指定路径
 * @param url
 * @param path
 * @param callback
 * @private
 */
clazz.prototype._download = function(url, path, callback) {
    http.get(url, function(res) {
        var writeStream = fs.createWriteStream(path);
        writeStream.on('close', function() {
            callback && callback(res);
        });
        res.pipe(writeStream);
    });
};

/**
 * 保存当前版本
 * @private
 */
clazz.prototype._bakCurrVersion = function(pluginId) {
    var baseDir = path.join(G.editorRoot, '../Plugins/', pluginId);
    var bakDir = path.join(G.editorRoot, '../Plugins/', 'bak', pluginId + "_" + G.uuid());
    fs.ensureDirSync(bakDir);
    fs.renameSync(path.join(baseDir, 'lib'), path.join(bakDir, 'lib'));
    fs.renameSync(path.join(baseDir, 'editorservice'), path.join(bakDir, 'editorservice'));
    fs.renameSync(path.join(baseDir, 'node_modules'), path.join(bakDir, 'node_modules'));
    fs.renameSync(path.join(baseDir, 'package.json'), path.join(bakDir, 'package.json'));
};

/**
 * 解压安装插件
 * @param pluginId
 * @param pluginFile
 * @param callback
 * @private
 */
clazz.prototype._unzipPlugin = function(pluginId, pluginFile, callback) {
    var self = this;
    fs.readFile(pluginFile, function(err, data) {
        if (err) {
            callback(false, err);
            return;
        }

        var zip = new jsZip();

        var unzipDir = path.join(G.editorRoot, '../Plugins', pluginId);
        fs.ensureDirSync(unzipDir);
        try {
            zip.load(data);
        }
        catch(e) {
            callback(false, e);
            return;
        }

        // 保存当前版本
        self._bakCurrVersion();

        // 解压版本
        Object.keys(zip.files).forEach(function(filename) {
            var node = zip.files[filename];
            if (node.dir) {
                fs.ensureDirSync(path.join(unzipDir, filename));
            }
            else {
                var content = zip.files[filename].asNodeBuffer();
                if (content) {
                    var filePath = path.join(unzipDir, filename);
                    fs.ensureDirSync(path.dirname(filePath));
                    fs.writeFileSync(filePath, content);
                }
            }

        });
        // 更新完成，派发事件给编辑器
        M.COMMAND.broadcast('UPDATE_VERSION_RESULT', {
            result: 0
        });
    });
};

/**
 * 安装插件
 */
clazz.prototype.installPlugin = function(pluginId, version, session, callback) {
    var self = this;
    var pluginDownloadPath = path.join(G.editorRoot, '../Plugins/Temp');
    fs.ensureDirSync(pluginDownloadPath);
    var downloadAndInstall = function(address) {
        self._download(address, pluginDownloadPath, function() {

        });
    };

    // 根据 pluginId 和 session 请求下载地址
    var queryCallback = function(result) {
        if (result.result !== 0 || result.address) {
            callback(result.result || -1);
            return;
        }

    };
    this.queryPluginDownloadAddress(pluginId, session, queryCallback);
};

/**
 * 格式化字符串
 * @param  {string} base - 文本原文
 * @param  {{}} args - 参数键值对
 * @return {string}
 */
clazz.prototype.formatString = function(base, args) {
    var content = base;
    for (var key in args) {
        var reg = new RegExp('\\{' + key + '\\}','g');
        content = content.replace(reg, args[key]);
    }
    return content;
};

// 定义模块
G.defineModule('PLUGIN_SCRIPTS', clazz);
