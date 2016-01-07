/**
 * @author lijh
 * @copyright 2015 Qcplay All Rights Reserved.
 * 提供横幅广告相关支持
 */

var BannerAd = qc.defineBehaviour('qc.Plugins.BannerAd', qc.Behaviour, function() {
    var self = this;

    /**
     * @property {string} urlPC - 广告页面地址(PC)
     */
    self.urlPC = '';

    /**
     * @property {string} urlMobile - 广告页面地址(移动设备）
     */
    self.urlMobile = '';

    /**
     * @property {number} height - 广告栏高度
     */
    self.height = 48;

    /**
     * @property {number} location - 广告位置
     */
    self.location = BannerAd.AD_LOCATION_BOTTOM;
}, {
    urlPC : qc.Serializer.STRING,
    urlMobile : qc.Serializer.STRING,
    height : qc.Serializer.NUMBER,
    location : qc.Serializer.NUMBER
});

BannerAd.__menu = 'Plugins/BannerAd';

BannerAd.AD_LOCATION_TOP = 0;
BannerAd.AD_LOCATION_BOTTOM = 1;

BannerAd.prototype.awake = function() {
    this.display();
};

// 显示横幅广告
BannerAd.prototype.display = function() {
    var self = this;

    if (document.getElementById('bannerAdDiv') !== null)
        return;

    var gameDiv = document.getElementById('gameDiv');

    // 创建一个div，添加到gameDiv中
    var div = document.createElement('div');
    var top = self.location === BannerAd.AD_LOCATION_TOP ? -self.game.height : -self.height;
    var style = qc.Util.formatString('position:relative;top:{0}px;height:{1}px', top, self.height);
    div.setAttribute('style', style);
    div.setAttribute('id', 'bannerAdDiv');
    gameDiv.appendChild(div);

    // 创建一个iframe用于显示广告页面，并添加到新创建的div中
    frame = document.createElement('iframe');
    var src = self.game.device.desktop ? self.urlPC : self.urlMobile;
    src = src + '?valign=' + (self.location === BannerAd.AD_LOCATION_TOP ? 'top' : 'bottom');
    frame.setAttribute('src', src);
    frame.setAttribute('width', '100%');
    frame.setAttribute('height', '100%');
    frame.setAttribute('frameborder', '0');
    frame.setAttribute('scrolling', 'no');
    div.appendChild(frame);
}

// 隐藏横幅广告
BannerAd.prototype.hide = function() {
    var self = this;

    var adDiv = document.getElementById('bannerAdDiv');
    if (adDiv !== null)
        adDiv.parentElement.removeChild(adDiv);
}
