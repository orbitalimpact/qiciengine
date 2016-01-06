/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 场景打包规则
 */

var fs = require('fs-extra');
var path = require('path');

M.PACK_RULE.atlas = {
    type : G.ASSET_TYPE.ASSET_ATLAS,
    require : [
        [ '.json', '' ],
        [ '.png', '.jpg', '.jpeg', '.gif' ],
        [ '.ani', undefined ]
    ],
    metaInfo : function(dir, name, list) {
        if (list[0] === '.json' && list[2] === '.ani') {
            var json;
            try {
                json = fs.readJsonSync(path.join(dir, name + '.ani'), {throws: false});
            } 
            catch (e) {
                json = null;
            }
            if (json && json.animations)
                // 动作文件根路径就有 animations 才是普通动画
                return {"animationType": 1};
            else if (json && json.samples)
                // 动作文件根路径就有 samples 认为是帧采样动画
                return {"animationType": 3};
            else
                // 骨骼动画
                return {"animationType": 2};
        }
    },
    serialize : 'JSON'
};