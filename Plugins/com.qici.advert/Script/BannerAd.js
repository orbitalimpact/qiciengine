/**
 * @author lijh
 * @copyright 2015 Qcplay All Rights Reserved.
 */

var BannerAd = qc.defineBehaviour('qc.Plugins.BannerAd', qc.Behaviour, function() {
    var self = this;

    /**
     * @property {string} url - 广告页面地址
     */
    self.url = '';

    /**
     * @property {number} height - 广告栏高度
     */
    self.height = 60;

    /**
     * @property {number} location - 广告位置
     */
    self.location = BannerAd.AD_LOCATION_BOTTOM;
}, {
    url : qc.Serializer.STRING,
    height : qc.Serializer.NUMBER,
    location : qc.Serializer.NUMBER
});

BannerAd.AD_LOCATION_TOP = 0;
BannerAd.AD_LOCATION_BOTTOM = 1;

BannerAd.prototype.awake = function() {
    this.showBannerAd();
};

// 显示横幅广告
BannerAd.prototype.showBannerAd = function() {
    var self = this;

    var gameDiv = document.getElementById('gameDiv');

    // 创建一个div，追回到gameDiv中
    var div = document.createElement('div');
    var top = self.location === BannerAd.AD_LOCATION_TOP ? self.game.height : self.height;
    var style = qc.Util.formatString('position:relative;top:-{0}px;height:{1}px', top, self.height);
    div.setAttribute('style', style);
    div.setAttribute('id', 'bannerAdDiv');
    gameDiv.appendChild(div);

    // 创建一个iframe，用于显示广告页面，并追加到新创建的div中
    frame = document.createElement('iframe');
    frame.setAttribute('src', self.url);
    frame.setAttribute('width', '100%');
    frame.setAttribute('height', '100%');
    frame.setAttribute('frameborder', '0');
    frame.setAttribute('scrolling', 'no');
    frame.setAttribute('id', 'barAdFrame');
    div.appendChild(frame);
}
