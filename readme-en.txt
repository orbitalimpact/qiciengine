Welcome to QICI Engine!
=============================================================================
Introduction

QICI Engine is a free and open source JavaScript game engine library with a web-based comprehensive suite of toolset for making HTML5 games. 

Github: http://github.com/qiciengine/qiciengine
Download: http://github.com/qiciengine/qiciengine/blob/master/release-notes.md
Docs: http://docs.qiciengine.com/manual/index.html
API: http://docs.qiciengine.com/api/game/index.html
Demos: http://engine.qiciengine.com/demo/
Twitter: http://twitter.com/qiciengine
Slack: http://qiciengine.slack.com
Ask: http://ask.qiciengine.com/

For more information, please visit: http://www.qiciengine.com
=============================================================================
The file and folder structure of QICI Editor:

/Plugins                    All QICI Engine plugins	
/editorservice              Node.js server directory
    /StartService.js        Server startup file	
/lib                        JavaScript libraries
    /phaser.js              Uncompressed, development version of Phaser 2.3.0 JavaScript library
    /phaser.min.js          Compressed, production version of Phaser 2.3.0 JavaScript library
    /qc-core-debug.js       Uncompressed, development version of QICI Core JavaScript library
    /qc-core.js             Compressed, production version of QICI Core JavaScript library
    /qc-loading-debug.js    Uncompressed, development version of game loading JavaScript library
    /qc-loading.js          Compressed, production version of game loading JavaScript library
    /webfontloader.js       Web Font Loader: https://github.com/typekit/webfontloader
/node_modules               All node modules needed for running server
package.json                Project information for npm install
start-mac.command           Startup file for Mac OS X: node ./editorservice/StartService.js
start-win.bat               Startup for Windows: node ./editorservice/StartService.js
=============================================================================
Installation 

If you already have Node.js installed, please update it to latest version. the Node.js versions that QICI Engine supports are:

Any v0.12.x version before io.js merged with Node.js
Any version higher than v4.1 after io.js merged with Node.js

For more information, please visit: http://docs.qiciengine.com/manual/Overview/Install.html
=============================================================================
Run

Double click on the start-mac.command or start-win.bat file depending on your OS to run the server, then the default browser will be opened to visit http://localhost:5002/project.html URL automatically. Also you can run "node ./editorservice/StartService.js" command under the directory of unzip QICI Engine package to run the server.

Handle failure:
1. Make sure the lastest Node.js is installed.
2. Remove the node_modules directory, reinstall it by running command "npm install"
=============================================================================
