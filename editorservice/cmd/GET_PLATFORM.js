/**
 * @author liyk
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 请求操作系统信息
 */

M.COMMAND.registerCmd({
    name : 'GET_PLATFORM',
    main : function(socket, cookie) {
        return process.platform;
    }
});
