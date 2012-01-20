/*
ObjectMaker.js
Object generator module, handles generation of misc things.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/utils/ObjectMaker",
		objectmaker = {},
		model;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
    objectmaker.make_skybox = make_skybox;
	
	objectmaker = main.asset_register( assetPath, objectmaker, true );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	main.assets_require( [
		"assets/modules/core/Model"
	], init_internal, true );
	
	function init_internal ( m ) {
		console.log('internal objectmaker');
		model = m;
		
		main.asset_ready( assetPath );
		
	}

    /*===================================================
    
    maker functions
    
    =====================================================*/
    
    // generates a skybox from array of images
    
    function make_skybox ( imagesAssetPath, mapping, instance ) {
		
		var textureCube,
			shader,
			material;
		
		instance = instance || {};
		
		// get images from assets
		
		ap = imagesAssetPath;
		
		// cube texture
		
		textureCube = new THREE.Texture( null, mapping );
		
		main.assets_require( [ 
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
		shader.uniforms[ "tCube" ].texture = textureCube;
		
		// material
		
		material = new THREE.ShaderMaterial( {

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false
			
		} );
		
		// instance
		
		instance = model.instantiate( {
            geometry: new THREE.CubeGeometry( 100, 100, 100 ),
			materials: material,
			shading: THREE.SmoothShading,
			flipSided: true
        }, instance );
        
        return instance;
        
    }
        
    return main; 
    
}(KAIOPUA || {}));