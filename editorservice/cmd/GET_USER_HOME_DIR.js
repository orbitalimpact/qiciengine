/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 获取用户的home文件夹
 */

M.COMMAND.registerCmd({
    name : 'GET_USER_HOME_DIR',
    main : function(socket, cookie, dir) {
        return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    }
});
