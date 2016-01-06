/**
 * @author chenx
 * @date 2015.11.13
 * copyright 2015 Qcplay All Rights Reserved.
 */

/**
 * tween 回调函数
 * @class qc.TweenFunction
 */
var TweenFunction = qc.defineBehaviour('qc.TweenFunction', qc.Tween, function() {
    var self = this;

    /**
     * @property {string} func - 回调函数名
     */
    self.funcName = '';

    /**
     * @property {function} _func - 回调函数
     */
    self.func = null;

    // 回调函数的属主
    self.funcContext = null;

    // 默认情况下不可用
    self.enable = false;
},{
    funcName: qc.Serializer.STRING
});

// 菜单上的显示
TweenFunction.__menu = 'Plugins/TweenFunction';

Object.defineProperties(TweenFunction.prototype, {
    funcName: {
        get: function() { return this._funcName; },
        set: function(v) {
            if (v === this._funcName) return;

            this._funcName = v;
            this.onEnable();
        }
    }
});

// 组件 enabled
// gameObject 所有脚本挂载完后，才调用该接口，在此处将函数名转换成函数
TweenFunction.prototype.onEnable = function() {

    if (this._funcName.length <= 0)
        return;

    // 遍历 gameObject 及其所有的 scripts，查找回调函数
    this.func = this.gameObject[this._funcName];
    var classList = [];
    if (this.func)
    {
        // 记录存在该函数名的类名
        classList.push(this.gameObject.class);
        this.func = this.func.bind(this.gameObject);
        //this.funcContext = this.gameObject;
    }

    var self = this;
    this.gameObject.scripts.forEach(function(scriptOb) {
        var func = scriptOb[self._funcName];
        if (func)
        {
            // 记录存在该函数名的类名
            classList.push(scriptOb.class);
            self.func = func.bind(scriptOb);
            //this.funcContext = scriptOb;
        }
    });

    if (!self.func && this.enable)
        this.game.log.important('TweenFunction({0}) not find!', this._funcName);

    if (classList.length <= 1)
        return;

    // 存在多个相同名字的函数，提示错误
    self.game.log.error('Error: Exist multi functions with same name: {0}', classList);

    if (self.game.device.editor === true)
    {
        // 在编辑器中，弹出错误提示框
        var G = window.parent && window.parent.G;
        if (G)
        {
            var str = G._('TweenFunction func error') + classList;
            G.notification.error(str);
        }
    }
};


// 帧调度
TweenFunction.prototype.onUpdate = function(factor, isFinished) {
    if (typeof(this.func) != 'function')
        return;

    if (this.duration == 0 && !isFinished)
        // 表示该回调只在完成的调用一次
        return;

    // 调用回调函数
    this.func(factor, this.duration);
};

/**
 * 开始变化
 * @param node {qc.Node} - 需要改变的节点
 * @param duration {number} - 经历的时间
 * @param funcName {string} - 回调函数名
 * @returns {qc.TweenFunction}
 */
TweenFunction.begin = function(node, duration, funcName) {
    var tween = qc.Tween.begin('qc.TweenFunction', node, duration);
    tween.funcName = funcName;

    return tween;
};
