/*
Game.js
Game module, handles sections of game.
*/

define(["order!lib/three/Three",
        "order!lib/three/ThreeExtras",
        "order!lib/three/postprocessing/ShaderExtras",
        "order!lib/three/postprocessing/EffectComposer",
        "order!lib/three/postprocessing/RenderPass",
        "order!lib/three/postprocessing/ShaderPass",
        "order!lib/three/postprocessing/MaskPass",
        "order!game/workers/Loader",
        "order!game/sections/LauncherSection"],
function() {
    var shared = require('utils/Shared'),
        domElement = shared.html.gameContainer,
        transitioner = shared.html.transitioner,
        launcher = require('game/sections/LauncherSection'),
        renderer, 
        renderTarget, 
        sections, 
        sectionNames, 
        currentSection, 
        previousSection, 
        paused = true,
        transitionOut = 1000, 
        transitionIn = 400;
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    // init three 
    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: false, clearColor: 0x000000, clearAlpha: 0 } );
    renderer.setSize( shared.screenWidth, shared.screenHeight );
    renderer.autoClear = false;
    
    // render target
    renderTarget = new THREE.WebGLRenderTarget( shared.screenWidth, shared.screenHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter } );
    
    // add to game dom element
    domElement.append( renderer.domElement );
    
    // store sections
    sections = {
        launcher : launcher
    };
    sectionNames = ['launcher'];
    
    // share
    shared.renderer = renderer;
    shared.renderTarget = renderTarget;
    
    // game signals
    shared.signals.paused = new signals.Signal();
    shared.signals.resumed = new signals.Signal();
    
    // resize listener
    resize(shared.screenWidth, shared.screenHeight);
    shared.signals.windowresized.add(resize);
    
    /*===================================================
    
    external init
    
    =====================================================*/

    function init() {
        var i, l;
        
        // init each section
        for (i = 0, l = sectionNames.length; i < l; i += 1) {
            sections[sectionNames[i]].init();
        }
        
        // set initial section
        set_section(sections.launcher);
        
        animate();
    }
    
    /*===================================================
    
    functions
    
    =====================================================*/
    
    function find_objs_with_materials (objsList) {
        var obj, objsWithMats = [], i;
        
        for (i = objsList.length - 1; i >= 0; i -= 1) {
            obj = objsList[i];
            
            if (typeof obj.materials !== 'undefined' && obj.materials.length > 0) {
                objsWithMats[objsWithMats.length] = obj;
            }
            else if (obj.children.length > 0)  {
                objsWithMats = objsWithMats.concat(find_objs_with_materials(obj.children));
            }
        }
        
        return objsWithMats;
    }

    function set_section ( section ) {
        // hide current section
        if (typeof currentSection !== 'undefined') {
            
            previousSection = currentSection;
            
            previousSection.hide();
            
            transitioner.fadeTo(transitionIn, 1).promise().done( function () {
                previousSection.remove();
            });
            
        }
        
        // no current section
        currentSection = undefined;
        
        // start and show new section
        if (typeof section !== 'undefined') {
            
            // wait for transitioner to finish fading in
            transitioner.promise().done(function () {
                
                section.resize(shared.screenWidth, shared.screenHeight);
            
                section.show();
                
                currentSection = section;
                
                transitioner.fadeTo(transitionOut, 0);
                
            });
            
        }
    }
    
    function pause () {
        if (paused === false) {
            
            paused = true;
            
            shared.signals.paused.dispatch();
            
        }
    }
    
    function resume () {
        if (paused === true) {
            
            paused = false;
            
            shared.signals.resumed.dispatch();
            
        }
    }
    
    function animate () {
        
        requestAnimationFrame( animate );
        
        if (typeof currentSection !== 'undefined') {
            
            // update section
            
            currentSection.update();
            
        }
        
    }
    
    function resize( W, H ) {
        
        // resize three
        renderer.setSize( W, H );
        renderTarget.width = W;
        renderTarget.height = H;
        
    }

    // return something to define module
    return {
        init: init,
        resume: resume,
        pause: pause,
        domElement: function () { return domElement; },
        paused: function () { return paused; }
    };
});