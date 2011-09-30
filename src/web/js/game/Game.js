/*
Game.js
Game module, handles sections of game.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        sections = game.sections = game.sections || {},
        domElement,
        transitioner,
        renderer, 
        renderTarget,
        currentSection, 
        previousSection, 
        paused = true,
        transitionOut = 1000, 
        transitionIn = 400,
        dependencies = [
            "js/lib/three/Three.js",
            "js/lib/three/ThreeExtras.js",
            "js/lib/three/postprocessing/ShaderExtras.js",
            "js/lib/three/postprocessing/EffectComposer.js",
            "js/lib/three/postprocessing/RenderPass.js",
            "js/lib/three/postprocessing/ShaderPass.js",
            "js/lib/three/postprocessing/MaskPass.js",
            "js/game/sections/LauncherSection.js",
            "js/effects/LinearGradient.js",
            "js/effects/FocusVignette.js",
            "js/game/sections/launcher/StartMenu.js",
            "js/game/sections/launcher/Water.js",
            "js/game/sections/launcher/Sky.js"
        ];
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init() {
        
        // get dependencies
        
        main.loader.show();
        
        main.loader.load( dependencies , function () {
            main.loader.hide();
            start();
        });
        
    }
    
    function start () {
        var i, l;
        
        domElement = shared.html.gameContainer;
        transitioner = shared.html.transitioner;
        
        // init three 
        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: false, clearColor: 0x000000, clearAlpha: 0 } );
        renderer.setSize( shared.screenWidth, shared.screenHeight );
        renderer.autoClear = false;
        
        // render target
        renderTarget = new THREE.WebGLRenderTarget( shared.screenWidth, shared.screenHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter } );
        
        // add to game dom element
        domElement.append( renderer.domElement );
        
        // get section names
        sectionNames = [];
        for ( i in sections ) {
           if ( sections.hasOwnProperty( i ) ) {
               sectionNames.push(i);
           }
        }
        
        // share
        shared.renderer = renderer;
        shared.renderTarget = renderTarget;
        
        // game signals
        shared.signals = shared.signals || {};
        shared.signals.paused = new signals.Signal();
        shared.signals.resumed = new signals.Signal();
        
        // resize listener
        resize(shared.screenWidth, shared.screenHeight);
        shared.signals.windowresized.add(resize);
        
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

    /*===================================================
    
    public properties
    
    =====================================================*/
    
    game.init = init;
    game.resume = resume;
    game.pause = pause;
    game.domElement = function () { return domElement; };
    game.paused = function () { return paused; };
        
    return main; 
    
}(KAIOPUA || {}));