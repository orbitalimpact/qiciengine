/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 */

M.COMMAND.registerCmd({
    name : 'UPDATE_VERSION',
    main : function(socket, cookie, data) {
        return M.UPDATE_MANAGER.updateVersion();
    }
});
