/*
IntroSection.js
Intro module, handles introduction to story and teaching user basic game mechanics.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        sections = game.sections = game.sections || {},
        section = sections.section = sections.section || {},
        renderer, 
        renderTarget,
        camera,
        scene,
        ambient,
        composerScene,
        renderPasses;
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init () {
        
        init_environment();
        
        init_render_processing();
        
    }
    
    function init_environment () {
        
        // camera
        
        camera = new THREE.Camera(60, shared.screenWidth / shared.screenHeight, 1, 10000);
        
        // scene
        
        scene = new THREE.Scene();
        
        // lights
        
        ambient = new THREE.AmbientLight( 0xCCCCCC );
        
        scene.addLight( ambient );
        
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
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    section.init = init;
    section.show = show;
    section.hide = hide;
    section.remove = remove;
    section.update = update;
    section.resize = resize;
    section.domElement = function () {};
    
    return main; 
    
}(KAIOPUA || {}));