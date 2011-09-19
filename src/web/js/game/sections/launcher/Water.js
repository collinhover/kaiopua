/*
Water.js
Launcher section water handler.
*/

define([],
function () {
    var waterGeometry, 
        waterMaterial,
        waterMesh,
        waterFog,
        color = 0x529ad1,
        size = 10000,
        vertsW = 50,
        vertsH = 50,
        vertsNum,
        time = 0,
        speed = 0.04,
        speedMod = 0.5,
        amplitude = 200,
        frequency = 4,
        vertVariations = [],
        vvAbs = 35,
        vvMin = -Math.min(amplitude * 0.5, vvAbs),
        vvMax = Math.min(amplitude * 0.5, vvAbs),
        vvDelta = (vvMax - vvMin) * 0.01,
        vvDirSwitchPause = 600,
        cameraBobAmp = amplitude * 1.5,
        cameraTiltAmp = 5 * (Math.PI / 180),
        cameraTiltCycleMod = Math.PI * 1.5;
        
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init () {
        var i;
        
        // create water geometry
        waterGeometry = new THREE.PlaneGeometry( size, size, vertsW - 1, vertsH - 1 );
        waterGeometry.dynamic = true;
        
        // per vert variation
        vertsNum = waterGeometry.vertices.length;
        for ( i = 0; i < vertsNum; i += 1 ) {
            vertVariations[ i ] = {
                amplitude : Math.random() * (vvMax - vvMin) + vvMin,
                dir : 1,
                dirSwitch : Math.round(Math.random() * (vvDirSwitchPause * 0.5) + (vvDirSwitchPause * 0.5)),
                dirSwitchCount : Math.round(Math.random() * (vvDirSwitchPause * 0.5) + (vvDirSwitchPause * 0.5))
            };
        }
        
        // water material
        waterMaterial = new THREE.MeshLambertMaterial( { color: color } );
        
        // water mesh
        waterMesh = new THREE.Mesh( waterGeometry, waterMaterial );
        
        // fog
        waterFog = new THREE.Fog( color, - 100, size );
    }
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function waves() {
        
        var waterVerts = waterGeometry.vertices, 
            vert, variation, vvw = vertsW - 1, vvh = vertsH - 1,
            i, l;
        
        // update wave time
        //time = new Date().getTime() * speedMod;
        time += speed * speedMod;
        time = time % (Math.PI * 2);
        
        for ( i = 0; i < vertsW; i += 1 ) {
            for ( l = 0; l < vertsH; l += 1 ) {
                vert = waterVerts[ i + l * vertsH ];
                
                // set water vert
                vert.position.z = amplitude * ( Math.cos( i / frequency  + time ) + Math.sin( l / frequency + time ) );
                
                // set water vert variation
                if( i !== 0 && i !== vvw && l !== 0 && l !== vvh) {
                    variation = vertVariations[ i + l * vertsH ];
                    
                    // update variation amplitude
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
		waterGeometry.computeFaceNormals();
		waterGeometry.computeVertexNormals();
        
        // tell three to update vertices
		waterGeometry.__dirtyVertices = true;
	}
    
    // return something to define module
    return {
        init: init,
        waves : waves,
        get_mesh : function () { return waterMesh; },
        get_fog : function () { return waterFog; },
        get_time : function () { return time; },
        cameraBobAmp : cameraBobAmp,
        cameraTiltAmp : cameraTiltAmp,
        cameraTiltCycleMod : cameraTiltCycleMod
    };
});