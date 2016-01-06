        function init() {
            // load scripts
            var scriptIndex = 0;
            function loadScript() {
                // all scripts are loaded
                if (scriptIndex === scripts.length) {
                    loadGame();
                    return;
                }
        
                // load next script
                var src = scripts[scriptIndex];
                var js = document.createElement('script');
                js.onerror = function() {
                    alert('Failed to load:' + scr);
                };
                js.onload = function () {
                    scriptIndex++;
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
            loadScript();
        }