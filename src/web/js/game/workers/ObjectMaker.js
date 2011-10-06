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
    
    objectmaker.make_model = make_model;
    objectmaker.find_objs_with_materials = find_objs_with_materials;
    objectmaker.generate_skybox = generate_skybox;
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    // adds functionality to basic mesh/model objects
    // default is vertex coloring
    
    function make_model ( parameters ) {
        var i, l,
            model = {},
            geometry,
            materials,
            materialsForShading,
            material,
            mesh,
            scale;
        
        // handle parameters
        
        parameters = parameters || {};
            
        // geometry
        
        geometry = parameters.geometry || new THREE.Geometry();
        
        // material
        
        materials = parameters.materials || new THREE.MeshFaceMaterial();
        
        materials = materials && materials.length ? materials : [ materials ];
        
        // shading
        
        materialsForShading = geometry.materials && geometry.materials.length > 0 ? geometry.materials : materials;
        
        for ( i = 0, l = materialsForShading.length; i < l; i += 1) {
            material = materialsForShading[i][0];
            if (typeof material.shading !== 'undefined' ) {
                material.shading = parameters.shading || THREE.SmoothShading; // (1 = flat, 2 = smooth )
            }
        }
        
        // mesh
        
        mesh = new THREE.Mesh( geometry, material );
        
        // scale
        
        scale = parameters.scale || 1;
        
        mesh.scale.set( scale, scale, scale );
        
        // public properties
        
        model.mesh = mesh;
        
        return model;
    }
    
    // finds all objects with own materials
    // will iterate through all children recursively
    
    function find_objs_with_materials ( objsList ) {
        var obj, objsWithMats = [], i;
        
        for (i = objsList.length - 1; i >= 0; i -= 1) {
            obj = objsList[i];
            
            if (typeof obj.materials !== 'undefined' && obj.materials.length > 0) {
                objsWithMats[objsWithMats.length] = obj;
            }
            else if (obj.children.length > 0)  {
                objsWithMats = objsWithMats.concat(find_objs_with_materials(obj.children));
            }
        }
        
        return objsWithMats;
    }
    
    // generates a skybox from array of images
    
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
        
    return main; 
    
}(KAIOPUA || {}));