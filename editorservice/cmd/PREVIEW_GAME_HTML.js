/**
 * @author linyw
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 请求生成Temp/PreviewGame.html
 */
var fs = require('fs-extra');
var path = require('path');

M.COMMAND.registerCmd({
    name : 'PREVIEW_GAME_HTML',
    main : function(socket, cookie, paras) {
        // 读取WebGL模板文件
        var content = fs.readFileSync(path.join(G.editorRoot, 'Template/PreviewGameWebGL.templet.html'), 'utf8');
        // 替换插件文件
        content = M.PLUGIN_SCRIPTS.genTemplateContent(content);
        // 写入目标文件
        fs.writeFileSync(G.gameRoot + 'Temp/PreviewGameWebGL.html', M.USER_SCRIPTS.genTemplateContent(content));

        // 读取Canvas模板文件
        var content = fs.readFileSync(path.join(G.editorRoot, 'Template/PreviewGameCanvas.templet.html'), 'utf8');
        // 替换插件文件
        content = M.PLUGIN_SCRIPTS.genTemplateContent(content);
        // 写入目标文件
        fs.writeFileSync(G.gameRoot + 'Temp/PreviewGameCanvas.html', M.USER_SCRIPTS.genTemplateContent(content));

        return 1;
    }
});
