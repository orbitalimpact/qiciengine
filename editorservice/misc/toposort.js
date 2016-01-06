/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 拓扑排序用于检测依赖顺序
 */

/**
 * 当前的拓扑关系是否可以加入一条边
 */
module.exports.canAddEdge = function(dependences, item, dep) {
    // 只需要保证，dep 的所有递归依赖，均没有 item 项即可
    var visited = {};
    function visit(node) {
        if (node === item)
            return false;

        var list = dependences[node];
        if (!list || !list.length)
            return true;

        for (var index in list) {
            var subNode = list[index];
            if (visited[subNode])
                continue;
            visited[subNode] = true;

            if (!visit(subNode))
                return false;
        };

        return true;
    };

    return visit(dep);
};

/**
 * 根据依赖关系，生成一条链
 */
module.exports.toposort = function(dependences) {
    var nodes = [];

    // 收集所有的顶点
    for (var node in dependences) {
        if (nodes.indexOf(node) < 0)
            nodes.push(node);

        var list = dependences[node];
        for (var index in list) {
            var subNode = list[index];
            if (nodes.indexOf(subNode) < 0)
                nodes.push(subNode);
        }
    }

    var cursor = nodes.length;
    var index = cursor;
    var visited = {};
    var sorted = new Array(cursor);
    var cyclicDependency = false;

    // 定义遍历，找到根证明没有任何依赖，就可以加入
    function visit(node, index, predecessors) {
        if (predecessors.indexOf(node) >= 0) {
            // 出现环状引用了
            cyclicDependency = true;
            return;
        }

        if (visited[index]) return;
        visited[index] = true;

        // 深度下找
        var list = dependences[node];
        var i = list ? list.length : 0;
        if (i) {
            var preds = predecessors.concat(node);
            do {
                var child = list[--i];
                visit(child, nodes.indexOf(child), preds);
                if (cyclicDependency)
                    break;
            } while(i);
        }

        sorted[--cursor] = node;
    }

    // 拓扑查找
    while (index--) {
        if (!visited[index]) {
            visit(nodes[index], index, []);
        }
    }

    if (cyclicDependency) {
        console.log('出现环状引用。');
        return [];
    }
    return sorted;
};