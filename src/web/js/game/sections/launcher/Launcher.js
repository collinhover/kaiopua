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
        fog, camera, scene, floor = 0,
        water = {};
        
            
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    // water properties
    water.color = 0x529ad1;
    water.size = 10000;
    water.vertsW = 50;
    water.vertsH = 50;
    water.time = 0;
    water.speed = 0.04;
    water.speedMod = 0.5;
    water.amp = 200;
    water.cameraBobAmp = water.amp * 1.5;
    water.cameraTiltAmp = 5 * (Math.PI / 180);
    water.cameraTiltCycleMod = Math.PI * 1.5;
    water.waveFreq = 4;
    water.vertVariation = {};
    water.vertVariation.verts = [];
    water.vertVariation.abs = 35;
    water.vertVariation.min = -Math.min(waveAmp * 0.5, wvvMaxAbs);
    water.vertVariation.max = Math.min(waveAmp * 0.5, wvvMaxAbs);
    water.vertVariation.delta = (wvvMax - wvvMin) * 0.01;
    water.vertVariation.dirSwitchPause = 600;
    
    init_internal();
    
    function init_internal () {
        
        var i, ambient, light1, 
            waterGeometry, waterMaterial, 
            numWaterVerts, wvv = water.vertVariation;
        
        camera = new THREE.Camera(60, shared.screenWidth / shared.screenHeight, 1, 10000);
        
        // starting position
        camera.position.x = -5800;
        camera.position.y = floor;
        camera.position.z = 0;
        
        // useTarget property set to false for control over rotation
        camera.useTarget = false;
        camera.rotation.y = -90 * Math.PI / 180;
        
        scene = new THREE.Scene();
        
        fog = new THREE.Fog( water.color, - 100, water.size );
        scene.fog = fog;
    
        // lights
        
        ambient = new THREE.AmbientLight( 0xCCCCCC );
        
        light1 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light1.position = new THREE.Vector3(-1,1, -1).normalize();
        
        scene.addLight( ambient );
        scene.addLight( light1 );
        
        // create water geometry
        waterGeometry = new THREE.PlaneGeometry( water.size, water.size, water.vertsW - 1, water.vertsH - 1 );
        waterGeometry.dynamic = true;
        
        // per vert variation
        numWaterVerts = waterGeometry.vertices.length;
        for ( i = 0; i < numWaterVerts; i += 1 ) {
            wvv[ i ] = {
                amp : Math.random() * (wvv.max - wvv.min) + wvv.min,
                dir : 1,
                dirSwitch : Math.round(Math.random() * (wvv.dirSwitchPause * 0.5) + (wvv.dirSwitchPause * 0.5)),
                dirSwitchCount : Math.round(Math.random() * (wvv.dirSwitchPause * 0.5) + (wvv.dirSwitchPause * 0.5))
}           ;
        }
        
        // water material
        waterMaterial = new THREE.MeshLambertMaterial( { color: waterColor } );
        
        // water mesh
        water.mesh = new THREE.Mesh( waterGeometry, waterMaterial );
        water.mesh.rotation.x = -90 * Math.PI / 180;
        water.mesh.doubleSided = true;
        
        scene.addObject(water.mesh );
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
    
    function waves() {
        
        var waterGeometry = waterMesh.geometry,
            waterVerts = waterGeometry.vertices, 
            numVertsW = water.vertsW, numVertsH = water.vertsH,
            wv, wvv, vvw = numVertsW - 1, vvh = water.vertsH - 1,
            i, l;
        
        // update wave time
        wave.time += waveSpeed * waveSpeedMod;
        waveTime = waveTime % (Math.PI * 2);
        
        for ( i = 0; i < numVertsW; i += 1 ) {
            for ( l = 0; l < numVertsH; l += 1 ) {
                wv = waterVerts[ i + l * numVertsH ];
                
                // set water vert
				wv.position.z = waveAmp * ( Math.cos( i / waveFreq  + waveTime ) + Math.sin( l / waveFreq + waveTime ) );
                
                // set water vert variation
                if( i !== 0 && i !== numVertsW - 1 && l !== 0 && l !== numVertsH - 1) {
                    wvv = waterVertVar[ i + l * numVertsH ];
                    
                    // update variation amplitude
                    wvv.amp = Math.min(wvvMax, Math.max(wvvMin, wvv.amp + wvvDelta * wvv.dir ));
                    
                    // check for switch direction of variation
                    if ( wvv.dirSwitch > wvv.dirSwitchCount ) {
                        wvv.dir = -wvv.dir;
                        wvv.dirSwitch = 0;
                    }
                    wvv.dirSwitch += 1;
                    
                    // add variation to vert z
                    wv.position.z += wvv.amp;
                }
			}
		}
        
        // recompute normals for correct lighting
        // very heavy on processing
		waterGeom.computeFaceNormals();
		waterGeom.computeVertexNormals();
        
        // tell three to update vertices
		waterGeom.__dirtyVertices = true;
	}
    
    function simulate () {
        
        waves();
        
        // bob camera with waves
		camera.position.y = floor + (Math.sin(waveTime) * waveCameraBobAmp);
        camera.rotation.x = Math.sin(waveTime + waveCameraTiltCycleMod) * waveCameraTiltAmp;
        
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