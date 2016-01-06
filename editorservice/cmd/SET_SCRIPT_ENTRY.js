/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 设置一个文件作为 entry file（第一个被加载）
 */

M.COMMAND.registerCmd({
    name : 'SET_SCRIPT_ENTRY',
    main : function(socket, cookie, args) {
        var item = args.item;

        var ret = M.USER_SCRIPTS.setAsEntry(item);
        if (ret === true)
            return { 'operRet': true };
        else
            return { 'operRet' : false, 'reason' : ret };
    }
});
