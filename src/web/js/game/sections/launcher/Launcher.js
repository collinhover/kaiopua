/*
Launcher.js
Launcher module, handles loading assets, tutorial, and start menu.
*/
define(["game/sections/launcher/Loader",
        "game/sections/launcher/StartMenu"],
function (loader, tutorial, startMenu) {
    var shared = require('utils/Shared'),
        renderer, renderTarget,
        fog, camera, scene;
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    fog = new THREE.Fog( 0xFFFFFF, - 100, 800 );
    
    camera = new THREE.Camera( 75, shared.screenWidth / shared.screenHeight, 1, 3000 );
    camera.position.z = 600;
    
    scene = new THREE.Scene();
    scene.fog = fog;
    
    var geometry = new THREE.SphereGeometry(200, 10, 10);
    var material = new THREE.MeshLambertMaterial( { color: 0xfee972 } );
    
    var mesh = new THREE.Mesh( geometry, material );
    
    scene.addObject( mesh );
    
    var pointLight = new THREE.PointLight( 0xFFFFFF );
    
    pointLight.position.x = 200;
    pointLight.position.y = 0;
    pointLight.position.z = 400;
    
    scene.addLight(pointLight); 
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init () {
        
        renderer = shared.renderer;
        renderTarget = shared.renderTarget;
        
    }
    
    /*===================================================
    
    functions
    
    =====================================================*/
    
    function show () {
        
        // add listener for resize signal
        shared.signals.windowresized.add(resize);
        
    }
    
    function hide () {
        
        // on completing hide, remove from container
        remove();
        
    }
    
    function remove () {
        
        // remove listener for resize signal
        shared.signals.windowresized.remove(resize);
        
    }
    
    function update () {
        
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.02;
        
        renderer.render( scene, camera);//, renderTarget );
        
    }
    
    function resize ( W, H ) {
        
    }
    
    // return something to define module
    return {
        init: init,
        show: show,
        hide: hide,
        update: update
    };
});