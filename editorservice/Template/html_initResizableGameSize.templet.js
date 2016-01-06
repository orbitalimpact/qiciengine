        function initResizableGameSize(){
            var game = window[qici.config.gameInstance];
            game.phaser.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
        
            var gameDiv = document.getElementById('gameDiv'),
                width = document.documentElement.clientWidth - 60,
                height = (Math.min(window.innerHeight, document.documentElement.clientHeight) || document.documentElement.clientHeight) - 60;
        
            gameDiv.style.left = '30px';
            gameDiv.style.top = '30px';
            gameDiv.style.width = width + 'px';
            gameDiv.style.height = height + 'px';
        
            var dragDiv = document.getElementById('dragDiv');
            dragDiv.style.msTouchAction = 'none';
            dragDiv.style.setProperty("-webkit-tap-highlight-color", "rgba(0, 0, 0, 0)", null);
            dragDiv.style.width = '60px';
            dragDiv.style.height = '60px';
            dragDiv.style.borderRadius = '30px';
            dragDiv.style.background = 'rgba(128,128,128,0.5)';
            dragDiv.style.cursor = 'pointer';
            dragDiv.style.left = width + 'px';
            dragDiv.style.top = height + 'px';
        
            var lastClientPoint = null,
                lastWidth = null,
                lastHeight = null;
        
            function getClientPoint(event){
                return {
                    x: event.clientX,
                    y: event.clientY
                };
            }
            
            function handleDown(event){
                event.preventDefault();
                if (game.paused) {
                    return;
                }
                lastClientPoint = getClientPoint(event);
                lastWidth = width;
                lastHeight = height;
            }
            
            function handleMove(event){
                if (event.target === dragDiv) {
                    dragDiv.style.background = 'rgba(128,128,128,0.8)';
                }else {
                    dragDiv.style.background = 'rgba(128,128,128,0.5)';
                }
                if (lastClientPoint) {
                    var clientPoint = getClientPoint(event),
                        dx = clientPoint.x - lastClientPoint.x,
                        dy = clientPoint.y - lastClientPoint.y;
        
                    width = lastWidth + dx;
                    height = lastHeight + dy;

                    adjustGameSize();
                }
            }
        
            function handleUp(event){
                lastClientPoint = null;
                dragDiv.style.background = 'rgba(128,128,128,0.5)';
            }
            
            var adjustGameSize = game.adjustGameSize = function(){
                game.phaser.scale.setGameSize(width, height);

                gameDiv.style.width = width + 'px';
                gameDiv.style.height = height + 'px';
                dragDiv.style.left = width + 'px';
                dragDiv.style.top = height + 'px';

                game.updateScale();                
            };
        
            dragDiv.addEventListener('mousedown', handleDown, false);
            dragDiv.addEventListener('touchstart', handleDown, false);
        
            window.addEventListener('mousemove', handleMove, false);
            window.addEventListener('touchmove', handleMove, false);
        
            window.addEventListener('mouseup', handleUp, false);
            window.addEventListener('touchend', handleUp, false);

            adjustGameSize();
        }


        