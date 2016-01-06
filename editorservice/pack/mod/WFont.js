/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 动态字体打包规则
 */

M.PACK_RULE.wfont = {
    type : G.ASSET_TYPE.ASSET_WEBFONT,
    require : [
        '.wfont'
    ],
    uuidGenerator : function() {
        var uuid = G.uuid();
        return 'l' + uuid.slice(1);
    },
    serialize : 'JSON'
};