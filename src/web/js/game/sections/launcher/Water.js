/*
Water.js
Launcher section water handler.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		sections = game.sections = game.sections || {},
        launcher = sections.launcher = sections.launcher || {},
        water = launcher.water = launcher.water || {},
        wavesGeometry, 
        wavesMaterial,
        wavesMesh,
        wavesColor = 0x529ad1,
        wavesSize = 10000,
        wavesVertsW = 50,
        wavesVertsH = 50,
        wavesVertsNum,
        waveTime = 0,
        wavesSpeed = 0.001,
        wavesAmplitude = 200,
        wavesFrequency = 4,
        vertVariations = [],
        vvAbs = 35,
        vvMin = -Math.min(wavesAmplitude * 0.5, vvAbs),
        vvMax = Math.min(wavesAmplitude * 0.5, vvAbs),
        vvDelta = (vvMax - vvMin) * 0.01,
        vvDirSwitchPause = 600,
        bobAmp,
        bobTiltAmp = 5 * (Math.PI / 180),
        bobTiltCycleMod = Math.PI * 1.5,
        waterRaysInactive = [],
        waterRaysActive = [],
        rayTexture,
        rayTexturePath = "assets/textures/light_ray.png",
        numRays = 20,
        rayWidth = 700,
        rayHeight = 2000,
        rayHeightVariation = rayHeight * 0.5,
        lightAngle = (-Math.PI * 0.1),
        rayShowChance = 0.001,
        rayOpacityOn = 0.6,
        rayOpacityDelta = 0.02,
        environment;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    water.init = init;
    water.waves = waves;
    water.get_environment = function () { return environment; };
    water.bob = bob;
        
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init ( parameters ) {
        var i, ray, rayGeometry, rayMaterial;
        
        // handle parameters
        
        parameters = parameters || {};
        
        wavesColor = parameters.wavesColor || wavesColor;
        
        wavesSize = parameters.wavesSize || wavesSize;
        
        wavesVertsW = parameters.wavesVertsW || wavesVertsW;
        
        wavesVertsH = parameters.wavesVertsH || wavesVertsH;
        
        wavesSpeed = parameters.wavesSpeed || wavesSpeed;
        
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
        
        rayHeightVariation = parameters.rayHeightVariation || rayHeightVariation;
        
        lightAngle = parameters.lightAngle || lightAngle;
        
        rayShowChance = parameters.rayShowChance || rayShowChance;
        
        rayOpacityOn = parameters.rayOpacityOn || rayOpacityOn;
        
        rayOpacityDelta = parameters.rayOpacityDelta || rayOpacityDelta;
        
        // environment
        
        environment = new THREE.Object3D();
        
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
		wavesMesh.dynamic = true;
        
        environment.add( wavesMesh );
        
        // water rays
        
        rayGeometry = new THREE.PlaneGeometry ( rayWidth, rayHeight + (Math.random() * (rayHeightVariation) - (rayHeightVariation * 0.5)) );
        
        rayTexture = new THREE.Texture( main.utils.loader.assets[rayTexturePath] ); 
        rayTexture.needsUpdate = true;
        
        for ( i = 0; i < numRays; i += 1 ) {
        
            rayMaterial = new THREE.MeshLambertMaterial( { color: wavesColor, map: rayTexture, opacity: 0, depthTest: false } );
            
			ray = new THREE.Mesh( rayGeometry, rayMaterial );
            
            ray.rotation.set( Math.PI * 0.5 - lightAngle, -Math.PI * 0.5, 0); //
            
            // add to inactive water rays list
            waterRaysInactive[waterRaysInactive.length] = {
                ray: ray,
                material: rayMaterial,
                targetOpacity: rayOpacityOn,
                targetOpacityDir: 1
            };
            
            // add to environment
            environment.add( ray );
        }
        
    }
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function show_ray (tri) {
        var mat = tri.material,
            halfDelta = rayOpacityDelta * 0.5;
        
        // increase material opacity towards target
        mat.opacity += (halfDelta + Math.random() * halfDelta) * tri.targetOpacityDir;
        
        // if at or below 0, stop showing
        if (tri.targetOpacity === 0 && mat.opacity <= tri.targetOpacity) {
            tri.targetOpacityDir = 1;
            tri.targetOpacity = rayOpacityOn;
            
            waterRaysActive.splice(tri.activeIndex, 1);
            
            waterRaysInactive[waterRaysInactive.length] = tri;
        }
        // else keep ray showing
        else {
            if (tri.targetOpacity === rayOpacityOn && mat.opacity >= tri.targetOpacity){
                tri.targetOpacityDir = -1;
                tri.targetOpacity = 0;
            }
            
            // recursive call until done
            window.requestAnimationFrame(function () { show_ray(tri); });   
        }
        
    }
    
    function waves( time ) {
        
        var wavesVerts = wavesGeometry.vertices, 
            vert, variation, vvw = wavesVertsW - 1, vvh = wavesVertsH - 1,
            waterRayInfo, waterRay, i, l;
        
        // update wave time
        waveTime = time * wavesSpeed;
        
        for ( i = 0; i < wavesVertsW; i += 1 ) {
            for ( l = 0; l < wavesVertsH; l += 1 ) {
                vert = wavesVerts[ i + l * wavesVertsH ];
                
                // set water vert
                vert.position.z = wavesAmplitude * ( Math.cos( i / wavesFrequency  + waveTime ) + Math.sin( l / wavesFrequency + waveTime ) );
                
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
                
                // check vert z, if low enough 
                // and there are inactive water rays, show water ray
                if (vert.position.z < -wavesAmplitude && waterRaysInactive.length > 0 && Math.random() <= rayShowChance) {
                
                    // get next ray by removing last from inactive
                    waterRayInfo = waterRaysInactive.pop();
                    waterRay = waterRayInfo.ray;
                    
                    // set ray position to position of triggering water vertex
                    waterRay.position.set(vert.position.x, vert.position.y, -(vert.position.z + rayHeight * 0.5 + wavesAmplitude));
                    
                    // record active index for later so we dont have to search
                    waterRayInfo.activeIndex = waterRaysActive.length;
                    
                    // add to list of active rays
                    waterRaysActive[waterRaysActive.length] = waterRayInfo;
                    
                    // show ray
                    show_ray(waterRayInfo);
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
        object.position.y = (Math.sin(waveTime) * bobAmp);
        object.rotation.x = Math.sin(waveTime + bobTiltCycleMod) * bobTiltAmp;
    }
    
    return main; 
    
}(KAIOPUA || {}));