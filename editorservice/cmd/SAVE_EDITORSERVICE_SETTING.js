/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 设置服务器配置
 */

var fs = require('fs-extra');
var path = require('path');

M.COMMAND.registerCmd({
    name : 'SAVE_EDITORSERVICE_SETTING',
    main : function(socket, cookie, args) {
        var key = args.key;
        var value = args.value;

        // 获取配置信息
        var v = M.SETTING.saveSetting(key, value);

        var ret = { operRet : true };
        ret[key] = v;
        return ret;
    }
});
