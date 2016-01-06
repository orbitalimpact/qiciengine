/**
 * @author chenx
 * @date 2015.10.15
 * copyright 2015 Qcplay All Rights Reserved.
 *
 */

// 脚本显示扩展
G.extend.inspector('qc.Plugins.ServerCommnunicate', function() {
    var self = this,
        target = self.target;

    // 调用自己的绘制
    var gui = qc.editor.gui;
    gui.columnWidths = ['70+0.1', '60+1'];
    gui.line([
        gui.text('URL'),
        gui.stringInput({bind: 'url'})
    ]);
});
