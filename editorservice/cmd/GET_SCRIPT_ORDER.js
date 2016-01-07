/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 客户端向服务器请求脚本加载顺序
 */

M.COMMAND.registerCmd({
    name : 'GET_SCRIPT_ORDER',
    main : function(socket, cookie, args) {
        return {
            operRet : true,
            order : M.USER_SCRIPTS.getScriptOrder(args.basePath)
        };
    }
});
