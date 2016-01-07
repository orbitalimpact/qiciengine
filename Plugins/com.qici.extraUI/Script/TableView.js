/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 */
/**
 * 一个高效的表格显示组件，
 */
var TableView = qc.defineBehaviour('com.qici.extraUI.TableView', qc.Behaviour, function() {
    var self = this;

    /**
     * @property {[qc.Node]} _cellPool - 缓存的节点
     */
    self._cellPool = [];

    /**
     * @property {[qc.Node]} _usingCell - 使用中的节点
     */
    self._usingCell = [];

    /**
     * @property {qc.Rectangle} _showRect - 当前显示的子节点记录
     */
    self._showRect = new qc.Rectangle(0, 0, 0, 0);

    /**
     * 启用滚动功能
     */
    self.scrollSupport = new com.qici.extraUI.ScrollSupport(
        self.game,
        self.gameObject, 
        self._getViewRect.bind(self), 
        self._getContentRect.bind(self),
        self._setContentPosition.bind(self));

    self.runInEditor = true;
}, {
    content: qc.Serializer.NODE,
    adapterNode: qc.Serializer.NODE,
    horizontalScrollBar: qc.Serializer.NODE,
    verticalScrollBar: qc.Serializer.NODE,
    cellPrefab: qc.Serializer.PREFAB,
    overflow: qc.Serializer.BOOLEAN,
    canHorizontal: qc.Serializer.BOOLEAN,
    canVertical: qc.Serializer.BOOLEAN,
    movementType: qc.Serializer.NUMBER,
    elasticity: qc.Serializer.NUMBER,
    inertia: qc.Serializer.BOOLEAN,
    decelerationRate: qc.Serializer.NUMBER,
    scrollSensitivity: qc.Serializer.NUMBER,
    propagationScroll: qc.Serializer.BOOLEAN,
    extraLeft: qc.Serializer.NUMBER,
    extraRight: qc.Serializer.NUMBER,
    extraTop: qc.Serializer.NUMBER,
    extraBottom: qc.Serializer.NUMBER
});

Object.defineProperties(TableView.prototype, {
    /**
     * @property {qc.Node} adapterNode - 数据提供者所在的节点
     */
    adapterNode : {
        get : function() { return this._adapterNode || this.gameObject; },
        set : function(v) {
            if (v === this._adapterNode) 
                return;

            this._adapterNode = v;
            // 删除当前的数据来源
            if (this._adapter) {
                this._adapter.onDataChange.remove(this._clearTable, this);
                this._adapter = null;
            }
            this._needRebuild = true;
        }
    },

     /**
     * @property {qc.Node} adapter - 数据提供者
     * @readonly
     */
    adapter : {
        get : function() { 
            if (!this._adapter) {
                this._adapter = this.adapterNode && this.adapterNode.getScript('com.qici.extraUI.TableViewAdapter');
                if (this._adapter) {
                    this._adapter.onDataChange.add(this._clearTable, this);
                }
            }
            return this._adapter;
        },
    },

    /**
     * @property {qc.Node} content - 需要滚动显示的内容
     * 注意本节点之下不能挂载子节点，重构表单时会删除所有的子节点。
     */
    content : {
        get : function() {
            if (this._content && this._content._destroy) {
                this.content = null;
            }
            return this._content;
        },
        set : function(value) {
            var self = this;
            if (self._content) {
                self._content.onChildrenChanged.remove(self._doChildrenChanged, self);
                self._content.onLayoutArgumentChanged.remove(self._doLayoutArgumentChanged, self);
            }
            self._content = value;
            self._needRebuild = true;
            if (self._content) {
                self._content.onChildrenChanged.add(self._doChildrenChanged, self);
                self._content.onLayoutArgumentChanged.add(self._doLayoutArgumentChanged, self);
            }
        }
    },

    /**
     * @property {qc.Prefab} cellPrefab - 单元格的预制
     */
    cellPrefab : {
        get : function() { return this._cellPrefab; },
        set : function(v) {
            if (v === this._cellPrefab) 
                return;

            this._cellPrefab = v;
            // 更改显示预制时需要清理所有节点
            if (this.content)
                this.content.removeChildren();
            // 清理缓存的节点
            this._cellPool = [];
            this._needRebuild = true;
        }
    },

    /**
     * @property {boolean} overflow - 是否溢出显示。
     * 当溢出显示时，节点完全超过content的范围才隐藏。
     * 否者只要超出范围就隐藏
     */
    overflow : {
        get : function() { return this._overflow; },
        set : function(v) {
            if (v === this._overflow)
                return;

            this._overflow = v;
            this._needRebuild = true;
        }
    },

    extraLeft : {
        get : function() { return this._extraLeft || 0; },
        set : function(v) {
            if (v === this._extraLeft)
                return;
            this._extraLeft = v;
            this._needRebuild = true;
        }
    },
    extraRight : {
        get : function() { return this._extraRight || 0; },
        set : function(v) {
            if (v === this._extraRight)
                return;
            this._extraRight = v;
            this._needRebuild = true;
        }
    },
    extraTop : {
        get : function() { return this._extraTop || 0; },
        set : function(v) {
            if (v === this._extraTop)
                return;
            this._extraTop = v;
            this._needRebuild = true;
        }
    },
    extraBottom : {
        get : function() { return this._extraBottom || 0; },
        set : function(v) {
            if (v === this._extraBottom)
                return;
            this._extraBottom = v;
            this._needRebuild = true;
        }
    },

    canHorizontal: {
        get : function() {
            return this.scrollSupport ? this.scrollSupport.canHorizontal : null;
        },
        set : function(value) {
            this.scrollSupport && (this.scrollSupport.canHorizontal = value);
        }
    },

    canVertical: {
        get : function() {
            return this.scrollSupport ? this.scrollSupport.canVertical : null;
        },
        set : function(value) {
            this.scrollSupport && (this.scrollSupport.canVertical = value);
        }
    },

    movementType: {
        get : function() {
            return this.scrollSupport ? this.scrollSupport.movementType : null;
        },
        set : function(value) {
            this.scrollSupport && (this.scrollSupport.movementType = value);
        }
    },

    elasticity: {
        get : function() {
            return this.scrollSupport ? this.scrollSupport.elasticity : null;
        },
        set : function(value) {
            this.scrollSupport && (this.scrollSupport.elasticity = value);
        }
    },

    inertia: {
        get : function() {
            return this.scrollSupport ? this.scrollSupport.inertia : null;
        },
        set : function(value) {
            this.scrollSupport && (this.scrollSupport.inertia = value);
        }
    },

    decelerationRate: {
        get : function() {
            return this.scrollSupport ? this.scrollSupport.decelerationRate : null;
        },
        set : function(value) {
            this.scrollSupport && (this.scrollSupport.decelerationRate = value);
        }
    },

    scrollSensitivity: {
        get : function() {
            return this.scrollSupport ? this.scrollSupport.scrollSensitivity : null;
        },
        set : function(value) {
            this.scrollSupport && (this.scrollSupport.scrollSensitivity = value);
        }
    },

    propagationScroll: {
        get : function() {
            return this.scrollSupport ? this.scrollSupport.propagationScroll : null;
        },
        set : function(value) {
            this.scrollSupport && (this.scrollSupport.propagationScroll = value);
        }
    },
    
    /**
     * @property {qc.Node | null} horizontalScrollBar - 水平滚动条
     */
    horizontalScrollBar : {
        get : function() {
            return this.scrollSupport ? this.scrollSupport.horizontalScrollBar : null;
        },
        set : function(value) {
            this.scrollSupport && (this.scrollSupport.horizontalScrollBar = value);
        }
    },

    /**
     * @property {qc.Node | null} verticalScrollBar - 竖直滚动条
     */
    verticalScrollBar : {
        get : function() {
            return this.scrollSupport ? this.scrollSupport.verticalScrollBar : null;
        },
        set : function(value) {
            this.scrollSupport && (this.scrollSupport.verticalScrollBar = value);
        }
    },

    /**
     * @property {number} horizontalNormalizedPosition - 水平方向上滚动的比例
     */
    horizontalNormalizedPosition : {
        get : function() {
            return this.scrollSupport ? this.scrollSupport.horizontalNormalizedPosition : null;
        },
        set : function(value) {
            this.scrollSupport  && this.scrollSupport.setNormalizedPosition(value, 0);
        }
    },

    /**
     * @property {number} verticalNormalizedPosition - 竖直方向上滚动的比例
     */
    verticalNormalizedPosition : {
        get : function() {
            return this.scrollSupport ? this.scrollSupport.verticalNormalizedPosition : null;
        },
        set : function(value) {
            this.scrollSupport  && this.scrollSupport.setNormalizedPosition(value, 1);
        }
    }
});

/**
 * 脚本启动时
 */
TableView.prototype.awake = function() {
};

/**
 * 析构
 */
TableView.prototype.onDestroy = function() {
    var self = this;
    // 清理一些引用的资源
    self.content = null;
    self.cellPrefab = null;
    self._adapter = null;
    self.adapterNode = null;

    self._cellPool = [];
    self._showCell = [];
    self._usingCell = [];
};

/**
 * 更新
 */
TableView.prototype.update = function() {
    if (this.content) {
        this.scrollSupport.pivotX = this.content.pivotX;
        this.scrollSupport.pivotY = this.content.pivotY;
    }
    this.scrollSupport.update(this.game.time.deltaTime);
    if (this._needRebuild) {
        this._rebuildTable();
    }
};

/**
 * 重新排布
 */
TableView.prototype.relayout = function() {
    this._rebuildTable();
};

/**
 * 清理表格
 */
TableView.prototype._clearTable = function() {
    var self = this,
        gameObject = self.gameObject,
        content = self.content;

    content.x = 0;
    content.y = 0;

    // 移除所有子节点
    self.revokeAllCell();
};

/**
 * 回收所有节点
 */
TableView.prototype.revokeAllCell = function() {
    var self = this,
        content = self.content;
    content.removeChildren();
    Array.prototype.push.apply(self._cellPool, self._usingCell);
    self._usingCell = [];
};

/**
 * 废弃一个节点
 * @param  {qc.Node} node - 不在显示区域的需要回收的节点
 */
TableView.prototype._revokeCell = function(node) {
    var self = this;
    self._cellPool.push(node);
    var idx = self._usingCell.indexOf(node);
    if (idx >= 0) {
        self._usingCell.splice(idx, 1);
    }
};

/**
 * 获取一个新的节点。
 * 如果当前缓存中存在可用的节点，则从缓存中获取，否则根据Prefab新建一个。
 * @return {qc.Node} 单元格的节点
 */
TableView.prototype._createCell = function() {
    var self = this;
    if (!self._cellPrefab) {
        return null;
    }
    var node = self._cellPool.pop() || self.game.add.clone(self._cellPrefab, self.gameObject);
    if (node) {
        self._usingCell.push(node);
    }
    return node;
};

/**
 * 获取视图大小
 */
TableView.prototype._getViewRect = function() {
    return this.gameObject.rect;
};

/**
 * 获取内容大小
 */
TableView.prototype._getContentRect = function() {
    var self = this,
        adapter = self.adapter,
        content = self.content;
    if (!content || !adapter) 
        return new qc.Rectangle(0, 0, 0, 0);

    var tableSize = adapter.getTableSize();
    var lastCellX = tableSize.x < Infinity ? tableSize.x - 1 : 0,
        lastCellY = tableSize.y < Infinity ? tableSize.y - 1 : 0;

    var cellRect = adapter.getCellRect(lastCellX, lastCellY);
    return new qc.Rectangle(content.x, content.y, 
        tableSize.x < Infinity ? cellRect.x + cellRect.width : Infinity,
        tableSize.y < Infinity ? cellRect.y + cellRect.height : Infinity);
};

/**
 * 设置当前内容在表格内容中的偏移
 */
TableView.prototype._setContentPosition = function(offsetX, offsetY) {
    var self = this,
        content = self.content;
    if (!content) 
        return;

    content.x = offsetX;
    content.y = offsetY;

    // 修改表格位置后需要马上重新设定显示内容。否则，可能会无法立即及时的更新内容信息
    self._rebuildTable();
};

/**
 * 获取当前内容区域在表格中对应的内容区域
 */
TableView.prototype._getViewRectInTable = function() {
    var self = this,
        gameObject = self.gameObject,
        rect = gameObject.rect,
        content = self.content;
    if (!content)
        return new qc.Rectangle(0, 0, 0, 0);
    return new qc.Rectangle(
        rect.x - self.extraLeft - content.x,
         rect.y - self.extraTop - content.y, 
         rect.width + self.extraLeft + self.extraRight, 
         rect.height + self.extraTop + self.extraBottom);
};

/**
 * 设置单元格的偏移
 */
TableView.prototype._setCellRect = function(cell, x, y, width, height) {
    var self = this,
        content = self.content;
    if (!content || !cell) 
        return;

    cell.x = x;
    cell.y = y;
    cell.width = width;
    cell.height = height;
};


/**
 * 重新构建表格
 */
TableView.prototype._rebuildTable = function() {
    var self = this,
        adapter = self.adapter,
        content = self.content;

    if (!content) {
        return;
    }

    if (!adapter) {
        this._clearTable();
        return;
    }

    var tableSize = adapter.getTableSize();
    if (tableSize.x <= 0 || tableSize.y <= 0 ||
        (tableSize.x === Infinity && tableSize.y === Infinity)) {
        // 没有行，或者没有列，或者行无限且列无限
        // 则清理显示并退出处理
        this._clearTable();
        return;
    }

    var bounds = self._getViewRectInTable();
    var showRect = self._showRect;
    var minX = bounds.x,
        maxX = bounds.x + bounds.width,
        minY = bounds.y,
        maxY = bounds.y + bounds.height;

    var leftUp = adapter.findCellWithPos(minX, minY);
    var rightBottom = adapter.findCellWithPos(maxX, maxY);

    if (!self.overflow) {
        var overLeftUp = adapter.findCellWithPos(minX - 1, minY - 1);
        var overRightBottom = adapter.findCellWithPos(maxX + 1, maxY + 1);
        if (overLeftUp.x === leftUp.x)
            ++leftUp.x;
        if (overLeftUp.y === leftUp.y)
            ++leftUp.y;
        if (overRightBottom.x === rightBottom.x)
            --rightBottom.x;
        if (overRightBottom.y === rightBottom.y)
            --rightBottom.y;
    }

    var startCellX = Math.max(leftUp.x, 0),
        startCellY = Math.max(leftUp.y, 0),
        endCellX = Math.min(rightBottom.x, tableSize.x - 1),
        endCellY = Math.min(rightBottom.y, tableSize.y - 1);

    var children = content.children;
    var totalLength = showRect.width * showRect.height;

    // 显示与实际需要的不匹配，全部销毁后重置
    if (totalLength !== children.length) {
        content.removeChildren();
        showRect.setTo(0, 0, 0, 0);
        totalLength = 0;
    }

    // 先移出不需要显示的部分
    var node;
    var yPos, xPos, yEnd, xEnd;
    var childIdx = totalLength - 1;
    for (yPos = showRect.y + showRect.height -1, yEnd = showRect.y; yPos >= yEnd; --yPos) {
        for (xPos = showRect.x + showRect.width - 1, xEnd = showRect.x; xPos >= xEnd; --xPos, --childIdx) {
            if (xPos >= startCellX && xPos <= endCellX &&
                yPos >= startCellY && yPos <= endCellY) 
                continue;
            node = content.removeChildAt(childIdx);
            adapter.revokeCell(node, xPos, yPos);
            self._revokeCell(node);
        }
    }

    var currStartX = Math.max(showRect.x, startCellX),
        currStartY = Math.max(showRect.y, startCellY),
        currEndX = Math.min(showRect.x + showRect.width - 1, endCellX),
        currEndY = Math.min(showRect.y + showRect.height - 1, endCellY);

    // 当前需要显示的宽，高
    var showWidth = endCellX - startCellX + 1,
        showHeight = endCellY - startCellY + 1;
    if (showWidth > 0 && showHeight > 0) {
        childIdx = 0;
        for (yPos = startCellY; yPos <= endCellY; ++yPos) {
            for (xPos = startCellX; xPos <= endCellX; ++xPos, ++childIdx) {
                if (xPos >= currStartX && xPos <= currEndX &&
                    yPos >= currStartY && yPos <= currEndY)
                    continue;
                node = self._createCell();
                if (!node) {
                    continue;
                }
                content.addChildAt(node, childIdx);
                var cellRect = adapter.getCellRect(xPos, yPos);
                self._setCellRect(node, cellRect.x, cellRect.y, cellRect.width, cellRect.height);
                adapter.createCell(node, xPos, yPos);
            }
        }
    }
    showRect.setTo(startCellX, startCellY, showWidth, showHeight);
};

/**
 * 当子节点变化时
 * @private
 */
TableView.prototype._doChildrenChanged = function(event) {
    this._needRebuild = true;
};

TableView.prototype._doLayoutArgumentChanged = function() {
    this._needRebuild = true;
};
