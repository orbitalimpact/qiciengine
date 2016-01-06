/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 */

/*
 * 安装插件
 */

M.COMMAND.registerCmd({
    name : 'INSTALL_PLUGIN',
    main : function(socket, cookie, data, callback) {
        return M.PLUGIN_SCRIPTS.installPlugin(data.pluginId, data.version, data.session, callback);
    }
});
