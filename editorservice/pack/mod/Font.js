/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 场景打包规则
 */

M.PACK_RULE.font = {
    type : G.ASSET_TYPE.ASSET_FONT,
    require : [
        [ '.png', '.jpg', '.jpeg' ],
        '.xml'
    ],
    metaInfo : { "xSpacing" : 1, "ySpacing" : 1 },
    priority : 100,
    serialize : 'JSON'
};