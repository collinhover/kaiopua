/*
Model.js
Model generator module.
*/

(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Model.js",
		model = {},
		physics,
		mathhelper,
		durationBase = 1000,
		objectCount = 0,
		morphsNumMin = 5;
	
	main.asset_register( assetPath, {
		data: model,
		requirements: [
			"assets/modules/core/Physics.js",
			"assets/modules/utils/MathHelper.js"
		], 
		callbacksOnReqs: init,
		wait: true
	} );
	
	function init ( p, mh ) {
		console.log('internal model', model);
		physics = p;
		mathhelper = mh;
		
		init_internal();
		
	}
	
	function init_internal () {
		
		/*===================================================
		
		model
		
		=====================================================*/
		
		model.Instance = KaiopuaModel;
		model.Instance.prototype = new THREE.Mesh();
		model.Instance.prototype.constructor = model.Instance;
		
		// adds functionality to and inherits from THREE.Mesh
		
		function KaiopuaModel ( parameters ) {
			
			var i, l,
				geometry,
				vertices,
				vertex,
				vertPos,
				materials,
				materialsToModify,
				material,
				rotation,
				position,
				morphs;
			
			// handle parameters
			
			parameters = parameters || {};
			
			// geometry
			
			if ( parameters.hasOwnProperty( 'geometry' ) ) {
				
				geometry = parameters.geometry;
				
			}
			else if ( parameters.hasOwnProperty( 'geometryAssetPath' ) ) {
				
				geometry = main.get_asset_data( parameters.geometryAssetPath );
				
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
			
			// call prototype constructor
			
			THREE.Mesh.call( this, geometry, /* currently no multimaterials */ materials[0] );
			
			// force use quaternion
			
			this.useQuaternion = true;
			
			// rotation
			
			if ( parameters.hasOwnProperty('rotation') ) {
				
				rotation = parameters.rotation;
				
				// quaternion
				if ( rotation instanceof THREE.Quaternion ) {
					
					this.quaternion.copy( rotation );
					
				}
				// vector
				else if ( rotation instanceof THREE.Vector3 ) {
					
					this.quaternion.setFromEuler( rotation );
					
				}
				// matrix
				else if ( rotation instanceof THREE.Matrix4 ) {
					
					this.quaternion.setFromRotationMatrix( rotation );
					
				}
				
			}
			
			// position
			
			if ( parameters.hasOwnProperty('position') && parameters.position instanceof THREE.Vector3 ) {
				
				position = parameters.position;
				
				this.position.copy( position );
				
			}
			
			// shadows
			
			if ( parameters.hasOwnProperty('castShadow') === true ) {
				
				this.castShadow = parameters.castShadow;
				
			}
			
			if ( parameters.hasOwnProperty('receiveShadow') === true ) {
				
				this.receiveShadow = parameters.receiveShadow;
				
			}
			
			// flip sided
			
			if ( parameters.hasOwnProperty('flipSided') === true ) {
				
				this.flipSided = parameters.flipSided;
				
			}
			
			// double sided
			
			if ( parameters.hasOwnProperty('doubleSided') === true ) {
				
				this.doubleSided = parameters.doubleSided;
				
			}
			
			// targetable, default to false
			
			if ( parameters.hasOwnProperty( 'targetable' ) ) {
				
				this.targetable = parameters.targetable;
				
			}
			else {
				
				this.targetable = false;
				
			}
			
			// interactive, default to false
			
			if ( parameters.hasOwnProperty( 'interactive' ) ) {
				
				this.interactive = parameters.interactive;
				
			}
			else {
				
				this.interactive = false;
				
			}
			
			// morphs
			
			this.morphs = make_morphs_handler( this );
			
			// center offset
			
			this.compute_center_offset();
			
			//
			//
			//
			//
			// TESTING
			
			if ( parameters.adjustForOffset === true ) {
				
				// use center offset to correct model
				// subtract offset from all vertices
				
				var vertices = this.geometry.vertices,
					vertex,
					vertexPosition;
				
				for ( i = 0, l = vertices.length; i < l; i ++) {
					
					vertex = vertices[ i ];
					
					vertexPosition = vertex.position;
					
					vertexPosition.subSelf( this.centerOffset );
					
				}
				
				// also subtract offset from all morph target vertices
				
				var morphTargets = this.geometry.morphTargets,
					morphTarget,
					morphVertices,
					j, k;
				
				for ( i = 0, l = morphTargets.length; i < l; i ++) {
					
					morphTarget = morphTargets[ i ];
					
					vertices = morphTarget.vertices;
					
					for ( j = 0, k = vertices.length; j < k; j ++) {
						
						vertex = vertices[ j ];
						
						vertexPosition = vertex.position;
						
						vertexPosition.subSelf( this.centerOffset );
						
					}
					
				}
				
				// force recompute of bounding box
				
				this.geometry.computeBoundingBox();
				
				// add offset to position
				
				this.position.addSelf( this.centerOffset );
				
				// force recompute of center offset
				
				this.compute_center_offset();
				
			}
			
			// physics
			
			if ( parameters.hasOwnProperty( 'physics' ) ) {
				
				this.physics = parameters.physics;
				
			}
			else if ( parameters.hasOwnProperty( 'physicsParameters' ) ) {
				
				this.physics = physics.translate( this, parameters.physicsParameters );
				
			}
			
		}
		
		/*===================================================
		
		utility
		
		=====================================================*/
		
		model.Instance.prototype.compute_dimensions_from_bounding_box = function ( ignoreScale ) {
			
			var g = this.geometry,
				d,
				bbox;
			
			// if needs dimensions
			
			if ( this.hasOwnProperty( 'dimensions' ) && this.dimensions instanceof THREE.Vector3 ) {
				
				d = this.dimensions;
				
			}
			else {
				
				d = this.dimensions = new THREE.Vector3();
				
			}
			
			// if needs calculation
			
			if ( typeof g.boundingBox !== 'undefined' ) {
				g.computeBoundingBox();
			}
			
			bbox = g.boundingBox;
			
			if ( bbox ) {
				
				// get original dimensions
				
				d.set( bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z );
				
				// scale to mesh's scale
				
				if ( ignoreScale !== true ) {
					
					d.multiplySelf( this.scale );
					
				}
				
			}
			
			return d;
			
		}
		
		model.Instance.prototype.compute_center_offset = function ( ignoreScale ) {
			
			var g = this.geometry,
				co,
				d,
				bbox;
			
			// if needs dimensions
			
			if ( this.hasOwnProperty( 'dimensions' ) && this.dimensions instanceof THREE.Vector3 ) {
				
				d = this.dimensions;
				
			}
			else {
				
				d = this.compute_dimensions_from_bounding_box( ignoreScale );
				
			}
			
			// if needs center offset
			
			if ( this.hasOwnProperty( 'centerOffset' ) && this.centerOffset instanceof THREE.Vector3 ) {
				
				co = this.centerOffset;
				
			}
			else {
				
				co = this.centerOffset = new THREE.Vector3();
				
			}
			
			// copy dimensions and half
			
			co.copy( d ).multiplyScalar( 0.5 );
			
			// add minimum bounds
			
			bbox = g.boundingBox;
			
			if ( bbox ) {
				
				co.addSelf( bbox.min );
				
			}
			
			return co;
			
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
				morphColors,
				morphs = {},
				shapes,
				colors;
			
			// morph types
			
			morphs.shapes = shapes = parse_morph_list( mesh );
			
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
					
					if ( typeof name === 'undefined' || name === '*' || uName === name ) {
						
						uList[ uNames[i] ].stop();
						
					}
					
				}
				
			};
			
			return morphs;
		}
		
		function parse_morph_list ( mesh ) {
			
			var i, l,
				geometry = mesh.geometry,
				morphs = geometry.morphTargets || [],
				data = {},
				list = {},
				names = [],
				updates = [],
				morph,
				name,
				nameParsed,
				morphData,
				map;
			
			// parses all morphs
			
			for ( i = 0, l = morphs.length; i < l; i ++ ) {
				
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
			
			// if geometry has morphs
			// check stability
			
			if ( morphs.length > 0 ) {
				
				// adds stability morph to end of morphs list, identical to base geometry
				// as required to make model + morphtargets work
				
				add_stability_morph( mesh );
				
				// ensure minimum number of morphs
				
				for ( i = morphs.length, l = morphsNumMin; i < l; i++ ) {
					
					add_stability_morph( mesh );
					
				}
				
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
		
		function add_stability_morph ( mesh ) {
			
			var i, l,
				geometry = mesh.geometry,
				vertices = geometry.vertices,
				vertex,
				vertPos,
				morphNumber = mesh.morphTargetInfluences.length,
				morphInfo = { name: 'stability_morph_' + morphNumber, vertices: [] },
				morphVertices = morphInfo.vertices;
			
			for ( i = 0, l = vertices.length; i < l; i++ ) {
				
				vertex = vertices[ i ];
				
				vertPos = vertex.position;
				
				morphVertices.push( new THREE.Vertex( new THREE.Vector3( vertPos.x, vertPos.y, vertPos.z ) ) );
				
			}
			
			// add morph target to list
			
			geometry.morphTargets.push( morphInfo );
			
			// update morph target info in mesh
			
			mesh.morphTargetInfluences.push( 0 );
			mesh.morphTargetDictionary[ morphInfo.name ] = morphNumber;
			
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
					
					info.durationOriginal = info.duration = parameters.duration || durationBase;
					
					if ( parameters.hasOwnProperty('loop') === true ) {
						
						info.loop = parameters.loop;
						
					}
					else {
						
						info.loop = false;
						
					}
					
					info.loopDelay = parameters.loopDelay || 0;
					
					info.loopChance = parameters.loopChance || 1;
					
					info.loopChance = mathhelper.clamp( info.loopChance, 0, 1 );
					
					if ( parameters.hasOwnProperty('reverseOnComplete') === true ) {
						
						info.reverseOnComplete = parameters.reverseOnComplete;
						
					}
					else {
						
						info.reverseOnComplete = false;
						
					}
					
					info.durationShift = parameters.durationShift || 0;
					
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
				
					updater.resume();
				
				}
				
			};
			
			updater.resume = function () {
				
				if ( info.updating !== true ) {
					
					// stop waiting on loop delay
					if ( typeof info.loopDelayID !== 'undefined' ) {
						clearRequestTimeout( info.loopDelayID );
					}
					
					// start updating
					
					info.updating = true;
						
					shared.signals.update.add( updater.update );
					
				}
				
			};
			
			updater.reset = function ( isLooping ) {
				
				var loopDelay;
				
				info.timeStart = new Date().getTime();
				
				info.numFramesUpdated = 0;
				
				info.duration = info.durationOriginal + ( Math.random() * info.durationShift );
				
				if ( info.reverseOnComplete === true ) {
					
					info.direction = -info.direction;
					
					if ( info.direction === -1 ) {
						info.frame = info.morphsMap.length - 1;
					}
					else {
						info.frame = 0;
					}
					
				}
				
				// if first reset, or not looping
				
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
				// handle looping
				else {
					
					updater.handleLooping( info.loopDelay );
					
				}
				
			};
			
			updater.handleLooping = function ( delay ) {
				
				// delay
				
				delay = delay || 0;
				
				if ( Math.random() > info.loopChance ) {
					
					delay += info.durationOriginal;
					
				}
				
				// if should resume after loop delay
				
				if ( delay > 0 ) {
					
					// stop waiting on loop delay
					if ( typeof info.loopDelayID !== 'undefined' ) {
						clearRequestTimeout( info.loopDelayID );
					}
					
					// pause updater
					
					updater.stop();
					
					info.loopDelayID = requestTimeout( updater.handleLooping, delay );
					
				}
				// else resume
				else {
					
					updater.resume();
					
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
				
				// stop waiting on loop delay
				
				if ( typeof info.loopDelayID !== 'undefined' ) {
					clearRequestTimeout( info.loopDelayID );
				}
				
				// stop updating
				
				info.updating = false;
					
				shared.signals.update.remove( updater.update );
				
			};
			
			return updater;
		}
		
	}
    
} (KAIOPUA) );