/**
 * @author lijh
 * @copyright 2015 Qcplay All Rights Reserved.
 * 提供弹出式广告相关支持
 */

var PopupAd = qc.defineBehaviour('qc.Plugins.PopupAd', qc.Behaviour, function() {
    var self = this;

    /**
     * @property {string} urlPC - 用于PC设备的广告页面地址
     */
    self.urlPC = '';

    /**
     * @property {string} urlMobile - 用于移动设备的广告页面地址
     */
    self.urlMobile = '';

    /**
     * @property {string} widthPC - PC设备上的广告页面宽度
     */
    self.widthPC = 100;

    /**
     * @property {string} heightPC - PC设备上的广告页面高度
     */
    self.heightPC = 100;

    /**
     * @property {string} closeImgUrl - 关闭按钮地址
     */
    self.closeImgUrl = '';

    /**
     * @property {qc.Point} closeImgWidth - 关闭按钮宽度
     */
    self.closeImgWidth = 0;

    /**
     * @property {qc.Point} closeImgHeight - 关闭按钮高度
     */
    self.closeImgHeight = 0;

    /**
     * @property {qc.Signal} onAccessAd - 点击广告页面事件
     */
    self.onAccessAd = new qc.Signal();

    /**
     * @property {qc.Timer} adTimer - 用于检测用户是否点击广告页面的定时器
     */
    self.adTimer = undefined;
}, {
    urlPC : qc.Serializer.STRING,
    urlMobile: qc.Serializer.STRING,
    widthPC: qc.Serializer.NUMBER,
    heightPC: qc.Serializer.NUMBER,
    closeImgUrl : qc.Serializer.STRING,
    closeImgWidth : qc.Serializer.NUMBER,
    closeImgHeight : qc.Serializer.NUMBER
});

PopupAd.__menu = 'Plugins/PopupAd';

// 显示弹出广告
PopupAd.prototype.display = function() {
    var self = this;

    if (document.getElementById('popupAdDiv') !== null)
        return;

    var gameDiv = document.getElementById('gameDiv');
    gameDiv.style.pointerEvents = 'none';

    // 创建一个与gameDiv平级的div，避免事件被gameDiv优先截获
    var div = document.createElement('div');
    var width, height;
    if (self.game.device.desktop)
    {
        width  = self.widthPC;
        height = self.heightPC;
    }
    else
    {
        width = height = Math.min(self.game.width, self.game.height);
    }

    var top = (self.game.height - height) / 2;
    var left = (self.game.width - width) / 2;
    var style = qc.Util.formatString('position:absolute;top:{0}px;left:{1}px;width:{2}px;height:{3}px',
        top, left, width, height);
    div.setAttribute('style', style);
    div.setAttribute('id', 'popupAdDiv');
    gameDiv.parentElement.appendChild(div);

    // 创建一个iframe用于显示广告页面，并添加到新创建的div中
    frame = document.createElement('iframe');
    frame.setAttribute('src', self.game.device.desktop ? self.urlPC : self.urlMobile);
    frame.setAttribute('width', '100%');
    frame.setAttribute('height', '100%');
    frame.setAttribute('frameborder', '0');
    frame.setAttribute('scrolling', 'no');
    div.appendChild(frame);

    // 右上角添加关闭按钮
    var imgDiv = document.createElement('div');
    imgDiv.setAttribute('style', 'position:absolute;top:0px;right:0px;');
    div.appendChild(imgDiv);

    var img = document.createElement('img');
    img.setAttribute('src', self.closeImgUrl);
    img.setAttribute('width', self.closeImgWidth);
    img.setAttribute('height', self.closeImgHeight);

    if (self.game.device.desktop)
        img.addEventListener('click', self.hide.bind(self), true);
    else
        img.addEventListener('touchend', self.hide.bind(self), true);
    imgDiv.appendChild(img);

    // 启动定时器检测是否点击了广告
    self.adTimer = self.game.timer.loop(500, function() {
        if (document.activeElement === frame)
        {
            self.game.timer.remove(self.adTimer);

            self.onAccessAd.dispatch();
        }
    });
}

// 隐藏弹出广告
PopupAd.prototype.hide = function() {
    var self = this;

    var gameDiv = document.getElementById('gameDiv');
    gameDiv.style.pointerEvents = 'auto';

    var adDiv = document.getElementById('popupAdDiv');
    if (adDiv !== null)
        adDiv.parentElement.removeChild(adDiv);

    self.game.timer.remove(self.adTimer);
}

