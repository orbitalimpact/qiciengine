/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 查询服务器配置
 */

var fs = require('fs-extra');
var path = require('path');

M.COMMAND.registerCmd({
    name : 'QUERY_EDITORSERVICE_SETTING',
    main : function(socket, cookie, args) {
        var key = args.key;

        // 获取配置信息
        var value = M.SETTING.querySetting(key);
        var ret = { operRet : true };
        ret[key] = value;
        return ret;
    }
});
