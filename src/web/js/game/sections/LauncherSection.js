/*
LauncherSection.js
Launcher module, handles loading assets, tutorial, and start menu.
*/
define(["game/effects/EffectLinearGradient",
        "game/effects/EffectVignette",
        "game/sections/launcher/Loader",
        "game/sections/launcher/StartMenu",
        "game/sections/launcher/Water",
        "game/sections/launcher/Sky"],
function () {
    var shared = require('utils/Shared'),
        renderer, 
        renderTarget,
        camera, 
        cameraRotY = -90 * Math.PI / 180, 
        scene,
        backgroundParams = {
            colors: [0x0F042E, 0x1D508F, 0x529AD1, 0x529AD1, 0x455AE0],
            stops: [0, 0.25, 0.44, 0.62, 1.0],
            startBottom: true
        },
        background = require('game/effects/EffectLinearGradient'),
        postprocessing = [
            require('game/effects/EffectVignette')
        ],
        water = require("game/sections/launcher/Water"),
        sky = require("game/sections/launcher/Sky");
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    init_internal();
    
    function init_internal () {
        
        var i, ambient, light1, waterEnv, skyEnv;
        
        camera = new THREE.Camera(60, shared.screenWidth / shared.screenHeight, 1, 10000);
        
        //camera = new THREE.FirstPersonCamera( { fov: 60, aspect:shared.screenWidth / shared.screenHeight, near: 1, far: 20000, movementSpeed: 1000, lookSpeed: 0.1, noFly: false, lookVertical: true } );
        
        // starting position
        camera.position.set(-5800, 0, 0);
        
        // useTarget property set to false for control over rotation
        //camera.target.position.set(0, 0, 0);
        camera.useTarget = false;
        camera.rotation.y = cameraRotY;
        
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
        var i, ppl = postprocessing.length, shader;
        
        renderer = shared.renderer;
        renderTarget = shared.renderTarget;
        
        // background
        
        background.init( backgroundParams );
        
        // post processing
        
        for (i = 0; i < ppl; i += 1) {
            
            shader = postprocessing[i];
            
            shader.init();
            
        }
    }
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function simulate () {
        
        sky.wind_blow();
        
        water.waves();
        
        // bob camera with waves
		water.bob( camera );
        
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
        
        // set gradient background
        shared.gameContainer.addClass('bg_launcher');
        
        // disable renderer object sorting
        shared.renderer.sortObjects = false;
        
        // add listener for resize signal
        shared.signals.windowresized.add(resize);
        
    }
    
    function hide () {
        
        // remove listener for resize signal
        shared.signals.windowresized.remove(resize);
        
    }
    
    function remove () {
        
        // enable renderer object sorting
        shared.renderer.sortObjects = true;
        
        // clear gradient background
        shared.gameContainer.removeClass('bg_launcher');
        
    }
    
    function update () {
        var i, ppl = postprocessing.length, shader;
        
        simulate();
        
        renderer.clear();
        
        // post process
        if (ppl > 0) {
            
            // apply background
            
            background.apply();
            
            // render base scene into render target
            
            renderer.render( scene, camera, renderTarget);
            
            // apply post processing for each shader in order
            for (i = 0; i < ppl; i += 1) {
                
                shader = postprocessing[i];
                
                shader.apply();
                
            }
            
            /*
			// Render scene into texture
            
			scene.overrideMaterial = null;
			renderer.render( scene, camera, postprocessing.rtDiffuse, true );
            
			// Render depth into texture

			scene.overrideMaterial = postprocessing.depthMaterial;
			renderer.render( scene, camera, postprocessing.rtTextureDepth, true );
            
			// Render postprocessing composite

			renderer.render( postprocessing.scene, postprocessing.camera );
            */
        }
        // no post processing
        else {
            renderer.render( scene, camera );
        }
        
    }
    
    function resize ( W, H ) {
        
        camera.aspect = W / H;
		camera.updateProjectionMatrix();
        
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