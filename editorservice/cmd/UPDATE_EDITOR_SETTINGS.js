/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 更新编辑器的配置信息
 */
M.COMMAND.registerCmd({
    name : 'UPDATE_EDITOR_SETTINGS',
    main : function(socket, cookie, data) {

        var stateMD5 = G.config.editor.stateMD5;
        G.config.editor = data;

        if (cookie != -1)
            // 表示前端发起的更新，不改变 stateMD5 值
            G.config.editor.stateMD5 = stateMD5;

        var f = G.load('filesystem/AutoConfigProject');
        f.writeEditorSetting(data);
        return true;
    }
});
