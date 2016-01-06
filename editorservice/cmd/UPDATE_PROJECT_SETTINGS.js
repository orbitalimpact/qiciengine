/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 更新工程的配置信息
 */
M.COMMAND.registerCmd({
    name : 'UPDATE_PROJECT_SETTINGS',
    main : function(socket, cookie, data) {
        G.config.project = data;

        var f = G.load('filesystem/AutoConfigProject');
        f.writeProjectSetting(data);

        // 重新生成游戏启动文件
        G.log.debug('update project settings.');
        M.PROJECT.genGameHTML();

        return true;
    }
});
