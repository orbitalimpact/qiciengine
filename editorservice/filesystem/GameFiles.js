/**
 * @author weism
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 维护游戏工程的目录信息
 */
var fsEx = G.load('filesystem/FsExpand');;
var fs = require('fs-extra');
var path = require('path');

var clazz = function() {
    /**
     * 文件的目录树信息，组织了文件的类型、关联的文件信息等
     */
    this.files = {
        Game : {}
    };

    /**
     * uuid与文件的映射关系，目录排除在外
     */
    this.uuid2file = {
    };

    /**
     * 临时目录，成功设置后，赋给 uuid2file
     */
    this._tempUUID2file = {
    };

    /**
     * 脚本的依赖关系，使用uuid来记录
     */
    this.scriptDependence = {};
};
clazz.prototype = {};
clazz.prototype.constructor = clazz;
G.gameFiles = new clazz();

/**
 * 重新刷新整个目录树和所有的数据
 * 需要确保所有的资源都完整打包后才执行遍历刷新操作
 */
clazz.prototype.refresh = function() {
    // 读取整个目录的资源
    var self = this;
    var readDirDeep = function(dir) {
        var dict = {};
        var list = fs.readdirSync(dir);
        list.forEach(function(subPath) {
            // 隐藏文件不收集
            if (fsEx.isHidden(dir, subPath)) return;

            var fullPath = path.join(dir, subPath);
            var stat;

            try { stat = fs.statSync(fullPath); } catch (e) { return; }
            if (!stat) return;

            if (stat.isDirectory())
                dict[subPath] = readDirDeep(fullPath);
            else
                dict[subPath] = {
                    size : stat.size,
                    ext : fsEx.extname(fullPath)
                };
        });
        return dict;
    }

    // 将资源进行分类
    var list = readDirDeep(G.gameRoot);
    this.files.Game = {};
    var copyAndParse = function(source, dest, currPath) {
        for (var k in source) {
            var fileInfo = source[k];
            if (fileInfo.ext === undefined) {
                // 这是个目录，递归处理
                dest[k] = {};
                copyAndParse(fileInfo, dest[k], currPath + k + '/');
                continue;
            }

            // 我们只关心打包后的资源文件和脚本，即bin/js
            if (fileInfo.ext !== '.bin' &&
                fileInfo.ext !== '.js')
                continue;

            var filePath = path.join(G.gameRoot, currPath, k);
            var metaPath = filePath + ".meta";

            do
            {
                if (fs.existsSync(metaPath)) {
                    // 确定存在
                    exists = true;
                    break;
                }

                if (fileInfo.ext !== '.js') {
                    // bin 文件，直接认为 meta 不存在
                    exists = false;
                    break;
                }

                // 尝试创建 JS 的 meta 文件
                G.watch.assureMeta(filePath);
                exists = fs.existsSync(metaPath);
            } while (false);

            // 确定不存在 meta 文件
            if (!exists) continue;
            var metaContent = null;
            try {
                metaContent = fs.readJSONFileSync(metaPath, { throws : false });    
            }
            catch(e) {
                metaContent = null;
            }
            if (metaContent == null) {
                G.log.error('读取json文件' + metaPath + '失败。');
                continue;
            }

            // 读取对应的meta文件，在meta文件中指明了资源的类型和源资源列表
            dest[k] = {
                meta : metaContent,
                size : fileInfo.size
            };

            // 缓存uudi信息
            self._tempUUID2file[dest[k].meta.uuid] = currPath + k;
        }
    };
    copyAndParse(list, this.files.Game, '');

    // 处理完毕后，覆盖原配置
    self.uuid2file = self._tempUUID2file;
    self._tempUUID2file = {};

    // 准备保存这一份 uuid2file
    self._saveUrlMap();
};

/**
 * 保存一份 uuid -> url 的映射
 */
clazz.prototype._saveUrlMap = function() {
    // 我们只需要  uuid -> url 信息
    var urlMap = {};
    var uuid2file = this.uuid2file;

    for (var uuid in uuid2file) {
        var url = uuid2file[uuid];
        if (url.slice(-4).toLowerCase() !== '.bin')
            continue;

        urlMap[uuid] = url;
    }

    // 写入文件
    fs.ensureDirSync(path.join(G.gameRoot, 'Assets/meta'));
    fs.writeFileSync(path.join(G.gameRoot, 'Assets/meta/globalUrlMap.js'),
        'urlMapConfig = ' + JSON.stringify(urlMap, null, 2) + ';\n');
};

// bin 文件变更的时候，处理更新 uuid2file
G.emitter.on('fileChanged', function(file) {
    if (path.extname(file).toLowerCase() !== '.bin')
        // 不是关心的文件
        return;

    // build路径无视
    var relativePath = path.relative(G.gameRoot, file);
    if (relativePath.indexOf('Build/') === 0 ||
        relativePath.indexOf('Build\\') === 0)
        return;

    // 尝试获取其 meta
    var metaInfo = M.PACK.extractMetaFromBin(file);
    if (!metaInfo) return;

    // 判定路径是否变化
    var meta = metaInfo.uuid;
    var lastPath = G.gameFiles.uuid2file[meta];
    if (lastPath && 
        (lastPath === relativePath ||
         lastPath === relativePath.replace(/\\/g, '/')))   
        // 路径没有发生变化
        return;

    // 路径变化了，新增资源 or 资源路径变化
    // G.log.trace('资源{0}的路径从{1}为设置为：{2}，刷新', meta, lastPath, relativePath);
    M.PROJECT.genGameHTML();
});

/**
 * 取得某个文件的详细信息
 */
clazz.prototype.getFileInfo = function(file) {
    var arr = file.split('/');
    var curr = this.files.Game;
    for (var i = 0; i < arr.length - 1; i++) {
        curr = curr[arr[i]];
        if (!curr) return null;
    }

    return curr[arr[arr.length - 1]];
};
