/**
 * Created by linyiwei on 11/25/15.
 */

// make sure requestAnimationFrame work
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
/**
 * Created by linyiwei on 11/25/15.
 */

// index of loaded asset
qici.loadIndex = 0;

// check if assets load finish
qici.allAssetLoaded = false;

// the flag is set to true when a asset loaded
qici.hasAssetLoaded = false;

qici.init = function() {
    var loadingInterval = qici.config.loading.loadingInterval;
    var brightingInterval = qici.config.loading.brightingInterval;
    var blinkingCount = qici.config.loading.blinkingCount;
    var blinkingInterval = qici.config.loading.blinkingInterval;
    var fadingInterval = qici.config.loading.fadingInterval;

    var loadState = 'loading';
    var tickIndex = -1;
    var lastTime = null;
    var startFadeTime = null;
    var targetRotate;
    var targetX;
    var targetY;

    var gameSVG = document.getElementById("gameSVG");
    var expand = document.getElementById('expand');
    var collapse = document.getElementById('collapse');

    // hide game div
    document.getElementById('gameDiv').style.display = 'none';

    // adjust dots position
    var positions = [
        { x: 133, y: 290, angle: 0 },
        { x: 233, y: 290, angle: 0 },
        { x: 333, y: 290, angle: 0 },
        { x: 433, y: 290, angle: 0 },
        { x: 433, y: 190, angle: 0 },
        { x: 433, y: 90, angle: 0 },
        { x: 333, y: 90, angle: 0 },
        { x: 233, y: 90, angle: 0 },
        { x: 133, y: 90, angle: 0 },
        { x: 133, y: 190, angle: 0 }
    ];
    for (var i = 0; i < 10; i++) {
        var translate = 'translate(' + positions[i].x + '  ' + positions[i].y + ')';
        document.getElementById('bt' + i).setAttribute('transform', translate);
        document.getElementById('dt' + i).setAttribute('transform', translate);
    }

    // load next script
    function loadScript() {

        var totalCount = qici.scripts.length + qici.loadingAssetCount || 0;

        // all the scripts are loaded
        if (qici.loadIndex === qici.scripts.length ) {
            // finish load js scripts
            // begin to load game
            qici.loadGame();

            return;
        }
        else if (qici.loadIndex > qici.scripts.length && qici.loadIndex < totalCount)
            // loading assets
            return;
        else if (qici.loadIndex >= totalCount)
        {
            // assets load finish
            qici.allAssetLoaded  = true;

            // adjust tickIndex for brighting
            tickIndex = (tickIndex + 4) % 20;
            tickIndex = (tickIndex - tickIndex % 2) / 2;

            // switch to collaspe
            expand.style.opacity = '0';
            collapse.style.opacity = '1';
            collapse.setAttribute('transform', 'translate(92, 92) rotate (' + targetRotate +
                ') translate(-92, -92) translate(' + targetX + '  ' + targetY + ') ');

            // begin to brighting
            loadState = 'brighting';
            return;
        }

        var src = qici.scripts[qici.loadIndex];
        var js = document.createElement('script');
        js.onerror = function() {
            console.log('Failed to load:', src);
            qici.loadIndex++;
            updateStep();
            loadScript();
        };
        js.onload = function () {
            qici.loadIndex++;
            updateStep();
            loadScript();
        };
        js.setAttribute('type', 'text/javascript');
        if (typeof src === 'string') {
            js.setAttribute('src', src);
        }
        else {
            js.setAttribute('src', src[0]);
            js.setAttribute('plugin_id', src[1]);
        }
        document.getElementsByTagName('head')[0].appendChild(js);
    }

    // update loading step
    function updateStep() {
        var totalCount = qici.scripts.length + qici.loadingAssetCount || 0;
        var step = qici.loadIndex / totalCount * 10;
        for (var i = 0; i < 10; i++) {
            if (i < step) {
                document.getElementById('bb' + i).style.opacity = '1';
                document.getElementById('db' + i).style.opacity = '0';
            }
            else {
                document.getElementById('bb' + i).style.opacity = '0';
                document.getElementById('db' + i).style.opacity = '1';
            }
        }
    }

    // eating dot when loading
    function eatDot() {
        tickIndex = (tickIndex + 1) % 20;
        var mod = tickIndex % 2;
        var halfIndex = (tickIndex - mod) / 2;

        for (var i = 0; i < 10; i++) {
            var target;
            if (mod === 0) {
                expand.style.opacity = '1';
                collapse.style.opacity = '0';
                target = expand;
            }
            else {
                expand.style.opacity = '0';
                collapse.style.opacity = '1';
                target = collapse;
            }
            var x = positions[halfIndex].x - 70;
            var y = positions[halfIndex].y - 70;
            var transform;
            if (halfIndex <= 3) {
                targetRotate = 0;
                targetX = x;
                targetY = y;
            }
            else if (halfIndex <= 5) {
                targetRotate = -90;
                targetX = -y;
                targetY = x;
            }
            else if (halfIndex <= 8) {
                targetRotate = -180;
                targetX = -x;
                targetY = -y;
            }
            else {
                targetRotate = 90;
                targetX = y;
                targetY = -x;
            }
            target.setAttribute('transform', 'translate(92, 92) rotate (' + targetRotate +
                ') translate(-92, -92) translate(' + targetX + '  ' + targetY + ') ');

            if (i === halfIndex || i === (halfIndex + 1) % 10 || i === (halfIndex + 2) % 10) {
                document.getElementById('bt' + i).style.opacity = '1';
                document.getElementById('dt' + i).style.opacity = '0';
            }
            else {
                document.getElementById('bt' + i).style.opacity = '0';
                document.getElementById('dt' + i).style.opacity = '1';
            }
        }
    }

    // bright the next dots
    function brightDot() {
        tickIndex = (tickIndex + 1) % 10;
        // all the dots are bright
        if(document.getElementById('bt' + tickIndex).style.opacity === '1') {
            // begin to blink dots
            loadState = 'blinking';
        }
        // bright this dot
        document.getElementById('bt' + tickIndex).style.opacity = '1';
        document.getElementById('dt' + tickIndex).style.opacity = '0';
    }

    // blink all dots
    function blinkDot() {
        blinkingCount--;
        // finish blinking
        if (blinkingCount === 0) {
            document.getElementById('dotGroup').style.opacity = '1';

            // begin to show logo
            loadState = 'fading';
            startFadeTime = new Date().getTime();
        }
        else {
            document.getElementById('dotGroup').style.opacity = blinkingCount % 2 ? '1' : '0';
        }
    }

    // fade in QICI logo
    function fading() {
        var time = new Date().getTime();
        var delta = time - startFadeTime;

        var rate = delta / fadingInterval;
        if (rate > 1.5) {
            // finish fade in
            loadState = 'done';
            gameSVG.parentNode.removeChild(gameSVG);
            
            // show game div
            document.getElementById('gameDiv').style.display = 'block';
            
            // adjust game size
            var game = window[qici.config.gameInstance];

            delete game.state.loadingAnimation;
            if (game.state.delayCreateCallback) {
                game.state.delayCreateCallback();
            }
            
            if (game.adjustGameSize) {
                game.adjustGameSize(true);
            }
            else {
                game.updateScale(true);    
            }
        }
        else {
            if (rate > 1) rate = 1;
            document.getElementById('fadeOutGroup').style.opacity = 1 - rate;
            document.getElementById('qiciText').style.opacity = rate;
            var rotate = targetRotate + (45 - targetRotate) * rate;
            var x = targetX + (300 - targetX) * rate;
            var y = targetY + (0 - targetY) * rate;
            collapse.setAttribute('transform', 'translate(92, 92) rotate (' + rotate +
                ') translate(-92, -92) translate(' + x + '  ' + y + ') ');
        }
    }

    // Animation for loading scripts
    function tick() {
        if (loadState === 'done') {
            return;
        }
        requestAnimationFrame(tick);

        var time = new Date().getTime();
        if (lastTime) {
            var deltaTime = time - lastTime;
            if (loadState === 'loading' && deltaTime < loadingInterval) {
                return;
            }
            if (loadState === 'brighting' && deltaTime < brightingInterval) {
                return;
            }
            if (loadState === 'blinking' && deltaTime < blinkingInterval) {
                return;
            }
        }
        lastTime = time;

        var width = document.documentElement.clientWidth;
        if (window.innerWidth && window.innerWidth < width) {
            width = window.innerWidth;
        }
        var height = document.documentElement.clientHeight;
        if (window.innerHeight && window.innerHeight < height) {
            height = window.innerHeight;
        }
        gameSVG.setAttribute('width', width + "px");
        gameSVG.setAttribute('height', height + "px");

        if (loadState === 'loading') {
            eatDot();
        }
        else if (loadState === 'brighting') {
            brightDot();
        }
        else if (loadState === 'blinking') {
            blinkDot();
        }
        else if (loadState === 'fading') {
            fading();
        }

        // If a asset loaded, update step
        if (qici.hasAssetLoaded)
        {
            qici.hasAssetLoaded = false;
            loadScript();
            updateStep();
        }
    }

    gameSVG.style.opacity = '1';
    tick();
    loadScript();
    updateStep();
};

// callback of loading process notify
qici.loadAssetsNotify = function() {

    if (qici.allAssetLoaded)
        // loading finish
        return;

    // one asset loaded
    qici.loadIndex++;
    qici.hasAssetLoaded = true;

    //console.log('loadAssetsNotify', qici.loadIndex);
};

/**
 * @author weism
 */
qici.loadGame = function() {
    var game = window[qici.config.gameInstance] = new qc.Game({
        width: '100%',
        height: '100%',
        parent: 'gameDiv',
        state: qici.splashState,
        editor: qici.config.editor === true,
        backgroundColor: new qc.Color(qici.config.backgroundColor),
        runInBackground: qici.config.runInBackground,
        antialias: qici.config.antialias,
        resolution : qici.config.resolution,
        transparent: qici.config.transparent,
        debug: qici.config.developerMode === true,
        renderer: (function() {
            if (qici.config.renderer === 'WebGL') {
                return Phaser.WEBGL;
            }
            if (qici.config.renderer === 'Canvas'){
                return Phaser.CANVAS;
            }
            return Phaser.AUTO;
        })()
    });

    game.loadingProcessCallback = qici.loadAssetsNotify;
    game.bundleIdentifier = qici.config.bundleIdentifier;
    game.log.important('**** [QICI Engine]Starting game: {0}', qici.config.gameName);
};

qici.splashState = {
    init: function() {
        window[qici.config.gameInstance].fullScreen();
    },
    preload: function() {
        var game = window[qici.config.gameInstance];
        if (qici.config.loadingPrefab) {
            game.assets.load('__loading_prefab__', qici.config.loadingPrefab);
        }

        var text = game.add.text();
        text.text = 'Initializing, please wait ...';
        text.setAnchor(new qc.Point(0, 0), new qc.Point(1, 1));
        text.left = 0;
        text.right = 0;
        text.top = 0;
        text.bottom = 0;
        text.alignH = qc.UIText.CENTER;
        text.alignV = qc.UIText.MIDDLE;
        text.fontSize = 24;
        text.color = new qc.Color(0xffffff);
        text.strokeThickness = 2;
        text.stroke = new qc.Color(0x000000);
        game._initText_ = text;
        game.updateScale(true);
    },
    create: function() {
        var game = window[qici.config.gameInstance];
        game.state.entry = qici.config.entryScene;
        game.state.list = qici.config.scene;
        var node;
        if (qici.config.loadingPrefab) {
            var prefab = game.assets.find('__loading_prefab__');
            if (prefab) {
                node = game.add.clone(prefab);
                node.ignoreDestroy = true;
                node.visible = false;
            }
        }
        if (game._initText_) {
            if (node) {
                game._initText_.destroyImmediately();
            }
            delete game._initText_;
        }
        game.state.loadingAnimation = true;
        game.timer.add(1, function() { game.state.load(game.state.entry, true); });
    }
};

/**
 * Created by linyiwei on 11/25/15.
 */

document.write('\
<svg id="gameSVG" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"\
x="0px" y="0px" width="610px" height="610px" viewBox="-200 -200 1010 1010"\
style="opacity:0;background:black;position:absolute;top:0;left:0;z-index:10000">\
<defs>\
    <filter id="shadow" filterUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">\
    <feGaussianBlur result="blurOut" in="SourceGraphic" stdDeviation="10"/>\
<feBlend in="SourceGraphic" in2="blurOut" mode = "normal"/>\
    </filter>\
    <path id="brightdot" filter="url(#shadow)" fill-rule="evenodd" clip-rule="evenodd" fill="#F7DA80" d="M16.26,11.26h10c2.761,0,5,2.238,5,5v10c0,2.761-2.239,5-5,5h-10\
c-2.762,0-5-2.239-5-5v-10C11.26,13.498,13.498,11.26,16.26,11.26z"/>\
<path id="darkdot" filter="url(#shadow)" fill-rule="evenodd" clip-rule="evenodd" fill="#7F8080" d="M16.26,11.26h10c2.761,0,5,2.238,5,5v10c0,2.761-2.239,5-5,5h-10\
c-2.762,0-5-2.239-5-5v-10C11.26,13.498,13.498,11.26,16.26,11.26z"/></defs>\
<g id="fadeOutGroup">\
    <path fill-rule="evenodd" clip-rule="evenodd" fill="none" stroke="#2A4D9F" stroke-miterlimit="10" d="M9.724,4.724h590\
c2.761,0,5,2.239,5,5v590c0,2.761-2.239,5-5,5h-590c-2.761,0-5-2.239-5-5v-590C4.724,6.963,6.963,4.724,9.724,4.724z"/>\
<path transform="translate(75 428)" fill-rule="evenodd" clip-rule="evenodd" fill="none" stroke="#2A4D9F" stroke-miterlimit="10" d="M6.771,1.929h440\
c2.761,0,5,2.239,5,5v40c0,2.761-2.239,5-5,5h-440c-2.762,0-5-2.239-5-5v-40C1.771,4.168,4.01,1.929,6.771,1.929z"/>\
<g id="dotGroup">\
    <use id="dt0" xlink:href="#darkdot" />\
    <use id="dt1" xlink:href="#darkdot" />\
    <use id="dt2" xlink:href="#darkdot" />\
    <use id="dt3" xlink:href="#darkdot" />\
    <use id="dt4" xlink:href="#darkdot" />\
    <use id="dt5" xlink:href="#darkdot" />\
    <use id="dt6" xlink:href="#darkdot" />\
    <use id="dt7" xlink:href="#darkdot" />\
    <use id="dt8" xlink:href="#darkdot" />\
    <use id="dt9" xlink:href="#darkdot" />\
\
    <use id="bt0" xlink:href="#brightdot" />\
    <use id="bt1" xlink:href="#brightdot" />\
    <use id="bt2" xlink:href="#brightdot" />\
    <use id="bt3" xlink:href="#brightdot" />\
    <use id="bt4" xlink:href="#brightdot" />\
    <use id="bt5" xlink:href="#brightdot" />\
    <use id="bt6" xlink:href="#brightdot" />\
    <use id="bt7" xlink:href="#brightdot" />\
    <use id="bt8" xlink:href="#brightdot" />\
    <use id="bt9" xlink:href="#brightdot" />\
\
    <use id="db0" xlink:href="#darkdot" transform="translate(88 432)" />\
    <use id="db1" xlink:href="#darkdot" transform="translate(131 432)" />\
    <use id="db2" xlink:href="#darkdot" transform="translate(174 432)" />\
    <use id="db3" xlink:href="#darkdot" transform="translate(217 432)" />\
    <use id="db4" xlink:href="#darkdot" transform="translate(260 432)" />\
    <use id="db5" xlink:href="#darkdot" transform="translate(303 432)" />\
    <use id="db6" xlink:href="#darkdot" transform="translate(346 432)" />\
    <use id="db7" xlink:href="#darkdot" transform="translate(389 432)" />\
    <use id="db8" xlink:href="#darkdot" transform="translate(432 432)" />\
    <use id="db9" xlink:href="#darkdot" transform="translate(475 432)" />\
\
    <use id="bb0" xlink:href="#brightdot" transform="translate(88 432)" />\
    <use id="bb1" xlink:href="#brightdot" transform="translate(131 432)" />\
    <use id="bb2" xlink:href="#brightdot" transform="translate(174 432)" />\
    <use id="bb3" xlink:href="#brightdot" transform="translate(217 432)" />\
    <use id="bb4" xlink:href="#brightdot" transform="translate(260 432)" />\
    <use id="bb5" xlink:href="#brightdot" transform="translate(303 432)" />\
    <use id="bb6" xlink:href="#brightdot" transform="translate(346 432)" />\
    <use id="bb7" xlink:href="#brightdot" transform="translate(389 432)" />\
    <use id="bb8" xlink:href="#brightdot" transform="translate(432 432)" />\
    <use id="bb9" xlink:href="#brightdot" transform="translate(475 432)" />\
    </g>\
    </g>\
    <g id="qiciText" style="opacity:0;" transform="translate(105 415)" filter="url(#shadow)">\
    <path fill="#F7DA80" d="M20.225,65.547V13.094H64.1v52.453H51.584l1.969,6.398h-11.25l-2.109-6.398H20.225L20.225,65.547\
L20.225,65.547z M53.413,55.563V23.078h-22.5v32.484H53.413L53.413,55.563L53.413,55.563z"/>\
<path fill="#F7DA80" d="M158.291,65.547h-10.828V13.094h10.828V65.547L158.291,65.547L158.291,65.547z"/>\
    <path fill="#F7DA80" d="M282.435,65.547h-40.922V13.094h40.922v9.984h-30.094v32.484h30.094V65.547L282.435,65.547L282.435,65.547z"/>\
    <path fill="#F7DA80" d="M376.625,65.547h-10.828V13.094h10.828V65.547L376.625,65.547L376.625,65.547z"/>\
    </g>\
    <path id="collapse" style="opacity:0;" filter="url(#shadow)" fill-rule="evenodd" clip-rule="evenodd" fill="#F7DA80" d="M132.148,82.202L97.465,47.408\
c-1.298-1.302-3.406-1.306-4.708-0.008L50.325,89.697c-1.302,1.298-1.305,3.405-0.007,4.708l42.304,42.439\
c1.298,1.302,3.406,1.306,4.708,0.008l34.789-34.678l23.538,0.04l-53.647,53.477c-3.906,3.893-10.229,3.882-14.123-0.024\
L31.48,99.081c-3.894-3.906-3.884-10.229,0.021-14.123l56.577-56.396c3.906-3.894,10.229-3.883,14.123,0.023l53.485,53.656\
L132.148,82.202z"/>\
<path id="expand" style="opacity:0;" filter="url(#shadow)" fill-rule="evenodd" clip-rule="evenodd" fill="#F7DA80" d="M129.992,55.139L87.562,30.687\
c-1.588-0.915-3.623-0.374-4.546,1.21L50.434,89.732c-1.301,1.298-1.304,3.408-0.007,4.71l32.437,57.744\
c0.916,1.597,2.951,2.146,4.545,1.226l42.604-24.58l22.728,6.131L87.04,172.868c-4.784,2.759-10.889,1.112-13.637-3.679\
L33.601,99.787c-2.748-4.791-2.808-11.222-0.04-15.972l40.091-68.805c2.768-4.75,8.873-6.375,13.637-3.629l65.432,37.708\
L129.992,55.139z"/>\
</svg>');