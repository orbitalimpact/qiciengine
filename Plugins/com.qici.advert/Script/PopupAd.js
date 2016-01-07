/**
 * @author lijh
 * @copyright 2015 Qcplay All Rights Reserved.
 */

var PopupAd = qc.defineBehaviour('qc.Plugins.PopupAd', qc.Behaviour, function() {
    var self = this;

    /**
     * @property {string} url - 广告页面地址
     */
    self.url = '';

    /**
     * @property {string} closeImgUrl - 关闭按钮地址
     */
    self.closeImgUrl = '';
}, {
    url : qc.Serializer.STRING,
    closeImgUrl : qc.Serializer.STRING
});

PopupAd.prototype.showPopupAd = function() {
    var self = this;

    var gameDiv = document.getElementById('gameDiv');

    // 创建一个div，追加到gameDiv中
    var height = self.game.height;
    var width = self.game.width;

    var div = document.createElement('div');
    var top = -(self.game.height + height) / 2;
    var left = (self.game.width - width) / 2;
    var style = qc.Util.formatString('position:relative;top:{0}px;left:{1}px;width:{2}px;height:{3}px',
        top, left, width, height);
    div.setAttribute('style', style);
    div.setAttribute('id', 'popupAdDiv');
    gameDiv.appendChild(div);

    // 创建一个iframe，用于显示广告页面，并追加到新创建的div中
    frame = document.createElement('iframe');
    frame.setAttribute('src', self.url);
    frame.setAttribute('width', '100%');
    frame.setAttribute('height', '100%');
    frame.setAttribute('frameborder', '0');
    frame.setAttribute('scrolling', 'no');
    frame.setAttribute('id', 'popupAdFrame');
    div.appendChild(frame);

    // 右上角添加关闭按钮
    var imgDiv = document.createElement('div');
    var imgTop = -height;
    var imgLeft = 0;
    var imgStyle = qc.Util.formatString('position:relative;top:{0}px;left:{1}px;', imgTop, imgLeft);
    imgDiv.setAttribute('style', imgStyle);
    imgDiv.setAttribute('id', 'closeAdDiv');
    div.appendChild(imgDiv);

    var img = document.createElement('img');
    img.setAttribute('src', self.closeImgUrl);
    img.setAttribute('style', 'float:right');

    var onClick = function(){
        gameDiv.removeChild(div);
    };

    if (self.game.device.desktop)
        img.addEventListener('click', onClick);
    else
        img.addEventListener('touchend', onClick);
    imgDiv.appendChild(img);
}
