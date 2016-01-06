/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * 客户端向服务器发起 DEBUG 请求
 */
var path = require('path');
var fs = require('fs-extra');

M.COMMAND.registerCmd({
    name : 'DEBUG',
    main : function(socket, cookie, args) {
        if (args.type === 'convertAtlasFrameToImage') {
            // 遍历所有的 Assets 下文件
            var explorePath = function(dir) {
                var list = fs.readdirSync(path.join(G.gameRoot, dir));
                for (var i = 0, len = list.length; i < len; i++) {
                    var subPath = list[i];
                    var fullPath = path.join(G.gameRoot, dir, subPath);
                    var stat = fs.statSync(fullPath);

                    if (stat.isDirectory()) {
                        explorePath(path.join(dir, subPath));
                    }
                    else {
                        var ext = path.extname(subPath).toLowerCase();
                        if (ext === '.state' || ext === '.prefab') {
                            // 处理这个文件
                            var data;
                            try {
                                data = fs.readJsonSync(fullPath, {throw: false});
                            }
                            catch (e) {
                                data = null;
                            }

                            if (!data) continue;
                            var modified = false;
                            var deepModify = function(p) {
                                for (var name in p) {
                                    var content = p[name];
                                    var lowname = name.toLowerCase();
                                    if ([ 'frame', '_normaltexture', '_pressedtexture', '_disabletexture' ].indexOf(lowname) >= 0 &&
                                        content &&
                                        typeof(content) === 'object' &&
                                        typeof(content[1]) === 'string' &&
                                        content[1].slice(-4) === '.bin') {
                                        modified = true;
                                        content[1] = content[1].slice(0, -4) + '.png';
                                    }
                                    if (typeof(content) === 'object')
                                        deepModify(content);
                                }
                            };
                            deepModify(data);

                            // 写入文件
                            if (modified) fs.writeJSONSync(fullPath, data);
                        }
                        else if (ext === '.meta') {
                            // 处理这个文件
                            var modified = false;
                            var data;
                            try {
                                data = fs.readJsonSync(fullPath, {throw: false});
                            }
                            catch (e) {
                                data = null;
                            }

                            if (!data || !data.padding) continue;
                            console.log(fullPath);
                            var padding = {};
                            for (var name in data.padding) {
                                if (name.slice(-4) === '.bin') {
                                    modified = true;
                                    padding[name.slice(0, -4) + '.png'] = data.padding[name];
                                }
                                else
                                    padding[name] = data.padding[name];
                            }
                            if (modified)  {
                                data.padding = padding;
                                fs.writeJSONSync(fullPath, data);
                            }
                        }


                    }
                }
            };
            explorePath('Assets');
            explorePath('Temp');

            return { 'operRet' : true };
        }

        return { 'operRet' : false };
    }
});
