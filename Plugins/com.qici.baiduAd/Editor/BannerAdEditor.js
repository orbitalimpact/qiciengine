/**
 * @author lijh
 * copyright 2015 Qcplay All Rights Reserved.
 */

// 脚本显示扩展
G.extend.inspector('qc.Plugins.BannerAd', function() {
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
        gui.text('Height'),
        gui.stringInput({ bind: 'height' })
    ]);

    gui.line([
        gui.text('Location'),
        gui.dropDownList({bind: 'location', items: [
            { label: 'Top',      value: qc.Plugins.BannerAd.AD_LOCATION_TOP      },
            { label: 'Bottom',   value: qc.Plugins.BannerAd.AD_LOCATION_BOTTOM   }
        ]})
    ]);
});
