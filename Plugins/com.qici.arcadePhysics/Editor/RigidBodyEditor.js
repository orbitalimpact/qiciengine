/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 */

// 脚本显示扩展
G.extend.inspector('qc.arcade.RigidBody', function() {
    var self = this,
        target = self.target;

    // 调用自己的绘制
    var gui = qc.editor.gui;
    gui.columnWidths = ['90+0.1', '60+0.3'];

    gui.line([
        gui.text('Mass'),
        gui.numberInput({ bind: 'mass' })
    ]);
    gui.line([
        gui.text('Moves'),
        gui.checkBox({ bind: 'moves'})
    ]);
    gui.line([
        gui.text('Immovable'),
        gui.checkBox({ bind: 'immovable'})
    ]);
    gui.line([
        gui.text('Collide World Bounds'),
        gui.checkBox({ bind: 'collideWorldBounds'})
    ]);
    gui.line([
        gui.text('Allow Rotation'),
        gui.checkBox({ bind: 'allowRotation'})
    ]);
    gui.line([
        gui.text('Allow Gravity'),
        gui.checkBox({ bind: 'allowGravity'})
    ]);

    gui.columnWidths = ['70+0.1', 20, '30+0.1', 20, '30+0.1'];
    qc.editor.InspectorUtil.drawPoint(target, 'bounce', 'bounce');
    qc.editor.InspectorUtil.drawPoint(target, 'velocity', 'velocity');
    qc.editor.InspectorUtil.drawPoint(target, 'maxVelocity', 'maxVelocity');
    qc.editor.InspectorUtil.drawPoint(target, 'acceleration', 'acceleration');
    qc.editor.InspectorUtil.drawPoint(target, 'drag', 'drag');
    qc.editor.InspectorUtil.drawPoint(target, 'gravity', 'gravity');
    qc.editor.InspectorUtil.drawPoint(target, 'friction', 'friction');

    gui.columnWidths = ['120+0.1', '30+3'];
    gui.line([
        gui.text('Angular Velocity'),
        gui.numberInput({ bind: 'angularVelocity' })
    ]);
    gui.line([
        gui.text('Max Angular'),
        gui.numberInput({ bind: 'maxAngular' })
    ]);
    gui.line([
        gui.text('Angular Acceleration'),
        gui.numberInput({ bind: 'angularAcceleration' })
    ]);
    gui.line([
        gui.text('Angular Drag'),
        gui.numberInput({ bind: 'angularDrag' })
    ]);

    gui.columnWidths = [30, 60, '60+1'];
    var title = gui.titleLine('Check Collision', true);
    title.add(gui.line([
        gui.empty(),
        gui.text('Up'),
        gui.checkBox({ bind: 'checkCollision.up' })
    ]));
    title.add(gui.line([
        gui.empty(),
        gui.text('Down'),
        gui.checkBox({ bind: 'checkCollision.down' })
    ]));
    title.add(gui.line([
        gui.empty(),
        gui.text('Left'),
        gui.checkBox({ bind: 'checkCollision.left' })
    ]));
    title.add(gui.line([
        gui.empty(),
        gui.text('Right'),
        gui.checkBox({ bind: 'checkCollision.right' })
    ]));

    gui.columnWidths = ["60+0.3", "60+0.5"];
    gui.line([
        gui.text('ccdIterations'),
        gui.intInput({ bind: 'ccdIterations' })
    ]);
    qc.editor.InspectorUtil.drawNodes(self, 'Collides', 'collides');
    qc.editor.InspectorUtil.drawNodes(self, 'Overlaps', 'overlaps');
});