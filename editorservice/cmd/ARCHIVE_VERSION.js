/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 */

/*
 * 获取当前的最新版本信息
 */

M.COMMAND.registerCmd({
    name : 'ARCHIVE_VERSION',
    main : function(socket, cookie, data) {
        return M.UPDATE_MANAGER.archiveVersion(data.version);
    }
});
