/*
Game.js
Game module, handles sections of game.
*/

define(["order!lib/Three",
        "order!lib/ThreeExtras",
        "game/sections/launcher/Launcher"],
function() {
    var shared = require('utils/Shared'),
        launcher = require('game/sections/launcher/Launcher'),
        domElement = shared.gameContainer,
        renderer, renderTarget, sections, currentSection, paused = true;
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    // init three 
    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( shared.screenWidth, shared.screenHeight );
    
    // render target
    renderTarget = new THREE.WebGLRenderTarget( shared.screenWidth, shared.screenHeight );
    renderTarget.minFilter = THREE.LinearFilter;
    renderTarget.magFilter = THREE.NearestFilter;
    
    // add to game dom element
    domElement.append( renderer.domElement );
    
    // store sections
    sections = {
        launcher : launcher
    };
    
    // share
    shared.renderer = renderer;
    shared.renderTarget = renderTarget;
    
    // resize listener
    shared.signals.windowresized.add(resize);
    
    /*===================================================
    
    external init
    
    =====================================================*/

    function init() {
        
        set_section(sections.launcher);
        
        start_updating();
        
    }
    
    /*===================================================
    
    functions
    
    =====================================================*/

    function set_section ( section ) {
        // hide current section
        if (typeof currentSection !== 'undefined') {
            currentSection.hide();
        }
        
        // show new section
        section.show();
        
        // store new as current
        currentSection = section;
    }
    
    function start_updating () {
        if (paused === true) {
            paused = false;
            update();
        }
    }
    
    function stop_updating () {
        paused = true;
    }
    
    function update () {
        if (paused === false) {
            window.requestAnimFrame( update );
            
            if (typeof currentSection !== 'undefined') {
                currentSection.update();
            }
        }
    }
    
    function resize( W, H ) {
        // resize game container
        domElement.width(W).height(H);
        
        // resize three
        renderer.setSize( W, H );
        renderTarget.width = W;
        renderTarget.height = H;
    }

    // return something to define module
    return {
        init: init,
        start_updating: start_updating,
        stop_updating: stop_updating,
        domElement: domElement,
        paused: function () { return paused; }
    };
});