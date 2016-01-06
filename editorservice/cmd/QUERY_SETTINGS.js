/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 取得工程的配置信息
 */
var fs = require('fs-extra');

M.COMMAND.registerCmd({
    name : 'QUERY_SETTINGS',
    main : function(socket, cookie, data) {
        return G.config;
    }
});
