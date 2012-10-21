/*
 *
 * Skybox.js
 * Skybox instance.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/env/Skybox.js",
		_Skybox = {},
		_Model;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Skybox,
		requirements: [
			"js/kaiopua/core/Model.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m ) {
		console.log('internal Skybox');
		_Model = m;
		
		_Skybox.Instance = Skybox;
		_Skybox.Instance.prototype = new _Model.Instance();
		_Skybox.Instance.prototype.constructor = _Skybox.Instance;
		
	}

    /*===================================================
    
    instance
    
    =====================================================*/
    
    function Skybox ( imagesAssetPath, mapping ) {
		
		var ap = imagesAssetPath,
			textureCube,
			shader,
			material;
		
		// cube texture
		
		textureCube = new THREE.Texture( null, mapping );
		textureCube.format = THREE.RGBFormat;
		textureCube.flipY = false;
		
		main.asset_require( [ 
			ap + "_posx.jpg",
			ap + "_negx.jpg",
			ap + "_posy.jpg",
			ap + "_negy.jpg",
			ap + "_posz.jpg",
			ap + "_negz.jpg"
		], function ( posx, negx, posy, negy, posz, negz ) {
			
			textureCube.image = [ posx, negx, posy, negy, posz, negz ];
			textureCube.needsUpdate = true;
			
		} );
		
		// shader
		
		shader = $.extend(true, {}, THREE.ShaderUtils.lib[ "cube" ]);
		shader.uniforms[ "tCube" ].value = textureCube;
		
		// material
		
		material = new THREE.ShaderMaterial( {
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		} );
		
		// proto
		
		_Model.Instance.call( this, {
            geometry: new THREE.CubeGeometry( 100, 100, 100 ),
			material: material,
			shading: THREE.SmoothShading
        } );
        
    }
    
} ( KAIOPUA ) );