/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 请求生成Temp/StartScene.html
 */
var fs = require('fs-extra');
var path = require('path');

M.COMMAND.registerCmd({
    name : 'START_SCENE_HTML',
    main : function(socket, cookie, paras) {
        // 读取模板文件
        var content = fs.readFileSync(path.join(G.editorRoot, 'Template/StartScene.templet.html'), 'utf8');
        // 替换插件文件
        content = M.PLUGIN_SCRIPTS.genTemplateContent(content);
        // 写入目标文件
        fs.writeFileSync(G.gameRoot + 'Temp/StartScene.html',
            M.USER_SCRIPTS.genTemplateContent(content));
        return 1;
    }
});

