/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 */

/*
 * 取得插件的脚本信息
 */
M.COMMAND.registerCmd({
    name : 'QUERY_PLUGIN_SCRIPT',
    main : function(socket, cookie, data) {
        return M.PLUGIN_SCRIPTS.getPluginScript(data.id);
    }
});
