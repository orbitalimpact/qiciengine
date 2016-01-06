/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 定期检查工程目录，确保所有的资源被打包
 */
var fsEx = G.load('filesystem/FsExpand');
var fs = require('fs-extra');
var path = require('path');

var pendingWatch;

/**
 * @param fileName 源文件名
 * 确保当前文件的 meta 存在，注意 assure 创建 meta 时候是同步的
 */
var assureMeta = module.exports.assureMeta = function(fileName) {
    var metaName = fsEx.getMetaName(fileName);
    if (!fs.existsSync(fileName)) {
        if (!fsEx.isBin(fileName) && !fsEx.isJs(fileName))
            return;
        // 不存在 bin/js 文件，如果存在 .meta 则尝试删除
        if (fs.existsSync(metaName)) {
            // 对应的 bin/js 被删除，但是本文件夹中存在该 meta 的来源，先不删除 meta
            if (fsEx.isJs(fileName)) {
                // js 文件，来源就是自己，前面已经确定了 fileName 对应文件不存在，删除 meta
                G.log.important('删除JS的meta{0}', metaName);
                fs.unlinkSync(metaName);
            }
            else {
                // bin 文件，meta 中的 source 只要有人还在，就先不要删除 meta
                var metaContent;
                try {
                    metaContent = fs.readJsonSync(metaName, { throws : false });
                }
                catch (e) {
                    metaContent = null;
                }
                var needRemove = true;

                // 获取基本名字
                var baseName;
                if (G.ASSET.IsSound(fileName)) {
                    // 音乐文件特殊处理，a.mp3.bin 组合 name 为 a 而非 a.mp3
                    baseName = fileName.slice(0, -8);
                }
                else {
                    baseName = fileName.slice(0, -4);
                }

                if (metaContent && metaContent.source) {
                    var metaSource = metaContent.source;
                    for (var i = 0, len = metaSource.length; i < len; i++) {
                        if (fs.existsSync(baseName + metaSource[i])) {
                            needRemove = false;
                            break;
                        }
                    }
                }

                // 还是坚持要删除，那就删除吧
                if (needRemove) {
                    fs.unlinkSync(metaName);
                }
            }
        }
    }
    else {
        // 存在该文件
        if (!fs.existsSync(metaName)) {
            if (fsEx.isJs(fileName)) {
                fs.writeJSONFileSync(metaName, {
                    'type' : G.ASSET_TYPE.ASSET_JS,
                    'uuid' : G.uuid()
                });
            }
            else if (fsEx.isBin(fileName)) {
                var metaExtra = M.PACK.extractMetaFromBin(fileName);
                if (metaExtra) fs.writeJSONFileSync(metaName, metaExtra);
                else {
                    G.log.trace('cannot extra {0} meta, try next time.', fileName);
                }
            }
        }
        else {
            // 存在文件且存在 meta，删除无关的 meta
            if (!fsEx.isBin(fileName) && !fsEx.isJs(fileName)) {
                fs.unlinkSync(metaName);
            }
        }
    }
};

/**
 * 确保meta对应的主文件存在，如果不存在则需要干掉meta文件
 */
var assureFileForMeta = function(file) {
    var fileName = fsEx.getNormalNameByMeta(file);
    assureMeta(fileName);
};

/**
 * @param path
 * 定期遍历整个目录，确保 meta、bin 正确创建
 */
var explorDaemon = module.exports.exploreDaemon = function(dir) {
    dir = dir || G.gameRoot;
    if (!dir) return;
    var files;
    try {
        files = fs.readdirSync(dir);
    }
    catch (e) {}
    if (!files) {
        console.error('explore path ', dir, 'faild');
        return;
    }

    var nameGroup = {};
    files.forEach(function(subPath) {
        if (fsEx.isHidden(dir, subPath))
            return;
        if (fsEx.skipWhenPack(dir, subPath))
            return;

        var fullPath = path.join(dir, subPath);
        if (fsEx.isMeta(subPath)) {
            // meta 文件，需要确保主文件存在
            assureFileForMeta(fullPath);
        }
        else {
            // 其他文件，确保 meta 存在
            assureMeta(fullPath);
        }
        if (!fs.existsSync(fullPath)) return;

        // 处理完自己，如果是目录需要递归
        var stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            explorDaemon(fullPath);
            return;
        }

        // 需要以名字编组，记录所有的文件列表 、修改时间、bin创建时间
        // 如果判定需要创建 bin，则尝试生成之
        var name = fsEx.getBaseName(subPath);
        if (!fsEx.isMeta(subPath)) {
            var group;
            var groupName;

            if (/(.ogg$|.mp3$)/.test(subPath))
            	groupName = subPath;
            else
                groupName = name;

            if (!nameGroup[groupName])
                group = nameGroup[groupName] = {};
            else
                group = nameGroup[groupName];

            if (fsEx.isBin(subPath))
                // 记录上次 bin 文件创建时间
                group.binModify = stat.ctime;
            else {
                // 记录上次文件修改时间
                if (!group.lastModify || stat.ctime > group.lastModify)
                    group.lastModify = stat.ctime;

                if (!group.list)
                    group.list = [ fsEx.extname(subPath) ];
                else
                    group.list.push(fsEx.extname(subPath) );
            }
        }
    });

    if (Object.keys(nameGroup).length) {
        Object.keys(nameGroup).forEach(function(name) {
            var group = nameGroup[name];

            if (!group.list || !group.list.length)
                return;
            if (!group.binModify || group.lastModify > group.binModify) {
            	if (/(.ogg$|.mp3$)/.test(name))
            		name = name.slice(0, -4);
                M.PACK.toBin(dir, name, group.list);
            }
        });
    }
};

// 这个文件变更了，尝试单独获取这个文件的信息
var tryPackByOneFile = module.exports.tryPackByOneFile = function(fileName) {
    // meta 在 pack 的时候自动写入（并非用户手动修改）的情况下，不要第一时间写入 bin，因为此时正在写 bin
    if (fsEx.isMeta(fileName)) {
        var md5sum = M.PACK.metaContentHash[fileName];
        if (md5sum) {
            var metaContent = fs.readJsonSync(fileName);
            if (M.util.calcMD5(JSON.stringify(metaContent)) === md5sum) {
                return;
            }
        }
    }

    var fileInfo = path.parse(fileName);
    var shorterName, name;
    var maxTimes = 10;
    var p;

    // 获取基础名字，例如 a.mp3.bin -> a,   b.png -> b,  c.mp3.bin.meta -> c
    name = fileInfo.name.toLowerCase();
    do
    {
        p = path.parse(name);
        shorterName = p.name;
        if (shorterName === name ||
            !M.PACK.isValideExt(p.ext))
            break;
        name = shorterName;
    } while (maxTimes--);

    var dir  = fileInfo.dir;

    // 获取文件夹下的同名文件
    var list = [ ];
    if (!fs.existsSync(dir)) {
        // 被删除的文件，不需要尝试打包（删除文件夹的时候会进入该逻辑）
        return;
    }
    var files = fs.readdirSync(dir);
    if (!files) {
        console.error('explore path ', path, 'failed');
        return;
    }

    files.forEach(function(subPath) {
        var subFileInfo = path.parse(subPath);
        if (subFileInfo.name.toLowerCase() === name) {
            var ext = subFileInfo.ext.toLowerCase();
            if (ext != 'bin')
                list.push(ext);
        }
    });

    if (list.length) {
        M.PACK.toBin(dir, name, list);
    }
};

// 处理文件发生变化
var dealWithFileEvent = function(event, rootPath, fileName, virtualDir) {
    //明确说明先不要派发 watch
    if (pendingWatch) {
        return;
    }

    var fullPath = path.join(rootPath, fileName);

    // 通知关注者
    G.emitter.emit('fileChanged', fullPath);

    // G.log.trace('fs: event:' + event + ' filePath:' + fullPath);

    if (fileName && fsEx.isMeta(fileName)) {
        // meta 文件的话，如果是 modify 则尝试重新打包
        if (fs.existsSync(fullPath)) tryPackByOneFile(fullPath);
    }
    else if (fileName && !fsEx.isHidden(rootPath, fileName)) {
        // 非 meta，非 hidden

        if (!fsEx.skipWhenPack(rootPath, fileName)) {
            // 尝试打包
            if (event === 'rename') {
                assureMeta(fullPath);
            }

            var exist = fs.existsSync(fullPath);
            if (!fsEx.isBin(fullPath) || !exist)
                tryPackByOneFile(fullPath);
        }

        // 有效的变更，派发事件给客户端
        M.COMMAND.broadcast('FILE_CHANGED', {
            event: event,
            fileName: path.join(virtualDir, fileName),
            exist: exist
        });
    }
};

G.fsWatcher = [];

/**
 * @param path
 * @returns {object} node 监控文件发生任何变更，确保 meta，通知给所有连接中的对象
 */
module.exports.watchDir = function(rootPath, virtualDir) {
    virtualDir = virtualDir || "./";
    if (process.platform === 'darwin') {
        // mac 系统，沿用 fs.watch 递归即可
        G.fsWatcher.push(fs.watch(rootPath, {persistent: true, recursive: true}, function(event, fileName) {
            // 处理中文 utf8 问题
            fileName = Buffer(fileName, 'binary').toString();
            dealWithFileEvent(event, rootPath, fileName, virtualDir);
        }));
    }
    else {
        // 其他系统，使用 chokidar 来替代
        var chokidar = require('chokidar');
        G.fsWatcher.push(chokidar.watch(rootPath, {
            usePolling: false,
            ignoreInitial: true,
            ignored: /Build[\///]*/
        }).on('all', function(event, fileName) {
            // 尝试替换 windows 风格的分隔符
            var fullPath = fileName.replace(/\\/g, '/');
            fileName = path.relative(rootPath, fullPath);
            dealWithFileEvent(event, rootPath, fileName, virtualDir);
        }));
    }
};

// 更新开始的消息，暂停 file change 事件
G.emitter.on('startUpdate', function() {
    pendingWatch = true;
});

// 检测到更新完毕的消息，explore 一把
G.emitter.on('endUpdate', function(success) {
    if (!success) {
        pendingWatch = false;
        try {
            explorDaemon();
        }
        catch (e) {
        }
    }

    // success 需等待重启，需要持续 pending
});