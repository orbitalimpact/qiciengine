/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 声音文件 mp3 打包规则
 */

M.PACK_RULE.soundMp3 = {
    type : G.ASSET_TYPE.ASSET_SOUND,
    require : [
        '.mp3'
    ],
    binName : function(name, requireList) {
        // 这里有个非常特殊的处理，生成 bin 那么时候，声音文件的 name 需要增加 .mp3 .ogg，
        // 例如 a.mp3 出来的 a.mp3.bin，其他文件 a.png 出来的则是 a.bin
        return name + requireList[0];
    },
    serialize : 'CONCAT',
    continuePacking : true
};