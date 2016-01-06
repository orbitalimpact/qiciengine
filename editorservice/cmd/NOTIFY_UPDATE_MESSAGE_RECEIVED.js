/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 */

/*
 * 客户端收到更新消息的回馈
 */

M.COMMAND.registerCmd({
    name : 'NOTIFY_UPDATE_MESSAGE_RECEIVED',
    main : function(socket, cookie, data) {
        process.exit(100);
    }
});
