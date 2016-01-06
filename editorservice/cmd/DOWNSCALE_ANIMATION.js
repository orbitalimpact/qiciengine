/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 客户端向服务器请求缩放当前 atlas 为一半
 */
var path = require('path');
var fs = require('fs-extra');
M.COMMAND.registerCmd({
    name : 'DOWNSCALE_ANIMATION',
    main : function(socket, cookie, args) {
        var dir = args.dir;
        dir = path.join(G.gameRoot, dir);

        var img = args.img;

        dir = dir.slice(0, -4);

        // 写 png
        var data = img.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(data, 'base64');
        fs.writeFile(dir + '.png', buf);

        // 改 json/ani
        M.util.deepModifyXYWH(dir + '.json', 0.5);
        M.util.deepModifyXYWH(dir + '.ani', 0.5);

        // 搞定
        return { 'operRet' : true };
    }
});
