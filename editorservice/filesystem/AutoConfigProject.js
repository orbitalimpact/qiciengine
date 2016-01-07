/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 确保工程目录的完整、所有配置文件存在并正确配置
 */

// 载入文件操作库
var fs = require('fs-extra');
var path = require('path');
var fsEx = G.load('filesystem/FsExpand');

var writeEditorSetting = function(o) {
    fsEx.writeJsonFileSync(path.join(G.gameRoot, 'ProjectSetting', 'editor.setting'), o || G.config.editor);
};

var writeScriptSetting = function(o) {
    fsEx.writeJsonFileSync(path.join(G.gameRoot, 'ProjectSetting', 'script.setting'), o || {});
};

var writeProjectSetting = function(o) {
    fsEx.writeJsonFileSync(path.join(G.gameRoot, 'ProjectSetting', 'project.setting'), o || G.config.project);
};

var writeSceneSetting = function(o) {
    fsEx.writeJsonFileSync(path.join(G.gameRoot, 'ProjectSetting', 'scene.setting'), o || G.config.scene);
};

var genEditorHtmlTemplate = function() {
    G.gameFiles.refresh();
    createEditorStarupFile();
    createInstallPluginFile();
};

// 成功启动 node 服务之后，需要复写 html 启动文件
G.emitter.on('serviceOn', function() {
    createProjectFile();
    if (G.gameRoot) {
        M.USER_SCRIPTS.restore();
        genEditorHtmlTemplate();
        createCodeEditorFile();
    }

    if (global.process && global.process.versions['electron']) {
        // 在electron中运行，不要打开浏览器
    }
    else if (process.argv.indexOf('--notOpenProjectPage') >= 0) {

    }
    else {
        var opener = require('opener');
        opener('http://localhost:' + M.COMMUNICATE.port + '/Project.html');

        // 等待 3 秒连接进入
        setTimeout(function() {
            if (G.beConnnected) return;
            var chalk = require('chalk');
            G.log.trace(chalk.red('Please enter this url in browser:\n=====\nhttp://127.0.0.1:{0}/Project.html\n====='),
                M.COMMUNICATE.port);
        }, 3 * 1000);
    }
});

// 在 editor 目录下的 js 文件发生变更时，生成模板
G.emitter.on('fileChanged', function(file) {
    if (file.indexOf(path.join(G.gameRoot, 'Editor')) === 0) {
        var lowerCaseName = file.toLowerCase();
        if (lowerCaseName.slice(-8) === '.js.meta' ||
            lowerCaseName.slice(-3) === '.js') {
            // editor 目录的 js 文件发生变更
            M.USER_SCRIPTS.markJsExtDirty(file);
            genEditorHtmlTemplate();
        }
    }
});

var createEditorStarupFile = function() {
    var port = M.COMMUNICATE.port;
    if (!port)
        // 无法获取 port 信息，服务还未启动
        return;

    // 尝试读取模板
    var fullPath = path.join(G.editorRoot, 'Template/index.templet.html');
    var content = fs.readFileSync(fullPath, 'utf8');

    // 生成逻辑脚本
    content = content.replace(/__PORT__/g, port);
    content = content.replace(/__EDITOR_PLUGINS_SCRIPTS__/g, M.PLUGIN_SCRIPTS.printEditorExtends());
    content = content.replace(/__EDITOR_EXTEND_SCRIPTS__/g, M.USER_SCRIPTS.printEditorExtends());
    content = content.replace(/{__ver__}/g, G.VERSION);

    // 写入目标文件
    var targetPath = path.join(G.gameRoot, 'index.html');
    fs.writeFileSync(targetPath, content);
};

var createInstallPluginFile = function() {
    var port = M.COMMUNICATE.port;
    if (!port)
    // 无法获取 port 信息，服务还未启动
        return;

    // 尝试读取模板
    var fullPath = path.join(G.editorRoot, 'Template/InstallPlugin.templet.html');
    var content = fs.readFileSync(fullPath, 'utf8');

    // 生成逻辑脚本
    content = content.replace(/__PORT__/g, port);
    content = content.replace(/__EDITOR_PLUGINS_SCRIPTS__/g, M.PLUGIN_SCRIPTS.printEditorExtends());
    content = content.replace(/__EDITOR_EXTEND_SCRIPTS__/g, M.USER_SCRIPTS.printEditorExtends());
    content = content.replace(/{__ver__}/g, G.VERSION);

    // 写入目标文件
    fs.ensureDirSync(path.join(G.gameRoot, 'Temp'));
    var targetPath = path.join(G.gameRoot, 'Temp', 'InstallPlugin.html');
    fs.writeFileSync(targetPath, content);
};

var createProjectFile = function() {
    var port = M.COMMUNICATE.port;

    var content = fs.readFileSync(path.join(G.editorRoot, 'Template/Project.templet.html'), 'utf8');
    content = content.replace(/__PORT__/g, port);
    fs.writeFileSync(path.join(G.editorRoot, 'Project.html'), content);
}

// 生成CodeEditor.html
var createCodeEditorFile = function() {
    var port = M.COMMUNICATE.port;

    var content = fs.readFileSync(path.join(G.editorRoot, 'Template/CodeEditor.templet.html'), 'utf8');
    content = content.replace(/{__ver__}/g, G.VERSION);
    content = content.replace(/__PORT__/g, port);
    var tempPath = G.gameRoot + 'Temp/';
    fs.writeFileSync(tempPath + 'CodeEditor.html', content);
}


// 游戏工程的路径
var initConfig = function() {
    G.config = {
        editor : {},
        project : {},
        editorVersion : G.VERSION
    };
    var gameRoot = G.gameRoot;
    if (!gameRoot) return;
    var settingPath = gameRoot + 'ProjectSetting/';
    var tempPath = gameRoot + 'Temp/';

    // 游戏的配置

    G.config.systemPredefined = [
        fsEx.toUnixFileName(gameRoot),
        fsEx.toUnixFileName(gameRoot + 'Assets/'),
        fsEx.toUnixFileName(settingPath),
        fsEx.toUnixFileName(gameRoot + 'Scripts/'),
        fsEx.toUnixFileName(tempPath),
        fsEx.toUnixFileName(gameRoot + 'Editor/'),
        fsEx.toUnixFileName(gameRoot + 'Build/'),
        fsEx.toUnixFileName(gameRoot + 'Plugins/')
    ];

    // 确保几个大的目录存在
    for (var i = 0, len = G.config.systemPredefined.length; i < len; i++) {
        fs.ensureDirSync(G.config.systemPredefined[i]);
    }

    // 确保editor.setting文件存在，如果不存在则创建之
    var defaultEditorSetting = {
        layout: "landscape",
        currScene: ""
    };
    var editorFile = settingPath + 'editor.setting';
    if (!fs.existsSync(editorFile)) {
        writeEditorSetting(defaultEditorSetting);
    }
    G.config.editor = fs.readJsonFileSync(editorFile);

    // 确保project.setting文件存在，如果不存在则创建之
    var defaultProjectSetting = {
        projectName: "Default",
        gameName: "DefaultGame",
        companyName: "DefaultCompany",
        bundleIdentifier: "com.DefaultCompany.Default",
        gameInstance: "qc_game",
        frameRate: {
            'mobile': 30,
            'desktop': 60
        },
        backgroundColor: 0xff474747,
        runInBackground: true,
        antialias: true,
        renderer: 'Auto',
        transparent: false,
        developerMode: false
    };
    var projectFile = settingPath + 'project.setting';
    if (!fs.existsSync(projectFile)) {
        writeProjectSetting(defaultProjectSetting);
    }
    G.config.project = fs.readJsonFileSync(projectFile);
    if (G.config.project.frameRate == null) {
        G.config.project.frameRate = defaultProjectSetting.frameRate;
    }
    if (G.config.project.backgroundColor == null) {
        G.config.project.backgroundColor = defaultProjectSetting.backgroundColor;
    }
    if (G.config.project.runInBackground == null) {
        G.config.project.runInBackground = defaultProjectSetting.runInBackground;
    }
    if (G.config.project.renderer == null) {
        G.config.project.renderer = defaultProjectSetting.renderer;
    }
    if (G.config.project.antialias == null) {
        G.config.project.antialias = defaultProjectSetting.antialias;
    }
    if (G.config.project.transparent == null) {
        G.config.project.transparent = defaultProjectSetting.transparent;
    }

    // 确保scene.setting文件存在，不存在则创建之
    var defaultSceneSetting = {
        scene: {},
        entryScene: ''
    };
    var sceneFile = settingPath + 'scene.setting';
    if (!fs.existsSync(sceneFile)) {
        writeSceneSetting(defaultSceneSetting);
    }
    G.config.scene = fs.readJsonFileSync(sceneFile);

    // 确保script.setting文件存在，如果不存在则创建之
    var defaultScriptSetting = {};
    var scriptFile = settingPath + 'script.setting';

    if (!fs.existsSync(scriptFile)) {
        writeScriptSetting(defaultScriptSetting);
    }

    // 如果StartHiddenScene.html不存在，则创建之
    var content = fs.readFileSync(path.join(G.editorRoot, 'Template/StartHiddenScene.templet.html'), 'utf8');
    content = content.replace(/{__ver__}/g, G.VERSION);
    fs.writeFileSync(tempPath + 'StartHiddenScene.html', content);

    // 如果scene_editor.state不存在，创建之
    var sceneEditorPath = tempPath + 'scene_editor.state';
    if (!fs.existsSync(sceneEditorPath)) {
        fsEx.writeJsonFileSync(sceneEditorPath, {
            dependences: {},
            data: {}
        });

        // 确保删除 editor.setting 中的 currScene
        if (fs.existsSync(settingPath + 'editor.setting')) {
            delete G.config.editor['currScene'];
            writeEditorSetting(G.config.editor);
        }

        if (G.watch) G.watch.tryPackByOneFile(sceneEditorPath);
    }

    // 创建css目录
    var cssPath = gameRoot + 'Assets/css/style.css';
    fs.ensureDirSync(gameRoot + 'Assets/css');
    if (!fs.existsSync(cssPath)) fs.writeFileSync(cssPath, '/* css for dom */');
};
initConfig();
G.emitter.on('switchProject', function() {
    initConfig();
    M.USER_SCRIPTS.restore();

    genEditorHtmlTemplate();
    createCodeEditorFile();
});

// 监听通知，重新生成 editor 模板
G.emitter.on('refreshStartupFile', genEditorHtmlTemplate);

// 需要导出的外部接口
module.exports = {
    writeEditorSetting : writeEditorSetting,
    writeProjectSetting : writeProjectSetting,
    writeSceneSetting : writeSceneSetting
};
