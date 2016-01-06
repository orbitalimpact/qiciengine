/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 更新工程的配置信息
 */
M.COMMAND.registerCmd({
    name : 'UPDATE_SCENE_SETTINGS',
    main : function(socket, cookie, data) {
        var settings = {
            scene : {},
            entryScene : ''
        };

        for (var i in data) {
            settings.scene[data[i]] = 'Assets/state/' + data[i] + '.bin';
        }
        if (Object.keys(data).length > 0)
            settings.entryScene = data['0'];

        G.config.scene = settings;
        var f = G.load('filesystem/AutoConfigProject');
        f.writeSceneSetting(settings);

        // 重新生成游戏启动文件
        G.log.debug('update scene settings.');
        M.PROJECT.genGameHTML();

        return G.config.scene;
    }
});
