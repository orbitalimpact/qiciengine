/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 请求工程的资源目录树
 */
var path = require('path');
var fsEx = G.load('filesystem/FsExpand');

M.COMMAND.registerCmd({
    name : 'EXPLORE',
    main : function(socket, cookie, dir) {
        var curPath = dir ? path.join(G.gameRoot, dir) : G.gameRoot;

        // 注意，最外层还要包装个 current root path
        var data = {};
        data[path.basename(curPath)] = {
            predefined: true,
            sub: fsEx.explorePath(curPath)
        };

        // 返回值回馈客户端
        return data;
    }
});
