/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 该文件是否 entry file（第一个被加载）
 */

M.COMMAND.registerCmd({
    name : 'IS_SCRIPT_ENTRY',
    main : function(socket, cookie, args) {
        var item = args.item;

        return {
            'operRet': true,
            'isEntry': M.USER_SCRIPTS.isEntry(item)
        };
    }
});
