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
            materialsToModify,
            material,
            mesh,
            scale,
			rotation,
			position,
            morphs;
        
        // handle parameters
        
        parameters = parameters || {};
            
        // geometry
        
        geometry = parameters.geometry || new THREE.Geometry();
		
		//geometry.computeVertexNormals();
		
        // materials
        
        materials = parameters.materials || [];
		
		if ( materials.hasOwnProperty('length') === false ) {
			materials = [ materials ];
		}
        
        materialsToModify = materials.slice(0);
        
        // if has geometry materials
        
        if ( geometry.materials && geometry.materials.length > 0 ) {
            
            // add to all
            
            for ( i = 0, l = geometry.materials.length; i < l; i += 1) {
				
				material = geometry.materials[i][0];
				
                materialsToModify.push( material );
            }
            
        }
		
		// if no materials yet, add default
        if ( materials.length === 0 ) {
            
            materials = [ new THREE.MeshFaceMaterial() ];
            
            materialsToModify = materialsToModify.push( material );
            
        }
		
        // material properties
        
        for ( i = 0, l = materialsToModify.length; i < l; i += 1) {
            material = materialsToModify[i];
            
            // morph targets
			material.morphTargets = geometry.morphTargets && geometry.morphTargets.length > 0 ? true : false;
			
            // shading
            // (1 = flat, 2 = smooth )
			material.shading = parameters.shading || THREE.SmoothShading;
			
        }
		
        // mesh
        
        mesh = new THREE.Mesh( geometry, materials );
		
		// force use quaternion
		
		mesh.useQuaternion = true;
        
        // shadows
        
        mesh.castShadow = parameters.castShadow || false;
        mesh.receiveShadow = parameters.receiveShadow || false;
        
        // scale
        
        scale = parameters.scale || 1;
        
        mesh.scale.set( scale, scale, scale );
		
		// rotation
		
		if ( parameters.hasOwnProperty('rotation') ) {
			
			rotation = parameters.rotation;
			
			// if quaternion
			if ( rotation.hasOwnProperty('w') ) {
				
				mesh.quaternion.copy( rotation );
				
			}
			// vector
			else if ( rotation.hasOwnProperty('x') && rotation.hasOwnProperty('y') && rotation.hasOwnProperty('z') ) {
				
				mesh.quaternion.setFromEuler( rotation );
				
			}
			// else matrix
			else {
				
				mesh.quaternion.setFromRotationMatrix( rotation );
				
			}
			
		}
		
		// position
		
		if ( parameters.hasOwnProperty('position') ) {
			
			position = parameters.position;
			
			mesh.position.copy( position );
			
		}
        
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
        
        morphs.play = function ( name, parameters ) {
            
            var shapesList = shapes.list,
                updates = shapes.updates,
                uNames = updates.names,
                uList = updates.list,
                updaterIndex,
                updater,
                info,
                morphsMap;
            
            // get if updater for animation exists
            
            updaterIndex = uNames.indexOf( name );
			
            // new updater
            
            if ( updaterIndex === -1 && typeof shapesList[ name ] !== 'undefined' && shapesList[ name ].map.length !== 0 ) {
			
				morphsMap = shapesList[ name ].map;
				
                updater = make_morph_updater( name );
                
                info = updater.info;
                
                // add to lists
                
                uNames.push( name );
                
                uList[ name ] = updater;
                
                // start updating
                
                updater.start( mesh, morphsMap, parameters );
            
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
        
		// parses all morphs except for last
		// assumes last is identical to base geometry
		// as required to make model + morphtargets work
		
        for ( i = 0, l = morphs.length - 1; i < l; i += 1 ) {
            
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
        var updater = {},
            info;
        
        // init updater
        
        info = updater.info = {
            name: name,
            updating: false
        };
        
        updater.start = function ( mesh, morphsMap, parameters ) {
            
            if ( info.updating !== true ) {
                
                parameters = parameters || {};
                
                info.mesh = mesh;
                
                info.morphsMap = morphsMap;
                
                info.duration = parameters.duration || durationBase;
                
                info.loop = parameters.loop || false;
                
                info.callback = parameters.callback;
                
                info.direction = parameters.direction || 1;
                
                info.interpolationDirection = 1;
                
                // special case for single morph
                
                if ( morphsMap.length === 1 ) {
                    
                    // if morph is not already in zero state
                    
                    if ( info.direction === -1 && mesh.morphTargetInfluences[ morphsMap[0] ] > 0 ) {
                        info.interpolationDirection = -1;
                    }
                    
                    // direction cannot be in reverse
                    
                    info.direction = 1;
                    
                }
                
                if ( parameters.reset !== false ) {
                    updater.reset();
                }
            
                info.updating = true;
                    
                shared.signals.update.add( updater.update );
            
            }
            
        };
        
        updater.reset = function ( isLooping ) {
            
            info.timeStart = new Date().getTime();
            
            info.numFramesUpdated = 0;
            
            if ( isLooping !== true ) {
                
                info.time = info.timeLast = info.timeStart;
                
                info.frameTimeDelta = 0;
                
                if ( info.direction === -1 ) {
                    info.frame = info.morphsMap.length - 1;
                }
                else {
                    info.frame = 0;
                }
                
                info.frameLast = -1;
                
            }
            
        };
        
        updater.reverseDirection = function () {
            
            info.direction = -info.direction;
            
        };
        
        updater.reverseInterpolationDirection = function () {
            
            info.interpolationDirection = -info.interpolationDirection;
            
        };
        
        updater.update = function () {
            
            var mesh = info.mesh,
                loop,
                callback,
                morphsMap = info.morphsMap,
                numFrames = morphsMap.length,
                time = info.time,
                timeStart = info.timeStart,
                timeLast = info.timeLast,
                timeDelta = (time - timeLast),
                timeFromStart = time - timeStart,
                frameTimeDelta = info.frameTimeDelta,
                direction = info.direction,
                duration = info.duration,
                durationFrame = duration / numFrames,
                frame = info.frame,
                frameLast = info.frameLast,
                morphIndex = morphsMap[ frame ].index,
                morphIndexLast,
                cyclePct = timeFromStart / duration,
                interpolationDirection = info.interpolationDirection,
                interpolationDelta = (timeDelta / durationFrame) * interpolationDirection;
            
            // update frameTimeDelta
            
            info.frameTimeDelta = frameTimeDelta += timeDelta;
            
            // if frame should swap
            
            if ( frameTimeDelta >= durationFrame ) {
                
                // reset frame time delta
                // account for large time delta
                info.frameTimeDelta = Math.max( 0, frameTimeDelta - durationFrame );
                
                // record new frames for next cycle
                
                info.frameLast = info.frame;
                
                info.frame = frame + 1 * direction;
                
                info.numFramesUpdated += 1;
                
                // reset frame to start?
                
                if ( direction === -1 && info.frame < 0  ) {
                    
                    info.frame = numFrames - 1;
                    
                }
                else if ( direction === 1 && info.frame > numFrames - 1 ) {
                    
                    info.frame = 0;
                    
                }

                // push influences to max / min
                    
                if ( frameLast > -1 ) {
                    
                    morphIndexLast = morphsMap[ frameLast ].index;
                    
                    mesh.morphTargetInfluences[ morphIndexLast ] = 0;
                    
                }
                
                mesh.morphTargetInfluences[ morphIndex ] = 1;
                
                // special case for looping single morphs
                    
                if ( morphsMap.length === 1 ) {
                    
                    if ( interpolationDirection === -1 ) {
                        
                        mesh.morphTargetInfluences[ morphIndex ] = 0;
                        
                    }
                    
                    info.frameLast = -1;
                    
                    updater.reverseInterpolationDirection();
                    
                }
                
            }
            // change influences by interpolation delta
            else {
                
                // current frame
                
                mesh.morphTargetInfluences[ morphIndex ] = Math.max( 0, Math.min ( 1, mesh.morphTargetInfluences[ morphIndex ] + interpolationDelta ) );
                
                // last frame
                
                if ( frameLast > -1 ) {
                    
                    morphIndexLast = morphsMap[ frameLast ].index;
                    
                    mesh.morphTargetInfluences[ morphIndexLast ] = Math.min( 1, Math.max( 0, mesh.morphTargetInfluences[ morphIndexLast ] - interpolationDelta ) );
                    
                }
                
            }
            
            // update time
            
            info.timeLast = info.time;
            info.time = new Date().getTime();
            
            // reset, looping and callback
            
            if ( info.numFramesUpdated >= numFrames ) {
                
                loop = info.loop;
                
                if ( loop !== true ) {
                    
                    updater.stop();
                    
                }
                // do looping cycle reset
                else {
                    
                    updater.reset( loop );
                    
                }
                
                callback = info.callback;
                
                if ( typeof callback !== 'undefined' ) {
                    
                    callback.call();
                    
                }
                
            }
            
        };
        
        updater.stop = function () {
            
            updater.info.updating = false;
                
            shared.signals.update.remove( updater.update );
            
        };
        
        return updater;
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