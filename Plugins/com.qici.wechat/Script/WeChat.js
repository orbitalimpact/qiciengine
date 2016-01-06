/**
 * @author weism
 * @copyright 2015 Qcplay All Rights Reserved.
 */

var WeChat = qc.defineBehaviour('qc.WeChat', qc.Behaviour, function() {
    var self = this;

    /**
     * @property {string} shareAppId - 用于分享的微信公众号的appid
     */
    self.shareAppId = '';

    /**
     * @property {string} wxAppId - 用于登录的微信公众号的appid
     */
    self.wxAppId = '';

    /**
     * @property {string} webAppId - 网站应用的appid
     */
    self.webAppId = '';

    /**
     * @property {string} domain
     *  域名（存放php文件的域名地址，例如：http://engine.zuoyouxi.com/wx/）
     *  域名最后面以 '/' 结束
     */
    self.domain = '';

    /**
     * @property {string} gameDomain
     *   游戏服务器存放的域名（即放game_client文件的域名地址）
     *   例如： http://engine.zuoyouxi.com/teris/
     */
    self.gameDomain = '';

    /**
     * @property {string} extendParams
     *   微信登录时的扩展参数，可用于传递一些自定义信息
     *   例如： {"game":1}
     */
    self.extendParams = '';

    /**
     * @property {boolean} redirectCurrentUrl
     *   = true：使用游戏页直接换取code。当在微信公众号后台配置了游戏域名（gameDomain）为回调地址时采用
     *   = false：使用this.domain + 'code.php'作为接收code的回调页，之后再跳转到本页面。当微信公众号后台配置的是domain时采用
     *            这种情况下，游戏的域名和公众号后台配置的可以是不一样的，并且多个游戏可以共用一个公众号的信息。缺点是浏览器会有两次跳转
     */
    self.redirectCurrentUrl = true;

    /**
     * @property {boolean} debug - 微信接口的debug是否打开，在发布时一定要关闭哦
     */
    self.debug = false;

    /**
     * 微信分享的接口实例
     */
    self.wx = new WX();

    /**
     * @property {qc.Signal} onStartLogin - 开始登录的事件
     */
    self.onStartLogin = new qc.Signal();

    /**
     * @property {qc.Signal} onLogin - 登录成功的事件
     */
    self.onLogin = new qc.Signal();

    /**
     * @property {qc.Signal} sessionExpired - 会话过期的事件
     */
    self.sessionExpired = new qc.Signal();

    /**
     * @property {object} user - 微信的用户信息
     * @readonly
     */
    self.user = null;

    /**
     * @property {string} status - 当前的登录状态
     *   loggingIn - 登录中
     *   loggedIn - 已登录
     *   expired - 会话过期
     */
    self.status = '';
}, {
    shareAppId: qc.Serializer.STRING,
    wxAppId: qc.Serializer.STRING,
    webAppId: qc.Serializer.STRING,
    domain: qc.Serializer.STRING,
    gameDomain: qc.Serializer.STRING,
    extendParams: qc.Serializer.STRING,
    redirectCurrentUrl: qc.Serializer.BOOLEAN,
    debug: qc.Serializer.BOOLEAN
});
WeChat.__menu = 'Plugins/WeChat';

// 初始化处理
WeChat.prototype.awake = function() {
    // 请求签名信息
    var self = this;
    if (!self.domain) return;

    var url = self.domain + 'index.php?cmd=sign&appid=' + self.shareAppId + '&url=' + encodeURIComponent(window.location.href);
    self.game.log.trace('开始请求微信分享的签名信息：{0}', url);
    qc.AssetUtil.get(url, function(r) {
        self.game.log.trace('获取签名成功：' + r);
        self.parseSign(r);
    }, function() {
        console.error('获取签名信息失败');
    });

    // 加载js库
    self.loadWXLib();

    // 获取code
    self._code = this.getParam('code');
    self._state = this.getParam('state');
    if (self._code) {
        // 请求换取token，如果失败需要重新请求登录
        self.status = 'loggingIn';
        self.game.timer.add(1, function() {
            self.requestToken(self._code);
        });
    }
};

// 析构的处理
WeChat.prototype.onDestroy = function() {
    if (this.timer) {
        this.game.timer.remove(this.timer);
    }
};

/**
 * 请求微信登录
 */
WeChat.prototype.login = function() {
    if (this.isWeChat()) {
        this.loginInWX();
        return;
    }
    this.loginInWeb();
};

// 微信内登陆
WeChat.prototype.loginInWX = function() {
    var url = '',
        redirectUri = window.location.origin + window.location.pathname;
    if (this.redirectCurrentUrl) {
        url = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
            "appid=" + this.wxAppId +
            "&redirect_uri=" + encodeURIComponent(redirectUri) +
            "&response_type=code&scope=snsapi_userinfo&state=weixin#wechat_redirect";
    }
    else {
        // 跳转到code.php页面，再跳转回本页面
        url = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
            "appid=" + this.wxAppId +
            "&redirect_uri=" + encodeURIComponent(this.domain + 'code.php') +
            "&response_type=code&scope=snsapi_userinfo" +
            "&state=" + encodeURIComponent(redirectUri) +
            "#wechat_redirect";
    }
    window.location.href = url;
};

// 微信外登录
WeChat.prototype.loginInWeb = function() {
    var url = '',
        redirectUri = window.location.origin + window.location.pathname;
    if (this.redirectCurrentUrl) {
        url = "https://open.weixin.qq.com/connect/qrconnect?" +
            "appid=" + this.webAppId +
            "&redirect_uri=" + encodeURIComponent(redirectUri) +
            "&response_type=code&scope=snsapi_login&state=pc#wechat_redirect";
    }
    else {
        // 跳转到code.php页面，再跳转回本页面
        url = "https://open.weixin.qq.com/connect/qrconnect?" +
            "appid=" + this.webAppId +
            "&redirect_uri=" + encodeURIComponent(this.domain + 'code.php') +
            "&response_type=code&scope=snsapi_login" +
            "&state=" + encodeURIComponent(redirectUri) +
            "#wechat_redirect";
    }
    window.location.href = url;
};

// 解析签名信息
WeChat.prototype.parseSign = function(r) {
    var self = this;
    var sign = JSON.parse(r);
    self.timeStamp = sign.timestamp;
    self.nonceStr = sign.nonceStr;
    self.signature = sign.signature;

    if (!self.jweixin) {
        // 微信接口尚未载入，延迟继续检测
        self.game.timer.add(500, function() {
            self.parseSign(r);
        });
        return;
    }

    // 调用微信的初始化接口
    self.game.log.trace('开始初始化微信接口');
    self.wx.debug = self.debug;
    self.wx.init({
        timeStamp: self.timeStamp,
        nonceStr: self.nonceStr,
        signature: self.signature,
        appId: self.shareAppId
    }, function() {
        self.game.log.trace('初始化微信接口完成。');
    });
};

// 动态加载wx的库
WeChat.prototype.loadWXLib = function() {
    var self = this;
    var src = "http://res.wx.qq.com/open/js/jweixin-1.0.0.js";
    var js = document.createElement('script');
    js.onerror = function() {
        console.error('加载jweixin库失败');
    };
    js.onload = function() {
        // 标记加载完成了
        self.game.log.trace('微信接口下载完成');
        self.jweixin = true;
    };
    js.setAttribute('src', src);
    js.setAttribute('type', 'text/javascript');
    document.getElementsByTagName('head')[0].appendChild(js);
};

// 当前是否运行在微信客户端
WeChat.prototype.isWeChat = function() {
    var ua = window.navigator.userAgent.toLowerCase();
    return ua.match(/MicroMessenger/i) == 'micromessenger';
};

// 获取url的参数
WeChat.prototype.getParam = function(key) {
    var r = new RegExp("(\\?|#|&)" + key + "=([^&#]*)(&|#|$)");
    var m = location.href.match(r);
    return decodeURIComponent(!m ? "" : m[2]);
};

// 使用code换取token
WeChat.prototype.requestToken = function(code) {
    var self = this,
        url = self.gameDomain + "login.php?code=" + code;
    if (!self.isWeChat()) url += "&web=1";

    // 附加自定义的扩展参数
    url += "&extendParams=" + self.extendParams;

    self.onStartLogin.dispatch();
    qc.AssetUtil.get(url, function(r) {
        var data = JSON.parse(r);
        if (data.error) {
            // 换取token失败，重新请求登录
            self.game.log.error('换取token失败，重新请求登录');
            self.login();
            return;
        }

        // 登录成功了，抛出事件
        self.game.log.trace('登录成功：{0}', r);
        self.status = 'loggedIn';
        self.user = data;
        self.onLogin.dispatch();

        // 定期刷新access_token，并保持会话
        self.timer = self.game.timer.loop(5 * 60000, self.refreshToken, self);
    });
};

// 刷新token
WeChat.prototype.refreshToken = function() {
    var self = this,
        url = self.gameDomain + "refresh.php";
    if (!self.isWeChat()) url += "?web=1";
    qc.AssetUtil.get(url, function(r) {
        var data = JSON.parse(r);
        if (data.error) {
            // 刷新token失败了，抛出事件
            self.status = 'expired';
            self.game.timer.remove(self.timer);
            delete self.timer;
            self.sessionExpired.dispatch();
            return;
        }

        // 成功了，啥也不用处理
        self.game.log.trace('刷新Access Token成功。');
    });
};
