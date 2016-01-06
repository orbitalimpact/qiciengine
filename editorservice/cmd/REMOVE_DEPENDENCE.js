/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 客户端向服务器请求移除一个资源的依赖关系
 */

M.COMMAND.registerCmd({
    name : 'REMOVE_DEPENDENCE',
    main : function(socket, cookie, args) {
        var item = args.item;
        var dep = args.dep;

        var ret = M.USER_SCRIPTS.removeDependence(item, dep);
        var deps = M.USER_SCRIPTS.getDependence(item);

        // 返回操作结果
        return { 'operRet': ret, 'deps' : deps };
    }
});
