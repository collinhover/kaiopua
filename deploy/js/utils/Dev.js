/*  
Dev.js
Initializes Logger, Stats, and DAT-GUI for development purposes
*/

define(["lib/jquery-1.6.3.min",
        "lib/requestAnimFrame", 
        "lib/requestInterval", 
        "lib/requestTimeout",
        "utils/Shared",
        "lib/Logger",
        "lib/Stats",
        "lib/DAT.GUI"],
function(Shared) {
    var domElement, container, stats, logger, gui, guiContainer, guiHeight, frameRate, refreshInt, statsUpdateHandle;
    
    frameRate = 60;
    refreshInt = 1000 / frameRate;
    
    // stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    
    // stats functions
    function stats_start () {
        // if stats already exists, reset
        stats_stop();
        
        // start stats updating
        statsUpdateHandle = requestInterval( function () {
        
            stats.update();
        
        }, refreshInt );
    }
    function stats_stop () {
        if (typeof statsUpdateHandle !== 'undefined') {
            clearRequestInterval( statsUpdateHandle );
            statsUpdateHandle = undefined;
        }
    }
    
    // start stats
    stats_start();
    
    // logger
    logger = new Logger();
    logger.domElement.style.position = 'absolute';
    logger.domElement.style.overflow = 'auto';
    logger.domElement.style.padding = '0';
    logger.domElement.style.opacity = '0.8';
    logger.domElement.style.backgroundColor = '#333';
    logger.domElement.style.color = '#fff';
    
    // gui
    // DAT.GUI hacked to add property to disable drag
    gui = new DAT.GUI({height: 200, dragAllowed: false, closeString: 'Close Dev Console', openString: 'Open Dev Console'});
    guiContainer = $('#guidat');
    gui.domElement.style.margin = '0';
    
    // gui elements
    gui.add(logger, 'clear').name('Clear Log');
    
    // force the gui to calculate the correct height
    // - sure there must be a better way :-/
    gui.toggle();
    gui.toggle();
    
    // add listeners to gui toggle
    gui.toggleButton.addEventListener('mouseup', function(e) {
        // turn logger and stats off
        $(logger.domElement).toggle();
        $(stats.domElement).toggle();
        
        // start stats
        if (typeof statsUpdateHandle !== 'undefined') {
            stats_start();
        }
        else {
           stats_stop();     
        }
        
        e.preventDefault();
        return false;
    }, false);
    
    // set logger height explicitly to gui height
    // DAT.GUI hacked to add property totalHeight and targetHeight
    logger.domElement.style.height = gui.totalHeight + 'px';
    
    // container
    container = document.createElement( 'div' );
    container.id = 'dev_utils';
    container.style.position = 'absolute';
    container.style.left = '0px';
    container.style.top = '0px';
    
    // add all dev utils to container
    container.appendChild( logger.domElement );
    container.appendChild( stats.domElement );
    $(container).append( guiContainer );
    
    // resize dev utils
    function resize (W, H) {
        var statsDE = stats.domElement,
            logDE = logger.domElement,
            guiDE = gui.domElement,
            spaceW = 5, spaceH = 5,
            initX = spaceW, initY = spaceH,
            currX = initX, currY = initY,
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
        $(logDE).width(W - ( spaceW * 3 ) - $(guiDE).width());
    }
    resize( $(document).width(), $(document).height() );
    
    // add dev utils to window
    document.body.appendChild( container );
    
    // return an object to define module
    return {
        resize: resize,
        domElement: container,
        stats_stop: stats_stop,
        stats_start: stats_start
    };
});