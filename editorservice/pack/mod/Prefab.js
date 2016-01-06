/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 场景打包规则
 */
var fs = require('fs-extra');

M.PACK_RULE.prefab = {
    type : G.ASSET_TYPE.ASSET_PREFAB,
    require : [
        '.prefab'
    ],
    parser : parsePrefab,
    serialize : 'JSON'
};

// 读取 prefab 用来打包 bin 的时候需要过滤掉空格
function parsePrefab(path) {
    var fileContent;
    try { fileContent = fs.readJSONFileSync(path);}
    catch (e) { fileContent = {};}

    return JSON.stringify(fileContent);
};