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

    /**
     * @property {qc.Point} closeImgWidth - 关闭按钮宽度
     */
    self.closeImgWidth = 0;

    /**
     * @property {qc.Point} closeImgHeight - 关闭按钮高度
     */
    self.closeImgHeight = 0;
}, {
    url : qc.Serializer.STRING,
    closeImgUrl : qc.Serializer.STRING,
    closeImgWidth : qc.Serializer.NUMBER,
    closeImgHeight : qc.Serializer.NUMBER
});

PopupAd.prototype.display = function() {
    var self = this;

    var gameDiv = document.getElementById('gameDiv');

    // 创建一个div，添加到gameDiv中
    var width, height;
    width = height = Math.min(self.game.width, self.game.height);

    var div = document.createElement('div');
    var top = -(self.game.height + height) / 2;
    var left = (self.game.width - width) / 2;
    var style = qc.Util.formatString('position:relative;top:{0}px;left:{1}px;width:{2}px;height:{3}px',
        top, left, width, height);
    div.setAttribute('style', style);
    gameDiv.appendChild(div);

    // 创建一个iframe用于显示广告页面，并添加到新创建的div中
    frame = document.createElement('iframe');
    frame.setAttribute('src', self.url);
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

    var onClick = function(){
        gameDiv.removeChild(div);
    };

    if (self.game.device.desktop)
        img.addEventListener('click', onClick);
    else
        img.addEventListener('touchend', onClick);
    imgDiv.appendChild(img);
}
