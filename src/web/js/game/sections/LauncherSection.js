/*
LauncherSection.js
Launcher module, handles start environment.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        effects = main.effects = main.effects || {},
        sections = game.sections = game.sections || {},
        launcher = sections.launcher = sections.launcher || {},
        readyInternal = false,
        readyAll = false,
        renderer, 
        renderTarget,
        camera,
        scene,
        composerScene,
        renderPasses,
        bg,
        water,
        sky,
        time,
        cameraRotY = -90 * Math.PI / 180,
        camLookTarget,
        bgParams = {
            colors: [0x0F042E, 0x1D508F, 0x529AD1, 0x529AD1, 0x455AE0],
            stops: [0, 0.4, 0.6, 0.8, 1.0],
            startBottom: true
        },
        mouse = { 
            x: 0, 
            y: 0,
            rx: 0,
            ry: 0, 
            rangeTransMaxX: 500, 
            rangeTransMinX: -500,
            rangeTransMaxY: 250, 
            rangeTransMinY: -250,
            speedTransX: 0.01, 
            speedTransY: 0.01,
            rangeRotMaxX: 1000,
            rangeRotMinX: -1000,
            rangeRotMaxY: 1000,
            rangeRotMinY: 0,
            speedRotX: 0.05,
            speedRotY: 0.05
        };
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    launcher.init = init;
    launcher.show = show;
    launcher.hide = hide;
    launcher.remove = remove;
    launcher.update = update;
    launcher.resize = resize;
    launcher.ready = ready;
    launcher.domElement = function () {};
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    game.update_section_list();
    
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
    
    function init_internal () {
        
        if ( readyInternal !== true ) {
            
            init_basics();
            
            init_render_processing();
            
            readyInternal = true;
            
        }
        
    }
    
    function init_basics () {
        
        var ambient, directional;
        
        // camera
        
        camera = new THREE.PerspectiveCamera(60, shared.screenWidth / shared.screenHeight, 1, 10000);
        
        // starting position
        camera.position.set(-5800, 0, 0);
        
        // camera look target
        
        camLookTarget = new THREE.Vector3(0, 0, 0);
        
        camera.lookAt( camLookTarget );
        
        // scene
        
        scene = new THREE.Scene();
        
        // lights
        
        ambient = new THREE.AmbientLight( 0xCCCCCC );
        
        directional = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        directional.position = new THREE.Vector3(-1, 1, -1).normalize();
        
        scene.add( ambient );
        scene.add( directional );
        
        // fog
        scene.fog = new THREE.Fog( 0x529ad1, -100, 10000 );
        
    }
    
    function init_render_processing () {
        
        var shaderScreen = THREE.ShaderExtras[ "screen" ],
            shaderFocusVignette = effects.FocusVignette;
        
        bg = effects.LinearGradient.generate( bgParams );
        
        renderPasses = {
            bg: new THREE.RenderPass( bg.scene, bg.camera ),
            env: new THREE.RenderPass( scene, camera ),
            screen: new THREE.ShaderPass( shaderScreen ),
            focusVignette: new THREE.ShaderPass ( shaderFocusVignette )
        };
        
        renderPasses.screen.renderToScreen = true;
        
        renderPasses.env.clear = false;
        
        renderPasses.focusVignette.uniforms[ "screenWidth" ].value = shared.screenWidth;
        renderPasses.focusVignette.uniforms[ "screenHeight" ].value = shared.screenHeight;
        renderPasses.focusVignette.uniforms[ "vingenettingOffset" ].value = 0.6;
        renderPasses.focusVignette.uniforms[ "vingenettingDarkening" ].value = 0.5;
        renderPasses.focusVignette.uniforms[ "sampleDistance" ].value = 0.2;
        renderPasses.focusVignette.uniforms[ "waveFactor" ].value = 0.3;
        
        /*
        var effectController  = {
            
            vingenettingOffset: 0.6,
			vingenettingDarkening: 0.5,
			sampleDistance: 0.2,
            waveFactor: 0.3

		};

		var matChanger = function( ) {
            
			renderPasses.focusVignette.uniforms[ "vingenettingOffset" ].value = effectController.vingenettingOffset;
            renderPasses.focusVignette.uniforms[ "vingenettingDarkening" ].value = effectController.vingenettingDarkening;
            renderPasses.focusVignette.uniforms[ "sampleDistance" ].value = effectController.sampleDistance;
            renderPasses.focusVignette.uniforms[ "waveFactor" ].value = effectController.waveFactor;

		};
        
		require('utils/Dev').gui.add( effectController, "vingenettingOffset", 0.0, 3.0, 0.1 ).onChange( matChanger );
		require('utils/Dev').gui.add( effectController, "vingenettingDarkening", -1, 1, 0.01 ).onChange( matChanger );
		require('utils/Dev').gui.add( effectController, "sampleDistance", 0.0, 2, 0.01 ).onChange( matChanger );
        require('utils/Dev').gui.add( effectController, "waveFactor", 0.0, 2, 0.01 ).onChange( matChanger );
        */
        
        renderer = shared.renderer;
        renderTarget = shared.renderTarget;
        
        composerScene = new THREE.EffectComposer( renderer );
        
        composerScene.addPass( renderPasses.bg );
        composerScene.addPass( renderPasses.env );
        composerScene.addPass( renderPasses.focusVignette );
        composerScene.addPass( renderPasses.screen );
    }
    
    function init_environment () {
        
        var waterEnv, skyEnv;
        
        // water
        
        water = launcher.water;
        
        water.init( { wavesColor: scene.fog.color.getHex() } );
        
        waterEnv = water.get_environment();
        
        waterEnv.rotation.x = cameraRotY;
        
        scene.add( waterEnv );
        
        // sky
        
        sky = launcher.sky;
        
        sky.init();
        
        // sky mesh
        skyEnv = sky.get_environment();
        
        skyEnv.position.x = 0;
        skyEnv.position.y = 2000;
        
        skyEnv.rotation.y = cameraRotY;
        
        // add clouds
        scene.add( skyEnv );
        
    }
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function on_mouse_moved () {
        
        var pctX = ( shared.mouse.x / shared.screenWidth ),
            pctY = ( shared.mouse.y / shared.screenHeight );
        
        mouse.x = pctX * mouse.rangeTransMaxX + (1 - pctX) * mouse.rangeTransMinX;
        mouse.y = pctY * mouse.rangeTransMaxY + (1 - pctY) * mouse.rangeTransMinY;
        
        mouse.rx = (pctX) * mouse.rangeRotMaxX + (1 - pctX) * mouse.rangeRotMinX;
        mouse.ry = (1 - pctY) * mouse.rangeRotMaxY + (pctY) * mouse.rangeRotMinY;
        
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
        
        shared.renderer.sortObjects = false;
        
        shared.signals.mousemoved.add( on_mouse_moved );
        
        shared.signals.windowresized.add( resize );
        
        shared.signals.update.add( update );
        
    }
    
    function hide () {
        
        shared.signals.mousemoved.remove( on_mouse_moved );
        
        shared.signals.windowresized.remove( resize );
        
        shared.signals.update.remove( update );
        
    }
    
    function remove () {
        
        // enable renderer object sorting
        shared.renderer.sortObjects = true;
        
    }
    
    function update () {
        
        time = new Date().getTime();
        
        camera.position.z += (  mouse.x - camera.position.z ) * mouse.speedTransX;
        camera.position.y += ( -mouse.y - camera.position.y ) * mouse.speedTransY;
        
        // needs persistant tracking to add to
        camLookTarget.z += ( mouse.rx - camLookTarget.z ) * mouse.speedRotX;
        camLookTarget.y += ( mouse.ry - camLookTarget.y ) * mouse.speedRotY;
        
        camera.lookAt( camLookTarget );
        
        // update environment
        
        sky.wind_blow( time );
        
        water.waves( time );
        
        //water.bob( camera );
        
        // render
        
        renderer.setViewport( 0, 0, shared.screenWidth, shared.screenHeight );

	    renderer.clear();
        
		composerScene.render();
        
    }
    
    function resize ( W, H ) {
        
        renderPasses.focusVignette.uniforms[ "screenWidth" ].value = shared.screenWidth;
        renderPasses.focusVignette.uniforms[ "screenHeight" ].value = shared.screenHeight;
        
        bg.resize( W, H );
        
        camera.aspect = W / H;
		camera.updateProjectionMatrix();
        
        composerScene.reset();
        
    }
        
    return main; 
    
}(KAIOPUA || {}));