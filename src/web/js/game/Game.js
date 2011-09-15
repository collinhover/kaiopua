/*
Game.js
Game module, handles sections of game.
*/
define(["lib/jquery-1.6.3.min",
        "utils/Shared",
        "game/sections/launcher/Launcher"],
    function () {
        var shared = require('utils/Shared'),
            id = 'game';
            domElement = $('#' + id);
        
        // init
        shared.signals.windowresized.add(resize);
        
        // resize
        function resize (W, H) {
            require('utils/Dev').log('resize game');
            domElement.width(W).height(H);
        }
        
        // return something to define module
        return {
            domElement: domElement
        };
    }
);