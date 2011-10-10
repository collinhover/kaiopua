/*
IntroSection.js
Intro module, handles introduction to story and teaching user basic game mechanics.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        sections = game.sections = game.sections || {},
        section = sections.section = sections.section || {},
        readyInternal = false,
        readyAll = false,
        renderer, 
        renderTarget,
        camera,
        scene,
        ambient,
        composerScene,
        renderPasses;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    section.init = init;
    section.show = show;
    section.hide = hide;
    section.remove = remove;
    section.update = update;
    section.resize = resize;
    section.ready = ready;
    section.domElement = function () {};
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    game.update_section_list();
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function ready () { 
        return readyInternal && readyAll; 
    };
    
    function init () {
        
        if ( !ready() ) {
            
            assets = main.utils.loader.assets;
            
            init_internal();
            
            readyAll = true;
            
        }
    }
    
    function init_internal () {
        
        if ( readyInternal !== true ) {
            
            init_basics();
            
            init_render_processing();
            
            readyInternal = true;
            
        }
        
    }
    
    function init_basics () {
        
        // camera
        
        //camera = new THREE.Camera(60, shared.screenWidth / shared.screenHeight, 1, 10000);
        
        camera = new THREE.FirstPersonCamera( { fov: 60, aspect:shared.screenWidth / shared.screenHeight, near: 1, far: 20000, movementSpeed: 1000, lookSpeed: 0.1, noFly: false, lookVertical: true } );
        
        // scene
        
        scene = new THREE.Scene();
        
        // lights
        
        ambient = new THREE.AmbientLight( 0xCCCCCC );
        
        scene.addLight( ambient );
        
        var light1 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light1.position = new THREE.Vector3(-1, -1, 1).normalize();
        
        scene.addLight( light1 );
        
        // fog
        
        scene.fog = new THREE.Fog( 0xffffff, -100, 10000 );
        
    }
    
    function init_render_processing () {
        
        var shaderScreen = THREE.ShaderExtras[ "screen" ];
        
        // render passes
        
        renderPasses = {
            env: new THREE.RenderPass( scene, camera ),
            screen: new THREE.ShaderPass( shaderScreen )
        };
        
        renderPasses.screen.renderToScreen = true;
        
        // renderer
        
        renderer = shared.renderer;
        renderTarget = shared.renderTarget;
        
        // composer
        
        composerScene = new THREE.EffectComposer( renderer );
        
        composerScene.addPass( renderPasses.env );
        composerScene.addPass( renderPasses.screen );
        
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
        
        shared.signals.windowresized.add( resize );
        
    }
    
    function hide () {
        
        shared.signals.windowresized.remove( resize );
        
    }
    
    function remove () {
        
    }
    
    function update () {
        
        // render
        
        renderer.setViewport( 0, 0, shared.screenWidth, shared.screenHeight );

        renderer.clear();
        
    	composerScene.render();
        
    }
    
    function resize ( W, H ) {
        
        camera.aspect = W / H;
    	camera.updateProjectionMatrix();
        
        composerScene.reset();
        
    }
    
    return main; 
    
}(KAIOPUA || {}));