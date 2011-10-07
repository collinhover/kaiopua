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
    
    model
    
    =====================================================*/
    
    // adds functionality to basic mesh/model objects
    // default is vertex colored model
    
    function make_model ( parameters ) {
        var i, l,
            model = {},
            geometry,
            materials,
            materialsForShading,
            material,
            mesh,
            scale,
            morphs;
        
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
                // (1 = flat, 2 = smooth )
                material.shading = parameters.shading || THREE.SmoothShading; 
            }
        }
        
        // mesh
        
        mesh = new THREE.Mesh( geometry, material );
        
        // scale
        
        scale = parameters.scale || 1;
        
        mesh.scale.set( scale, scale, scale );
        
        // morphs
        
        morphs = make_morphs_handler( geometry );
        
        /*
        main.utils.dev.log( morphs.animations.names.length );
        main.utils.dev.log( morphs.animations.names[0] );
        
        main.utils.dev.log( morphs.animations.maps.horn_small[0].index );
        main.utils.dev.log( morphs.animations.maps.horn_small[0].number );
        main.utils.dev.log( morphs.animations.maps.horn_big[0].index );
        main.utils.dev.log( morphs.animations.maps.horn_big[0].number );
        */
        
        // public properties
        
        model.mesh = mesh;
        model.morphs = morphs;
        
        return model;
    }
    
    /*===================================================
    
    morphs
    
    =====================================================*/
    
    // creates handler for a model's morphs (animations and colors)
    // records indices of morphs (targets or colors) in geometry object
    // groups morphs into each single animation cycle by name
    // naming scheme is 'name' + 'number'
    
    function make_morphs_handler ( geometry ) {
        var i, l,
            morphTargets = geometry.morphTargets || [],
            morphColors = geometry.morphColors || [],
            morphs = {},
            animations,
            colors;
        
        // morph targets ( animations )
        
        morphs.animations = animations = parse_morph_list( morphTargets );
        
        // morph colors
        
        morphs.colors = colors = parse_morph_list( morphColors );
        
        return morphs;
    }
    
    function parse_morph_list ( morphs ) {
        var i, l,
            data = {},
            names = [],
            maps = {},
            morph,
            name,
            nameParsed,
            map;
        
        for ( i = 0, l = morphs.length; i < l; i += 1 ) {
            
            morph = morphs[i];
            
            name = morph.name;
            
            // extract base name and number
            
            nameParsed = parse_morph_name( name );
            
            // if morph map does not exist
            // create new map
            
            if ( typeof maps[ nameParsed.name ] === 'undefined' ) {
                
                // map array
                
                map = [];
                
                // add map to names and maps lists
                
                names[ i ] = nameParsed.name;
                
                maps[ nameParsed.name ] = map;
                
            }
            
            // get correct map
            
            map = maps[ nameParsed.name ];
            
            // add morph to current map
            
            map.push( { index: i, number: nameParsed.number } );
            
        }
        
        // sort maps
        
        for ( i = 0, l = names.length; i < l; i += 1 ) {
            
            map = maps[ names[i] ];
            
            // sort map by number
                
            map.sort( sort_morph_map );
        }
        
        // public properties
        
        data.names = names;
        data.maps = maps;
        
        return data;
    }
    
    function sort_morph_map ( a, b ) {
        
        return a.number - b.number;
        
    }
    
    function parse_morph_name( name ) {
        var nameParsed = { 
                name: name,
                number: 0
            },
            splitIndex,
            numberTest;
        
        // get split of base name and number by last _
        
        splitIndex = name.lastIndexOf('_');
        
        if ( splitIndex !== -1) {
            
            numberTest = parseFloat(name.substr( splitIndex + 1 ));
            
            // test if is number
            
            if ( !isNaN(numberTest) && isFinite(numberTest) ) {
                
                nameParsed.name = name.substr( 0, splitIndex );
                
                nameParsed.number = numberTest;
                
            }
        }
        
        return nameParsed;
    }
    
    /*===================================================
    
    misc
    
    =====================================================*/
    
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