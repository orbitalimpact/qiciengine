/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 */

var zlib = require('zlib');
var chalk = require('chalk');

/**
 * 将多个文件内容合并一起，用 buffer 方式组合在一起
 * @param {string[]} arguments - 各个文件的内容
 */
module.exports.packBinary = function(compressType, pieces) {
    var arr = [];

    // 将所有的文件先串在一起，内存中的结果将形如：
    // 00 00 00 00 00 00 00 00 00 00 .. 00 00 00 00 00 00 00 ..
    // -----------|--------------------|-----------|-----------
    //   a lenth       a content          b length     b content ..
    for (var i = 0, len = pieces.length; i < len; i++) {
        var body = pieces[i];
        if (typeof(body) === 'string')
            body = new Buffer(body);

        // 长度记录
        var bodyLenInt = body.length;
        var bodyLen = new Buffer(4);
        bodyLen[0] = (bodyLenInt >> 24) & 0xff;
        bodyLen[1] = (bodyLenInt >> 16) & 0xff;
        bodyLen[2] = (bodyLenInt >> 8) & 0xff;
        bodyLen[3] = bodyLenInt & 0xff;

        arr.push(bodyLen, body);
    }

    if (compressType === 'CONCAT') {
        // 只连接不进行压缩，插入 magic number QC
        arr.unshift(new Buffer('QC'));
        return Buffer.concat(arr);
    }
    else {
        // 其他方式默认是认为需进行压缩
        var inBuffer = Buffer.concat(arr);
        var outBuffer = zlib.deflateSync(inBuffer);
        return outBuffer;
    }
};

/**
 * 将 Buffer 内容还原为各文件内容
 * @param {string} data - 待解出来的数据
 */
module.exports.unpackBinary = function(data) {
    var rawData;

    // 判定当前是否压缩过
    if (data[0] === 0x51 && data[1] === 0x43) {
        // concat 类型（注意，buffer 的 slice 只是修改了起点、长度，内存不 copy）
        rawData = data.slice(2);
    }
    else {
        // zlib 压缩，进行解压
        rawData = zlib.inflateSync(data);
    }

    var contents = [];
    var length = rawData.length;
    var cursor = 0;

    while (cursor + 4 < length) {
        var bodyLen = (rawData[cursor    ] << 24) |
                      (rawData[cursor + 1] << 16) |
                      (rawData[cursor + 2] << 8) |
                       rawData[cursor + 3];
        contents.push(rawData.slice(cursor + 4, cursor + 4 + bodyLen));
        cursor += bodyLen + 4;
    }

    return contents;
};

/**
 * 将多个文件内容用字符串方式序列化
 * @param piece
 * @returns {*}
 */
module.exports.packString = function(pieces) {
    // 直接序列化
    return JSON.stringify(pieces);
};

/**
 * 将字符创方式序列化起来的内容还原出来
 */
module.exports.unpackString = function(data) {
    // 直接使用 JSON 返回
    try {
        var jsonData = JSON.parse(data);
        return jsonData;
    }
    catch (e) {};
};
