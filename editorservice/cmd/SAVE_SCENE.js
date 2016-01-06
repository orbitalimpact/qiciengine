/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 保存场景
 */

M.COMMAND.registerCmd({
    name : 'SAVE_SCENE',
    main : function(socket, cookie, data) {
        var name = data.name;
        var data = data.data;

        return M.SCENE_MANAGER.saveScene(name, data);
    }
});
