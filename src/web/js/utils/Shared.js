/*  
Shared.js
Initializes an object that contains shared information across modules. (thanks > ro.me)
*/

define([],
function () {
    // return something to define module
    // shared is intended to be all public properties
    return {
        mouse : { x: 0, y: 0 },
        screenWidth : $(window).width(),
        screenHeight : $(window).height(),
        originLink : window.location.pathname.toString(),
        
        frameRateMax : 60,
        frameRateMin : 20,
        refreshInterval : 1000 / 60,
        
        html: {
            staticMenu: $('#static_menu'),
            gameContainer: $('#game'),
            errorContainer: $('#error_container'),
            transitioner: $('#transitioner')
        },
        
        signals : {

            mousedown : new signals.Signal(),
            mouseup : new signals.Signal(),
            mousemoved : new signals.Signal(),
            mousewheel : new signals.Signal(),

            keydown : new signals.Signal(),
            keyup : new signals.Signal(),

            windowresized : new signals.Signal(),
            
            error : new signals.Signal()
        }
    };
});