/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 客户端向服务器询问当前的文件列表打包后的资源格式
 */
var fs = require('fs-extra');
var path = require('path');

M.COMMAND.registerCmd({
    name : 'IMPORT_RESOURCE',
    main : function(socket, cookie, args) {
        var dir = args.dir;
        var binName = args.binName;
        var files = args.files;

        var operateFailed = function(errStr) {
            G.log.trace(errStr);
            return {'operRet': false, 'reason': errStr};
        };

        // 核实一下
        var fileNames = Object.keys(files);
        var verify = M.PACK.judgeAssetType(Object.keys(files));
        if (verify.type === G.ASSET_TYPE.ASSET_UNKNOWN) {
            return operateFailed('没有该类型的打包规则');
        }

        if (verify.source.length != fileNames.length) {
            return operateFailed('资源列表数量多出，期望:' + verify.source + ',传入:' + fileNames);
        }

        // 将所有文件序列化到磁盘中

        // 确保目录存在
        fs.ensureDirSync(path.join(G.gameRoot, dir));

        for (var index = 0, fileLen = fileNames.length; index < fileLen; index++) {
            var fileName = fileNames[index];
            var fullPath = path.join(G.gameRoot, dir, binName + path.extname(fileName));

            fs.writeFileSync(fullPath, files[fileName]);
        };

        // 写入 bin 文件
        var ret = M.PACK.toBin(path.join(G.gameRoot, dir), binName, verify.source);
        if (ret)
            return {'operRet': true};
        else
            return operateFailed('写入bin打包文件失败');
    }
});
