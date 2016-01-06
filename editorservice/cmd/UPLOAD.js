/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 导入资源
 */
var fs = require('fs-extra');
var path = require('path');
var fsEx = G.load('filesystem/FsExpand');

M.COMMAND.registerCmd({
    name : 'UPLOAD',
    main : function(socket, cookie, data) {
        var content = data.content;
        var extname = fsEx.extname(data.path);

        if (['.eot', '.ttf', '.svg', '.woff', '.ttc'].indexOf(extname) < 0) {
            // 如果是虚拟目录禁止添加
            if (data.path.indexOf('Plugins') === 0) {
                return false;
            }

            // 普通上传
            var fullPath = fsEx.expandPath(path.join(G.gameRoot, data.path));
            fs.writeFileSync(fullPath, content);

            return true;
        }
        else {
            // 字体上传
            var pathParse = path.parse(data.path);
            var fontRelativePath = 'Assets/font/' + pathParse.base;
            var fontPath = path.join(G.gameRoot, fontRelativePath);
            var binPath = path.join(G.gameRoot, pathParse.dir, pathParse.name + '.wfont');

            // 确保 Game/Assets/font 存在
            fs.ensureDirSync(path.join(G.gameRoot, 'Assets/font/'));

            // 写入 font 资源到固定路径
            fs.writeFileSync(fontPath, content);

            // 生成 web font 文件
            fs.writeJSONSync(binPath, {
                url : [ fontRelativePath ]
            });
            return true;
        }
    }
});
