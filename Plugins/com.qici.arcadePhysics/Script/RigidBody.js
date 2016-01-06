/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 */

/**
 * 负责处理游戏的物理（使用arcade physics），刚体
 * @class qc.arcade.RigidBody
 */
var RigidBody = qc.defineBehaviour('qc.arcade.RigidBody', qc.Behaviour, function() {
        var self = this;
        self.arcade = self.game.phaser.physics.arcade;
        self.phaser = self.gameObject.phaser;

        // 检测碰撞的节点
        self._collide = [];

        // 检测重合的节点
        self._overlap = [];

        // 只有精灵和UIImage才能挂载刚体
        if (!(self.gameObject instanceof qc.Sprite) && !(self.gameObject instanceof qc.UIImage))
            throw new Error('Only Sprite or UIImage can attack RigidBody!');
        self.phaser.enableBody = false;
        self.phaser.physicsBodyType = Phaser.Physics.ARCADE;
        self.arcade.enable(self.phaser, self.phaser.physicsBodyType, false);
        self.phaser.body.enable = false;
        self.phaser.body._qc = self;
    }, function() {
        return {
            // 需要序列化的字段列表
            mass: qc.Serializer.NUMBER,
            collideWorldBounds: qc.Serializer.BOOLEAN,
            allowRotation: qc.Serializer.BOOLEAN,
            allowGravity: qc.Serializer.BOOLEAN,
            velocity: qc.Serializer.POINT,
            maxVelocity: qc.Serializer.POINT,
            acceleration: qc.Serializer.POINT,
            drag: qc.Serializer.POINT,
            gravity: qc.Serializer.POINT,
            friction: qc.Serializer.POINT,
            angularVelocity: qc.Serializer.NUMBER,
            maxAngular: qc.Serializer.NUMBER,
            angularAcceleration: qc.Serializer.NUMBER,
            angularDrag: qc.Serializer.NUMBER,
            bounce: qc.Serializer.POINT,
            immovable: qc.Serializer.BOOLEAN,
            moves: qc.Serializer.BOOLEAN,
            checkCollision: qc.Serializer.MAPPING,
            tilePadding: qc.Serializer.POINT,
            collides: qc.Serializer.NODES,
            overlaps: qc.Serializer.NODES,
            ccdIterations: qc.Serializer.INT
        }
    }
);

// 菜单上的显示
RigidBody.__menu = 'Plugins/Arcade/RigidBody';

Object.defineProperties(RigidBody.prototype, {
    /**
     * @property {number} mass - 物体的质量
     * @default 1
     */
    mass: {
        get: function()  { return this.phaser.body.mass; },
        set: function(v) { this.phaser.body.mass = v;    }
    },

    /**
     * @property {boolean} collideWorldBounds - 碰到游戏世界的边界是否反弹
     * @default false
     */
    collideWorldBounds: {
        get: function()  { return this.phaser.body.collideWorldBounds; },
        set: function(v) { this.phaser.body.collideWorldBounds = v;    }
    },

    /**
     * @property {boolean} allowRotation - 是否允许刚体旋转
     * @default true
     */
    allowRotation: {
        get: function()  { return this.phaser.body.allowRotation; },
        set: function(v) { this.phaser.body.allowRotation = v;    }
    },

    /**
     * @property {boolean} allowGravity - 是否受重力影响
     * @default true
     */
    allowGravity: {
        get: function()  { return this.phaser.body.allowGravity; },
        set: function(v) { this.phaser.body.allowGravity = v;    }
    },

    /**
     * @property {qc.Point} velocity - 速度
     * @default {x:0, y:0}
     */
    velocity: {
        get: function()  { return this.phaser.body.velocity; },
        set: function(v) { this.phaser.body.velocity = v;    }
    },

    /**
     * @property {qc.Point} maxVelocity - 最大移动速度
     * @default {x:10000, y:10000}
     */
    maxVelocity: {
        get: function()  { return this.phaser.body.maxVelocity; },
        set: function(v) { this.phaser.body.maxVelocity = v;    }
    },

    /**
     * @property {number} angularAcceleration - 角移动加速度
     * @default
     */
    angularAcceleration: {
        get: function()  { return this.phaser.body.angularAcceleration; },
        set: function(v) { this.phaser.body.angularAcceleration = v;
                           this.gameObject._isTransformDirty = true;    }
    },

    /**
     * @property {qc.Point} acceleration - 加速度
     * @default {x:0, y:0}
     */
    acceleration: {
        get: function()  { return this.phaser.body.acceleration; },
        set: function(v) { this.phaser.body.acceleration = v;    }
    },

    /**
     * @property {qc.Point} drag - 空气阻力
     * @default {x:0, y:0}
     */
    drag: {
        get: function()  { return this.phaser.body.drag; },
        set: function(v) { this.phaser.body.drag = v;    }
    },

    /**
     * @property {qc.Point} gravity - 重力
     * @default {x:0, y:0}
     */
    gravity: {
        get: function()  { return this.phaser.body.gravity; },
        set: function(v) { this.phaser.body.gravity = v;
                           this.gameObject._isTransformDirty = true; }
    },

    /**
     * @property {qc.Point} bounce - 反弹力
     * @default {x:0, y:0}
     */
    bounce: {
        get: function()  { return this.phaser.body.bounce; },
        set: function(v) { this.phaser.body.bounce = v;
                           this.gameObject._isTransformDirty = true; }
    },

    /**
     * @property {qc.Point} friction - 摩擦力
     * @default {x:1, y:0}
     */
    friction: {
        get: function()  { return this.phaser.body.friction; },
        set: function(v) { this.phaser.body.friction = v;
                           this.gameObject._isTransformDirty = true; }
    },

    /**
     * @property {number} angularVelocity - 角速度（弧度）
     * @default 0
     */
    angularVelocity: {
        get: function()  { return this.phaser.body.angularVelocity; },
        set: function(v) { this.phaser.body.angularVelocity = v;
                           this.gameObject._isTransformDirty = true; }
    },

    /**
     * @property {number} angularDrag - 角阻力
     * @default 0
     */
    angularDrag: {
        get: function()  { return this.phaser.body.angularDrag; },
        set: function(v) { this.phaser.body.angularDrag = v;
                           this.gameObject._isTransformDirty = true; }
    },

    /**
     * @property {number} maxAngular - 最大角速度（弧度）
     * @default 1000
     */
    maxAngular: {
        get: function()  { return this.phaser.body.maxAngular; },
        set: function(v) { this.phaser.body.maxAngular = v;    }
    },

    /**
     * @property {number} angle - 当前物体的角度（弧度）
     * @readonly
     */
    angle: {
        get: function() { return this.phaser.body.angle; }
    },

    /**
     * @property {number} speed - 当前物体的移动速度
     * @readonly
     */
    speed: {
        get: function() { return this.phaser.body.speed; }
    },

    /**
     * @property {boolean} immovable - 物理固定不动，不受其他刚体的影响
     * @default false
     */
    immovable: {
        get: function()  { return this.phaser.body.immovable; },
        set: function(v) { this.phaser.body.immovable = v;    }
    },

    /**
     * @property {boolean} moves - 当前是否由物理来决定其位置信息
     * @default true
     */
    moves: {
        get: function()  { return this.phaser.body.moves; },
        set: function(v) { this.phaser.body.moves = v;
                           this.gameObject._isTransformDirty = true; }
    },

    /**
     * @property {number} overlapX - 物理重叠后X方向的重叠范围
     * @readonly
     */
    overlapX: {
        get: function() { return this.phaser.body.overlapX; }
    },

    /**
     * @property {number} overlapY - 物理重叠后Y方向的重叠范围
     * @readonly
     */
    overlapY: {
        get: function() { return this.phaser.body.overlapY; }
    },

    /**
     * @property {boolean} embedded - 两个物体重叠但都没运动时，设置为true
     * @readonly
     */
    embedded: {
        get: function()  { return this.phaser.body.embedded; },
        set: function(v) { this.phaser.body.embedded = v;    }
    },

    /**
     * @property {object} checkCollision - 当物体向某方向移动时，是否检查碰撞
     * @default { none: false, any: true, up: true, down: true, left: true, right: true }
     */
    checkCollision: {
        get: function()  { return this.phaser.body.checkCollision; },
        set: function(v) { this.phaser.body.checkCollision = v;    }
    },

    /**
     * @property {object} touching - 物体碰撞后指明是从什么方向进入碰撞的
     * 例如：touching.up = true - 表示碰撞发生在顶部
     * @readonly
     */
    touching: {
        get: function() { return this.phaser.body.touching; }
    },

    /**
     * @property {object} wasTouching - This object is populated with previous touching values from the bodies previous collision.
     * @readonly
     */
    wasTouching: {
        get: function() { return this.phaser.body.wasTouching; }
    },

    /**
     * @property {object} blocked - 物体不能向某个方向移动
     * @readonly
     */
    blocked: {
        get: function()  { return this.phaser.body.blocked; },
        set: function(v) { this.phaser.body.blocked = v;    }
    },

    /**
     * @property {qc.Point} tilePadding -
     * 物体高速运动时，可能会穿过其他物体。
     * 设置这个值可以额外按照步长检测，防止这种情况的发生
     */
    tilePadding: {
        get: function()  { return this.phaser.body.tilePadding; },
        set: function(v) { this.phaser.body.tilePadding = v;    }
    },

    /**
     * @property {boolean} onFloor - 物体是不是在世界（地图）的底部
     * @readonly
     */
    onFloor: {
        get: function() { return this.phaser.body.onFloor(); }
    },

    /**
     * @property {boolean} onWall - 物体是不是某一边靠在世界边界
     * @readonly
     */
    onWall: {
        get: function() { return this.phaser.body.onWall(); }
    },

    /**
     * @property {number} deltaX - 两帧之间，物体在X方向移动的距离
     * @readonly
     */
    deltaX: {
        get: function() { return this.phaser.body.deltaX(); }
    },

    /**
     * @property {number} deltaY - 两帧之间，物体在Y方向移动的距离
     * @readonly
     */
    deltaY: {
        get: function() { return this.phaser.body.deltaY(); }
    },

    /**
     * @property {number} deltaZ - 两帧之间，物体旋转的弧度
     * @readonly
     */
    deltaZ: {
        get: function() { return this.phaser.body.deltaZ(); }
    },

    /**
     * @property {array} collides - 需要进行碰撞检测的元素
     */
    collides: {
        get: function()  { return this._collide; },
        set: function(v) { this._collide = v;    }
    },

    /**
     * @property {array} collides - 需要进行重叠检测的元素
     */
    overlaps: {
        get: function()  { return this._overlap; },
        set: function(v) { this._overlap = v;    }
    },

    /**
     * @property {number} ccdIterations
     *  碰撞检测时的离散点数量（0或-1表示不检测离散点）
     *  注意：值越大性能越差，但碰撞检测的效果越好
     * @default 0
     */
    ccdIterations: {
        get: function()  { return this.phaser.body.ccdIterations; },
        set: function(v) { this.phaser.body.ccdIterations = v;    }
    }
});

/**
 * 组件初始化
 */
RigidBody.prototype.awake = function() {
    // 强制重更新包围盒
    var body = this.phaser.body;
    body.updateBounds(true);
};

/**
 * 组件启用的处理
 */
RigidBody.prototype.onEnable = function() {
    var self = this;
    self.phaser.enableBody = true;
    self.phaser.body.enable = true;
};

/**
 * 组件禁用的处理
 */
RigidBody.prototype.onDisable = function() {
    var self = this;
    self.phaser.enableBody = false;
    self.phaser.body.enable = false;
};

/**
 * 帧调度
 */
RigidBody.prototype.update = function() {
    var self = this;
    for (var i = 0; i < self._collide.length; i++) {
        var node = self._collide[i];
        if (!node || node._destroy) continue;
        self.arcade.collide(self.phaser, node.phaser, self._collideCallback, undefined, self);
    }
    for (var i = 0; i < self._overlap.length; i++) {
        var node = self._overlap[i];
        if (!node || node._destroy) continue;
        self.arcade.overlap(self.phaser, node.phaser, self._overlapCallback, undefined, self);
    }
};

/**
 * 重置刚体的数据
 * @method qc.arcade.RigidBody#reset
 */
RigidBody.prototype.reset = function() {
    this._collide = [];
    this._overlap = [];
    this.phaser.body.reset(this.gameObject.x, this.gameObject.y);
};

/**
 * 添加一个碰撞检测节点
 * @method qc.arcade.RigidBody#addCollide
 */
RigidBody.prototype.addCollide = function(node) {
    if (this._collide.indexOf(node) === -1) {
        this._collide.push(node);
    }
};

/**
 * 删除一个碰撞检测节点
 * @method qc.arcade.RigidBody#removeCollide
 */
RigidBody.prototype.removeCollide = function(node) {
    var index = this._collide.indexOf(node);
    if (index !== -1) {
        this._collide.splice(index, 1);
    }
};

/**
 * 添加一个重叠检测节点
 * @method qc.arcade.RigidBody#addOverlap
 */
RigidBody.prototype.addOverlap = function(node) {
    if (this._overlap.indexOf(node) === -1) {
        this._overlap.push(node);
    }
};

/**
 * 删除一个重叠检测节点
 * @method qc.arcade.RigidBody#removeOverlap
 */
RigidBody.prototype.removeOverlap = function(node) {
    var index = this._overlap.indexOf(node);
    if (index !== -1) {
        this._overlap.splice(index, 1);
    }
};

/**
 * 按照一定的速度移动到目标位置
 * 如果指定了maxTime，会自动调整移动速度（确保按照指定的时间到达目标点）
 * 注意：移动时不会跟踪目标
 * 注意：当移动到目标位置时才会停止
 * @method qc.arcade.RigidBody#moveToObject
 * @param {any} destination - 目标位置（包含有xy属性即可）
 * @param {number} [speed=60] - 移动速度，每秒移动多少像素
 * @param {number} [maxTime=0] - 最大的耗时时间，单位毫秒
 * @return {number} 当前物体的旋转弧度
 */
RigidBody.prototype.moveToObject = function(destination, speed, maxTime) {
    return this.arcade.moveToObject(this.phaser, destination, speed, maxTime);
};

/**
 * 根据角度和速度，得到水平和垂直方向的速度
 * @param angle
 * @param speed
 * @param point
 * @returns {qc.Point}
 */
RigidBody.prototype.velocityFromAngle = function(angle, speed, point) {
    return this.arcade.velocityFromAngle(angle, speed, point);
};

/**
 * 根据弧度和速度，得到水平和垂直方向的速度
 * @param rotation
 * @param speed
 * @param point
 */
RigidBody.prototype.velocityFromRotation = function(rotation, speed, point) {
    return this.arcade.velocityFromRotation(rotation, speed, point);
};

/**
 * 以加速度移动到目标位置
 * @method qc.arcade.RigidBody#accelerateToObject
 * @param destination
 * @param speed
 * @param xSpeedMax
 * @param ySpeedMax
 */
RigidBody.prototype.accelerateToObject = function(destination, speed, xSpeedMax, ySpeedMax) {
    return this.arcade.accelerateToObject(this.phaser, destination, speed, xSpeedMax, ySpeedMax);
};

/**
 * 计算距离
 * @method qc.arcade.RigidBody#distanceBetween
 * @param target
 * @returns {number}
 */
RigidBody.prototype.distanceBetween = function(target) {
    return this.arcade.distanceBetween(this.phaser, target);
};

/**
 * 计算夹角（弧度）
 * @method qc.arcade.RigidBody#angleBetween
 * @param target
 * @returns {number}
 */
RigidBody.prototype.angleBetween = function(target) {
    return this.arcade.angleBetween(this.phaser, target);
};

/**
 * 碰撞的回调
 * @private
 */
RigidBody.prototype._collideCallback = function(o1, o2) {
    this.gameObject._sendMessage('onCollide', o1._qc, o2._qc);
};

/**
 * 重叠的回调
 * @private
 */
RigidBody.prototype._overlapCallback = function(o1, o2) {
    this.gameObject._sendMessage('onOverlap', o1._qc, o2._qc);
};
