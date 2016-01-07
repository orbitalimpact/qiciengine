欢迎使用青瓷引擎(QICI Engine)!
=============================================================================
介绍

青瓷引擎是一个免费开源的JavaScript游戏引擎类库，并提供了一站式基于浏览器的HTML5游戏开发工具套件。

Github: http://github.com/qiciengine/qiciengine
下载: http://bbs.zuoyouxi.com/forum.php?mod=viewthread&tid=86&page=1&extra=#pid103
文档: http://docs.zuoyouxi.com/manual/index.html
API: http://docs.zuoyouxi.com/api/game/index.html
例子: http://engine.zuoyouxi.com/demo/
问答: http://wenda.zuoyouxi.com/
QQ群: 214396286

可访问官网 http://www.zuoyouxi.com 了解更多信息
=============================================================================
QICI Editor文件目录结构

/Plugins                    所有青瓷引擎插件
/editorservice              服务器Node.js代码目录
    /StartService.js        服务器启动文件
/lib                        JavaScript类库目录
    /phaser.js              未压缩的开发版 Phaser 2.3.0 JavaScript 类库
    /phaser.min.js          压缩的发布版 Phaser 2.3.0 JavaScript 类库
    /qc-core-debug.js       未压缩的开发版青瓷引擎核心类库
    /qc-core.js             压缩的发布版青瓷引擎核心类库
    /qc-loading-debug.js    未压缩的开发版游戏加载进度类库
    /qc-loading.js          压缩的发布版游戏加载进度类库
    /webfontloader.js       字体资源加载类库: https://github.com/typekit/webfontloader
/node_modules               服务器Node.js依赖模块
package.json                npm install依赖的项目信息
start-mac.command           Mac OS X下的启动文件: node ./editorservice/StartService.js
start-win.bat               Windows下的启动文件: node ./editorservice/StartService.js
=============================================================================
安装

如果您本机已经安装了Node.js，推荐您升级到最新版本，青瓷引擎支持的Node.js版本：

Node.js合并io.js之前任何 v0.12.x 的版本
Node.js合并io.js之后任何高于 v4.1 的版本

可阅读《安装》手册: http://docs.qiciengine.com/manual/Overview/Install.html 了解更多信息
=============================================================================
运行

根据你的操作系统直接双击运行start-mac.command或start-win.bat启动服务，默认会自动打开浏览器访问：http://localhost:5002/project.html，也可通过在青瓷引擎解压包所在目录下运行：node ./editorservice/StartService.js 命令实现同样地效果。

如果运行失败：
1、请确定你所安装的Node.js为最新版
2、可尝试删除node_modules目录内容，通过npm install重整安装Node.js模块
=============================================================================

