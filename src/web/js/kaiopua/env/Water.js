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
		assetPath = "js/kaiopua/env/Water.js",
		_Water = {},
		_Model,
		_ObjectHelper;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Water,
		requirements: [
			"js/kaiopua/core/Model.js",
			"js/kaiopua/utils/ObjectHelper.js",
			shared.pathToTextures + "water_512.png"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, oh, wavesImage ) {
		console.log('internal water');
		// assets
		
		_Model = m;
		_ObjectHelper = oh;
		
		// properties
		
		_Water.options = {
			intersectable: false
		};
		
		_Water.wavesTexture = new THREE.Texture( wavesImage );
		_Water.wavesTexture.needsUpdate = true;
		
		// instance
		
		_Water.Instance = Water;
		_Water.Instance.prototype = new _Model.Instance();
		_Water.Instance.prototype.constructor = _Water.Instance;
		
	}
        
    /*===================================================
    
    water
    
    =====================================================*/
    
    function Water ( parameters ) {
		
		parameters = parameters || {};
		
        var i, l,
			wavesInfo,
			vvInfo,
			wavesGeometry,
			wavesMaterial,
			wavesTexture,
			wavesVertsW,
			wavesVertsH,
			wavesNumHorizontal,
			wavesNumVertical,
			wavesSpeed,
			wavesAmplitude,
			wavesFrequency,
			wavesColor,
			wavesAmbient,
			wavesSize,
			waves,
			wavesVertsNum,
			wavesFaces,
			face,
			faceCentroid,
			faceDist,
			darknessDistMin,
			darknessDistMax,
			opacityDistMin,
			opacityDistMax,
			centerPoint,
			vvAmpMax,
			vvAmpMin,
			vvAmpDelta,
			vvFreqMax,
			vvFreqMin,
			vvFreqDelta,
			vvFreqLast,
			vvDirSwitchDelta;
		
		// waves info
		
		wavesInfo = this.waves = {};
		wavesInfo.time = 0;
		wavesColor = parameters.wavesColor || 0x0bdafa;
		wavesAmbient = parameters.wavesAmbient || 0x3492D4;
		wavesSize = parameters.wavesSize || 10000;
		wavesInfo.vertsW = wavesVertsW = parameters.wavesVertsW || 100;
		wavesInfo.vertsH = wavesVertsH = parameters.wavesVertsH || 100;
		wavesInfo.numHorizontal = wavesNumHorizontal = parameters.wavesNumHorizontal || 80;
		wavesInfo.numVertical = wavesNumVertical = parameters.wavesNumVertical || 80;
		wavesInfo.speed = wavesSpeed = parameters.wavesSpeed || 0.001;
		wavesInfo.amplitude = wavesAmplitude = parameters.wavesAmplitude || 50;
		wavesInfo.frequency = wavesFrequency = parameters.wavesFrequency || 0.5;
		wavesInfo.timePerCycle = 1000 * ( Math.PI * 2 ) * ( 1000 * wavesSpeed );
		
		// vertex variations information
		vvInfo = wavesInfo.vv = {};
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
		
		// plane geometry should lay flat
		
		_ObjectHelper.apply_matrix( wavesGeometry, new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
		
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
		
		wavesMaterial = new THREE.MeshLambertMaterial( { 
			ambient: wavesAmbient, 
			color: wavesColor,
			shading: THREE.SmoothShading,
			transparent: true,
			opacity: parameters.wavesOpacity || 0.9,
			side: THREE.DoubleSide
		} );
		
		// waves texture
		
		if ( typeof parameters.wavesTexture === 'string' ) {
			
			wavesTexture = new THREE.Texture();
			
			main.asset_require( parameters.wavesTexture, function ( img ) {
				
				wavesTexture.image = img;
				wavesTexture.needsUpdate = true;
				
			});
			
			wavesMaterial.map = wavesTexture;
			
		}
		else {
			
			wavesMaterial.map = _Water.wavesTexture;
			
		}
		
		// create wave morph targets
		
		var numWavesMorphs = 10,
			morphTimeDelta = wavesInfo.timePerCycle / numWavesMorphs,
			waveVertices, 
			morphTarget, 
			morphTargetVertices,
			morphTargetVertexIndex,
			morphTargetVertex,
			v;
		
		function zeroPad(num,count)
		{
			var numZeropad = num + '';
			while(numZeropad.length < count) {
				numZeropad = "0" + numZeropad;
			}
			return numZeropad;
		}
		
		for ( i = 0, l = numWavesMorphs; i < l; i ++ ) {
			
			// init next morph target
			morphTarget = wavesGeometry.morphTargets[ i ] = {};
			morphTarget.name = 'waves_' + zeroPad( i, 4 );
			morphTarget.vertices = [];
			
			// get next morph target
			
			waveVertices = make_waves( morphTimeDelta );
			
			// add vertices
			
			morphTargetVertices = morphTarget.vertices;
			
			for ( v = 0; v < wavesVertsW * wavesVertsH; v ++ ) {
					
				morphTargetVertexIndex = v;
				
				morphTargetVertex = wavesGeometry.vertices[ morphTargetVertexIndex ];
				
				morphTargetVertices.push( new THREE.Vector3( morphTargetVertex.x, waveVertices[ morphTargetVertexIndex ], morphTargetVertex.z ) );
				
			}
			
		}
		
		// functions

		function make_waves ( time ) {

			var wavesVerts = wavesGeometry.vertices,
				wavesTime,
				wavesVertsNew = new Array( wavesVertsW * wavesVertsH * 3 ),
				vertVariations = vvInfo.list,
				vertIndex,
				vert,
				variation,
				vvAmp,
				vvFreq,
				vvw = wavesVertsW - 1,
				vvh = wavesVertsH - 1,
				vvpw,
				vvph,
				i, l;

			// update wave time
			wavesTime = wavesInfo.time += time * wavesSpeed;

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

						// update variation wavesAmplitude
						variation.amplitude = Math.min(vvAmpMax, Math.max(vvAmpMin, variation.amplitude + vvAmpDelta * variation.dir ));

						// update variation wavesFrequency
						vvFreq = wavesFrequency + Math.min( vvFreqMax, Math.max(vvFreqMin, variation.frequency + vvFreqDelta * variation.dir) );

						// check for switch direction of variation
						if ( variation.dirSwitch > variation.dirSwitchCount ) {
							variation.dir = -variation.dir;
							variation.dirSwitch = 0;
						}
						variation.dirSwitch += vvInfo.dirSwitchDelta * variation.dir;

						// set variation amp
						vvAmp = variation.amplitude;
					}
					else {
						vvAmp = 0;
						vvFreq = wavesFrequency;
					}

					// set water vert, x/y/z

					vertIndex = i + l * wavesVertsH;

					//wavesVertsNew[ vertIndex ] = vert.x;
					//wavesVertsNew[ vertIndex + 1 ] = vert.y;
					wavesVertsNew[ vertIndex ] = vvAmp + wavesAmplitude * ( Math.cos( vvpw * vvFreq + wavesTime ) + Math.sin( vvph * vvFreq + wavesTime ) );
					
				}
			}

			return wavesVertsNew;

		}
	
		// prototype constructor
		
		parameters.geometry = wavesGeometry;
		parameters.material = wavesMaterial;
		
		_Model.Instance.call( this, parameters );
		
		this.options = $.extend( true, this.options || {}, _Water.options, parameters.options );
		
    }
    
} ( KAIOPUA ) );