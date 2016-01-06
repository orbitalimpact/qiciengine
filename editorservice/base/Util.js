/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 提供常用接口的封装
 */

module.exports = {};

/**
 * 定义一个模块，定义完成后就可以使用（M.模块名）进行访问
 */
module.exports.defineModule = function(moduleName, clazz) {
    if (!M) M = {};

    // 实例化
    return M[moduleName] = new clazz();
};

/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
var UUID = (function() {
    var self = {};
    var lut = [];
    for (var i=0; i < 256; i++) {
        lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    self.generate = function() {
        var d0 = Math.random() * 0xffffffff | 0;
        var d1 = Math.random() * 0xffffffff | 0;
        var d2 = Math.random() * 0xffffffff | 0;
        var d3 = Math.random() * 0xffffffff | 0;
        return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] +
            lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' +
            lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
            lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] +
            lut[d2 >> 24 & 0xff] + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] +
            lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    };
    return self;
})();
module.exports.uuid = UUID.generate;

/**
 * 计算字符串的 md5 值
 */
var crypto = require('crypto');
module.exports.calcMD5 = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
};

/**
 * 生成当前时间串描述，形如 20151014112811
 */
var formattedTime = module.exports.formattedTime = function() {
    var tsHms = new Date();
    return tsHms.getFullYear() +
        ("0" + (tsHms.getMonth() + 1)).slice(-2) +
        ("0" + (tsHms.getDate() + 1)).slice(-2) +
        ("0" + tsHms.getHours()).slice(-2) +
        ("0" + tsHms.getMinutes()).slice(-2) +
        ("0" + tsHms.getSeconds()).slice(-2);
};

/**
 * 混合两个对象的属性
 */
module.exports.mixin = function (from, to) {
    if (!from || typeof (from) !== "object") {
        return to;
    }

    for (var key in from) {
        var type = typeof (from[key]);
        var o = from[key];
        if (!from[key] || type !== "object") {
            to[key] = from[key];
        }
        else {
            if (typeof (to[key]) === type) {
                to[key] = module.exports.mixin(from[key], to[key]);
            }
            else {
                to[key] = module.exports.mixin(from[key], new o.constructor());
            }
        }
    }
    return to;
};