/**
 * Created by qcplay on 7/15/15.
 */

// 脚本显示扩展
G.extend.inspector('qc.Plugins.NodeFadeInOut', function() {
    var self = this,
        target = self.target;

    // 先调用默认的绘制方法
    //self.defaultDraw();
    var defaultConfig = [70, 20, '30+1', 20, '30+1'];

    // 调用自己的绘制
    var gui = qc.editor.gui;

    gui.columnWidths = [90, '60+1'];

    // 淡入淡出的节点
    qc.editor.InspectorUtil.drawNodeRef(target, 'Target', 'target');

    gui.line([
        gui.text('Fade Type'),
        gui.dropDownList({bind: 'fadeType', items: [
            { label: 'Fade In', value: qc.Plugins.NodeFadeInOut.FADE_IN },
            { label: 'Fade Out', value: qc.Plugins.NodeFadeInOut.FADE_OUT }
        ]})
    ]);
    gui.line([
        gui.text('Fade Style'),
        gui.dropDownList({bind: 'fadeStyle', items: [
            { label: 'Zoom', value: qc.Plugins.NodeFadeInOut.STYLE_ZOOM },
            { label: 'Clip', value: qc.Plugins.NodeFadeInOut.STYLE_CLIP }
        ]})
    ]);
    gui.line([
        gui.text('Fade Effect'),
        gui.dropDownList({bind: 'fadeEffect', items: [
            { label: 'X and Y', value: qc.Plugins.NodeFadeInOut.EFFECT_XY },
            { label: 'Only X', value: qc.Plugins.NodeFadeInOut.EFFECT_X },
            { label: 'Only Y', value: qc.Plugins.NodeFadeInOut.EFFECT_Y }
        ]})
    ]);
    gui.line([
        gui.text('Column Count'),
        gui.numberInput({ bind: 'columnCount' })
    ]);
    gui.line([
        gui.text('Row Count'),
        gui.numberInput({ bind: 'rowCount' })
    ]);
    gui.columnWidths = defaultConfig;
    gui.line([
        gui.text('Pivot'),
        gui.text('X'),
        gui.numberInput({ bind: 'pivotX' }),
        gui.text('Y'),
        gui.numberInput({ bind: 'pivotY' })
    ]);
    qc.editor.TweenUtil.paintTweenBase(self, target);
});