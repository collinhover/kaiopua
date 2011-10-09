/*
ObjectMaker.js
Object generator module, handles generation of misc things.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        workers = game.workers = game.workers || {},
        objectmaker = workers.objectmaker = workers.objectmaker || {},
        durationBase = 1000;
    
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
            materialsAll,
            material,
            mesh,
            scale,
            morphs;
        
        // handle parameters
        
        parameters = parameters || {};
            
        // geometry
        
        geometry = parameters.geometry || new THREE.Geometry();
        
        // material
        
        materials = parameters.materials || [];
        
        materials = materials && materials.length ? materials : [ materials ];
        
        // if using vertex colors
        
        if ( parameters.vertexColors === true || parameters.vertexColors === THREE.VertexColors ) {
            
            parameters.vertexColors = THREE.VertexColors;
            
            // set materials to face material
            
            materials = [new THREE.MeshFaceMaterial()];
            
        }
        
        // if has geometry materials
        
        if ( geometry.materials && geometry.materials.length > 0 ) {
            
            // add to all
            
            for ( i = 0, l = geometry.materials.length; i < l; i += 1) {
                materials.push( geometry.materials[i][0] );
            }
        }
        
        // if no materials yet, add default
        if ( materials.length === 0 ) {
            
            materials.push( new THREE.MeshLambertMaterial() );
            
        }

        // material properties
        
        for ( i = 0, l = materials.length; i < l; i += 1) {
            material = materials[i];
            
            // morph targets
            
            material.morphTargets = geometry.morphTargets.length > 0 ? true : false;
            
            // vertex colors
            
            material.vertexColors = parameters.vertexColors || THREE.FaceColors;
            
            // shading
            // (1 = flat, 2 = smooth )
            material.shading = parameters.shading || THREE.SmoothShading;
            
        }
        
        // mesh
        
        mesh = new THREE.Mesh( geometry, materials );
        
        // shadows
        
        mesh.castShadow = parameters.castShadow || false;
        mesh.receiveShadow = parameters.receiveShadow || false;
        
        // scale
        
        scale = parameters.scale || 1;
        
        mesh.scale.set( scale, scale, scale );
        
        // morphs
        
        morphs = make_morphs_handler( mesh );
        
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
    
    function make_morphs_handler ( mesh ) {
        var i, l,
            geometry = mesh.geometry,
            morphTargets = geometry.morphTargets || [],
            morphColors = geometry.morphColors || [],
            morphs = {},
            shapes,
            colors;
        
        // morph types
        
        morphs.shapes = shapes = parse_morph_list( morphTargets );
        
        morphs.colors = colors = {};// not supported yet // parse_morph_list( morphColors );
        
        // functions
        
        morphs.shift = function ( nameStart, nameEnd, duration, callback ) {
            
        };
        
        morphs.play = function ( name, duration, loop, callback ) {
            
            var shapesList = shapes.list,
                updates = shapes.updates,
                uNames = updates.names,
                uList = updates.list,
                updaterIndex,
                updater,
                info;
            
            // get if updater for animation exists
            
            updaterIndex = uNames.indexOf( name );
            
            // new updater
            
            if ( updaterIndex === -1 && typeof shapesList[ name ] !== 'undefined' ) {
            
                updater = make_morph_updater( name );
                
                info = updater.info;
                
                // add to lists
                
                uNames.push( name );
                
                uList[ name ] = updater;
                
                // handle arguments
                
                info.nameTarget = info.nameCurrent = name;
            
                info.duration = duration || durationBase;
                
                info.loop = loop || false;
                
                info.callback = callback;
                
                // store info
                
                info.mesh = mesh;
                
                info.morphList = shapesList[ name ];
                
                // set update function
                
                updater.update = function () {
                    morph_play( updater );
                };
                
                // start updating
                
                updater.start();
            
            }
            
        };
        
        morphs.stop = function () {
            
            var i, l,
                updates = shapes.updates,
                uNames = updates.names,
                uList = updates.list;
            
            for ( i = 0, l = uNames.length; i < l; i += 1 ) {
                
                uList[ uNames[i] ].stop();
                
            }
            
        };
        
        return morphs;
    }
    
    function parse_morph_list ( morphs ) {
        var i, l,
            data = {},
            list = {},
            names = [],
            updates = [],
            morph,
            name,
            nameParsed,
            morphData,
            map;
        
        for ( i = 0, l = morphs.length; i < l; i += 1 ) {
            
            morph = morphs[i];
            
            name = morph.name;
            
            // extract base name and number
            
            nameParsed = parse_morph_name( name );
            
            // if morph map does not exist
            // create new data
            
            if ( typeof list[ nameParsed.name ] === 'undefined' ) {
                
                names.push( nameParsed.name );
                
                list[ nameParsed.name ] = {
                    
                    map: []
                    
                };
                
            }
            
            // get correct data
            
            morphData = list[ nameParsed.name ];
            
            // get map
            
            map = morphData.map;
            
            // add morph to data map
            
            map.push( { index: i, number: nameParsed.number } );
            
        }
        
        // sort maps
        
        for ( i = 0, l = names.length; i < l; i += 1 ) {
            
            morphData = list[ names[i] ];
            
            map = morphData.map;
            
            // sort map by number
                
            map.sort( sort_morph_map );
        }
        
        // init updates
        
        updates.names = [];
        updates.list = {};
        
        // public properties
        data.list = list;
        data.names = names;
        data.updates = updates;
        
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
    
    function morph_colors_to_face_colors( geometry ) {

        if ( geometry.morphColors && geometry.morphColors.length ) {
            
			var colorMap = geometry.morphColors[ 0 ];

			for ( var i = 0; i < colorMap.colors.length; i ++ ) {

				geometry.faces[ i ].color = colorMap.colors[ i ];

			}

		}

	}
    
    /*===================================================
    
    morph updates
    
    =====================================================*/
    
    function make_morph_updater ( name ) {
        var updater = {};
        
        // init updater
        
        updater.info = {
            name: name,
            updating: false
        };
        
        updater.start = function () {
            
            updater.info.updating = true;
                
            shared.signals.update.add( updater.update );
            
        };
        
        updater.update = function () {};
        
        updater.stop = function () {
            
            updater.info.updating = false;
                
            shared.signals.update.remove( updater.update );
            
        };
        
        return updater;
    }
    
    function morph_play ( updater ) {
        
        var info = updater.info;
        
        
        
    }
    
    function morph_shift ( updater ) {
        
        
        
    }
    
    // shapes
    /*
    shapes.updater.update = function () {
        
        var i, l,
            list = shapes.list,
            updater = shapes.updater,
            info = updater.info,
            nameCurrent,
            nameTarget,
            dataCurrent,
            dataTarget,
            morphsMap,
            morphIndex,
            morphIndexCurrent,
            morphIndexLast,
            numFrames,
            duration,
            durationFrame,
            interpolation,
            interpolationFrame,
            time,
            timeStart,
            timeLast,
            timeDelta,
            frame,
            loop,
            callback;
        
        if ( info.updating === true ) {
            
            // set parameters
            
            nameCurrent = info.nameCurrent;
            nameTarget = info.nameTarget;
            dataCurrent = list[ nameCurrent ];
            dataTarget = list[ nameTarget ];
            
            timeStart = info.timeStart;
            time = new Date().getTime();
            timeLast = info.time;
            timeDelta = time - timeStart;
            info.time = time;
            
            morphMap = [];
            
            // shifting between two shapes
            if ( nameCurrent !== nameTarget ) {
                
                morphsMap = [ dataCurrent.map[ 0 ], dataTarget.map[ 0 ] ];
                
            }
            // playing shape animation
            else {
                
                morphsMap = dataCurrent.map;
                
            }
            
            numFrames = morphsMap.length;
            
            duration = info.duration;
            
            durationFrame = duration / (numFrames - 1);
            
            interpolation = timeDelta / duration;
            
            interpolationFrame = (timeDelta % durationFrame) / durationFrame;
            
            frame = (Math.floor( (numFrames - 1) * interpolation ) + 1) % numFrames;
            
            if ( frame !== info.frameCurrent) {
                
                //info.frameCurrent = frame - 1;
                
                morphIndexLast = morphsMap[ info.frameLast ].index;
                morphIndexCurrent = morphsMap[ info.frameCurrent ].index;
                
                mesh.morphTargetInfluences[ morphIndexLast ] = 0;
                mesh.morphTargetInfluences[ morphIndexCurrent ] = 1;
                
                main.utils.dev.log(' --------------- ');
                main.utils.dev.log('frame ' + frame);
                main.utils.dev.log(' influences atm ');
                
                // make sure all other influences are reset
                // probably not the best way to do it
                for ( i = 0, l = morphsMap.length; i < l; i += 1) {
                    
                    if ( morphsMap[ i ].index !== morphIndexCurrent ) {
                        //mesh.morphTargetInfluences[morphsMap[ i ].index] = 0;
                    }
                    
                    main.utils.dev.log(' > ' + i + ' = ' + mesh.morphTargetInfluences[morphsMap[ i ].index]);
                    
                }
                
                info.frameLast = info.frameCurrent;
                info.frameCurrent = frame;
                
            }
            
            if ( timeDelta < duration ) {
            
                morphIndex = morphsMap[ frame ].index;
                
                morphIndexLast = morphsMap[ info.frameLast ].index;
                
                mesh.morphTargetInfluences[ morphIndex ] = interpolationFrame;
                mesh.morphTargetInfluences[ morphIndexLast ] = 1 - mesh.morphTargetInfluences[ morphIndex ];
                
            }
            // else complete timeDelta >= duration
            else {
                
                main.utils.dev.log(' final influences ');
                
                // make sure all other influences are reset
                // probably not the best way to do it
                for ( i = 0, l = morphsMap.length; i < l; i += 1) {
                    
                    main.utils.dev.log(' > ' + i + ' = ' + mesh.morphTargetInfluences[morphsMap[ i ].index]);
                    
                }
                
                // loop or stop
                
                loop = info.loop;
                
                if ( loop === true ) {
                    
                    morphs.play( nameTarget, duration, loop, callback );
                    
                }
                else {
                    
                    updater.stop();
                    
                }
                
                // callback
                
                callback = info.callback;
                
                if ( typeof callback !== 'undefined' ) {
                    callback.call();
                }
                
            }
        }
        
    };
    */
    
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