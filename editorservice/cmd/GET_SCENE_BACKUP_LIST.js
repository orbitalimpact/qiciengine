/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 获取一个场景的备份列表
 */

M.COMMAND.registerCmd({
    name : 'GET_SCENE_BACKUP_LIST',
    main : function(socket, cookie, args) {
        var name = args.name;

        if (!/\.state$/.test(name))
            name = name + '.state';

        return {
            operRet: true,
            list: M.SCENE_MANAGER.getBackupList(name)
        };
    }
});
