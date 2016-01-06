/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 */

// 脚本显示扩展
G.extend.inspector('com.qici.extraUI.TableView', function() {
    var self = this,
        target = self.target;

    // 调用自己的绘制
    var gui = qc.editor.gui;
    var defaultConfig = ["90+0.1", "60+0.5"];
    var InspectorUtil = qc.editor.InspectorUtil;
    gui.columnWidths = defaultConfig;

    // 滚动的内容
    InspectorUtil.drawNodeRef(target, 'content');
    InspectorUtil.drawNodeRef(target, 'adapterNode');

    InspectorUtil.drawPrefabInput(target, 'Cell Prefab', 'cellPrefab');

    gui.line([
        gui.text('Overflow', { align: 'left' }),
        gui.checkBox({ bind: 'overflow' })
    ]);

    gui.columnWidths = [self.indent, "70+0.1", "60+0.5"];
    // 拓展宽高
    var title = gui.titleLine('Extra Size', true);
    title.add(gui.line([
        gui.empty(),
        gui.text('Left', { toolTip: 'extraLeft' }),
        gui.numberInput({ bind: 'extraLeft' })
    ]));
    title.add(gui.line([
        gui.empty(),
        gui.text('Right', { toolTip: 'extraRight' }),
        gui.numberInput({ bind: 'extraRight' })
    ]));
    title.add(gui.line([
        gui.empty(),
        gui.text('Top', { toolTip: 'extraTop' }),
        gui.numberInput({ bind: 'extraTop' })
    ]));
    title.add(gui.line([
        gui.empty(),
        gui.text('Bottom', { toolTip: 'extraBottom' }),
        gui.numberInput({ bind: 'extraBottom' })
    ]));

    // 是否水平滚动
    title = gui.titleLine('Horizontal Scroll', G.preference.query('collapse.scrollView') === true);
    title.add(gui.line([
        gui.empty(),
        gui.text('Horizontal', { toolTip: 'canHorizontal' }),
        gui.checkBox({ bind: 'canHorizontal' })
    ]));
    title.add(InspectorUtil.drawNodeRef(target, 'horizontalScrollBar', undefined, true, 'ScrollBarH'));
    title.add(gui.line([
        gui.empty(),
        gui.text('Value', { toolTip: 'horizontalNormalizedPosition' }),
        gui.numberInput({ bind: 'horizontalNormalizedPosition' })
    ]));

    // 是否垂直滚动
    title = gui.titleLine('Vertical Scroll', G.preference.query('collapse.scrollView') === true);
    title.add(gui.line([
        gui.empty(),
        gui.text('Vertical', { toolTip: 'canVertical' }),
        gui.checkBox({ bind: 'canVertical' })
    ]));
    title.add(InspectorUtil.drawNodeRef(target, 'verticalScrollBar', undefined, true, 'ScrollBarV'));
    title.add(gui.line([
        gui.empty(),
        gui.text('Value', { toolTip: 'verticalNormalizedPosition' }),
        gui.numberInput({ bind: 'verticalNormalizedPosition' })
    ]));
    gui.columnWidths = defaultConfig;

    // 边界限制类型
    gui.line([
        gui.text('Movement Type', { toolTip: 'movementType' }),
        self._moveType = gui.dropDownList({ bind: 'movementType', items: [
            { label: 'Unrestricted', value: qc.ScrollView.MOVEMENT_UNRESTRICTED },
            { label: 'Elastic', value: qc.ScrollView.MOVEMENT_ELASTIC },
            { label: 'Clamped', value: qc.ScrollView.MOVEMENT_CLAMPED }
        ]})
    ]);

    // 复位速度
    var old = target.movementType;
    self._moveType.onValueChanged = function(v) {
        if (v !== old)
            self.repaint();
    };

    if (target.movementType === qc.ScrollView.MOVEMENT_ELASTIC) {
        gui.line([
            gui.text('Elasticity', { align: 'left' }),
            gui.numberInput({ bind: 'elasticity' })
        ]);
    }

    // 惯性滑动
    gui.line([
        gui.text('Inertia', { align: 'left' }),
        gui.checkBox({ bind: 'inertia' })
    ]);
    gui.line([
        gui.text('Deceleration Rate', { toolTip: 'decelerationRate' }),
        gui.numberInput({ bind: 'decelerationRate' })
    ]);

    // 滚动的敏感度
    gui.line([
        gui.text('Scroll Sensitivity', { toolTip: 'scrollSensitivity' }),
        gui.numberInput({ bind: 'scrollSensitivity' })
    ]);

    // 滚动的敏感度
    gui.line([
        gui.text('Propagation Scroll', { toolTip: 'propagationScroll' }),
        gui.checkBox({ bind: 'propagationScroll' })
    ]);
});