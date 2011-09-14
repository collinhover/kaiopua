/*  
Dev.js
Initializes Logger, Stats, and DAT-GUI for development purposes
*/

define(["lib/jquery-1.6.3.min", 
        "lib/requestAnimFrame", 
        "lib/requestInterval", 
        "lib/Logger", 
        "lib/Stats", 
        "lib/DAT.GUI", 
        "utils/Shared",
        "utils/DevCommands"], 
function() {
    var shared = require('utils/Shared'),
        devCommands = require('utils/DevCommands'),
        domElement, isOpen = true, container, stats, logger, 
        gui, guiContainer, guiHeight, 
        frameRate = 60, refreshInt = 1000 / frameRate,
        statsUpdateHandle;

    // stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';

    // stats functions
    function stats_start() {
        // if stats already exists, reset
        stats_stop();

        // start stats updating
        statsUpdateHandle = requestInterval(function() {

            stats.update();

        }, refreshInt);
    }

    function stats_stop() {
        if (typeof statsUpdateHandle !== 'undefined') {
            clearRequestInterval(statsUpdateHandle);
            statsUpdateHandle = undefined;
        }
    }

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
    // - sure there must be a better way :-/
    gui.toggle();
    gui.toggle();

    // set logger height explicitly to gui height
    // DAT.GUI hacked to add property totalHeight and targetHeight
    logger.domElement.style.height = gui.totalHeight + 'px';

    // container
    container = document.createElement('div');
    container.id = 'dev_utils';
    container.style.position = 'absolute';
    container.style.left = '0px';
    container.style.top = '0px';

    // add all dev utils to container
    container.appendChild(logger.domElement);
    container.appendChild(stats.domElement);
    $(container).append(guiContainer);

    // add dev utils to window
    document.body.appendChild(container);
    
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
    resize($(document).width(), $(document).height());

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

    // add listeners to gui toggle
    gui.toggleButton.addEventListener('mouseup', function(e) {
        togglePanel(e);
        e.preventDefault();
        return false;
    }, false);

    // turn dev off initially
    togglePanel();

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
    
    // return an object to define module
    return {
        toggle: togglePanel,
        log: logger.log,
        log_error: function (error, url, lineNumber) {
            logger.log('[ERROR] ' + error);
            logger.log('[ERROR] in file: ' + url);
            logger.log('[ERROR] line # ' + lineNumber);
        },
        add_command: devCommands.add,
        resize: resize,
        isOpen: function () {return isOpen;},
        domElement: container
    };
});