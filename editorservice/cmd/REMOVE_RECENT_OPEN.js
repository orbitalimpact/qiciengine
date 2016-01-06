/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 将某个工程从最近打开列表中删除
 */
M.COMMAND.registerCmd({
    name : 'REMOVE_RECENT_OPEN',
    main : function(socket, cookie, args) {
        var path = args.path;
        var resent = M.PROJECT.getRecentOpen();
        var index = resent.indexOf(path);

        // 无效的删除请求
        if (index < 0)
            return {
                'operRet' : false, 'resent' : resent
            };

        // 删除并且保存
        resent.splice(index, 1);
        M.PROJECT.setRecentOpen(resent);
        return {
            'operRet' : true, 'resent' : resent
        };
    }
});
