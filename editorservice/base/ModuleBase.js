/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 支持子模块挂载的基类
 */
var ModuleBase = function() {
    this._mods = {};
}
ModuleBase.prototype = {};
ModuleBase.prototype.constructor = ModuleBase;
G.ModuleBase = ModuleBase;

/**
 * 查找子模块
 * @method qc.gs.ModuleBase#mod
 * @param name
 */
ModuleBase.prototype.mod = function(name) {
    return this._mods[name];
}

/**
 * 注册子模块
 * @method qc.gs.ModuleBase#registerMod
 * @param mod
 */
ModuleBase.prototype.registerMod = function(mod) {
    if (typeof mod.name !== 'string')
        throw new Error('模块定义错误，需要有模块名！');
    this._mods[mod.name] = mod;
}

/**
 * 载入所有的子模块
 * @method qc.gs.ModuleBase#loadDir
 * @param dir
 */
ModuleBase.prototype.loadDir = function(dir) {
    G.loadDir(dir);
}