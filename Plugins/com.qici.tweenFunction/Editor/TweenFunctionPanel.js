/**
 * @author chenx
 * @date 2015.11.13
 * @copyright 2015 Qcplay All Rights Reserved.
 */

// 脚本显示扩展
G.extend.inspector('qc.TweenFunction', function() {
    var self = this;
    var target = this.target;

    // 调用自己的绘制
    var gui = qc.editor.gui;
    var defaultConfig = [90, '60+1'];
    gui.columnWidths = defaultConfig;

    gui.line([
        gui.text('Func Name'),
        gui.stringInput({ bind: 'funcName' })
    ]);

    qc.editor.TweenUtil.paintTween(self, target);
});
