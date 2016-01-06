/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 定义文件资源类型相关
 */

// 定义在全局便于访问
G.ASSET_TYPE = {
    /**
     * 几种资源类型，在meta文件中需要指明
     */
    ASSET_SCENE: 1,
    ASSET_PREFAB: 2,
    ASSET_ATLAS: 3,
    ASSET_TEXT: 4,
    ASSET_FONT: 5,
    ASSET_SOUND: 6,
    ASSET_EXCEL: 7,
    ASSET_WEBFONT : 8,
    ASSET_JS : 100,
    ASSET_UNKNOWN : 101
};

G.ASSET = {
    IsSound : function(url) {
        return (url && /\.(mp3|ogg)\.bin$/.test(url.toLowerCase()));
    }
};