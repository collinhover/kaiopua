/*
ObjectMaker.js
Object generator module, handles generation of misc things.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        workers = game.workers = game.workers || {},
        objectmaker = workers.objectmaker = workers.objectmaker || {};
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    objectmaker.make_skybox = make_skybox;
    
    /*===================================================
    
    misc objects
    
    =====================================================*/
    
    // generates a skybox from array of images
    
    function make_skybox ( imagesAssetPath, mapping ) {
		
		var assets = main.utils.loader.assets,
			model = game.core.model,
			images,
			textureCube,
			shader,
			material,
			model;
		
		// get images from assets
		
		ap = imagesAssetPath;
		
		images = [ assets[ap + "_posx.jpg"], assets[ap + "_negx.jpg"],
						 assets[ap + "_posy.jpg"], assets[ap + "_negy.jpg"],
						 assets[ap + "_posz.jpg"], assets[ap + "_negz.jpg"] ];
		
		// cube texture
		
		textureCube = new THREE.Texture( images, mapping );
		textureCube.needsUpdate = true;
		
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
		
		// model
		
		model = model.instantiate( {
            geometry: new THREE.CubeGeometry( 100, 100, 100 ),
			materials: material,
			shading: THREE.SmoothShading,
			flipSided: true
        } );
        
        return model;
        
    }
        
    return main; 
    
}(KAIOPUA || {}));