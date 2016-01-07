/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 服务器与客户端通信通道的消息接收
 */

M.COMMAND.registerCmd({
    name : 'SERVICE_PIPE_COMMAND',
    main : function(socket, cookie, data) {
        return M.SERVICE_PIPE.emit(data.command, data.data);
    }
});

