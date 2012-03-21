/*
 *
 * Puzzles.js
 * Generates water plane for world
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/env/WaterLauncher.js",
		_WaterLauncher = {},
		rayTexturePath = "assets/textures/light_ray.png";
    
     /*===================================================
    
    public
    
    =====================================================*/
    
    _WaterLauncher.Instance = WaterLauncher;
	_WaterLauncher.Instance.prototype.generate_waves = generate_waves;
	
	main.asset_register( assetPath, { data: _WaterLauncher } );
        
    /*===================================================
    
    water
    
    =====================================================*/
    
    function WaterLauncher ( parameters ) {
		
		parameters = parameters || {};
		
        var i, l,
			wavesInfo,
			vvInfo,
			wavesGeometry,
			wavesMaterial,
			wavesMesh,
			wavesVertsW,
			wavesVertsH,
			wavesNumHorizontal,
			wavesNumVertical,
			wavesSpeed,
			wavesAmplitude,
			wavesFrequency,
			wavesColor,
			wavesSize,
			wavesVertsNum,
			vvAmpMax,
			vvAmpMin,
			vvAmpDelta,
			vvFreqMax,
			vvFreqMin,
			vvFreqDelta,
			vvFreqLast,
			vvDirSwitchDelta,
			rays,
			rayGeometry,
			rayTexture,
			rayMaterial,
			rayMesh,
			numRays;
		
		// environment
        
        this.environment = new THREE.Object3D();
		
		this.environment.rotation.x = -90 * Math.PI / 180;
		this.environment.rotation.z = -Math.PI * 0.5;
		
		// waves
		
		this.waves = {};
		
		// waves info
		
		wavesInfo = this.waves.info = {};
		wavesInfo.time = 0;
		wavesColor = parameters.wavesColor || 0x0bdafa;
		wavesSize = parameters.wavesSize || 10000;
		wavesInfo.vertsW = wavesVertsW = parameters.wavesVertsW || 50;
		wavesInfo.vertsH = wavesVertsH = parameters.wavesVertsH || 50;
		wavesInfo.numHorizontal = wavesNumHorizontal = parameters.wavesNumHorizontal || 30;
		wavesInfo.numVertical = wavesNumVertical = parameters.wavesNumVertical || 30;
		wavesInfo.speed = wavesSpeed = parameters.wavesSpeed || 0.001;
		wavesInfo.amplitude = wavesAmplitude = parameters.wavesAmplitude || 100;
		wavesInfo.frequency = wavesFrequency = parameters.wavesFrequency || 0.5;
		wavesInfo.timePerCycle = 1000 * ( Math.PI * 2 ) * ( 1000 * wavesSpeed );
		
		// vertex variations information
		vvInfo = this.waves.vertVariations = {};
		vvInfo.list = [];
		vvInfo.ampAbs = parameters.vvAmpAbs || 35;
		vvInfo.ampMin = vvAmpMin = -Math.min(wavesInfo.amplitude * 0.5, vvInfo.ampAbs);
		vvInfo.ampMax = vvAmpMax = Math.min(wavesInfo.amplitude * 0.5, vvInfo.ampAbs);
		vvInfo.ampDelta = vvAmpDelta = (vvAmpMax - vvAmpMin) * 0.01;
		vvInfo.freqAbs = wavesFrequency;
		vvInfo.freqMin = vvFreqMin = -vvInfo.freqAbs * 0.05;
		vvInfo.freqMax = vvFreqMax = vvInfo.freqAbs * 0.05;
		vvInfo.freqDelta = vvFreqDelta = (vvFreqMax - vvFreqMin) * 0.001;
		vvInfo.dirSwitchPause = wavesInfo.timePerCycle * 0.5;
		vvInfo.dirSwitchDelta = vvDirSwitchDelta = vvInfo.dirSwitchPause / 60;
        
        // create water geometry
		
        wavesGeometry = new THREE.PlaneGeometry( wavesSize, wavesSize, wavesVertsW - 1, wavesVertsH - 1 );
        wavesGeometry.dynamic = true;
		
        // per vert variation
		
        wavesVertsNum = wavesGeometry.vertices.length;
		
		vvFreqLast = (vvFreqMax - vvFreqMin) * 0.5;
		
        for ( i = 0; i < wavesVertsNum; i ++ ) {
			
            vvInfo.list[ i ] = {
                amplitude: Math.random() * (vvAmpMax - vvAmpMin) + vvAmpMin,
				frequency: vvFreqLast * 0.75 + (Math.random() * (vvFreqMax - vvFreqMin) + vvFreqMin) * 0.25,
                dir: 1,
                dirSwitch: Math.round(Math.random() * (vvInfo.dirSwitchPause * 0.5) + (vvInfo.dirSwitchPause * 0.5)),
                dirSwitchCount: Math.round(Math.random() * (vvInfo.dirSwitchPause * 0.5) + (vvInfo.dirSwitchPause * 0.5))
            };
			
			vvFreqLast = vvInfo.list[ i ].frequency;
			
        }
        
        // waves material
		
		wavesMaterial = new THREE.MeshPhongMaterial( { 
			ambient: wavesColor, 
			color: wavesColor,
			specular: 0x00daff, 
			shininess: 10, 
			shading: THREE.SmoothShading,
			transparent: true,
			opacity: 0.8
		} );
		
		// water mesh
		
        wavesMesh = this.waves.mesh = new THREE.Mesh( wavesGeometry, wavesMaterial );
        wavesMesh.doubleSided = true;
		wavesMesh.dynamic = true;
		
        this.environment.add( wavesMesh );
		
		// water rays
		
		rays = this.waves.rays = {};
		
		numRays = parameters.numRays || 20;
		
		rays.width = parameters.rayWidth || 700;
		rays.height = parameters.rayHeight || 2000;
        rays.heightVariation = rays.height * 0.5;
		rays.inactive = [];
		rays.active = [];
        rays.lightAngle = (-Math.PI * 0.1);
        rays.showChance = 0.0001;
        rays.opacityOn = 0.6;
        rays.opacityDelta = 0.01;
		
		// ray geometry
		
        rayGeometry = new THREE.PlaneGeometry ( rays.width, rays.height + ( Math.random() * ( rays.heightVariation ) - ( rays.heightVariation * 0.5 ) ) );
		
		// ray texture
		
        rayTexture = new THREE.Texture(); 
		
		main.asset_require( rayTexturePath, function ( img ) {
			
			rayTexture.image = img;
			rayTexture.needsUpdate = true;
			
		});
		
		// generate all rays
		
        for ( i = 0; i < numRays; i ++ ) {
			
			// material
        
            rayMaterial = new THREE.MeshBasicMaterial( { color: wavesColor, map: rayTexture, opacity: 0, depthTest: false } );
            
			// ray
			
			rayMesh = new THREE.Mesh( rayGeometry, rayMaterial );
            
            rayMesh.rotation.set( Math.PI * 0.5 - rays.lightAngle, 0, 0);
            
            // add to inactive water rays list
            rays.inactive[ rays.inactive.length ] = {
                ray: rayMesh,
                material: rayMaterial,
                targetOpacity: rays.opacityOn,
                targetOpacityDir: 1
            };
            
            // add to environment
			
            this.environment.add( rayMesh );
			
        }
		
		// ray function
		
		rays.show_ray = function ( rayInfo ) {
			
			var material = rayInfo.material,
				halfDelta = rays.opacityDelta * 0.5;
			
			// increase material opacity towards target
			
			material.opacity += ( halfDelta + Math.random() * halfDelta ) * rayInfo.targetOpacityDir;
			
			// if at or below 0, stop showing
			
			if ( rayInfo.targetOpacity === 0 && material.opacity <= rayInfo.targetOpacity ) {
				
				rayInfo.targetOpacityDir = 1;
				rayInfo.targetOpacity = rays.opacityOn;
				
				rays.active.splice( rayInfo.activeIndex, 1 );
				
				rays.inactive[ rays.inactive.length ] = rayInfo;
				
			}
			// else keep ray showing
			else {
				
				if ( rayInfo.targetOpacity === rays.opacityOn && material.opacity >= rayInfo.targetOpacity ) {
					
					rayInfo.targetOpacityDir = -1;
					rayInfo.targetOpacity = 0;
					
				}
				
				// recursive call until done
				
				window.requestAnimationFrame( function () { rays.show_ray( rayInfo ); } );   
			}
			
		}
		
	}
		
	// functions

	function generate_waves ( time ) {
		
		var i, l,
			waves = this.waves,
			wavesInfo = waves.info,
			wavesMesh = waves.mesh,
			wavesGeometry = wavesMesh.geometry,
			wavesVerts = wavesGeometry.vertices,
			wavesTime,
			wavesVertsW = wavesInfo.vertsW,
			wavesVertsH = wavesInfo.vertsH,
			wavesNumHorizontal = wavesInfo.numHorizontal,
			wavesNumVertical = wavesInfo.numVertical,
			wavesAmplitude = wavesInfo.amplitude,
			wavesFrequency = wavesInfo.frequency,
			vvInfo = waves.vertVariations,
			vertVariations = vvInfo.list,
			vertIndex,
			vert,
			variation,
			vvAmp,
			vvAmpMax = vvInfo.ampMax,
			vvAmpMin = vvInfo.ampMin,
			vvAmpDelta = vvInfo.ampDelta,
			vvFreq,
			vvFreqMax = vvInfo.freqMax,
			vvFreqMin = vvInfo.freqMin,
			vvFreqDelta = vvInfo.freqDelta,
			vvDirSwitchDelta = vvInfo.dirSwitchDelta,
			vvw = wavesVertsW - 1,
			vvh = wavesVertsH - 1,
			vvpw,
			vvph,
			rays = waves.rays,
			rayInfo,
			ray;
		
		// update wave time
		wavesTime = wavesInfo.time += time * wavesInfo.speed;
		
		for ( i = 0; i < wavesVertsW; i ++ ) {
			for ( l = 0; l < wavesVertsH; l ++ ) {

				vertIndex = i + l * wavesVertsH;

				vert = wavesVerts[ vertIndex ];

				vvpw = wavesNumHorizontal * ( i / wavesVertsW );
				vvph = wavesNumVertical * ( l / wavesVertsH );

				// reset variation amp

				vvAmp = 0;

				// set water vert variation
				if( i !== 0 && i !== vvw && l !== 0 && l !== vvh) {
					
					variation = vertVariations[ i + l * wavesVertsH ];

					// update variation amplitude
					variation.amplitude = Math.min( vvAmpMax, Math.max( vvAmpMin, variation.amplitude + vvAmpDelta * variation.dir ));

					// update variation wavesFrequency
					vvFreq = wavesFrequency + Math.min( vvFreqMax, Math.max(vvFreqMin, variation.frequency + vvFreqDelta * variation.dir ) );

					// check for switch direction of variation
					if ( variation.dirSwitch > variation.dirSwitchCount ) {
						variation.dir = -variation.dir;
						variation.dirSwitch = 0;
					}
					variation.dirSwitch += vvDirSwitchDelta * variation.dir;

					// set variation amp
					vvAmp = variation.amplitude;
					
				}
				else {
					
					vvAmp = 0;
					vvFreq = wavesFrequency;
					
				}
				
				// set water vert z
				
				vert.position.z = vvAmp + wavesAmplitude * ( Math.cos( vvpw * vvFreq + wavesTime ) + Math.sin( vvph * vvFreq + wavesTime ) );
				
				// check vert z, if low enough 
                // and there are inactive water rays, show water ray
                if (vert.position.z < -wavesAmplitude && rays.inactive.length > 0 && Math.random() <= rays.showChance ) {
                
                    // get next ray by removing last from inactive
					
                    rayInfo = rays.inactive.pop();
                    ray = rayInfo.ray;
                    
                    // set ray position to position of triggering water vertex
					
                    ray.position.set( vert.position.x, vert.position.y, -( vert.position.z + rays.height * 0.5 + wavesAmplitude ) );
                    
                    // record active index for later so we dont have to search
					
                    rayInfo.activeIndex = rays.active.length;
                    
                    // add to list of active rays
					
                    rays.active[ rays.active.length ] = rayInfo;
                    
                    // show ray
					
                    rays.show_ray( rayInfo );
					
                }
				
			}
		}
		
		// recompute normals for correct lighting
		// very heavy on processing
		wavesGeometry.computeFaceNormals();
		wavesGeometry.computeVertexNormals();
		
		// tell three to update vertices
		wavesGeometry.__dirtyVertices = true;
		wavesGeometry.__dirtyNormals = true;

	}
    
} ( KAIOPUA ) );