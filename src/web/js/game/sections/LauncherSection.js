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
        
        var i, ambient, light1, waterMesh, skyMesh, cloudTexture;
        
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
        
        // water
        water.init();
        
        waterMesh = water.get_mesh();
        
        waterMesh.rotation.x = -90 * Math.PI / 180;
        waterMesh.doubleSided = true;
        
        scene.fog = water.get_fog();
        scene.addObject( waterMesh );
        
        // sky
        cloudTexture = THREE.ImageUtils.loadTexture( 'files/img/cloud256.png', THREE.UVMapping, function () {
            sky.init({ 
                cloudTexture: cloudTexture, 
                fog: scene.fog,
                numClouds: 500,
                cloudScaleStart: 20,
                cloudScaleEnd: 5,
                cloudScaleShiftWeight: 0.5,
                cloudSpaceWidth: 10000,
                cloudSpaceDepth: 10000,
                cloudSpaceHeightStart: {min: 4000, max: 4000},
                cloudSpaceHeightEnd: {min: 0, max: 1500}
            });
            
            // sky mesh
            skyMesh = sky.get_mesh();
            
            skyMesh.position.x = 0;
            skyMesh.position.y = 1000;
            
            skyMesh.rotation.y = cameraRotY;
            
            // add clouds
            scene.addObject( skyMesh );
        });
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
        
        water.waves();
        
        // bob camera with waves
		camera.position.y = (Math.sin(water.get_time()) * water.cameraBobAmp);
        camera.rotation.x = Math.sin(water.get_time() + water.cameraTiltCycleMod) * water.cameraTiltAmp;
        
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