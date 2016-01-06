/**
 * Created by wudm on 9/8/15.
 */

var MY_FLAG = 2;

var path = require('path');
var fs = require('fs-extra');
var chalk = require('chalk');

module.exports = {};

var urlMap;

// 收集当前目录的 uuid / url 映射
var gatherUrlMap = function(rootDir) {
    // 读取整个目录的资源
    var self = this;

    urlMap = {
        __builtin_resource__ : '__builtin_resource__'
    };

    var readDirDeep = function(dir) {
        var list = fs.readdirSync(dir);
        list.forEach(function(subPath) {
            var fullPath = dir + '/' + subPath;
            var stat;

            try { stat = fs.statSync(fullPath); } catch (e) { return; }
            if (!stat) return;

            if (stat.isDirectory())
                readDirDeep(fullPath);
            else {
                var ext = path.extname(fullPath).toLowerCase();
                if (ext !== '.bin') return;
                var metaPath = fullPath + ".meta";
                if (!fs.existsSync(metaPath)) return;

                var metaContent = null;
                try {
                    metaContent = fs.readJSONFileSync(metaPath, { throws : false });
                }
                catch(e) {
                    metaContent = null;
                }
                if (metaContent == null) return;

                // 缓存uuid信息
                urlMap[metaContent.uuid] = path.posix.relative(rootDir, fullPath);
            }
        });
    };

    readDirDeep(rootDir);
};

// 根据 url 找到 key
var locateUrl = function(url) {
    for (var key in urlMap) {
        if (urlMap[key] === url)
            return key;
    }
};

/**
 * 干掉 Prefab 中的 url，顺带如果有 uuid -> url 对应不上的情况，修复
 */
var modifyFile = function(filePath) {
    var ext = path.extname(filePath).toLowerCase();
    if (ext !== '.state' && ext !== '.prefab') return;
    if (!urlMap) return;
    var data;
    try {
        data = fs.readJsonSync(filePath, { throw : false });   
    }
    catch (e) {
        data = null;
    }
    if (!data) return;
    var modified = false;
    var deepModify = function(p) {
        for (var name in p) {
            var content = p[name];
            if (content && content.length >= 4 &&
                typeof(content[2]) === 'string' &&
                content[2].indexOf('.bin') >= 0) {
                    modified = true;
                    var url = content[2];
                    content.splice(2, 1);
                    if (urlMap[content[1]] !== url) {
                        var newKey = locateUrl(url);
                        G.log.trace(chalk.yellow('不一致修复(x):\n' +
                            '    旧uuid:' + content[1] + '\n' +
                            '    对应url:' + urlMap[content[1]] + '\n' +
                            '    实际url:' + url + '\n' +
                            '    修复为:' + newKey));
                        content[1] = newKey;
                        content[3] = newKey;
                    }
                }

            if (content && content.key && content.uuid && content.url) {
                modified = true;
                var url = content.url;
                delete content.url;
                if (urlMap[content.key] !== url) {
                    var newKey = locateUrl(url);
                    G.log.trace(chalk.yellow('不一致修复(x):\n' +
                        '    旧uuid:' + content.key + '\n' +
                        '    对应url:' + urlMap[content.key] + '\n' +
                        '    实际url:' + url + '\n' +
                        '    修复为:' + newKey));
                    content.key = newKey;
                    content.uuid = newKey;
                }
            }

            if (typeof(content) === 'object')
                deepModify(content);
        }
    };
    deepModify(data);

    // 写入文件
    if (modified) {
        fs.writeJSONSync(filePath, data);
    }
};

/**
 * 递归遍历所有的预制、场景，修复其中的 colorTint
 */
var modifyDir = function(dir) {
    var settingPath = path.join(dir, 'ProjectSetting/project.setting');
    var isProjectRoot = false;

    if (fs.existsSync(settingPath)) {
        var projectConf;
        try {
            projectConf = fs.readJsonSync(settingPath, { throws : false });   
        }
        catch(e) {
            projectConf = null;
        }
        if (projectConf == null) {
            return;
        }
        var toolFlag = projectConf.toolFlag || 0;
        if (toolFlag & (1 << MY_FLAG)) {
            // G.log.trace('目录{0}已经处理过converPrefabForRemoveUrl工具。', dir);
            return;
        }

        isProjectRoot = true;

        // 设置回写
        projectConf.toolFlag = (toolFlag | (1 << MY_FLAG));
        G.load('filesystem/FsExpand').writeJsonSync(settingPath, projectConf);

        // 收集 uuid/url 映射
        gatherUrlMap(dir);

        // 确保清空 scene_editor
        var sceneEditorPath = path.join(dir, 'Temp', 'scene_editor.state');
        G.load('filesystem/FsExpand').writeJsonFileSync(sceneEditorPath, {
            dependences: {},
            data: {}
        });
        // 确保删除 editor.setting 中的 currScene
        var editorSettingPath = path.join(dir, 'ProjectSetting', 'editor.setting');
        if (fs.existsSync(editorSettingPath)) {
            var conf;
            try {
                conf = fs.readJsonFileSync(editorSettingPath, { throws : false });
            }
            catch(e) {
                conf = {};
            }
            
            delete conf['currScene'];
            if (G.config && G.config.editor && dir === G.gameRoot)
                delete G.config.editor['currScene'];
            G.load('filesystem/FsExpand').writeJsonFileSync(editorSettingPath, conf);
        }
        if (G.watch) G.watch.tryPackByOneFile(sceneEditorPath);
    }

    // 逐个文件处理
    fs.readdirSync(dir).forEach(function(subPath) {
        var fullPath = dir + '/' + subPath;
        var stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // 是一个目录，继续递归下去处理
            modifyDir(fullPath);
        }
        else {
            modifyFile(fullPath);
        }
    });

    // 需要扫描重新打包
    if (isProjectRoot) {
        // G.log.trace('重新打包{0}下的资源。', dir);
        G.load('filesystem/Watch').exploreDaemon(dir);
    }
};

/**
 * 处理入口
 * 使用：G.load('patch/convertPrefabForRemoveUrl').rebuild()
 */
module.exports.rebuild = function(fullPath) {
    if (!fullPath) fullPath = G.gameRoot;
    if (!fullPath)
        // 还是无法获取到目录
        return;
    if (!fs.existsSync(fullPath)) {
        G.log.trace('路径' + fullPath + '不存在。');
        return;
    }

    var dir = fullPath;
    G.log.trace(chalk.red('开始处理路径:' + fullPath));

    if (!fs.statSync(fullPath).isDirectory()) {
        G.log.trace(chalk.red('请输入有效的目录。'));
    }
    else
        modifyDir(fullPath);

    G.load('filesystem/Watch').exploreDaemon(dir);
    G.log.trace(chalk.red('处理结束。'));
};

// 打开工程、切换工程的时候尝试 convert
if (G.gameRoot) modifyDir(G.gameRoot);
G.emitter.on('switchProject', function() {
    modifyDir(G.gameRoot);
});
