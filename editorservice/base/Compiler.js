/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 提供编译的支持
 */
var fs = require('fs');
var path = require('path');

module.exports = {
    /**
     * 载入一个代码文件
     * @param file - 相对于工程根目录的路径
     */
    load : function(file) {
        return require('./' + path.relative(__dirname, path.join(G.editorRoot, file)));
    },

    /**
     * 载入一个目录下的所有js代码
     * @param path - 相对于工程根目录的路径
     */
    loadDir : function(dir) {
        var fullDir = path.join(G.editorRoot, dir);
        var list = fs.readdirSync(fullDir);
        var fsEx = G.load('filesystem/FsExpand');
        for (var i in list) {
            if (path.extname(list[i]).toLowerCase() !== '.js') continue;

            var p = path.join(fullDir, list[i]);
            var stat = fs.statSync(p);
            if (stat.isDirectory()) continue;

            // 载入
            require('./' + path.relative(__dirname, p));
        }
    }
}
