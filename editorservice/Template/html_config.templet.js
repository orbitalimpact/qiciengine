        var qici = {};
        qici.config = {
            // 项目名，默认为：Game
            projectName: '__PROJECT_NAME__',
        
            // 游戏名字，默认为：未命名
            gameName: '__GAME_NAME__',
        
            // 开发者名字，默认为：DefaultCompany
            companyName: '__COMPANY_NAME__',
        
            // 项目唯一标识，默认为：com.DefaultCompany.Game
            bundleIdentifier: '__BUNDLE_IDENTIFIER__',
        
            // 游戏示例，将作为全局变量访问，默认为：game
            gameInstance: '__GAME_INSTANCE__',

            // 帧率
            frameRate: __FRAMERATE__,
            
            // 游戏背景色
            backgroundColor: __BACKGROUNDCOLOR__,
        
            // 后台运行
            runInBackground: __RUNINBACKGROUND__,
        
            // 抗锯齿
            antialias: __ANTIALIAS__,

            // 渲染方式
            renderer: '__RENDERER__',
        
            // 背景透明
            transparent: __TRANSPARENT__,
        
            // 游戏切屏时的进度界面
            loadingPrefab: '__LOADINGPREFAB__',

            // 开发模式
            developerMode: true,
        
            // 所有的游戏场景
            scene: {
                editor : 'Temp/scene_editor.bin'
                __SCENE_LIST__
            },
            
            // 入口场景
            entryScene : 'editor',
            loading: {
                loadingInterval: 200,
                brightingInterval: 10,
                blinkingCount: 5,
                blinkingInterval: 70,
                fadingInterval: 1
            }
        };
