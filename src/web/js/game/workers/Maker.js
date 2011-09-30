/*
Maker.js
Object generator module, handles generation of misc things.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        maker = game.maker = game.maker || {};
        
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function generate_skybox ( images, width, height, depth ) {
        
        var textureCube = new THREE.Texture( images );
        
        var shader = THREE.ShaderUtils.lib["cube"];
        
    	shader.uniforms["tCube"].texture = textureCube;
        
		var material = new THREE.MeshShaderMaterial( {
            
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms
            
		} ),
        
		mesh = new THREE.Mesh( new THREE.CubeGeometry( width || 100000, height || 100000, depth || 100000, 1, 1, 1, null, true ), material );
        
        return mesh;
        
    }
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    maker.generate_skybox = generate_skybox;
        
    return main; 
    
}(KAIOPUA || {}));