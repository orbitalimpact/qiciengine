/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 场景管理
 */
var fs = require('fs-extra');
var path = require('path');
var fsEx = G.load('filesystem/FsExpand');

var clazz = function() {
};
clazz.prototype = {};
clazz.prototype.constructor = clazz;

// 保存一个场景
clazz.prototype.saveScene = function(name, data) {
    if (name == 'unsavedScene')
    {
        // 该名字保留给系统新建场景的临时名，不能被用户使用
        console.log('保存场景时，名字不能为 unsavedScene');
        return false;
    }

    var fullDir = G.gameRoot + 'Assets/state';
    var name = name + '.state';
    var fullPath = path.join(fullDir, name);

    // 确保目录存在
    fs.ensureDirSync(fullDir);

    fsEx.writeJSONFileSync(fullPath, data);

    // 拷贝文件到临时场景
    fs.copySync(fullPath, G.gameRoot + 'Temp/scene_editor.state');

    // 进行备份
    try {
        this.backupScene(name);
    }
    catch(e) {

    }

    // 重新打包下资源
    var watch = G.load('filesystem/Watch');
    watch.exploreDaemon();

    // 保存源 state 的 md5
    var srcState = fs.readFileSync(fullPath, { encoding : 'utf8' });
    G.config.editor.stateMD5 = M.util.calcMD5(srcState);

    M.COMMAND.dispatch('UPDATE_EDITOR_SETTINGS', -1, G.config.editor);

    return true;
};

// 回退场景到某个节点
clazz.prototype.revertToRevision = function(name, version) {
    var fullDir = G.gameRoot + 'Assets/state';
    var backupDir = path.join(G.gameRoot, 'Assets/state', '.scene_backup');

    // 确定双方存在
    if (!fs.existsSync(path.join(fullDir, name)) ||
        !fs.existsSync(path.join(backupDir, version))) {
        return false;
    }

    // 保存当前到备份
    var jsonData;

    try {
        jsonData = fs.readJSONFileSync(path.join(backupDir, version));
    } catch(e) {

    }
    if (!jsonData)
        return false;

    // 写入目标文件
    fsEx.writeJSONFileSync(path.join(fullDir, name), jsonData);

    // 重新打包下资源
    var watch = G.load('filesystem/Watch');
    watch.exploreDaemon();
    return true;
};

// 获取这个场景的备份列表
clazz.prototype.getBackupList = function(name) {
    // 保证数量在配置的范围内
    var backupDir = path.join(G.gameRoot, 'Assets/state', '.scene_backup');
    if (!fs.existsSync(backupDir)) return [];
    var files = fs.readdirSync(backupDir);
    var list = [];
    for (var i in files) {
        if (files[i].indexOf(name) !== 0) continue;
        list.push(files[i]);
    }
    return list;
};

// 备份一个场景
clazz.prototype.backupScene = function(name) {
    var dir = G.gameRoot + 'Assets/state';
    if (!fs.existsSync(path.join(dir, name)))
        // 不需要备份
        return;

    // 确保数量保持在期望的范围内
    var num = M.SETTING.querySetting('stateHistorySize');
    if (num <= 0)
        return;

    // 拷贝到目录中
    var ext = M.util.formattedTime();

    var backupDir = path.join(dir, '.scene_backup');
    fs.ensureDir(backupDir);

    // 写入
    fsEx.writeJSONFileSync(path.join(backupDir, name + '_' + ext),
        fs.readJSONFileSync(path.join(dir, name)));

    // 获取备份列表
    list = this.getBackupList(name);
    if (list.length <= num)
        // 不需要删除
        return;

    // 排序
    list = list.sort().slice(0, list.length - num);
    for (var i in list) {
        // 删除文件
        fs.removeSync(path.join(backupDir, list[i]));
    }
};

// 定义模块
G.defineModule('SCENE_MANAGER', clazz);
