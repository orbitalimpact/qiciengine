/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 配置
 */
var fs = require('fs-extra');
var path = require('path');

var clazz = function() {
};
clazz.prototype = {};
clazz.prototype.constructor = clazz;

// 保存配置
clazz.prototype.saveSetting = function(key, value) {
    // 获取配置信息
    var conf;
    try {
        conf = fs.readJsonSync(path.join(G.editorRoot, 'project.setting'), { throws : false });
    }
    catch(e) {
        conf = null;
    }

    if (!conf) conf = {};

    // 做一些修饰行为
    switch (key) {
    case 'stateHistorySize' : value = this.getStateHistorySize(value);
    default : break;
    }

    conf[key] = value;

    // 保存
    G.load('filesystem/FsExpand').writeJsonSync(path.join(G.editorRoot, 'project.setting'), conf);

    return value;

};

// 查询配置
clazz.prototype.querySetting = function(key) {
    var conf;

    if (!conf) {
        try {
            conf = fs.readJsonSync(path.join(G.editorRoot, 'project.setting'), {throws: false});
        }
        catch (e) {
            conf = null;
        }

        if (!conf) conf = {};
    }

    var value = conf[key];

    // 做一些修饰行为
    switch (key) {
    case 'stateHistorySize' : value = this.getStateHistorySize(value);
    default : break;
    }

    return value;;
};

// 范围修正
clazz.prototype.getStateHistorySize = function(v) {
    if (v === undefined)
        // 没有值，取默认
        return 20;
    return Math.max(0, Math.min(30, parseInt(v)));
};

// 定义模块
G.defineModule('SETTING', clazz);
