/*
 *
 * Model.js
 * Adds additional functionality to basic Mesh.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */

(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Model.js",
		_Model = {},
		_Physics,
		_ObjectHelper,
		_MathHelper,
		durationBase = 1000,
		durationPerFrameMinimum = shared.timeDeltaExpected || 1000 / 60;
		objectCount = 0,
		morphsNumMin = 5;
	
	main.asset_register( assetPath, {
		data: _Model,
		requirements: [
			"assets/modules/core/Physics.js",
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/MathHelper.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	function init_internal ( p, oh, mh ) {
		console.log('internal model', _Model);
		_Physics = p;
		_ObjectHelper = oh;
		_MathHelper = mh;
		
		_Model.Instance = Model;
		_Model.Instance.prototype = new THREE.Mesh();
		_Model.Instance.prototype.constructor = _Model.Instance;
		_Model.Instance.prototype.compute_dimensions = compute_dimensions;
		
		// catch parent changes and add / remove physics automatically
		
		Object.defineProperty( _Model.Instance.prototype, 'parent', { 
			get : function () { return this._parent; },
			set : function ( newParent ) {
				
				var scene;
				
				// store new parent
				
				this._parent = newParent;
				
				// search for scene
				
				scene = this;
				
				while ( typeof scene.parent !== 'undefined' ) {
					
					scene = scene.parent;
					
				}
				
				// if parent is child of scene, add physics
				
				if ( scene instanceof THREE.Scene )  {
					
					_Physics.add( this );
					
				}
				// else default to remove
				else {
					
					_Physics.remove( this );
					
				}
				
			}
			
		});
		
	}
	
	/*===================================================
	
	model
	
	=====================================================*/
	
	// adds functionality to and inherits from THREE.Mesh
	
	function Model ( parameters ) {
		
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
		
		if ( parameters.geometry instanceof THREE.Geometry ) {
			
			geometry = parameters.geometry;
			
		}
		else if ( typeof parameters.geometry === 'string' ) {
			
			geometry = main.get_asset_data( parameters.geometry );
			
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
		
		// adjust for offset if needed
		
		if ( parameters.center === true ) {
			
			_ObjectHelper.object_center( this );
			
		}
		
		if ( parameters.centerRotation === true ) {
			
			_ObjectHelper.object_center_rotation( this );
			
		}
		
		// compute dimensions
		
		this.compute_dimensions();
		
		// physics
		
		if ( parameters.hasOwnProperty( 'physics' ) ) {
			
			this.physics = _Physics.translate( this, parameters.physics );
			
		}
		
		// id
		
		this.id = parameters.id || this.id;
		
	}
	
	/*===================================================
	
	utility
	
	=====================================================*/
	
	function compute_dimensions ( ignoreScale ) {
		
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
			
			return this;
			
		};
		
		morphs.stop = function ( name ) {
			
			var updates = shapes.updates,
				uList = updates.list,
				updater;
			
			updater = uList[ name ];
			
			if ( typeof updater !== 'undefined' ) {
				
				updater.stop();
				
			}
			
			return this;
			
		};
		
		morphs.stopAll = function () {
			
			var i, l,
				updates = shapes.updates,
				uNames = updates.names,
				uName,
				uList = updates.list;
			
			// search through all morphs for name
			// if name not passed or is wildcard, stop all
			
			for ( i = 0, l = uNames.length; i < l; i ++ ) {
				
				uName = uNames[ i ];
				
				this.stop( uName );
				
			}
			
			return this;
			
		};
		
		morphs.clear = function ( name, duration ) {
			
			var updates = shapes.updates,
				uList = updates.list,
				updater;
			
			updater = uList[ name ];
			
			if ( typeof updater !== 'undefined' ) {
				
				updater.clear( duration );
				
			}
			
			return this;
			
		};
		
		morphs.clearAll = function ( duration ) {
			
			var i, l,
				updates = shapes.updates,
				uNames = updates.names,
				uName,
				uList = updates.list;
			
			// search through all morphs for name
			// if name not passed or is wildcard, clear all
			
			for ( i = 0, l = uNames.length; i < l; i ++ ) {
				
				uName = uNames[ i ];
				
				this.clear( uName, duration );
				
			}
			
			return this;
			
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
			
			if ( main.is_number(numberTest) ) {
				
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
		
		updater.start = function ( mesh, morphsMap, parameters, updatingParameters ) {
			
			var durationNew,
				durationPrev,
				durationFramePrev,
				durationFrameNew,
				timeFromStart,
				framePct,
				cyclePct;
			
			// if not already updating
			
			if ( info.updating !== true ) {
				
				parameters = parameters || {};
				
				info.mesh = mesh;
				
				info.morphsMap = morphsMap;
				
				info.duration = info.durationOriginal = parameters.duration || durationBase;
				
				if ( parameters.hasOwnProperty('loop') === true ) {
					
					info.loop = parameters.loop;
					
				}
				else {
					
					info.loop = false;
					
				}
				
				info.loopDelay = parameters.loopDelay || 0;
				
				info.loopChance = parameters.loopChance || 1;
				
				info.loopChance = _MathHelper.clamp( info.loopChance, 0, 1 );
				
				if ( parameters.hasOwnProperty('reverseOnComplete') === true ) {
					
					info.reverseOnComplete = parameters.reverseOnComplete;
					
				}
				else {
					
					info.reverseOnComplete = false;
					
				}
				
				info.reverse = false;
				
				info.direction = 1;
				
				info.interpolationDirection = 1;
				
				info.durationShift = parameters.durationShift || 0;
				
				info.callback = parameters.callback;
				
				// reset
				
				if ( parameters.reset !== false ) {
					updater.reset();
				}
				
				// change remaining parameters
				
				this.changeParameters( parameters );
				
				// resume
				
				updater.resume();
			
			}
			// if new parameters passed
			else {
				
				this.changeParameters( parameters );
				
			}
			
			return this;
			
		};

		updater.changeParameters = function ( parameters ) {
			
			parameters = parameters || {};
			
			// stop clearing
			
			if ( info.clearing === true ) {
				
				info.clearing = false;
				
			}
			
			// duration
			
			if ( main.is_number( parameters.duration ) && ( parameters.duration / info.morphsMap.length ) > durationPerFrameMinimum && info.durationOriginal !== parameters.duration ) {
				
				durationNew = parameters.duration;
				
				durationPrev = info.duration;
				
				timeFromStart = info.time - info.timeStart;
				
				cyclePct = timeFromStart / durationPrev;
				
				// fix time start to account for difference in durations
				
				info.timeStart += ( durationPrev * cyclePct ) - ( durationNew * cyclePct );
				
				// fix frame time delta to account for new duration per frame
				
				durationFramePrev = durationPrev / info.morphsMap.length;
				
				durationFrameNew = durationNew / info.morphsMap.length;
				
				framePct = info.frameTimeDelta / durationFramePrev;
				
				info.frameTimeDelta = durationFrameNew * framePct;
				
				// store new duration
				
				info.duration = info.durationOriginal = durationNew;
				
			}
			
			// direction
			
			if ( typeof parameters.reverse === 'boolean' && info.reverse !== parameters.reverse ) {
				
				info.reverse = parameters.reverse;
				
				info.direction = ( info.reverse === true ) ? -1 : 1;
				
				// special case for single morph
				
				if ( info.morphsMap.length === 1 ) {
					
					// if morph is not already in zero state
					
					if ( info.direction === -1 && mesh.morphTargetInfluences[ info.morphsMap[0] ] > 0 ) {
						info.interpolationDirection = -1;
					}
					
					// direction cannot be in reverse
					
					info.direction = 1;
					
				}
				
			}
			
			return this;
			
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
			
			return this;
			
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
		
		updater.reverseDirection = function () {
			
			info.direction = -info.direction;
			
		};
		
		updater.reverseInterpolationDirection = function () {
			
			info.interpolationDirection = -info.interpolationDirection;
			
		};
		
		updater.update = function ( timeDelta ) {
			
			var i, l,
				loop = info.loop,
				callback,
				morphsMap = info.morphsMap,
				influences = info.mesh.morphTargetInfluences,
				numFrames = morphsMap.length,
				time = info.time,
				timeStart = info.timeStart,
				timeLast = info.timeLast,
				timeFromStart = time - timeStart,
				duration = info.duration,
				cyclePct = timeFromStart / duration,
				frameTimeDelta,
				frame,
				frameLast,
				morphIndex,
				morphIndexLast,
				direction,
				durationFrame,
				interpolationDirection,
				interpolationDelta;
			
			// if clearing
			
			if ( info.clearing === true ) {
				
				// properties
				
				interpolationDelta = (timeDelta / duration);
				
				// decrease all morphs by the same amount at the same time
				
				for ( i = 0, l = numFrames; i < l; i ++ ) {
					
					morphIndex = morphsMap[ i ].index;
					
					influences[ morphIndex ] = Math.min( 1, Math.max( 0, influences[ morphIndex ] - interpolationDelta ) );
					
				}
				
			}
			// else default frame to frame interpolation
			else {
				
				// properties
				
				frame = info.frame;
				frameLast = info.frameLast;
				morphIndex = morphsMap[ frame ].index;
				direction = info.direction;
				durationFrame = duration / numFrames;
				interpolationDirection = info.interpolationDirection;
				interpolationDelta = (timeDelta / durationFrame) * interpolationDirection;
				
				// update frameTimeDelta
			
				frameTimeDelta = info.frameTimeDelta += timeDelta;
				
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
						
						influences[ morphIndexLast ] = 0;
						
					}
					
					influences[ morphIndex ] = 1;
					
					// special case for looping single morphs
						
					if ( morphsMap.length === 1 ) {
						
						if ( interpolationDirection === -1 ) {
							
							influences[ morphIndex ] = 0;
							
						}
						
						info.frameLast = -1;
						
						updater.reverseInterpolationDirection();
						
					}
					
				}
				// change influences by interpolation delta
				else {
					
					// current frame
					
					influences[ morphIndex ] = Math.max( 0, Math.min ( 1, influences[ morphIndex ] + interpolationDelta ) );
					
					// last frame
					
					if ( frameLast > -1 ) {
						
						morphIndexLast = morphsMap[ frameLast ].index;
						
						influences[ morphIndexLast ] = Math.min( 1, Math.max( 0, influences[ morphIndexLast ] - interpolationDelta ) );
						
					}
					
				}
				
			}
			
			// update time
			
			info.timeLast = info.time;
			info.time += timeDelta;
			
			// reset, looping and callback
			
			if ( cyclePct >= 1 || info.numFramesUpdated >= numFrames ) {
				
				// if clearing, finish
				if ( info.clearing === true ) {
					
					updater.clear();
					
				}
				// if looping, do looping cycle reset
				else if ( loop === true ) {
					
					updater.reset( loop );
					
				}
				// else stop
				else {
					
					updater.stop();
					
				}
				
				callback = info.callback;
				
				if ( typeof callback !== 'undefined' ) {
					
					callback.call();
					
				}
				
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
				
				info.cleared = false;
					
				shared.signals.update.add( updater.update );
				
			}
			
			return this;
			
		};
		
		updater.stop = function (  ) {
			
			if ( info.updating === true ) {
				
				info.updating = false;
					
				shared.signals.update.remove( updater.update );
				
			}
			
			return this;
			
		};
		
		updater.clear = function ( duration ) {
			var i, l,
				influences = info.mesh.morphTargetInfluences,
				morphsMap = info.morphsMap;
			
			if ( info.cleared !== true ) {
				
				// clear over duration
				
				if ( duration > 0 ) {
					
					// if not already clearing over duration
					
					if ( info.clearing !== true || info.duration !== duration ) {
						
						this.reset( false );
						
						info.duration = duration;
						
						info.clearing = true;
						
						this.resume();
						
					}
					
				}
				else {
					
					this.stop();
					
					this.reset( false );
					
					// reset influences
						
					for ( i = 0, l = morphsMap.length; i < l; i ++ ) {
						
						influences[ morphsMap[ i ].index ] = 0;
						
					}
					
					info.clearing = false;
					
					info.cleared = true;
					
				}
				
			}
			
			return this;
			
		}
		
		return updater;
	}
    
} (KAIOPUA) );