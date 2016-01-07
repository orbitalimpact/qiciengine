/**
 * @author lijh
 * copyright 2015 Qcplay All Rights Reserved.
 */

// 脚本显示扩展
G.extend.inspector('qc.Plugins.PopupAd', function() {
    var self = this,
        target = self.target;

    // 调用自己的绘制
    var gui = qc.editor.gui;
    gui.columnWidths = ['70+0.1', '60+1'];

    gui.line([
        gui.text('UrlPC'),
        gui.stringInput({ bind: 'urlPC' })
    ]);

    gui.line([
        gui.text('UrlMobile'),
        gui.stringInput({ bind: 'urlMobile' })
    ]);

    gui.line([
        gui.text('WidthPC'),
        gui.stringInput({ bind: 'widthPC' })
    ]);

    gui.line([
        gui.text('HeightPC'),
        gui.stringInput({ bind: 'heightPC' })
    ]);

     gui.line([
        gui.text('CloseImgUrl'),
        gui.stringInput({ bind: 'closeImgUrl' })
    ]);

    gui.line([
        gui.text('CloseImgWidth'),
        gui.stringInput({ bind: 'closeImgWidth' })
    ]);

    gui.line([
        gui.text('CloseImgHeight'),
        gui.stringInput({ bind: 'closeImgHeight' })
    ]);
});
