/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 */

/*
 * 获取当前的最新版本信息
 */

M.COMMAND.registerCmd({
    name : 'CHECK_FOR_UPDATES',
    main : function(socket, cookie, data) {
        return M.UPDATE_MANAGER.getLatestVersion(data.needQuery);
    }
});
