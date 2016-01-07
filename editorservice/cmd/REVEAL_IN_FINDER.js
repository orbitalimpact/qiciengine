/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 在资源浏览器中打开
 */
var opener = require('opener');
var path = require('path');
var fsEx = G.load('filesystem/FsExpand');

M.COMMAND.registerCmd({
    name : 'REVEAL_IN_FINDER',
    main : function(socket, cookie, args) {
        var fullPath;

        fullPath = fsEx.expandPath(path.join(G.gameRoot, args.path));
        G.log.trace('open local dir : {0}', fullPath);

        var ret = M.util.isLocalSocket(socket, M.COMMUNICATE.host) ? true : false;
        if (ret)
            opener('file:' + fullPath);

        return { 'operRet' : ret };
    }
});
