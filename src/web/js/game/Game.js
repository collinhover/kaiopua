/*
Game.js
Game module, handles sections of game.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        utils = main.utils = main.utils || {},
        loader = utils.loader = utils.loader || {},
        uihelper = utils.uihelper = utils.uihelper || {},
        game = main.game = main.game || {},
        sections = game.sections = game.sections || {},
        workers = game.workers = game.workers || {},
        menus = game.menus = game.menus || {},
        transitioner,
        domElement,
        menumaker,
        renderer, 
        renderTarget,
        sectionNames = [],
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
            "js/game/workers/MenuMaker.js"
        ],
        launcherAssets = [
            "js/game/sections/LauncherSection.js",
            "js/game/sections/launcher/Water.js",
            "js/game/sections/launcher/Sky.js",
            "assets/textures/cloud256.png",
            "assets/textures/light_ray.png"
        ],
        gameAssets = [
            "js/game/sections/IntroSection.js",
            { path: "assets/models/kaiopua_head.js", type: 'model' }
        ];
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init() {
        
        domElement = shared.html.gameContainer;
        
        // get dependencies
        
        loader.load( dependencies , function () {
            init_basics();
        });
        
    }
    
    function init_basics () {
        var i, l;
        
        // transitioner
        transitioner = uihelper.make_ui_element({
            classes: 'transitioner'
        });
        
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
        
        // start drawing
        
        animate();
        
        // get launcher
        
        loader.load( launcherAssets , function () {
            init_launcher();
        });
        
    }
    
    function init_launcher () {
        
        // update sections
        
        update_section_list();
        
        // set launcher section
        
        set_section( sections.launcher );
        
        // pause for short delay
        // start loading all game assets
        
        window.requestTimeout( function () {
            
            loader.ui_hide( false, 0);
            
            loader.ui_show( domElement );
            
            loader.load( gameAssets , function () {
                loader.ui_hide( true, undefined, function () {
                    init_game();
                });
            });
            
        }, loadAssetsDelay);
    }
    
    function init_game() {
        var ms;

        // update sections
        
        update_section_list();
        
        // init start menu
        
        ms = menus.start = menumaker.make_menu( {
            id: 'start_menu',
            width: 260
        } );
        
        ms.add_item( menumaker.make_button( {
            id: 'Start', 
            callback: function () {
                start_game();
            },
            staticPosition: true,
            classes: 'item_big'
        } ) );
        ms.add_item( menumaker.make_button( {
            id: 'Continue', 
            callback: function () {},
            staticPosition: true,
            disabled: true
        } ) );
        ms.add_item( menumaker.make_button( {
            id: 'Options', 
            callback: function () {},
            staticPosition: true,
            disabled: true
        } ) );
        
        //ms.itemsByID.Continue.enable();
        
        ms.ui_keep_centered();
        
        // hide instantly then show start menu
        
        ms.ui_hide( false, 0 );
        
        ms.ui_show( domElement );
        
    }
    
    /*===================================================
    
    start
    
    =====================================================*/
    
    function start_game() {
        var ms = menus.start;
        
        // disable start menu
        ms.disable();
        
        // hide start menu
        ms.ui_hide();
        
        // set intro section
        set_section( sections.intro );
    }
    
    /*===================================================
    
    functions
    
    =====================================================*/
    
    function update_section_list () {
        var i, l,
            name,
            prevNames = sectionNames.slice(0);
        
        // reset names
        
        sectionNames = [];
        
        // get all names
        
        for ( name in sections ) {
           if ( sections.hasOwnProperty( name ) ) {
               sectionNames.push( name );
           }
        }
        
        // init each new section
        
        for (i = 0, l = sectionNames.length; i < l; i += 1) {
            
            name = sectionNames[i];
            console.log(name);
            console.log(sections[name]);
            if ( prevNames.indexOf(name) === -1 ) {
                sections[name].init();
            }
        }
        
    }

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