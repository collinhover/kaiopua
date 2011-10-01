/*
Game.js
Game module, handles sections of game.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        loader = main.loader = main.loader || {},
        game = main.game = main.game || {},
        sections = game.sections = game.sections || {},
        workers = game.workers = game.workers || {},
        transitioner = workers.transitioner = workers.transitioner || {},
        menus = game.menus = game.menus || {},
        domElement,
        transitioner,
        menumaker,
        renderer, 
        renderTarget,
        currentSection, 
        previousSection, 
        paused = true,
        transitionOut = 1000, 
        transitionIn = 400,
        loadAssetsDelay = 500,
        dependencies = [
            "js/lib/three/Three.js",
            "js/lib/three/ThreeExtras.js",
            "js/lib/three/postprocessing/ShaderExtras.js",
            "js/lib/three/postprocessing/EffectComposer.js",
            "js/lib/three/postprocessing/RenderPass.js",
            "js/lib/three/postprocessing/ShaderPass.js",
            "js/lib/three/postprocessing/MaskPass.js",
            "js/effects/LinearGradient.js",
            "js/effects/FocusVignette.js",
            "js/game/workers/MenuMaker.js",
            "js/game/sections/LauncherSection.js",
            "js/game/sections/launcher/Water.js",
            "js/game/sections/launcher/Sky.js"
        ],
        gameAssets = [
            "assets/models/kaiopua_head.js"
        ];
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init() {
        
        // get dependencies
        
        loader.show();
        
        loader.load( dependencies , function () {
            loader.hide();
            init_basics();
        });
        
    }
    
    function init_basics () {
        var i, l;
        
        domElement = shared.html.gameContainer;
        
        // transitioner
        
        
        transitioner.domElement = document.createElement( 'div' );
        $(transitioner.domElement).addClass('transitioner');
        
        // workers
        
        menumaker = game.workers.menumaker;
        
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
        
        // start drawing
        
        animate();
        
        
        // pause for short delay
        // start loading all game assets
        window.requestTimeout( function () {
            
            loader.show();
            
            loader.load( gameAssets , function () {
                loader.hide();
                init_startmenu();
            });
            
        }, loadAssetsDelay);
        
    }
    
    /*===================================================
    
    start
    
    =====================================================*/
    
    function init_startmenu() {
        var ms;
        
        // init start menu
        
        ms = menus.start = menumaker.make_menu( {
            id: 'start_menu',
            width: 260
        } );
        
        ms.add_item( menumaker.make_button( 'Start', function () {
            start();
        }, false, 'item_big'  ) );
        ms.add_item( menumaker.make_button( 'Continue', function () {}, true ) );
        ms.add_item( menumaker.make_button( 'Options', function () {}, true ) );
        
        //ms.itemsByID.Continue.enable();
        
        ms.keep_centered();
        
        // hide instantly then show start menu
        
        ms.hide( 0 );
        
        ms.show( domElement );
        
    }
    
    function start() {
        var ms = menus.start;
        
        // disable start menu
        ms.disable();
        
        // hide start menu
        ms.hide();
        
        // set next section
        
    }
    
    /*===================================================
    
    functions
    
    =====================================================*/

    function set_section ( section ) {
        
        // hide current section
        if (typeof currentSection !== 'undefined') {
            
            previousSection = currentSection;
            
            previousSection.hide();
            
            $(domElement).append(transitioner.domElement);
            
            $(transitioner.domElement).fadeTo(transitionIn, 1).promise().done( function () {
                
                $(transitioner.domElement).detach();
                
                previousSection.remove();
                
            });
            
        }
        
        // no current section
        currentSection = undefined;
        
        // start and show new section
        if (typeof section !== 'undefined') {
            
            // wait for transitioner to finish fading in
            $(transitioner.domElement).promise().done(function () {
                
                $(domElement).append(transitioner.domElement);
                
                section.resize(shared.screenWidth, shared.screenHeight);
                
                section.show();
                
                currentSection = section;
                
                $(transitioner.domElement).fadeTo(transitionOut, 0).promise().done(function () {
                    $(transitioner.domElement).detach();
                });
                
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
    game.get_dom_element = function () { return domElement; };
    game.paused = function () { return paused; };
        
    return main; 
    
}(KAIOPUA || {}));