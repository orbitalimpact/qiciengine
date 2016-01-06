/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 客户端向服务器请求增加一个资源的依赖关系
 */

M.COMMAND.registerCmd({
    name : 'ADD_DEPENDENCE',
    main : function(socket, cookie, args) {
        var item = args.item;
        var dep = args.dep;

        var ret = M.USER_SCRIPTS.addDependence(item, dep);
        var deps = M.USER_SCRIPTS.getDependence(item);

        // 返回操作结果（失败的话返回具体原因）
        if (ret === true)
            return { 'operRet': true, 'deps' : deps };
        else
            return { 'operRet': false, 'deps' : deps, 'reason' : ret };
    }
});
