/**
 * @author weism
 * 在编辑器模式下的启动
 */

// 内置的启动场景，启动后即刻载入入口场景
qici.splashState = {
    init: function() {
        var game = window[qici.config.gameInstance];
        if (window.parent && window.parent !== window && window.parent.G) {
            game.getWindow = function() {
                return window;
            };
            window.parent.G.game = game;
            window.parent.G.e.emit(window.parent.G.e.SCENE_INITED, null);
        }

        if (qici.config.preview === true) {
            if (game.device.desktop) {
                initResizableGameSize();
            }
            else {
                game.fullScreen();
            }
        }
    },

    preload: function() {
        // 由于 webstorm 的 web 容器不是及时刷新，必须在 webstorm 的目录树中操作才刷新
        // 导致我们外部新增资源的时候，无法加载到资源
        // 这里统一改为从 Node 后台下载资源
        var game = window[qici.config.gameInstance];
        if (window.parent && window.parent !== window && window.parent.G) {
            var service = window.parent.G.service;
            game.assets.baseURL = 'http://' + service.ip + ':' + service.port + '/';
        }

        // 加载切屏的动画预制
        if (qici.config.editor !== true) {
            if (qici.config.loadingPrefab)
                game.assets.load('__loading_prefab__', qici.config.loadingPrefab);
            game.updateScale(true);
        }
    },

    create: function() {
        // 初始化用户场景信息
        var game = window[qici.config.gameInstance];
        game.state.entry = qici.config.entryScene;
        game.state.list = qici.config.scene;

        // 修改默认帧率
        if (qici.config.frameRate) game.time.applyFrameRate(qici.config.frameRate);

        // 挂载切屏场景的动画，并设置为切屏不析构
        var node;
        if (qici.config.editor !== true && qici.config.loadingPrefab) {
            var prefab = game.assets.find('__loading_prefab__');
            if (prefab) {
                node = game.add.clone(prefab);
                node.ignoreDestroy = true;
                node.visible = false;
            }
        }

        // 进入第一个场景(需要用户第一个场景资源下载完毕才能进入)
        var loadEntryScene = function() {
            game.state.load(game.state.entry, true, function() {
                console.log('Loading assets for entry scene.');
            }, function() {
                console.log('Finish loading assets for entry scene.');
                if (window.parent && window.parent.G && window.parent.G.qcplay) {
                    window.parent.G.e.emit(window.parent.G.e.SCENE_LOADED, null);
                }
            });
        };
        game.state.loadingAnimation = true;
        game.timer.add(1, loadEntryScene);
    }
};
