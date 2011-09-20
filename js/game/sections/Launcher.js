/*
Launcher.js
Launcher module, handles loading assets, tutorial, and start menu.
*/
define(["game/sections/launcher/Loader",
        "game/sections/launcher/StartMenu",
        "game/sections/launcher/Water",
        "game/sections/launcher/Sky"],
function (loader, tutorial, startMenu) {
    var shared = require('utils/Shared'),
        renderer, renderTarget,
        camera, scene,
        water = require("game/sections/launcher/Water"); 
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    init_internal();
    
    function init_internal () {
        
        var i, ambient, light1;
        
        camera = new THREE.Camera(60, shared.screenWidth / shared.screenHeight, 1, 10000);
        
        // starting position
        camera.position = new THREE.Vector3(-5800, 0, 0);
        
        // useTarget property set to false for control over rotation
        camera.useTarget = false;
        camera.rotation.y = -90 * Math.PI / 180;
        
        scene = new THREE.Scene();
    
        // lights
        
        ambient = new THREE.AmbientLight( 0xCCCCCC );
        
        light1 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light1.position = new THREE.Vector3(-1,1, -1).normalize();
        
        scene.addLight( ambient );
        scene.addLight( light1 );
        
        // water
        water.init();
        
        scene.fog = water.fog;
        
        scene.addObject( water.mesh );
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
        
        //water.waves();
        
        // bob camera with waves
		//camera.position.y = floor + (Math.sin(water.time) * water.waveCameraBobAmp);
        //camera.rotation.x = Math.sin(water.time + water.waveCameraTiltCycleMod) * waveCameraTiltAmp;
        
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
        
        // set gradient background
        shared.gameContainer.addClass('bg_launcher');
        
        // add listener for resize signal
        shared.signals.windowresized.add(resize);
        
    }
    
    function hide () {
        
        // remove listener for resize signal
        shared.signals.windowresized.remove(resize);
        
    }
    
    function remove () {
        
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