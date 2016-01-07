/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 */

/**
 * 保持横版或者竖版的组件
 * 在本节点下面的对象都会进行旋转
 * @class qc.Plugins.LockOrientation
 */
var LockOrientation = qc.defineBehaviour('qc.Plugins.LockOrientation', qc.Behaviour, function() {
    var self = this;

    /**
     * @property {int} orientation - 当前是限定为横版还是竖版，有如下取值：
     * Device.AUTO = 0;
     * Device.PORTRAIT = 1;
     * Device.LANDSCAPE = 2;
     */
    self.orientation = self.game.device.orientation;

    // 在PC上默认不启用
    self.desktop = false;

    // 本组件可以在编辑器模式下运行
    self.runInEditor = true;

    self.manualType = 0;
}, {
    orientation: qc.Serializer.INT,
    desktop: qc.Serializer.BOOLEAN,
    manualType: qc.Serializer.INT
});
LockOrientation.__menu = 'Plugins/LockOrientation';

Object.defineProperties(LockOrientation.prototype, {
    orientation: {
        get: function() {
            return this._orientation;
        },
        set: function(v) {
            if (v === this._orientation) return;
            this._orientation = v;
            this._doOrientation(this.game.device.orientation);
        }
    }
});

// 初始化处理，关注横竖版事件并做处理
LockOrientation.prototype.awake = function() {
    var self = this, o = self.gameObject;

    self.game.world.onSizeChange.add(self._doOrientation, self);
    o.parent.onRelayout.add(self.assureSize, self);

    // 确保目标节点大小、pivot与世界一致
    self._doOrientation();
    self.assureSize();

    var adapter = o.parent.getScript('qc.ScaleAdapter');

    if (adapter) {
        // 本插件需要重载掉ScaleAdapter，在屏幕宽高缩放时，需要按照旋转后的长宽来获取
        var oldScaleAdapter_getReferenceResolution = adapter.getReferenceResolution;
        adapter.getReferenceResolution = function() {
            var p = oldScaleAdapter_getReferenceResolution.call(this);
            if (self.rotate90) {
                return new qc.Point(p.y, p.x);
            }
            return p;        
        };
    }
};

// 组件析构的处理
LockOrientation.prototype.onDestroy = function() {
    this.game.world.onSizeChange.remove(this._doOrientation, this);
    this.gameObject.parent.onRelayout.remove(this.assureSize, this);
};

// 确保和父亲节点的大小保持一致
LockOrientation.prototype.assureSize = function() {
    var self = this, o = self.gameObject;

    var rect = o.parent.rect;
    if (self.rotate90 === true) {
        // 旋转时，对调下长宽，确保和父亲节点重合
        o.width = rect.height;
        o.height = rect.width;
    }
    else {
        o.width = rect.width;
        o.height = rect.height;
    }
    o.setAnchor(new qc.Point(0.5, 0.5), new qc.Point(0.5, 0.5));
    o.anchoredX = 0;
    o.anchoredY = 0;
    o.pivotX = 0.5;
    o.pivotY = 0.5;
};

// 横竖屏发生变化的处理
LockOrientation.prototype._doOrientation = function() {
    var self = this, o = self.gameObject, v = self.game.device.orientation;

    if (!self.desktop && !self.game.editor && self.game.device.desktop) {
        o.rotation = 0;
        self.rotate90 = false;
        return;
    }

    switch (self.orientation) {
    case qc.Device.AUTO:
    default:
        o.rotation = 0;
        self.rotate90 = false;
        return;

    case qc.Device.PORTRAIT:
    case qc.Device.LANDSCAPE:
        if (v === self.orientation) {
            // 一致，就不需要旋转了
            o.rotation = 0;
            self.rotate90 = false;
        }
        else {
            // 不一致，旋转90度
            o.rotation = -Math.PI / 2;
            self.rotate90 = true;
        }
        self.assureSize();
        break;
    }
    var adapter = o.parent.getScript('qc.ScaleAdapter');
    if (adapter) {
        if (self.rotate90) {
            if (self.manualType === qc.ScaleAdapter.MANUAL_WIDTH) {
                adapter.manualType = qc.ScaleAdapter.MANUAL_HEIGHT;
            }
            else if (self.manualType === qc.ScaleAdapter.MANUAL_HEIGHT) {
                adapter.manualType = qc.ScaleAdapter.MANUAL_WIDTH;
            }
            else {
                adapter.manualType = self.manualType;
            }
        }
        else {
            adapter.manualType = self.manualType;
        }
    }
};

