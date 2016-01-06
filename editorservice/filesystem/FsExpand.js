/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * node 工程的文件操作辅助类
 */

var fs = require('fs-extra');
var path = require('path');

var sysHiddenDir = [
    'Build',
    'docs'
];

var _fixedVirtualDir = [
    'Plugins'
];

var _virtualMap = {};

/**
 * @param fileName
 * @returns {boolean} 当前文件是否隐藏文件（不做 bin/meta 生成等逻辑）
 */
isHidden = module.exports.isHidden = function(dir, fileName) {
    // 以 __ 结尾（比如 webStorm 的编辑产生的中间文件
    // 以 . 开头，这默认就是系统隐藏文件
    // 以 .swap 结束的，一般也是文本的
    // 以 .svn 结束的，版本控制文件
    // 以 .out 结束的日志文件
    // 以 ~$ 开头的 excel 临时文件
    fileName = fileName.toLowerCase();
    if (/(__$|^\.|\.swap$|\.out$|\.svn$|^\~\$|\~$)/.test(path.basename(fileName)))
        return true;

    // 判定是否系统预设路径
    var fullPath = path.join(dir, fileName).toLowerCase();

    if (G.gameRoot) {
        for (var i = 0, length = sysHiddenDir.length; i < length; i++) {
            if (fullPath.indexOf(path.join(G.gameRoot, sysHiddenDir[i]).toLowerCase()) === 0)
                return true;
        }
    }

    return false;
};

isFixedVirtualDir = module.exports.isFixedVirtualDir = function(dir) {
    if (G.gameRoot) {
        for (var i = 0, length = _fixedVirtualDir.length; i < length; i++) {
            if (dir === path.join(G.gameRoot, _fixedVirtualDir[i]))
                return true;
        }
    }
    return false;
};

/**
 * @param dir 文件路径
 * @param subPath 文件名
 * @returns {boolean} 当前文件是否不通知客户端显示（但是需要做 bin 、meta 生成处理）
 */
skipWhenExplore = module.exports.skipWhenExplore = function(dir, fileName) {
    if (dir === G.gameRoot &&
           ['ProjectSetting', 'Temp'].indexOf(fileName) >= 0)
        return true;

    if (fileName === 'meta' &&
        dir === G.gameRoot + 'Assets') {
        // gameRoot 下的 Assets/meta 不显示
        return true;
    }

    return false;
};

/**
 * @param dir 文件路径
 * @returns {boolean} 当前文件是否不打包（但是需要做 bin 、meta 生成处理）
 */
skipWhenPack = module.exports.skipWhenPack = function(dir, fileName) {
    var rawPathConfig = path.join(G.gameRoot, 'Assets', 'raw').replace(/\\/g, '/');
    if (path.join(dir, fileName).replace(/\\/g, '/').indexOf(rawPathConfig) === 0)
        return true;

    return false;
};

/**
 * @param dir 文件路径
 * @param subPath 文件名
 * @returns {boolean} 当前文件夹是否将原档下发客户端
 */
needExploreRawFile = module.exports.needExploreRawFile = function(dir) {
    if (dir.replace(/\\/g, '/') ===
        path.join(G.gameRoot, 'Assets', 'raw').replace(/\\/g, '/'))
        return true;

    return false;
};

/**
 * @param fileName
 * @returns {boolean} 当前文件是不是meta
 */
isMeta = module.exports.isMeta = function(fileName) {
    return extname(fileName) === '.meta';
};

/**
 * @param fileName
 * @returns {boolean} 当前文件是不是bin打包文件
 */
isBin = module.exports.isBin = function(fileName) {
    return extname(fileName) === '.bin';
};

/**
 * @param fileName
 * @returns {boolean} 当前文件是不是js打包文件
 */
isJs = module.exports.isJs = function(fileName) {
    return extname(fileName) === '.js';
};

/**
 * @param fileName
 * @returns {boolean} 根据普通文件，获取对应的 meta 文件名
 */
getMetaName = module.exports.getMetaName = function(fileName) {
    return fileName + '.meta';
};

extname = module.exports.extname = function(fileName) {
    return path.extname(fileName).toLowerCase();
};

/**
 * @param fileName
 * @returns {boolean} 根据 meta 文件名，获取对应的源文件名
 */
getNormalNameByMeta = module.exports.getNormalNameByMeta = function(fileName) {
    if (isMeta(fileName))
        return fileName.slice(0, -5);
    else
        return '';
};

// 将文件名替换为 unix 风格
toUnixFileName = module.exports.toUnixFileName = function(key) {
    key = key.replace(/\\/g, '/');
    var double = /\/\//;
    while (key.match(double))
        key = key.replace(double, '/');
    return key;
};

/**
 * 是否是系统预设目录
 */
isPredefined = module.exports.isPredefined = function(dir) {
    dir = toUnixFileName(path.join(dir, '/'));
    return G.config.systemPredefined.indexOf(dir) >= 0;
};

/**
 * @param path
 * @returns {object} 递归遍历一个目录，将文件用 object 方式全部呈现
 */
explorPath = module.exports.explorePath = function(dir) {
    var dict = {};
    var list = fs.readdirSync(expandPath(dir));
    list.forEach(function(subPath) {
        if (isHidden(dir, subPath) || isMeta(subPath))
            // 隐藏文件不收集，meta 文件不收集
            return;

        if (skipWhenExplore(dir, subPath))
            // 部分系统路径 explore 时不下发客户端（但是需要做 bin 、meta 生成处理）
            return;

        var fullPath = path.join(dir, subPath);
        var stat = fs.statSync(expandPath(fullPath));

        if (stat.isDirectory()) {
            // 是一个目录，继续递归下去
            dict[subPath] = {
                virtualDir : isFixedVirtualDir(fullPath),
                sub: explorPath(fullPath),
                predefined: isPredefined(fullPath)
            };
        }
        else {
            // 一些特殊目录需要无条件下发，css 也需要
            var needExploreRaw = needExploreRawFile(dir);
            if (needExploreRaw ||
                extname(subPath) === '.css') {
                dict[subPath] = {
                    raw : true
                };
                return;
            }

            // 只收集 .js && .bin 文件
            if (!isBin(subPath) && !isJs(subPath))
                return;

            // 下发类型给客户端
            var jsonData = null;
            try {
                jsonData = fs.readJSONFileSync(expandPath(fullPath + '.meta'), {throws: false});
            }
            catch (e) {
                jsonData = null;
            }
            if (jsonData) {
                var assetType = jsonData.type;
                var source = jsonData.source;

                // 设置返回信息
                var uuid = jsonData.uuid;
                dict[subPath] = {
                    uuid : uuid,
                    assetType : assetType,
                    source : source
                };

                // JS 的话还需要一个信息：脚本之间的依赖关系
                if (assetType === G.ASSET_TYPE.ASSET_JS) {
                    var deps = G.gameFiles.scriptDependence[uuid];
                    if (deps)
                        dict[subPath].dependences = deps;
                }
            }
        }
    });

    // 遍历虚拟目录
    var virtualList = readVirtualDir(dir);
    virtualList.forEach(function(subPath) {
        if (isHidden(dir, subPath) || isMeta(subPath))
        // 隐藏文件不收集，meta 文件不收集
            return;

        if (skipWhenExplore(dir, subPath))
            // 部分系统路径 explore 时不下发客户端（但是需要做 bin 、meta 生成处理）
            return;

        var fullPath = path.join(dir, subPath);
        var stat = fs.statSync(expandPath(fullPath));

        if (stat.isDirectory()) {
            // 是一个目录，继续递归下去
            dict[subPath] = {
                virtualDir: true,
                sub: explorPath(fullPath),
                predefined: isPredefined(fullPath)
            };
        }
        else {
            // 只收集 .js && .bin 文件
            if (! isBin(subPath) && ! isJs(subPath))
                return;

            // 下发类型给客户端
            var jsonData;
            try {
                jsonData = fs.readJSONFileSync(expandPath(fullPath + '.meta'), {throws: false});
            }
            catch (e) {
                jsonData = null;
            }
            if (jsonData) {
                var assetType = jsonData.type;
                var source = jsonData.source;

                // 设置返回信息
                var uuid = jsonData.uuid;
                dict[subPath] = {
                    uuid : uuid,
                    assetType : assetType,
                    source : source
                };

                // JS 的话还需要一个信息：脚本之间的依赖关系
                if (assetType === G.ASSET_TYPE.ASSET_JS) {
                    var deps = G.gameFiles.scriptDependence[uuid];
                    if (deps)
                        dict[subPath].dependences = deps;
                }
            }
        }
    });
    return dict;
};

// 根据文件名，获取基本名，例如 pic.png 得到 pic
getBaseName = module.exports.getBaseName = function(fileName) {
    return path.parse(fileName).name.toLowerCase();
};

virtualMap = module.exports.virtualMap = function() {
    return _virtualMap;
};

/**
 * 映射虚拟目录
 */
mapVirtualPath = module.exports.mapVirtualPath = function(type, virtualPath, path) {
    if (!type || !virtualPath || !path)
        return;
    if (!_virtualMap[type]) {
        _virtualMap[type] = {};
    }
    _virtualMap[type][virtualPath] = path;
};

/**
 * 取消虚拟目录的映射
 */
unmapVirtualPath = module.exports.unmapVirtualPath = function(type, virtualPath) {
    if (!type || !virtualPath)
        return;
    if (_virtualMap[type]) {
        _virtualMap[type][virtualPath] = null;
    }
};

/**
 * 清理虚拟目录
 */
clearVirtualPath = module.exports.clearVirtualPath = function(type) {
    if (type) {
        _virtualMap[type] = {};
    }
    else {
        _virtualMap = {};
    }
};

/**
 * 展开路径，在虚拟目录中则返回实际路径
 */
expandPath = module.exports.expandPath = function(filePath) {
    var relativePath = undefined;
    var realPath = filePath;
    for (var type in _virtualMap) {
        var list = _virtualMap[type];
        if (!list)
            continue;
        for (var vPath in list) {
            if (!list[vPath]) {
                continue;
            }
            var relative = path.relative(vPath, filePath);

            if (relative.indexOf('..') === 0 || relative.indexOf(':') >= 0) {
                continue;
            }
            if (relativePath === undefined || relativePath.length > relative.length) {
                relativePath = relative;
                realPath = path.join(list[vPath], relative);
            }
        }
    }
    return realPath;
};

/**
 * 获取虚拟路径，返回实际路径对应的虚拟路径
 */
getVirtualPath = module.exports.getVirtualPath = function(filePath) {
    var relativePath = undefined;
    var virtualPath = filePath;
    var realPath;
    for (var type in _virtualMap) {
        var list = _virtualMap[type];
        if (!list)
            continue;
        for (var vPath in list) {
            if (!(realPath = list[vPath])) {
                continue;
            }
            var relative = path.relative(realPath, filePath);

            if (relative.indexOf('..') === 0 || relative.indexOf(':') >= 0) {
                continue;
            }
            if (relativePath === undefined || relativePath.length > relative.length) {
                relativePath = relative;
                virtualPath = path.join(vPath, relative);
            }
        }
    }
    return virtualPath;
};

/**
 * 获取路径下的虚拟目录
 */
readVirtualDir = module.exports.readVirtualDir = function(dir) {
    var sub = [];
    for (var type in _virtualMap) {
        var list = _virtualMap[type];
        if (!list)
            continue;
        for (var vPath in list) {
            if (!list[vPath]) {
                continue;
            }
            var relative = path.relative(dir, vPath);
            if (relative.indexOf('..') !== 0 && relative.indexOf(':') < 0) {
                var part = relative.replace('\\', '/').split('/');
                if (part[0].length)
                    sub.push(part[0]);
            }
        }
    }
    return sub;
};

// 将 json 写入到文件中，这里我们这里不用 fs-extra.writeJsonSync 是因为
// 我们希望所有的 .setting 文件都用 2 空格分隔，其他文件不分隔
module.exports.writeJsonSync = module.exports.writeJsonFileSync = module.exports.writeJSONFileSync = function(file, obj, options) {
    var spaces = /\.(setting|prefab|state)$/.test(file) ? 2 : 0;
    var str = JSON.stringify(obj, null, spaces) + '\n';
    return fs.writeFileSync(file, str, options);
};
