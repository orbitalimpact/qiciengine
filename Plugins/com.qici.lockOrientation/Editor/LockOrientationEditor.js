/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 */

// 脚本显示扩展
G.extend.inspector('qc.Plugins.LockOrientation', function() {
    var self = this,
        target = self.target;

    // 调用自己的绘制
    var gui = qc.editor.gui;
    gui.columnWidths = ['70+0.1', '60+1'];
    gui.line([
        gui.text('Orientation'),
        gui.dropDownList({bind: 'orientation', items: [
            { label: 'None',      value: qc.Device.AUTO      },
            { label: 'Portrait',  value: qc.Device.PORTRAIT  },
            { label: 'Landscape', value: qc.Device.LANDSCAPE }
        ]})
    ]);
        // 缩放类型
    gui.line([
        gui.text('Manual Type'),
        gui.dropDownList({ bind: 'manualType', 'items': [
            { label: 'None', value: qc.ScaleAdapter.NONE },
            { label: 'Height', value: qc.ScaleAdapter.MANUAL_HEIGHT },
            { label: 'Width', value: qc.ScaleAdapter.MANUAL_WIDTH },
            { label: 'Expand', value: qc.ScaleAdapter.EXPAND },
            { label: 'Shrink', value: qc.ScaleAdapter.SHRINK },
            { label: 'Fill', value: qc.ScaleAdapter.FILL }
        ]})
    ]);
    
    gui.line([
       gui.text('Desktop'),
        gui.checkBox({bind: 'desktop'})
    ]);
});