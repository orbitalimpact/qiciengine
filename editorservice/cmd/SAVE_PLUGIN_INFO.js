/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 */

/*
 * 保存工程的插件信息
 */

M.COMMAND.registerCmd({
    name : 'SAVE_PLUGIN_INFO',
    main : function(socket, cookie, data) {
        return M.PLUGIN_SCRIPTS.saveEffectivePlugins(data.data);
    }
});
