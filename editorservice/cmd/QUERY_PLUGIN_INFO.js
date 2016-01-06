/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 */

 /*
 * 取得工程的插件信息
 */

M.COMMAND.registerCmd({
    name : 'QUERY_PLUGIN_INFO',
    main : function(socket, cookie, data) {
        return M.PLUGIN_SCRIPTS.getPluginInfo();
    }
});
