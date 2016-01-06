/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 日志系统支持
 */

/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 */

/**
 * 编辑器下的日志系统
 */

// 初始化 log4js
var log4js = require('log4js');
log4js.configure({
    appenders : [
        {
            "type": 'console',
            "category": "console",
            "layout": {
                "type": "messagePassThrough"
            }
        }
    ]
});
var colors = {
    'white' : ['\u001b[37m', '\u001b[39m'],
    'grey' : ['\u001b[90m', '\u001b[39m'],
    'black' : ['\u001b[30m', '\u001b[39m'],
    'blue' : ['\u001b[34m', '\u001b[39m'],
    'cyan' : ['\u001b[36m', '\u001b[39m'],
    'green' : ['\u001b[32m', '\u001b[39m'],
    'magenta' : ['\u001b[35m', '\u001b[39m'],
    'red' : ['\u001b[31m', '\u001b[39m'],
    'yellow' : ['\u001b[33m', '\u001b[39m']
};

var toContent = function(args){
    var content = args[0];
    for (var i = 1; i < args.length; i++) {
        var reg = new RegExp('\\{' + (i - 1) + '\\}', 'g');
        content = content.replace(reg, args[i]);
    }
    return content;
};

module.exports = {
    /**
     * @property {boolean} enableTrace - 是否允许普通日志的打印，在开发环境中需要打开
     */
    enableTrace : true,

    /**
     * debug 的调试信息是否需要输出，默认 false，启动参数指定 --debug
     */
    enableDebug : false,

    /**
     * 普通打印日志
     * @param arguments
     */
    trace : function() {
        if (!G.log.enableTrace) return;

        var content = toContent(arguments);
        var logger = log4js.getLogger('console');
        logger.info(content);
    },

    /**
     * 重要的打印日志
     * @param arguments
     */
    important : function() {
        var content = toContent(arguments);
        var logger = log4js.getLogger('console');
        logger.info(colors['green'][0] + content + colors['green'][1]);
    },

    /**
     * 错误日志
     * @param arguments
     */
    error : function() {
        var content = toContent(arguments);
        var logger = log4js.getLogger('console');
        logger.error(colors['red'][0] + content + colors['red'][1]);
        // 打印错误堆栈
        for (var i = 1; i < arguments.length; i++) {
            if (arguments[i] && arguments[i].stack)
                logger.error(arguments[i].stack);
        }
    },

    /**
     * 调试用
     * @param arguments
     */
    debug : function() {
        if (!G.log.enableDebug) return;

        var content = toContent(arguments);
        var logger = log4js.getLogger('console');
        logger.info(content);
    }
}
