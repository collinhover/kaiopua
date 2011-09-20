/*
Water.js
Launcher section water handler.

ray texture (c) oosmoxie @ http://oos.moxiecode.com/
*/

define([],
function () {
    var wavesGeometry, 
        wavesMaterial,
        wavesMesh,
        wavesColor = 0x529ad1,
        wavesSize = 10000,
        wavesVertsW = 50,
        wavesVertsH = 50,
        wavesVertsNum,
        time = 0,
        wavesSpeed = 0.04,
        wavesSpeedMod = 0.5,
        wavesAmplitude = 200,
        wavesFrequency = 4,
        vertVariations = [],
        vvAbs = 35,
        vvMin = -Math.min(wavesAmplitude * 0.5, vvAbs),
        vvMax = Math.min(wavesAmplitude * 0.5, vvAbs),
        vvDelta = (vvMax - vvMin) * 0.01,
        vvDirSwitchPause = 600,
        bobAmp = wavesAmplitude * 1.5,
        bobTiltAmp = 5 * (Math.PI / 180),
        bobTiltCycleMod = Math.PI * 1.5,
        waterRays = [],
        rayTexture = THREE.ImageUtils.loadTexture( "files/img/ray.png" ),
        numRays = 20,
        rayWidth = 700,
        rayHeight = 2000,
        lightAngle = (-Math.PI * 0.1), 
        environment = new THREE.Object3D();
        
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init ( parameters ) {
        var i, ray, rayGeometry, rayMaterial, rayVert;
        
        // handle parameters
        
        parameters = parameters || {};
        
        wavesColor = parameters.wavesColor || wavesColor;
        
        wavesSize = parameters.wavesSize || wavesSize;
        
        wavesVertsW = parameters.wavesVertsW || wavesVertsW;
        
        wavesVertsH = parameters.wavesVertsH || wavesVertsH;
        
        wavesSpeed = parameters.wavesSpeed || wavesSpeed;
        
        wavesSpeedMod = parameters.wavesSpeedMod || wavesSpeedMod;
        
        wavesAmplitude = parameters.wavesAmplitude || wavesAmplitude;
        
        vvAbs = parameters.vvAbs || vvAbs;
        
        vvMin = -Math.min(wavesAmplitude * 0.5, vvAbs);
        
        vvMax = Math.min(wavesAmplitude * 0.5, vvAbs);
        
        vvDelta = (vvMax - vvMin) * 0.01;
        
        bobAmp = wavesAmplitude * 1.5;
        
        wavesFrequency = parameters.wavesFrequency || wavesFrequency;
        
        numRays = parameters.numRays || numRays;
        
        rayWidth = parameters.rayWidth || rayWidth;
        
        rayHeight = parameters.rayHeight || rayHeight;
        
        lightAngle = parameters.lightAngle || lightAngle;
        
        // create water geometry
        wavesGeometry = new THREE.PlaneGeometry( wavesSize, wavesSize, wavesVertsW - 1, wavesVertsH - 1 );
        wavesGeometry.dynamic = true;
        
        // per vert variation
        wavesVertsNum = wavesGeometry.vertices.length;
        for ( i = 0; i < wavesVertsNum; i += 1 ) {
            vertVariations[ i ] = {
                amplitude : Math.random() * (vvMax - vvMin) + vvMin,
                dir : 1,
                dirSwitch : Math.round(Math.random() * (vvDirSwitchPause * 0.5) + (vvDirSwitchPause * 0.5)),
                dirSwitchCount : Math.round(Math.random() * (vvDirSwitchPause * 0.5) + (vvDirSwitchPause * 0.5))
            };
        }
        
        // water material
        wavesMaterial = new THREE.MeshLambertMaterial( { color: wavesColor } );
        
        // water mesh
        wavesMesh = new THREE.Mesh( wavesGeometry, wavesMaterial );
        wavesMesh.doubleSided = true;
        
        environment.addChild( wavesMesh );
        
        // water rays
        /*
        rayGeometry = new THREE.PlaneGeometry ( rayWidth, rayHeight );
        
        rayMaterial = new THREE.MeshLambertMaterial( { color: 0x000000});//wavesColor, map: rayTexture, opacity: 0.5, depthTest: false } );
        
        for ( i = 0; i < numRays; i += 1 ) {
            
			ray = new THREE.Mesh( rayGeometry, rayMaterial );
            //ray.doubleSided = true;
            ray.up.set(
            ray.rotation.set( Math.PI * 0.5 - lightAngle, -Math.PI * 0.5, 0);
            //ray.rotation.set( Math.PI * 0.5 - lightAngle, -Math.PI * 0.5, 0);
            
            rayVert = wavesGeometry.vertices[ Math.floor((i / numRays) * wavesVertsNum) ];
            
			//ray.position.x = rayVert.position.y;
            //ray.position.y = rayVert.position.x;
            //ray.position.z = -(rayWidth + wavesAmplitude);
            
            require('utils/Dev').log(' z: ' + ray.position.x + ' x: ' + ray.position.y + ' y: ' + ray.position.z);
            
            environment.addChild( ray );
        }
        */
    }
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function waves() {
        
        var wavesVerts = wavesGeometry.vertices, 
            vert, variation, vvw = wavesVertsW - 1, vvh = wavesVertsH - 1,
            i, l;
        
        // update wave time
        //time = new Date().getTime() * wavesSpeedMod;
        time += wavesSpeed * wavesSpeedMod;
        time = time % (Math.PI * 2);
        
        for ( i = 0; i < wavesVertsW; i += 1 ) {
            for ( l = 0; l < wavesVertsH; l += 1 ) {
                vert = wavesVerts[ i + l * wavesVertsH ];
                
                // set water vert
                vert.position.z = wavesAmplitude * ( Math.cos( i / wavesFrequency  + time ) + Math.sin( l / wavesFrequency + time ) );
                
                // set water vert variation
                if( i !== 0 && i !== vvw && l !== 0 && l !== vvh) {
                    variation = vertVariations[ i + l * wavesVertsH ];
                    
                    // update variation wavesAmplitude
                    variation.amplitude = Math.min(vvMax, Math.max(vvMin, variation.amplitude + vvDelta * variation.dir ));
                    
                    // check for switch direction of variation
                    if ( variation.dirSwitch > variation.dirSwitchCount ) {
                        variation.dir = -variation.dir;
                        variation.dirSwitch = 0;
                    }
                    variation.dirSwitch += 1;
                    
                    // add variation to vert z
                    vert.position.z += variation.amplitude;
                }
			}
		}
        
        // recompute normals for correct lighting
        // very heavy on processing
		wavesGeometry.computeFaceNormals();
		wavesGeometry.computeVertexNormals();
        
        // tell three to update vertices
		wavesGeometry.__dirtyVertices = true;
	}
    
    // bobs object with waves
    function bob ( object ) {
        object.position.y = (Math.sin(time) * bobAmp);
        object.rotation.x = Math.sin(time + bobTiltCycleMod) * bobTiltAmp;
    }
    
    // return something to define module
    return {
        init: init,
        waves : waves,
        get_environment : function () { return environment; },
        bob : bob
    };
});