/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 负责编辑器后台的启动
 */

// 全局的数据
G = {};
M = {};

// 载入版本数据
require('./Version.js');

// writeJson 的时候，不需要写入空格
var fs = require('fs-extra');
fs.jsonfile.spaces = 0;

// 记录项目路径
var path = require('path');

G.editorRoot = path.join(path.normalize(__dirname), '/');

// 建立事件派发器
var eventEmitter = require('events').EventEmitter;
G.emitter = new eventEmitter();

// 定义全局的代码载入函数
var compiler = require('./base/Compiler');
var load = G.load = compiler.load;
G.loadDir = compiler.loadDir;
var util = load('base/Util');
G.defineModule = util.defineModule;
G.uuid = util.uuid;
M.util = util;

// 日志系统
var log = G.log = load('base/Log');

// 碰到错误的时候，打印信息不退出
process.on('uncaughtException', function (err) {
    G.log.error('Caught exception: ', err);
});

// 指定 debug 多输出一些信息
if (process.argv.indexOf('--debug') > 0) {
    log.enableDebug = true;
}

// 载入资源类型的配置
load('misc/AssetType.js');

// 载入工程模块
G.load('module/Project.js');
var recentOpen = M.PROJECT.getRecentOpen();
if (recentOpen && recentOpen.length) {
    try {
        // 简单的进行验证，确保路径存在
        var dir = recentOpen[0];
        if (fs.existsSync(dir) &&
            fs.statSync(dir).isDirectory() &&
            fs.existsSync(path.join(dir, 'ProjectSetting')) &&
            fs.existsSync(path.join(dir, 'ProjectSetting/project.setting')))
            G.gameRoot = dir;
    }
    catch (e) {}
}

// 确保所有工程各文件和目录齐全
load('filesystem/AutoConfigProject');

// 提供socket服务
load('base/ModuleBase');
G.load('socket/Communicate');
G.load('socket/Command');
M.COMMAND.init();
//载入更新管理
G.load('misc/UpdateManager.js');
// 载入打包模块
G.load('pack/Pack');

// 确保Temp的一些文件被打包出来了，便于编辑器前端直接调用
load('filesystem/AutoPackTempFile');

// 监控工程目录
var watch = G.watch = G.load('filesystem/Watch');
setInterval(function() {
    // G.log.trace('完整遍历工程目录。');
    watch.exploreDaemon();
}, 30 * 1000);
watch.exploreDaemon();
if (G.gameRoot) watch.watchDir(G.gameRoot);

// 服务启动完毕后需要一个控制台
if (process.argv.indexOf('--repl') > 0) {
    var repl = require("repl");
    var chalk = require('chalk');
    G.emitter.on('serviceOn', function() {
        repl.start({
            prompt: chalk.green('QCNode> '),
            input: process.stdin,
            output: process.stdout
        });
    });
};

// 打包后的资源
G.load('filesystem/GameFiles');

// 载入插件模块
G.load('module/PluginScripts.js');

// 载入用户脚本处理模块
G.load('module/UserScripts.js');

// 配置信息模块
G.load('module/Setting.js');

// 场景管理模块
G.load('module/SceneManager.js');

// 载入工具处理模块
G.loadDir('patch');

// 通知所有模块载入成功
G.emitter.emit('postInit');
