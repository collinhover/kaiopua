/*
Launcher.js
Launcher module, handles loading assets, tutorial, and start menu.
*/
define(["game/sections/launcher/Loader",
        "game/sections/launcher/Tutorial",
        "game/sections/launcher/StartMenu"],
function (loader, tutorial, startMenu) {
    var shared = require('utils/Shared'),
        paused = true;
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    
    
    /*===================================================
    
    functions
    
    =====================================================*/
    
    function show () {
        
        // add listener for resize signal
        shared.signals.windowresized.add(resize);
        
    }
    
    function hide () {
        
        // on completing hide, remove from container
        remove();
        
    }
    
    function remove () {
        
        // remove listener for resize signal
        shared.signals.windowresized.remove(resize);
        
    }
    
    function update () {
        
    }
    
    function resize ( W, H ) {
        
    }
    
    // return something to define module
    return {
        show: show,
        hide: hide,
        update: update
    };
});