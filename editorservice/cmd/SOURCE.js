/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 查看代码文件
 */
var fs = require('fs-extra');
var fsEx = G.load('filesystem/FsExpand');

M.COMMAND.registerCmd({
    name : 'SOURCE',
    main : function(socket, cookie, file) {
        var fullPath = fsEx.expandPath(G.gameRoot + file);

        var content;
        try {
            content = fs.readFileSync(fullPath);
        }
        catch (e) {};
        if (!content) return '';

        // 数据二进制化，如果是图片信息，用 base64 加工发送
        var source;
        if (/.(png|jpg|gif|jpeg)$/.test(file))
            source = new Buffer(content).toString('base64');
        else
            source = new Buffer(content).toString();
        return {
            fileName : file,
            source : source
        };
    }
});
