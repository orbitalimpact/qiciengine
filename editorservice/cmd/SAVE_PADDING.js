/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 发送保存九宫格信息的请求
 */
var fsEx = G.load('filesystem/FsExpand');
var fs = require('fs-extra');
var path = require('path');

M.COMMAND.registerCmd({
    name : 'SAVE_PADDING',
    main : function(socket, cookie, args) {
        var texturePath = args.texturePath;
        var frame = args.frame;
        var padding = args.padding;

        // 1. 目标必须是资源文件
        if (! fsEx.isBin(texturePath)) {
            return { 'operRet' : false, 'reason' : '目标文件不是资源(bin)文件。' };
        }

        // 2. 确定当前的 texturePath 是不是存在
        var fullPath = path.join(G.gameRoot, texturePath);
        var metaPath = fsEx.getMetaName(fullPath);
        if (!fs.existsSync(fullPath) || !fs.existsSync(metaPath)) {
            return { 'operRet' : false, 'reason' : '目标文件/meta信息不存在。' };
        }

        // 3. 确定当前的类型是图集
        var metaContent;
        try {
             metaContent = fs.readJsonSync(metaPath, {throws: false});
        }
        catch (e) {
            metaContent = null;
        }

        if (!metaContent || metaContent.type != G.ASSET_TYPE.ASSET_ATLAS) {
            return { 'operRet' : false, 'reason' : '目标不是图集/图片资源无法保存九宫格数据。' };
        }

        // 4. padding 格式正确
        if (typeof(padding) !== 'object' ||
            padding.length != 4) {
            return { 'operRet' : false, 'reason' : 'padding期望是长度为4的列表。' };
        }

        // 5. 无法进一步校验了，只能相信客户直接写入
        if (!metaContent.padding)
            metaContent.padding = {};

        metaContent.padding[frame] = padding;

        // 写入文件
        fsEx.writeJsonSync(metaPath, metaContent);

        // 6. 重新打包 bin 资源
        G.watch.tryPackByOneFile(fullPath);

        // 返回操作成功的信息
        return { 'operRet' : true };
    }
});
