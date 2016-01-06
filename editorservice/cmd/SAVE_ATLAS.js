/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 用户生成图集信息保存
 */
var fs = require('fs-extra');
var path = require('path');

M.COMMAND.registerCmd({
    name : 'SAVE_ATLAS',
    main : function(socket, cookie, param) {
        var atlasName = param.atlasName;

        var imageContent = param.imageContent;
        var json = param.json;

        // 将 imageContent 换成 buffer 形态等待写入
        var data = imageContent.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(data, 'base64');

        // 写入文件中
        var dir = path.join(G.gameRoot, 'Assets/atlas/');
        fs.ensureDirSync(dir);

        // 先写入 json 数据
        var jsonPath = path.join(dir, atlasName + '.json');
        fs.writeJSONSync(jsonPath, json);

        var filePath = path.join(dir, atlasName + '.png');
        fs.writeFile(filePath, buf);
        return { 'operRet' : true, }
    }
});
