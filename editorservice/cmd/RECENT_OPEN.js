/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 最近打开的工程
 */

var fs = require('fs-extra');
var path = require('path');
var fsEx = G.load('filesystem/FsExpand');

M.COMMAND.registerCmd({
    name : 'RECENT_OPEN',
    main : function(socket, cookie, args) {

        var checkRet, unsaved;
        var checkTempScene = args.checkTempScene;
        if (checkTempScene)
        {
            // 需要检查 currScene 对应的 state 与 scene_editor.state 是否一致，
            // 若不一致，需要提示用户是否恢复临时场景
            if (G.config.editor && !!G.config.editor.currScene)
            {
                // 取得 currScene 的资源路径
                var stateBin = G.config.scene.scene[G.config.editor.currScene];
                if (stateBin)
                {
                    stateBin = stateBin.replace('.bin', '.state');

                    // 读取 Assets/state 下的源 state
                    var fullPath = fsEx.expandPath(path.join(G.gameRoot, stateBin));
                    console.log('assets state : ', fullPath);
                    var srcState = fs.readFileSync(fullPath, { encoding : 'utf8' });

                    // 计算源 state 的 MD5
                    var stateMD5 = M.util.calcMD5(srcState);
                    if (!G.config.editor.stateMD5)
                    {
                        // editor.setting 中没有记录 md5，则保存该 md5
                        G.config.editor.stateMD5 = stateMD5;
                        M.COMMAND.dispatch('UPDATE_EDITOR_SETTINGS', -1, G.config.editor);
                    }

                    if (G.config.editor.stateMD5 != stateMD5)
                        // 不一致，根据该标识，前端直接弹出提示用户源场景文件发生变动
                        checkRet = 2;

                    // 读取 Temp 下的 scene_editor.state
                    fullPath = fsEx.expandPath(path.join(G.gameRoot, 'Temp/scene_editor.state'));
                    var tempState = fs.readFileSync(fullPath, { encoding : 'utf8' });

                    // 比对源 state 与 scene_editor.state 是否一致
                    if (srcState != tempState)
                        unsaved = true;
                }
            }
            else
                // 表示没有 currScene，根据该标识，前端直接打开 entryScene
                checkRet = 1;
        }

        return {
            'operRet' : true, 'resent' : M.PROJECT.getRecentOpen(),
            'checkRet' : checkRet, 'unsaved' : unsaved,
        };
    }
});
