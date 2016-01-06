/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 保存场景
 */

M.COMMAND.registerCmd({
    name : 'REVERT_SCENE_TO_REVISION',
    main : function(socket, cookie, data) {
        var name = data.state;
        var version = data.version;

        if (!/\.state$/.test(name))
            name = name + '.state';

        return { operRet : M.SCENE_MANAGER.revertToRevision(name, version) };
    }
});
