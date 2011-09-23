/*
LauncherSection.js
Launcher module, handles loading assets, tutorial, and start menu.
*/
define(["game/effects/LinearGradient",
        "game/effects/Vignette",
        "game/sections/launcher/Loader",
        "game/sections/launcher/StartMenu",
        "game/sections/launcher/Water",
        "game/sections/launcher/Sky"],
function () {
    var shared = require('utils/Shared'),
        renderer, 
        renderTarget,
        renderSeq,
        camera, 
        cameraRotY = -90 * Math.PI / 180, 
        scene,
        backgroundParams = {
            colors: [0x0F042E, 0x1D508F, 0x529AD1, 0x529AD1, 0x455AE0],
            stops: [0, 0.25, 0.5, 0.75, 1.0],
            startBottom: true
        },
        background = require('game/effects/LinearGradient'),
        postprocessing = [
            require('game/effects/Vignette')
        ],
        time,
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
        
        renderer = shared.renderer;
        renderTarget = shared.renderTarget;
        
    }
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
        var i, ppl = postprocessing.length, shader, bgRenderSeq;
        
        // background
        
        background.enable( backgroundParams );
        
        bgRenderSeq = background.get_render_sequence();
        bgRenderSeq.renderTarget = renderTarget;
        bgRenderSeq.forceClear = true;
        
        // render sequence
        
        renderSeq = [
            bgRenderSeq, 
            { scene: scene, camera: camera, renderTarget: renderTarget }
        ];
        
        // post processing
        
        for (i = 0; i < ppl; i += 1) {
            
            shader = postprocessing[i];
            
            shader.enable( renderTarget );
            
            renderSeq[renderSeq.length] = shader.get_render_sequence();
            
        }  
        
        // disable renderer object sorting
        shared.renderer.sortObjects = false;
        
        // add listener for resize signal
        shared.signals.windowresized.add(resize);
        
    }
    
    function hide () {
        
        var i, ppl = postprocessing.length, shader;
        
        // background
        
        background.disable();
        
        // post processing
        
        for (i = 0; i < ppl; i += 1) {
            
            shader = postprocessing[i];
            
            shader.disable();
            
        }
        
        // render sequence
        renderSeq = [];
        
        // remove listener for resize signal
        shared.signals.windowresized.remove(resize);
        
    }
    
    function remove () {
        
        // enable renderer object sorting
        shared.renderer.sortObjects = true;
        
    }
    
    function update () {
        
        time = new Date().getTime();
        
        sky.wind_blow( time );
        
        water.waves( time );
        
        // bob camera with waves
        water.bob( camera, time );
        
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
        get_render_sequence: function () { return renderSeq; },
        resize: resize
    };
});