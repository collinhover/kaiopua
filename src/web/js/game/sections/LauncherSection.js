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
    
    external init
    
    =====================================================*/
    
    function init () {
        
        init_environment();
        
        init_render_processing();
        
    }
    
    function init_environment () {
        
        var i, ambient, light1, waterEnv, skyEnv;
        
        // camera
        
        camera = new THREE.Camera(60, shared.screenWidth / shared.screenHeight, 1, 10000);
        
        // starting position
        camera.position.set(-5800, 0, 0);
        
        // useTarget property set to false for control over rotation
        camera.target.position.set(0, 0, 0);
        //camera.useTarget = false;
        //camera.rotation.y = cameraRotY;
        
        // scene
        
        scene = new THREE.Scene();
        
        // lights
        
        ambient = new THREE.AmbientLight( 0xCCCCCC );
        
        light1 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light1.position = new THREE.Vector3(-1,1, -1).normalize();
        
        scene.addLight( ambient );
        scene.addLight( light1 );
        
        // fog
        scene.fog = new THREE.Fog( 0x529ad1, -100, 10000 );
        
        // water
        
        water = launcher.water;
        
        water.init( { wavesColor: scene.fog.color.getHex() } );
        
        waterEnv = water.get_environment();
        
        waterEnv.rotation.x = cameraRotY;
        
        scene.addObject( waterEnv );
        
        // sky
        
        sky = launcher.sky;
        
        sky.init();
        
        // sky mesh
        skyEnv = sky.get_environment();
        
        skyEnv.position.x = 0;
        skyEnv.position.y = 2000;
        
        skyEnv.rotation.y = cameraRotY;
        
        // add clouds
        scene.addObject( skyEnv );
        
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
        
    }
    
    function hide () {
        
        shared.signals.mousemoved.remove( on_mouse_moved );
        
        shared.signals.windowresized.remove( resize );
        
    }
    
    function remove () {
        
        // enable renderer object sorting
        shared.renderer.sortObjects = true;
        
    }
    
    function update () {
        
        time = new Date().getTime();
        
        camera.position.z += (  mouse.x - camera.position.z ) * mouse.speedTransX;
        camera.position.y += ( -mouse.y - camera.position.y ) * mouse.speedTransY;
        
        camera.target.position.z += ( mouse.rx - camera.target.position.z ) * mouse.speedRotX;
        camera.target.position.y += ( mouse.ry - camera.target.position.y ) * mouse.speedRotY;
        
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
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    launcher.init = init;
    launcher.show = show;
    launcher.hide = hide;
    launcher.remove = remove;
    launcher.update = update;
    launcher.resize = resize;
    launcher.domElement = function () {};
        
    return main; 
    
}(KAIOPUA || {}));