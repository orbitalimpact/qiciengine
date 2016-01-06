// 检测环境
var _ensureModule = function(clazz) {
    var arr = clazz.split('.');
    var curr = window;
    for (var i = 0; i < arr.length; i++) {
        if (!curr[arr[i]]) curr[arr[i]] = {};
        curr = curr[arr[i]];
    }
};


_ensureModule('com.qici.extraUI');