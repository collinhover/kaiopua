/*  
Dev.js
Initializes Logger, Stats, and DAT-GUI for development purposes
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/utils/Dev",
        dev = {},
        devCommands,
        domElement, isOpen = true, stats, logger, 
        gui, guiContainer, guiHeight, statsPaused = true,
        dependencies = [
			"assets/modules/utils/DevCommands.js",
            "js/lib/Logger.js", 
            "js/lib/Stats.js", 
            "js/lib/DAT.GUI.js"
        ];
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    dev.toggle = togglePanel;
    dev.log = function (msg, expand) { 
        if (typeof logger !== 'undefined') {
            logger.log(msg, expand); 
        }
    };
    dev.log_error = function (error, url, lineNumber) {
        if (typeof logger !== 'undefined') {
            logger.log('[ERROR] ' + error);
            logger.log('[ERROR] in file: ' + url);
            logger.log('[ERROR] line # ' + lineNumber);
        }
    };
    dev.gui = function () { return gui; };
    dev.resize = resize;
    dev.isOpen = function () {return isOpen;};
    dev.domElement = function () { return domElement; };
	
	dev = main.asset_register( assetPath, dev, true );
    
    /*===================================================
    
    internal init
    
    =====================================================*/
	
	main.assets_require( dependencies, init, true );
    
    function init( d ) {
		
        devCommands = d;
        
        // stats
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        
        // logger
        logger = new Logger();
        $(logger.domElement).css({
            position: 'absolute',
            overflow: 'auto',
            padding: '0',
            opacity: '0.8',
            backgroundColor: '#333',
            color: '#fcd700',
            'font-size': '13px'
        });
        // override log function to autoscroll to bottom of domElement
        logger.oldLog = logger.log;
        logger.log = function (msg, expand) {
            logger.oldLog(msg, expand);
            logger.domElement.scrollTop = logger.domElement.scrollHeight;
        };
    
        // gui
        // DAT.GUI hacked to add property to disable drag
        gui = new DAT.GUI({
            height: 200,
            dragAllowed: false,
            closeString: 'Close Dev Console',
            openString: 'Open Dev Console'
        });
        guiContainer = $('#guidat');
        gui.domElement.style.margin = '0';
        
        // gui elements
        gui.add(devCommands, 'current').name('CMD?').onFinishChange(function(newCmd) {
            logger.log('[DEV CMD] ' + newCmd);
            devCommands.execute(newCmd);
        });
        gui.add(logger, 'clear').name('Clear Log');
    
        // force the gui to calculate the correct height
        // there must be a better way
        gui.toggle();
        gui.toggle();
    
        // set logger height explicitly to gui height
        // DAT.GUI hacked to add property totalHeight and targetHeight
        logger.domElement.style.height = gui.totalHeight + 'px';
    
        // container
        domElement = document.createElement('div');
        domElement.id = 'dev_utils';
        domElement.style.position = 'absolute';
        domElement.style.left = '0px';
        domElement.style.top = '0px';
    
        // add all dev utils to container
        domElement.appendChild(logger.domElement);
        domElement.appendChild(stats.domElement);
        $(domElement).append(guiContainer);
    
        // add dev utils to window
        $(document.body).append(domElement);
        
        // add listeners to gui toggle
        gui.toggleButton.addEventListener('mouseup', function(e) {
            togglePanel(e);
            e.preventDefault();
            return false;
        }, false);
    
        // turn dev off initially
        togglePanel();
        
        // resize signal
        resize(shared.screenWidth, shared.screenHeight);
        shared.signals.windowresized.add(resize);
    
        // add dev commands
        devCommands.add({
            cmd_hist: function(modifier) {
                if (modifier === 'clear') {
                    logger.log('Cleared dev cmd history!');
                    devCommands.clear_history();
                }
                else {
                    logger.log('Showing dev cmd history:');
                    logger.log(devCommands.get_history(), true);
                }
            }
        });
		
		main.asset_ready( assetPath );
		
    }
    
    /*===================================================
    
    functions
    
    =====================================================*/
    
    // stats functions
    function stats_start() {
        if (statsPaused === true) {
            statsPaused = false;
            stats_update();
        }
    }

    function stats_stop() {
        statsPaused = true;
    }
    
    function stats_update() {
        if (statsPaused === false) {
            requestAnimationFrame( stats_update );
            stats.update();
        }
    }
    
    // self toggle on/off
    function togglePanel(e) {
        // open?
        isOpen = !isOpen;
        
        // close gui if open
        if (typeof e === 'undefined' || (typeof e === 'undefined' && gui.appearanceVars()[0] === true)) {
            gui.toggle();
        }

        // turn logger and stats off
        $(logger.domElement).toggle();
        $(stats.domElement).toggle();

        // start stats
        if (isOpen) {
            stats_start();
        }
        else {
            stats_stop();
        }
    }
    
    // resize dev utils
    function resize(W, H) {
        var statsDE = stats.domElement,
            logDE = logger.domElement,
            guiDE = gui.domElement,
            spaceW = 5,
            spaceH = 5,
            initX = spaceW,
            initY = spaceH,
            currX = initX,
            currY = initY,
            statsW = $(statsDE).width(),
            guiW = guiContainer.width();

        // gui - far right
        guiContainer.css({
            right: spaceW,
            top: spaceH
        });

        // stats
        $(statsDE).css({
            left: W - statsW - $(guiDE).width() - (spaceW * 2),
            top: spaceH
        });

        // logger
        $(logDE).css({
            left: spaceW,
            top: spaceH
        });
        $(logDE).width(W - (spaceW * 3) - $(guiDE).width());
    }
    
    return main; 
    
}(KAIOPUA || {}));