/*
IntroSection.js
Intro module, handles introduction to story and teaching user basic game mechanics.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        sections = game.sections = game.sections || {},
        intro = sections.intro = sections.intro || {},
        readyInternal = false,
        readyAll = false,
        assets,
        objectmaker,
		world,
		player,
		camera,
        scene,
        renderer, 
        renderTarget,
        composerScene,
        renderPasses,
		light,
		lightSource;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    intro.init = init;
    intro.show = show;
    intro.hide = hide;
    intro.remove = remove;
    intro.update = update;
    intro.resize = resize;
    intro.ready = ready;
    intro.domElement = function () {};
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    game.update_section_list();
	
	function init_internal () {
        
        if ( readyInternal !== true ) {
            
            init_basics();
            
            init_render_processing();
            
            readyInternal = true;
            
        }
        
    }
    
    function init_basics () {
		
		// core
		
		world = game.core.world;
		player = game.core.player;
        
        // camera
        
        camera = player.get_camera();
        
        // scene
        
        scene = world.get_scene();
        
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
    
    external init
    
    =====================================================*/
    
    function ready () { 
        return readyInternal && readyAll; 
    }
    
    function init () {
        
        if ( !ready() ) {
			
            init_internal();
            
            init_environment();
            
            readyAll = true;
            
        }
    }
    
    function init_environment () {
		
		// light
		
		light = new THREE.SpotLight( 0xffffff );
        light.position = new THREE.Vector3(-1, 0, 1).normalize();
        
        scene.add( light );
        
        // light visual
        
        lightSource = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
        
        lightSource.useQuaternion = true;
        
        scene.add( lightSource );
		
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
        
        shared.signals.windowresized.add( resize );
        
        shared.signals.update.add( update );
        
    }
    
    function hide () {
        
        shared.signals.windowresized.remove( resize );
        
        shared.signals.update.remove( update );
        
    }
    
    function remove () {
        
    }
    
    function update () {
		
		// position point light to always be 
        // above and infront of camera
		
        var camP = camera.position.clone();
        var newP = new THREE.Vector3( 0, 200, -500);
        
        camera.quaternion.multiplyVector3( newP );
        
        newP.addSelf( camera.position );
        
		light.position = newP;
        lightSource.position = newP;
		
        lightSource.quaternion.copy( camera.quaternion );
        
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