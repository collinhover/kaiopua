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
    
    var DIST = 3000;
    var FLOOR = 0;
    var cameraRotVertMax = 25 * Math.PI / 180;
    var cameraRotVertMin = -25 * Math.PI / 180;
    var cameraRotHorzMax = 25 * Math.PI / 180;
    var cameraRotHorzMin = -25 * Math.PI / 180;
    
    fog = new THREE.Fog( 0x529ad1, - 100, 10000 );
    
    camera = new THREE.Camera(60, shared.screenWidth / shared.screenHeight, 1, 10000);
    /*
    FirstPersonCamera( {
                    fov: 60, 
                    aspect: shared.screenWidth / shared.screenHeight, 
                    near: 1, 
                    far: 10000,
					movementSpeed: 500, 
                    lookSpeed: 0.1, 
                    noFly: false, 
                    lookVertical: false
    });
    */
    
    camera.position.x = -5800;
    camera.position.y = 100;
    camera.position.z = FLOOR;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    
    scene = new THREE.Scene();
    scene.fog = fog;
    
    // lights
    
    var ambient = new THREE.AmbientLight( 0xCCCCCC );
    scene.addLight( ambient );
    
    var light1 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
    light1.position = new THREE.Vector3(-1,1, -1).normalize();
    
    scene.addLight(light1);
    
    // water
    var waterVertsW = 50;
    var waterVertsH = 50;
    var waterNumVerts = waterVertsW * waterVertsH;
    var waveTime = 0;
    var waveSpeed = 0.04;
    var waveSpeedMod = 0.5;
    var waveAmp = 200;
    var waveCameraBobAmp = waveAmp * 2;
    var waveFreq = 4;
    var wvvMin = -Math.min(waveAmp * 0.5, 35);
    var wvvMax = Math.min(waveAmp * 0.5, 35);
    var wvvDelta = (wvvMax - wvvMin) * 0.01;
    var wvvDirSwitchPause = 600;
    
    // create water geometry
    var waterGeom = new THREE.PlaneGeometry( 10000, 10000, waterVertsW - 1, waterVertsH - 1 );
    waterGeom.dynamic = true;
    
    // per vert variation
    var waterVertVar = [];
    for ( var i = 0; i < waterNumVerts; i += 1 ) {
		waterVertVar[ i ] = {
            amp : Math.random() * (wvvMax - wvvMin) + wvvMin,
            dir : 1,
            dirSwitch : Math.round(Math.random() * (wvvDirSwitchPause * 0.5) + (wvvDirSwitchPause * 0.5)),
            dirSwitchCount : Math.round(Math.random() * (wvvDirSwitchPause * 0.5) + (wvvDirSwitchPause * 0.5))
		};
    }
    
    var waterMaterial = new THREE.MeshLambertMaterial( { color: 0x529ad1 } );
    
    var waterMesh = new THREE.Mesh( waterGeom, waterMaterial );
	waterMesh.rotation.x = -90 * Math.PI / 180;
	waterMesh.doubleSided = true;
    
	scene.addObject(waterMesh);
    
    function waves() {
        
        var waterVerts = waterGeom.vertices, 
            wVert, wvVariation, 
            vvw = waterVertsW - 1, vvh = waterVertsH - 1, i, l;
        
        // update wave time
        waveTime += waveSpeed * waveSpeedMod;
        waveTime = waveTime % (Math.PI * 2);
        
        for ( i = 0; i < waterVertsW; i += 1 ) {
			for ( l = 0; l < waterVertsH; l += 1 ) {
                wVert = waterVerts[ i + l * waterVertsH ];
                
                // set water vert
				wVert.position.z = waveAmp * ( Math.cos( i / waveFreq  + waveTime ) + Math.sin( l / waveFreq + waveTime ) );
                
                // set water vert variation
                if( i !== 0 && i !== waterVertsW - 1 && l !== 0 && l !== waterVertsH - 1) {
                    wvVariation = waterVertVar[ i + l * waterVertsH ];
                    
                    // update variation amplitude
                    wvVariation.amp = Math.min(wvvMax, Math.max(wvvMin, wvVariation.amp + wvvDelta * wvVariation.dir ));
                    
                    // check for switch direction of variation
                    if ( wvVariation.dirSwitch > wvVariation.dirSwitchCount ) {
                        wvVariation.dir = -wvVariation.dir;
                        wvVariation.dirSwitch = 0;
                    }
                    wvVariation.dirSwitch += 1;
                    
                    // add variation to vert z
                    wVert.position.z += wvVariation.amp;
                }
			}
		}
        
        // recompute normals for correct lighting
        // very heavy on processing
		waterGeom.computeFaceNormals();
		waterGeom.computeVertexNormals();
        
        // tell three to update vertices
		waterMesh.geometry.__dirtyVertices = true;
	}
    
    function movement () {
        
        waves();
        
        // bob camera with waves
		camera.position.y = FLOOR + (Math.sin(waveTime) * waveCameraBobAmp);
        
    }
    
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
        
        // set gradient background
        shared.gameContainer.addClass('bg_launcher');
        
        // add listener for resize signal
        shared.signals.windowresized.add(resize);
        
    }
    
    function hide () {
        
        // on completing hide, remove from container
        remove();
        
    }
    
    function remove () {
        
        // set gradient background
        shared.gameContainer.removeClass('bg_launcher');
        
        // remove listener for resize signal
        shared.signals.windowresized.remove(resize);
        
    }
    
    function update () {
        
        movement();
        
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
        update: update,
        resize: resize
    };
});