/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 打开工程
 */
M.COMMAND.registerCmd({
    name : 'OPEN_PROJECT',
    main : function(socket, cookie, args) {
        var ret = M.PROJECT.openProject(args.path);
        if (ret === true)
            return { 'operRet' : true };
        else
            return { 'operRet' : false, 'reason' : ret };
    }
});
