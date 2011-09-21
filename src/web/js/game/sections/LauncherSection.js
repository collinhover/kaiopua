/*
LauncherSection.js
Launcher module, handles loading assets, tutorial, and start menu.
*/
define(["game/sections/launcher/Loader",
        "game/sections/launcher/StartMenu",
        "game/sections/launcher/Water",
        "game/sections/launcher/Sky"],
function () {
    var shared = require('utils/Shared'),
        renderer, renderTarget,
        camera, cameraRotY = -90 * Math.PI / 180, scene,
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
        camera.position = new THREE.Vector3(-5800, 0, 0);
        
        // useTarget property set to false for control over rotation
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
        
        simulate();
        
        renderer.render( scene, camera);//, renderTarget );
        
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