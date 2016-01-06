Phaser.Physics.Arcade.Body = function(sprite) {
    /**
     * @property {qc.Sprite} sprite - Reference to the parent Sprite.
     */
    this.sprite = sprite;
    this.qc = sprite._qc;

    /**
     * @property {qc.Game} game - Local reference to game.
     */
    this.game = sprite.game;

    /**
     * @property {number} type - The type of physics system this body belongs to.
     */
    this.type = Phaser.Physics.ARCADE;

    /**
     * @property {boolean} enable - A disabled body won't be checked for any form of collision or overlap or have its pre/post updates run.
     * @default true
     */
    this.enable = true;

    /**
     * @property {number} x - 刚体左上角的屏幕X坐标
     */
    this.x = sprite.world.x;
    this.prevX = this.x;

    /**
     * @property {number} y - 刚体左上角的屏幕Y坐标
     */
    this.y = sprite.world.y;
    this.prevY = this.y;

    /**
     * @property {number} width - 刚体在屏幕中的宽度
     * @readonly
     */
    this.width = sprite.width;

    /**
     * @property {number} height - 刚体在屏幕中的高度
     * @readonly
     */
    this.height = sprite.height;

    /**
     * @property {boolean} allowRotation - Allow this Body to be rotated? (via angularVelocity, etc)
     * @default
     */
    this.allowRotation = true;

    /**
     * An Arcade Physics Body can have angularVelocity and angularAcceleration. Please understand that the collision Body
     * itself never rotates, it is always axis-aligned. However these values are passed up to the parent Sprite and updates its rotation.
     * @property {number} rotation
     */
    this.rotation = sprite.rotation;

    /**
     * @property {number} preRotation - The previous rotation of the physics body.
     * @readonly
     */
    this.preRotation = sprite.rotation;

    /**
     * @property {qc.Point} gravity
     */
    this.gravity = new Phaser.Point(0, 0);

    /**
     * @property {number} ccdIterations - 连续碰撞的散列值
     * @default 0
     */
    this.ccdIterations = 0;

    /**
     * @property {qc.Point} velocity - 运动速度（基于父亲节点）
     */
    this.velocity = new Phaser.Point();
    this.newVelocity = new Phaser.Point(0, 0);

    /**
     * @property {qc.Point} deltaMax - 单次移动的最大距离限制
     */
    this.deltaMax = new Phaser.Point(0, 0);

    /**
     * @property {qc.Point} acceleration - 加速度
     */
    this.acceleration = new Phaser.Point();

    /**
     * @property {qc.Point} drag - The drag applied to the motion of the Body.
     */
    this.drag = new Phaser.Point();

    /**
     * @property {boolean} allowGravity - Allow this Body to be influenced by gravity? Either world or local.
     * @default
     */
    this.allowGravity = true;

    /**
     * @property {Phaser.Point} bounce - The elasticity of the Body when colliding. bounce.x/y = 1 means full rebound, bounce.x/y = 0.5 means 50% rebound velocity.
     */
    this.bounce = new Phaser.Point();

    /**
     * @property {Phaser.Point} maxVelocity - The maximum velocity in pixels per second sq. that the Body can reach.
     * @default
     */
    this.maxVelocity = new Phaser.Point(10000, 10000);

    /**
     * @property {Phaser.Point} friction - The amount of movement that will occur if another object 'rides' this one.
     */
    this.friction = new Phaser.Point(1, 0);

    /**
     * @property {number} angularVelocity - The angular velocity controls the rotation speed of the Body. It is measured in radians per second.
     * @default
     */
    this.angularVelocity = 0;

    /**
     * @property {number} angularAcceleration - The angular acceleration is the rate of change of the angular velocity. Measured in radians per second squared.
     * @default
     */
    this.angularAcceleration = 0;

    /**
     * @property {number} angularDrag - The drag applied during the rotation of the Body.
     * @default
     */
    this.angularDrag = 0;

    /**
     * @property {number} maxAngular - The maximum angular velocity in radians per second that the Body can reach.
     * @default
     */
    this.maxAngular = 1000;

    /**
     * @property {number} mass - The mass of the Body. When two bodies collide their mass is used in the calculation to determine the exchange of velocity.
     * @default
     */
    this.mass = 1;

    /**
     * @property {number} angle - The angle of the Body in radians, as calculated by its angularVelocity.
     * @readonly
     */
    this.angle = 0;

    /**
     * @property {number} speed - The speed of the Body as calculated by its velocity.
     * @readonly
     */
    this.speed = 0;

    /**
     * @property {number} facing - A const reference to the direction the Body is traveling or facing.
     * @default
     */
    this.facing = Phaser.NONE;

    /**
     * @property {boolean} immovable - An immovable Body will not receive any impacts from other bodies.
     * @default
     */
    this.immovable = false;

    /**
     * If you have a Body that is being moved around the world via a tween or a Group motion, but its local x/y position never
     * actually changes, then you should set Body.moves = false. Otherwise it will most likely fly off the screen.
     * If you want the physics system to move the body around, then set moves to true.
     * @property {boolean} moves - Set to true to allow the Physics system to move this Body, otherwise false to move it manually.
     * @default
     */
    this.moves = true;

    /**
     * This flag allows you to disable the custom x separation that takes place by Physics.Arcade.separate.
     * Used in combination with your own collision processHandler you can create whatever type of collision response you need.
     * @property {boolean} customSeparateX - Use a custom separation system or the built-in one?
     * @default
     */
    this.customSeparateX = false;

    /**
     * This flag allows you to disable the custom y separation that takes place by Physics.Arcade.separate.
     * Used in combination with your own collision processHandler you can create whatever type of collision response you need.
     * @property {boolean} customSeparateY - Use a custom separation system or the built-in one?
     * @default
     */
    this.customSeparateY = false;

    /**
     * When this body collides with another, the amount of overlap is stored here.
     * @property {number} overlapX - The amount of horizontal overlap during the collision.
     */
    this.overlapX = 0;

    /**
     * When this body collides with another, the amount of overlap is stored here.
     * @property {number} overlapY - The amount of vertical overlap during the collision.
     */
    this.overlapY = 0;

    /**
     * If a body is overlapping with another body, but neither of them are moving (maybe they spawned on-top of each other?) this is set to true.
     * @property {boolean} embedded - Body embed value.
     */
    this.embedded = false;

    /**
     * A Body can be set to collide against the World bounds automatically and rebound back into the World if this is set to true. Otherwise it will leave the World.
     * @property {boolean} collideWorldBounds - Should the Body collide with the World bounds?
     */
    this.collideWorldBounds = false;

    /**
     * Set the checkCollision properties to control which directions collision is processed for this Body.
     * For example checkCollision.up = false means it won't collide when the collision happened while moving up.
     * @property {object} checkCollision - An object containing allowed collision.
     */
    this.checkCollision = { none: false, any: true, up: true, down: true, left: true, right: true };

    /**
     * This object is populated with boolean values when the Body collides with another.
     * touching.up = true means the collision happened to the top of this Body for example.
     * @property {object} touching - An object containing touching results.
     */
    this.touching = { none: true, up: false, down: false, left: false, right: false };

    /**
     * This object is populated with previous touching values from the bodies previous collision.
     * @property {object} wasTouching - An object containing previous touching results.
     */
    this.wasTouching = { none: true, up: false, down: false, left: false, right: false };

    /**
     * This object is populated with boolean values when the Body collides with the World bounds or a Tile.
     * For example if blocked.up is true then the Body cannot move up.
     * @property {object} blocked - An object containing on which faces this Body is blocked from moving, if any.
     */
    this.blocked = { up: false, down: false, left: false, right: false };

    /**
     * @property {boolean} dirty - If this Body in a preUpdate (true) or postUpdate (false) state?
     */
    this.dirty = false;

    /**
     * @property {boolean} _reset - Internal cache var.
     * @private
     */
    this._reset = true;

    /**
     * @property {number} _sx - Internal cache var.
     * @private
     */
    this._sx = sprite.scale.x;
    this._spx = this._sx;

    /**
     * @property {number} _sy - Internal cache var.
     * @private
     */
    this._sy = sprite.scale.y;
    this._spy = this._sy;

    /**
     * @property {number} _dx - Internal cache var.
     * @private
     */
    this._dx = 0;

    /**
     * @property {number} _dy - Internal cache var.
     * @private
     */
    this._dy = 0;
};
var Body = Phaser.Physics.Arcade.Body;
Body.prototype = {};
Body.prototype.constructor = Body;

Object.defineProperties(Body.prototype, {
    right: {
        get: function() { return this.x + this.width; }
    },
    bottom: {
        get: function() { return this.y + this.height; }
    }
});

/**
 * 当节点缩放变化时，需要重新计算下
 */
Body.prototype.updateBounds = function(force) {
    var wt = this.qc.worldTransform;
    var asx = wt.a, asy = wt.d;

    var pwt = this.qc.parent.worldTransform;
    this._spx = pwt.a;
    this._spy = pwt.d;

    if (force ||
        (asx !== this._sx || asy !== this._sy)) {
        // 缓存scale的数据
        this._sx = asx;
        this._sy = asy;

        // 计算节点的世界宽和高
        // Note: get/set比较耗，这里直接访问内部变量了
        this.width = Math.abs(asx * this.qc._width);
        this.height = Math.abs(asy * this.qc._height);

        // 标记下
        this._reset = true;
    }
};

/**
 * 帧调度
 */
Body.prototype.preUpdate = function() {
    if (!this.enable || this.game.physics.arcade.isPaused) return;

    this.dirty = true;

    //  Store and reset collision flags
    this.wasTouching.none = this.touching.none;
    this.wasTouching.up = this.touching.up;
    this.wasTouching.down = this.touching.down;
    this.wasTouching.left = this.touching.left;
    this.wasTouching.right = this.touching.right;
    this.touching.none = true;
    this.touching.up = false;
    this.touching.down = false;
    this.touching.left = false;
    this.touching.right = false;
    this.blocked.up = false;
    this.blocked.down = false;
    this.blocked.left = false;
    this.blocked.right = false;
    this.embedded = false;

    // 计算当前的位置
    this.updateBounds();
    if (this._sx >= 0) {
        this.x = this.sprite.world.x - (this.sprite.anchor.x * this.width);
    }
    else {
        this.x = this.sprite.world.x - ((1 - this.sprite.anchor.x) * this.width);
    }
    if (this._sy >= 0) {
        this.y = this.sprite.world.y - (this.sprite.anchor.y * this.height);
    }
    else {
        this.y = this.sprite.world.y - ((1 - this.sprite.anchor.y) * this.height);
    }
    this.rotation = this.sprite.angle;
    this.preRotation = this.rotation;

    if (this._reset || this.sprite.fresh)
    {
        this.prevX = this.x;
        this.prevY = this.y;
    }

    if (this.moves)
    {
        this.game.physics.arcade.updateMotion(this);

        this.newVelocity.set(this.velocity.x * this.game.time.physicsElapsed,
            this.velocity.y * this.game.time.physicsElapsed);
        this.x += this.newVelocity.x * this._spx;
        this.y += this.newVelocity.y * this._spy;

        if (this.x !== this.prevX || this.y !== this.prevY)
        {
            this.speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            this.angle = Math.atan2(this.velocity.y, this.velocity.x);
        }

        //  Now the State update will throw collision checks at the Body
        //  And finally we'll integrate the new position back to the Sprite in postUpdate
        if (this.collideWorldBounds)
        {
            this.checkWorldBounds();
        }
    }

    // 计算期望的位移差
    this._dx = this.x - this.prevX;
    this._dy = this.y - this.prevY;

    this._reset = false;
};

Body.prototype.postUpdate = function() {
    if (!this.enable || !this.dirty) return;

    this.dirty = false;

    // 计算调整后的位移（可能因为碰撞等原因进行了调整）
    var dx = this.x - this.prevX,
        dy = this.y - this.prevY;
    if (dx < 0)
    {
        this.facing = Phaser.LEFT;
    }
    else if (dx > 0)
    {
        this.facing = Phaser.RIGHT;
    }
    if (dy < 0)
    {
        this.facing = Phaser.UP;
    }
    else if (dy > 0)
    {
        this.facing = Phaser.DOWN;
    }

    if (this.moves)
    {
        this._dx = dx;
        this._dy = dy;

        if (this.deltaMax.x !== 0 && this._dx !== 0)
        {
            if (this._dx < 0 && this._dx < -this.deltaMax.x)
            {
                this._dx = -this.deltaMax.x;
                this.x = this._dx + this.prevX;
            }
            else if (this._dx > 0 && this._dx > this.deltaMax.x)
            {
                this._dx = this.deltaMax.x;
                this.x = this._dx + this.prevX;
            }
        }

        if (this.deltaMax.y !== 0 && this._dy !== 0)
        {
            if (this._dy < 0 && this._dy < -this.deltaMax.y)
            {
                this._dy = -this.deltaMax.y;
                this.y = this._dy + this.prevY;
            }
            else if (this._dy > 0 && this._dy > this.deltaMax.y)
            {
                this._dy = this.deltaMax.y;
                this.y = this._dy + this.prevY;
            }
        }

        // 根据left和right，计算目标的原点位置
        if (this._dx !== 0) this.qc.x += this._dx / this._spx;
        if (this._dy !== 0) this.qc.y += this._dy / this._spy;
        this._reset = true;
    }

    if (this.allowRotation)
    {
        this.sprite.angle += this.deltaZ();
    }
    this.prevX = this.x;
    this.prevY = this.y;
};

Body.prototype.destroy = function() {
    this.sprite.body = null;
    this.sprite = null;
    this.qc = null;
};

Body.prototype.checkWorldBounds = function() {
    if (this.x < this.game.physics.arcade.bounds.x && this.game.physics.arcade.checkCollision.left &&
        this._dx < 0)
    {
        // 碰到左边界了，需要拉回来
        var qc = this.sprite._qc;
        this.x = this.game.physics.arcade.bounds.x;

        this.velocity.x *= -this.bounce.x;
        this.blocked.left = true;
    }
    else if (this.right > this.game.physics.arcade.bounds.right && this.game.physics.arcade.checkCollision.right &&
        this._dx > 0)
    {
        // 碰到右边界了，需要拉回来
        var qc = this.sprite._qc;
        this.x = this.game.physics.arcade.bounds.right - this.width;

        this.velocity.x *= -this.bounce.x;
        this.blocked.right = true;
    }

    if (this.y < this.game.physics.arcade.bounds.y && this.game.physics.arcade.checkCollision.up &&
        this._dy < 0)
    {
        // 碰到上边界了，需要拉回来
        var qc = this.sprite._qc;
        this.y = this.game.physics.arcade.bounds.y;

        this.velocity.y *= -this.bounce.y;
        this.blocked.up = true;
    }
    else if (this.bottom > this.game.physics.arcade.bounds.bottom && this.game.physics.arcade.checkCollision.down &&
        this._dy > 0)
    {
        // 碰到下边界了，需要拉回来
        var qc = this.sprite._qc;
        this.y = this.game.physics.arcade.bounds.bottom - this.height;

        this.velocity.y *= -this.bounce.y;
        this.blocked.down = true;
    }
};

Body.prototype.reset = function(x, y) {
    this.velocity.set(0);
    this.acceleration.set(0);

    this.speed = 0;
    this.angularVelocity = 0;
    this.angularAcceleration = 0;

    this._reset = true;
};

/**
 * Returns true if the bottom of this Body is in contact with either the world bounds or a tile.
 *
 * @method Phaser.Physics.Arcade.Body#onFloor
 * @return {boolean} True if in contact with either the world bounds or a tile.
 */
Body.prototype.onFloor = function() {
    return this.blocked.down;
};

/**
 * Returns true if either side of this Body is in contact with either the world bounds or a tile.
 *
 * @method Phaser.Physics.Arcade.Body#onWall
 * @return {boolean} True if in contact with either the world bounds or a tile.
 */
Body.prototype.onWall = function() {
    return (this.blocked.left || this.blocked.right);
};

/**
 * Returns the absolute delta x value.
 *
 * @method Phaser.Physics.Arcade.Body#deltaAbsX
 * @return {number} The absolute delta value.
 */
Body.prototype.deltaAbsX = function() {
    return (this.deltaX() > 0 ? this.deltaX() : -this.deltaX());
};

/**
 * Returns the absolute delta y value.
 *
 * @method Phaser.Physics.Arcade.Body#deltaAbsY
 * @return {number} The absolute delta value.
 */
Body.prototype.deltaAbsY = function() {
    return (this.deltaY() > 0 ? this.deltaY() : -this.deltaY());
};

/**
 * Returns the delta x value. The difference between Body.x now and in the previous step.
 *
 * @method Phaser.Physics.Arcade.Body#deltaX
 * @return {number} The delta value. Positive if the motion was to the right, negative if to the left.
 */
Body.prototype.deltaX = function (){
    return this.x - this.prevX;
};

/**
 * Returns the delta y value. The difference between Body.y now and in the previous step.
 *
 * @method Phaser.Physics.Arcade.Body#deltaY
 * @return {number} The delta value. Positive if the motion was downwards, negative if upwards.
 */
Body.prototype.deltaY = function() {
    return this.y - this.prevY;
};

/**
 * Returns the delta z value. The difference between Body.rotation now and in the previous step.
 *
 * @method Phaser.Physics.Arcade.Body#deltaZ
 * @return {number} The delta value. Positive if the motion was clockwise, negative if anti-clockwise.
 */
Body.prototype.deltaZ = function() {
    return this.rotation - this.preRotation;
};
