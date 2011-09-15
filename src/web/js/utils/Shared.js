/*  
Shared.js
Initializes an object that contains shared information across modules. (thanks > ro.me)
*/

define(["lib/signals.min"],
function () {
    // return something to define module
    // shared is intended to be all public properties
    return {
        mouse : { x: 0, y: 0 },
        screenWidth : window.innerWidth,
        screenHeight : window.innerHeight,
        loadedContent : false,
        originLink : window.location.pathname.toString(),
        
        signals : {

            mousedown : new signals.Signal(),
            mouseup : new signals.Signal(),
            mousemoved : new signals.Signal(),
            mousewheel : new signals.Signal(),

            keydown : new signals.Signal(),
            keyup : new signals.Signal(),

            windowresized : new signals.Signal(),

            load : new signals.Signal(),
            loadBegin : new signals.Signal(),
            loadItemAdded : new signals.Signal(),
            loadItemCompleted : new signals.Signal()
            
        },
        
        lastGamma: 0,
        lastBeta: 0
    };
});