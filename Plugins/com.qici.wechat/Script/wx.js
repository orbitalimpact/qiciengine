var WX = qc.WX = function() {
    var self = this;

    self.title = '';
    self.imgUrl = '';
    self.desc = '';
    self.url = '';
    self.sign = null;
    self.ready = false;
    self.debug = false;
};
WX.prototype = {};
WX.prototype.constructor = WX;

/**
 * 初始化微信接口
 */
WX.prototype.init = function(sign, callback) {
    var self = this;
    self.sign = sign;

    // 不支持微信接口？
    if (!window.wx) return;
    wx.config({
        debug: self.debug,
        appId: sign.appId,
        timestamp: sign.timeStamp,
        nonceStr: sign.nonceStr,
        signature: sign.signature,
        jsApiList: [
            'onMenuShareTimeline', 'onMenuShareQQ', 'onMenuShareQZone', 'onMenuShareAppMessage', 'onMenuShareWeibo',
            'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd',
            'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage',
            'translateVoice', 'getNetworkType', 'openLocation', 'getLocation', 'closeWindow', 'scanQRCode'
        ]
    });

    wx.ready(function() {
        // 标记下已经初始化完毕了
        self.ready = true;
        if (callback) callback();
    });
};

/**
 * 分享接口
 */
WX.prototype.share = function(title, imgUrl, desc, url, callback) {
    var self = this;
    self.title = title;
    self.imgUrl = imgUrl;
    self.desc = desc;
    self.url = url;
    self.callback = callback;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }

    var body = {
        title: self.title,
        desc: self.desc,
        link: self.url,
        imgUrl: self.imgUrl,
        success: function() {
            if (callback) callback();
        },
        cancel: function() {}
    };

    // 分享到朋友圈
    wx.onMenuShareTimeline(body);

    // 分享给朋友
    wx.onMenuShareAppMessage(body);

    // 分享到QQ
    wx.onMenuShareQQ(body);

    // 分享到腾讯微博
    wx.onMenuShareWeibo(body);

    // 分享到QQ空间
    wx.onMenuShareQZone(body);
};

/**
 * 拍照或从手机相册中选图
 * @param {number} count - 图片的数量
 */
WX.prototype.chooseImage = function(count, sizeType, sourceType, callback) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }

    if (!sizeType) sizeType = ['original', 'compressed'];
    if (!sourceType) sourceType = ['album', 'camera'];

    wx.chooseImage({
        count: count,
        sizeType: sizeType,
        sourceType: sourceType,
        success: function(res) {
            if (callback) callback(res.localIds);
        }
    });
};

/**
 * 预览图片
 */
WX.prototype.previewImage = function(current, urls) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }

    current = current || '';
    urls = urls || [];
    wx.previewImage({
        current: current,
        urls: urls
    });
};

/**
 * 上传图片，有效期为3天
 */
WX.prototype.uploadImage = function(localId, isShowProgressTips, callback) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.uploadImage({
        localId: localId,
        isShowProgressTips: isShowProgressTips ? 1 : 0,
        success: function(res) {
            if (callback) callback(res.serverId);
        }
    });
};

/**
 * 下载图片
 */
WX.prototype.downloadImage = function(serverId, isShowProgressTips, callback) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.downloadImage({
        serverId: serverId,
        isShowProgressTips: isShowProgressTips ? 1 : 0,
        success: function(res) {
            if (callback) callback(res.localId);
        }
    });
};

/**
 * 开始录音
 */
WX.prototype.startRecord = function() {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.startRecord();
};

/**
 * 停止录音
 */
WX.prototype.stopRecord = function(callback) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.stopRecord({
        success: function(res) {
            if (callback) callback(res.localId);
        }
    });
};

/**
 * 监听录音自动停止
 */
WX.prototype.onVoiceRecordEnd = function(callback) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.onVoiceRecordEnd({
        complete: function(res) {
            if (callback) callback(res.localId);
        }
    });
};

/**
 * 播放语音
 */
WX.prototype.playVoice = function(localId) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.playVoice({
        localId: localId
    });
};

/**
 * 暂停播放语音
 */
WX.prototype.pauseVoice = function(localId) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.pauseVoice({
        localId: localId
    });
};

/**
 * 暂停播放语音
 */
WX.prototype.stopVoice = function(localId) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.stopVoice({
        localId: localId
    });
};

/**
 * 监听语音播放完毕
 */
WX.prototype.onVoicePlayEnd = function(callback) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.onVoicePlayEnd({
        success: function (res) {
            if (callback) callback(res.localId);
        }
    });
};

/**
 * 上传语音，有效期为3天
 */
WX.prototype.uploadVoice = function(localId, isShowProgressTips, callback) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.uploadVoice({
        localId: localId,
        isShowProgressTips: isShowProgressTips ? 1 : 0,
        success: function(res) {
            if (callback) callback(res.serverId);
        }
    });
};

/**
 * 下载语音
 */
WX.prototype.downloadVoice = function(serverId, isShowProgressTips, callback) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.downloadVoice({
        serverId: serverId,
        isShowProgressTips: isShowProgressTips ? 1 : 0,
        success: function(res) {
            if (callback) callback(res.localId);
        }
    });
};

/**
 * 语音识别
 */
WX.prototype.translateVoice = function(localId, isShowProgressTips, callback) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.translateVoice({
        localId: localId,
        isShowProgressTips: isShowProgressTips ? 1 : 0,
        success: function(res) {
            if (callback) callback(res.translateResult);
        }
    });
};

/**
 * 获取网络状态：2g 3g 4g wifi
 */
WX.prototype.getNetworkType = function(callback) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.getNetworkType({
        success: function(res) {
            if (callback) callback(res.networkType);
        }
    });
};

/**
 * 查看位置
 */
WX.prototype.openLocation = function(lat, lng, name, address, scale, infoUrl) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    lat = lat || 0;
    lng = lng || 0;
    scale = scale || 1;
    name = name || '';
    address = address || '';
    infoUrl = infoUrl || '';
    wx.openLocation({
        latitude: lat,
        longitude: lng,
        name: name,
        address: address,
        scale: scale,
        infoUrl: infoUrl
    });
};

/**
 * 获取当前位置
 * @param {string} type - 'wgs84'(默认)，'gcj02'(火星坐标)
 * 返回的结果中，包含如下信息：
 *   latitude
 *   longitude
 *   speed
 *   accuracy
 */
WX.prototype.getLocation = function(type, callback) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    type = type || 'wgs84';
    wx.getLocation({
        type: type,
        success: callback
    });
};

/**
 * 微信扫一扫
 */
WX.prototype.scanQRCode = function(needResult, callback) {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.scanQRCode({
        needResult: needResult,
        scanType: ["qrCode","barCode"],
        success: function(res) {
            if (callback) callback(res.resultStr);
        }
    });
};

/**
 * 关闭当前网页
 */
WX.prototype.closeWindow = function() {
    var self = this;
    if (!self.ready) {
        console.error('尚未初始化完成');
        return;
    }
    wx.closeWindow();
};

/**
 * 微信支付
 */
WX.prototype.chooseWXPay = function() {
    // 后续增加
};