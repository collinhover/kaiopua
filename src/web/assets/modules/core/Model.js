/*
Model.js
Model generator module.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Model",
        model = {},
		physics,
		mathhelper,
        durationBase = 1000,
		objectCount = 0;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    model.instantiate = instantiate;
	
	model = main.asset_register( assetPath, model );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	main.assets_require( [
		"assets/modules/core/Physics",
		"assets/modules/workers/MathHelper"
	], init_internal, true );
	
	function init_internal ( physx, mh ) {
		console.log('internal model');
		physics = physx;
		mathhelper = mh;
		
		main.asset_ready( assetPath );
		
	}
    
    /*===================================================
    
    model
    
    =====================================================*/
    
    // adds functionality to basic mesh/model objects
    
    function instantiate ( parameters, instance ) {
		
        var i, l,
            geometry,
			vertices,
			vertex,
			vertPos,
            materials,
            materialsToModify,
            material,
            mesh,
            scale,
			rotation,
			position,
            morphs,
			rigidBody;
        
        // handle parameters
        
        parameters = parameters || {};
		
		instance = instance || {};
            
        // geometry
        
		if ( parameters.hasOwnProperty( 'geometry' ) ) {
			
			geometry = parameters.geometry;
			
		}
		else if ( parameters.hasOwnProperty( 'geometryAssetPath' ) ) {
			
			geometry = main.asset_data( parameters.geometryAssetPath );
			
		}
		else {
			
			geometry = new THREE.Geometry();
			
		}
		
        // materials
        
        materials = parameters.materials || [];
		
		if ( materials.hasOwnProperty('length') === false ) {
			materials = [ materials ];
		}
        
        materialsToModify = materials.slice(0);
        
        // if has geometry materials
        
        if ( geometry.materials && geometry.materials.length > 0 ) {
            
            // add to all
			
            for ( i = 0, l = geometry.materials.length; i < l; i ++) {
				
				material = geometry.materials[ i ];
				
                materialsToModify.push( material );
            }
            
        }
        
		// if no materials yet, add default
        if ( materials.length === 0 ) {
            
            materials = [ new THREE.MeshFaceMaterial() ];
            
            materialsToModify = materialsToModify.concat( materials );
            
        }
		
        // material properties
		
        for ( i = 0, l = materialsToModify.length; i < l; i ++) {
            material = materialsToModify[i];
			
            // morph targets
			if ( material.hasOwnProperty('morphTargets' ) ) {
				
				material.morphTargets = geometry.morphTargets && geometry.morphTargets.length > 0 ? true : false;
				
			}
			
            // shading
            // (1 = flat, 2 = smooth )
			if ( parameters.hasOwnProperty('shading' ) ) {
				
				material.shading = parameters.shading;
			
			}
        }
		
        // mesh
        
        mesh = new THREE.Mesh( geometry, /* currently no multimaterials */ materials[0] );
		
		// force use quaternion
		
		mesh.useQuaternion = true;
        
        // shadows
		
		if ( parameters.hasOwnProperty('castShadow') === true ) {
			
			mesh.castShadow = parameters.castShadow;
			
		}
		
		if ( parameters.hasOwnProperty('receiveShadow') === true ) {
			
			mesh.receiveShadow = parameters.receiveShadow;
			
		}
		
		// flip sided
		
		if ( parameters.hasOwnProperty('flipSided') === true ) {
			
			mesh.flipSided = parameters.flipSided;
			
		}
		
		// double sided
		
		if ( parameters.hasOwnProperty('doubleSided') === true ) {
			
			mesh.doubleSided = parameters.doubleSided;
			
		}
		
		// dynamic
		
		if ( parameters.hasOwnProperty('dynamic') === true ) {
			
			mesh.dynamic = parameters.dynamic;
			
		}
		
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
		
		// add reference to model instance in mesh
		
		mesh.kaiopuaModel = instance;
		
		// add id based on object count
		
		instance.id = objectCount;
		
		objectCount++;
        
        // public properties
		
        instance.mesh = mesh;
        instance.morphs = morphs;
		
		// targetable, default to true
		
		if ( parameters.hasOwnProperty( 'targetable' ) ) {
			
			instance.targetable = parameters.targetable;
			
		}
		else {
			
			instance.targetable = true;
			
		}
		
		// interactive, default to true
		
		if ( parameters.hasOwnProperty( 'interactive' ) ) {
			
			instance.interactive = parameters.interactive;
			
		}
		else {
			
			instance.interactive = true;
			
		}
		
		// physics
		
		if ( parameters.hasOwnProperty( 'rigidBody' ) ) {
			
			instance.rigidBody = parameters.rigidBody;
			
		}
		else if ( parameters.hasOwnProperty( 'rigidBodyInfo' ) ) {
				
			instance.rigidBody = physics.translate( instance.mesh, parameters.rigidBodyInfo );
			
		}
		
        return instance;
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
                morphsMap;
				
			// if morph name exists
			
			if ( typeof shapesList[ name ] !== 'undefined' && shapesList[ name ].map.length !== 0 ) {
				
				// get morphs map
				
				morphsMap = shapesList[ name ].map;
				
				// get if updater for animation exists
				
				updaterIndex = uNames.indexOf( name );
				
				// new updater
				
				if ( updaterIndex === -1 ) {
					
					updater = make_morph_updater( name );
					
					// add to lists
					
					uNames.push( name );
					
					uList[ name ] = updater;
					
				}
				// get existing
				else {
					
					updater = uList[ name ];
					
				}
				
				// start updating
				
				updater.start( mesh, morphsMap, parameters );
				
            }
			
        };
		
		morphs.clear = function ( name ) {
			
			var shapesList = shapes.list,
                updates = shapes.updates,
                uNames = updates.names,
                uList = updates.list,
                updaterIndex,
                updater;
				
			// if morph name exists
			
			if ( typeof shapesList[ name ] !== 'undefined' && shapesList[ name ].map.length !== 0 ) {
				
				// get if updater for animation exists
				
				updaterIndex = uNames.indexOf( name );
				
				if ( updaterIndex !== -1 ) {
					
					updater = uList[ name ];
					
					updater.clearMorph();
					
				}
				
			}
			
		};
        
        morphs.stop = function ( name ) {
            
            var i, l,
                updates = shapes.updates,
                uNames = updates.names,
                uName,
                uList = updates.list;
            
            for ( i = 0, l = uNames.length; i < l; i ++ ) {
                
                uName = uNames[ i ];
                
                if ( typeof name === 'undefined' || uName === name ) {
                	
                	uList[ uNames[i] ].stop();
                	
                }
                
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
		
        for ( i = 0, l = morphs.length - 1; i < l; i ++ ) {
            
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
        
        for ( i = 0, l = names.length; i < l; i ++ ) {
            
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
            
            if ( mathhelper.is_number(numberTest) ) {
                
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
                
				if ( parameters.hasOwnProperty('loop') === true ) {
					
					info.loop = parameters.loop;
					
				}
				else {
					
					info.loop = false;
					
				}
                
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
				
				info.frameLast = info.frameLast || -1;
				
            }
            
        };
		
		updater.clearMorph = function () {
			var i, l,
				influences = info.mesh.morphTargetInfluences,
				morphsMap = info.morphsMap;
			
			// reset influences
				
			for ( i = 0, l = morphsMap.length; i < l; i ++ ) {
				
				influences[ morphsMap[ i ].index ] = 0;
				
			}
		}
        
        updater.reverseDirection = function () {
            
            info.direction = -info.direction;
            
        };
        
        updater.reverseInterpolationDirection = function () {
            
            info.interpolationDirection = -info.interpolationDirection;
            
        };
		
        updater.update = function ( timeDelta ) {
			
            var mesh = info.mesh,
                loop = info.loop,
                callback,
                morphsMap = info.morphsMap,
                numFrames = morphsMap.length,
                time = info.time,
                timeStart = info.timeStart,
                timeLast = info.timeLast,
                //timeDelta = (time - timeLast),
                timeFromStart = time - timeStart,
                frameTimeDelta = info.frameTimeDelta,
                frame = info.frame,
                frameLast = info.frameLast,
                morphIndex = morphsMap[ frame ].index,
                morphIndexLast,
				direction = info.direction,
                duration = info.duration,
                durationFrame = duration / numFrames,
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
                
                info.numFramesUpdated ++;
                
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
			info.time += timeDelta;
            
            // reset, looping and callback
            
            if ( info.numFramesUpdated >= numFrames ) {
                
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
        
    return main; 
    
}(KAIOPUA || {}));