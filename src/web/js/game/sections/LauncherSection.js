/*
LauncherSection.js
Launcher module, handles loading assets, tutorial, and start menu.
*/
define(["game/effects/LinearGradient",
        "game/effects/FocusVignette",
        "game/sections/launcher/Loader",
        "game/sections/launcher/StartMenu",
        "game/sections/launcher/Water",
        "game/sections/launcher/Sky"],
function () {
    var shared = require('utils/Shared'),
        linearGradientEffect = require('game/effects/LinearGradient'),
        renderer, 
        renderTarget,
        camera, 
        cameraRotY = -90 * Math.PI / 180, 
        scene,
        composerScene,
        renderPasses,
        bgParams = {
            colors: [0x0F042E, 0x1D508F, 0x529AD1, 0x529AD1, 0x455AE0],
            stops: [0, 0.4, 0.6, 0.8, 1.0],
            startBottom: true
        },
        bg = linearGradientEffect.generate( bgParams ),
        time,
        water = require("game/sections/launcher/Water"),
        sky = require("game/sections/launcher/Sky"),
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
    
    internal init
    
    =====================================================*/
    
    init_internal();
    
    function init_internal () {
        
        init_basics();
        
        init_render_processing();
    
        init_environment();
        
    }
    
    function init_basics () {
        
        camera = new THREE.Camera(60, shared.screenWidth / shared.screenHeight, 1, 10000);
        
        //camera = new THREE.FirstPersonCamera( { fov: 60, aspect:shared.screenWidth / shared.screenHeight, near: 1, far: 20000, movementSpeed: 1000, lookSpeed: 0.1, noFly: false, lookVertical: true } );
        
        // starting position
        camera.position.set(-5800, 0, 0);
        
        // useTarget property set to false for control over rotation
        camera.target.position.set(0, 0, 0);
        //camera.useTarget = false;
        //camera.rotation.y = cameraRotY;
        
        scene = new THREE.Scene();
        
    }
    
    function init_render_processing () {
        
        var shaderScreen = THREE.ShaderExtras[ "screen" ],
            shaderFocusVignette = require('game/effects/FocusVignette');
        
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
    }
    
    function init_environment () {
        
        var i, ambient, light1, waterEnv, skyEnv;
        
        // lights
        
        ambient = new THREE.AmbientLight( 0xCCCCCC );
        
        light1 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light1.position = new THREE.Vector3(-1,1, -1).normalize();
        
        scene.addLight( ambient );
        scene.addLight( light1 );
        
        // fog
        scene.fog = new THREE.Fog( 0x529ad1, -100, 10000 );
        
        // water
        water.init( { wavesColor: scene.fog.color.getHex() } );
        
        waterEnv = water.get_environment();
        
        waterEnv.rotation.x = cameraRotY;
        
        scene.addObject( waterEnv );
        
        // sky
        
        sky.init();
        
        // sky mesh
        skyEnv = sky.get_environment();
        
        skyEnv.position.x = 0;
        skyEnv.position.y = 2000;
        
        skyEnv.rotation.y = cameraRotY;
        
        // add clouds
        scene.addObject( skyEnv );
        
    }
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init () {
        
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
    
    // return something to define module
    return {
        init: init,
        show: show,
        hide: hide,
        remove: remove,
        update: update,
        resize: resize
    };
});