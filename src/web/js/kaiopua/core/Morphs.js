/*
 *
 * Morphs.js
 * Handles morphs and animation for models.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/core/Morphs.js",
		_Morphs = {},
		_MorphAnimator,
		numMorphsMin = 5,
		stabilityID = 'morph_stability';
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _Morphs,
		requirements: [
			"js/kaiopua/core/MorphAnimator.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( ma ) {
		console.log('internal Morphs', _Morphs);
		
		// utility
		
		_MorphAnimator = ma;
		
		// properties
		
		_Morphs.options = {
			duration: 1000
		};
		
		// instance
		
		_Morphs.Instance = Morphs;
		_Morphs.Instance.prototype.constructor = _Morphs.Instance;
		
		_Morphs.Instance.prototype.play = play;
		_Morphs.Instance.prototype.stop = stop;
		_Morphs.Instance.prototype.stop_all = stop_all;
		_Morphs.Instance.prototype.clear = clear;
		_Morphs.Instance.prototype.clear_all = clear_all;
		_Morphs.Instance.prototype.remove = remove;
		
		_Morphs.Instance.prototype.stabilize = stabilize;
		
		// functions
		
		_Morphs.get_morph_name_data = get_morph_name_data;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Morphs ( mesh, parameters ) {
		
		var i, l,
			morphs,
			morph,
			morphName,
			nameData,
			name,
			number,
			map;
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.mesh = mesh;
		
		this.names = [];
		this.maps = {};
		
		this.options = $.extend( true, this.options || {}, _Morphs.options, parameters );
		
		// get mapped data for each morph
		
		morphs = main.to_array( this.mesh.geometry.morphTargets );
		
		for ( i = 0, l = morphs.length; i < l; i ++ ) {
			
			morph = morphs[ i ];
			morphName = morph.name;
			
			nameData = get_morph_name_data( morphName );
			name = nameData.name;
			number = nameData.number;
			
			if ( name !== stabilityID ) {
				
				if ( this.maps.hasOwnProperty( name ) !== true ) {
					
					this.maps[ name ] = [];
					this.names.push( name );
					
				}
				
				map = this.maps[ name ];
				map.push( { index: i, number: number } );
				
			}
			
		}
		
		// sort maps
		
		for ( i = 0, l = this.names.length; i < l; i ++ ) {
			
			name = this.names[i];
			map = this.maps[ name ];
				
			map.sort( sort_map );
			
		}
		
		// animators
		
		this.animators = {};
		this.animatorNames = [];
		this.animatingNames = [];
		
		this.stabilize();
		
	}
	
	/*===================================================
	
	play
	
	=====================================================*/
	
	function play ( name, parameters ) {
		
		var i, l,
			names = this.names,
			name,
			maps,
			map,
			animators,
			animatorNames,
			animatingNames,
			animator,
			index = main.index_of_value( names, name );
		
		if ( index !== -1 ) {
			
			maps = this.maps;
			animators = this.animators;
			animatorNames = this.animatorNames;
			animatingNames = this.animatingNames;
			
			name = names[ index ];
			map = maps[ name ];
			
			if ( animators.hasOwnProperty( name ) !== true ) {
				
				animator = animators[ name ] = new _MorphAnimator.Instance( this, name, this.options );
				
				animatorNames.push( name );
				
			}
			
			main.array_cautious_add( animatingNames, name );
			
			animator = animators[ name ];
			
			animator.play( parameters );
			
			
		}
		else if ( parameters && typeof parameters.callback === 'function' ) {
			
			parameters.callback();
			
		}
		
		return this;
		
	}
	
	/*===================================================
	
	stop
	
	=====================================================*/
	
	function stop ( name, parameters ) {
		
		var animators = this.animators,
			animator = animators[ name ];
		
		if ( animator instanceof _MorphAnimator.Instance ) {
			
			animator.stop( parameters );
			
		}
		
		return this;
		
	}
	
	function stop_all ( parameters, except ) {
		
		var i, l,
			animatingNames = this.animatingNames,
			name;
		
		if ( animatingNames.length > 0 ) {
				
			except = main.to_array( except );
			
			for ( i = 0, l = animatingNames.length; i < l; i++ ) {
				
				name = animatingNames[ i ];
				
				if ( main.index_of_value( except, name ) === -1 ) {
					
					this.stop( name, parameters );
					
				}
				
			}
			
		}
		
		return this;
		
	}
	
	/*===================================================
	
	clear
	
	=====================================================*/
	
	function clear ( name, parameters ) {
		
		var animators = this.animators,
			animator = animators[ name ];
		
		if ( animator instanceof _MorphAnimator.Instance ) {
			
			animator.clear( parameters );
			
		}
		
		return this;
		
	}
	
	function clear_all ( parameters, except ) {
		
		var i, l,
			animatingNames = this.animatingNames,
			name;
		
		if ( animatingNames.length > 0 ) {
				
			except = main.to_array( except );
			
			for ( i = 0, l = animatingNames.length; i < l; i++ ) {
				
				name = animatingNames[ i ];
				
				if ( main.index_of_value( except, name ) === -1 ) {
					
					this.clear( name, parameters );
					
				}
				
			}
			
		}
		
		return this;
		
	}
	
	function remove ( name ) {
		
		main.array_cautious_remove( this.animatingNames, name );
		
	}
	
	/*===================================================
	
	stabilize
	
	=====================================================*/
	
	function stabilize () {
		
		var i, l,
			mesh = this.mesh,
			geometry = mesh.geometry,
			morphs = geometry.morphTargets || [],
			morph,
			nameData,
			needsStability = !this.stable;
		
		// adds stability morph to end of morphs list, identical to base geometry
		// as required to make model + morphtargets work
		
		if ( needsStability === true ) {
			
			// find if has stability morph
			
			for ( i = 0, l = morphs.length; i < l; i ++ ) {
				
				morph = morphs[ i ];
				
				nameData = get_morph_name_data( morph.name );
				
				if ( nameData.name === stabilityID ) {
					
					needsStability = false;
					break;
					
				}
			
			}
			
			if ( morphs.length > 0 && ( needsStability === true || morphs.length < numMorphsMin ) ) {
				
				// have to add at least one stability morph
				
				add_stability_morph.call( this );
				
				// ensure minimum number of morphs
				
				for ( i = morphs.length, l = numMorphsMin; i < l; i++ ) {
					
					add_stability_morph.call( this );
					
				}
				
			}
			
			this.stable = true;
			
		}
		
	}
	
	function add_stability_morph ( mesh ) {
		
		var i, l,
			mesh = this.mesh,
			geometry = mesh.geometry,
			vertices = geometry.vertices,
			vertex,
			vertPos,
			morphNumber = mesh.morphTargetInfluences.length,
			morphInfo = {
				name: stabilityID + '_' + morphNumber,
				vertices: []
			},
			morphVertices = morphInfo.vertices;
		
		for ( i = 0, l = vertices.length; i < l; i++ ) {
			
			vertex = vertices[ i ];
			
			morphVertices.push( vertex.clone() );
			
		}
		
		// add morph target to list
		
		geometry.morphTargets.push( morphInfo );
		
		// update morph target info in mesh
		
		mesh.morphTargetInfluences.push( 0 );
		mesh.morphTargetDictionary[ morphInfo.name ] = morphNumber;
		
	}
	
	/*===================================================
    
    utility
    
    =====================================================*/
	
	function sort_map ( a, b ) {
		
		return a.number - b.number;
		
	}
	
	function remove_animator ( animator ) {
		
		
		
	}
	
	function get_morph_name_data ( name ) {
		
		var nameData = { 
				name: name,
				number: 0
			},
			index,
			numberTest;
		
		// get split of base name and number by last _
		
		index = name.lastIndexOf('_');
		
		if ( index !== -1) {
			
			numberTest = parseFloat(name.substr( index + 1 ));
			
			// test if is number
			
			if ( main.is_number( numberTest ) ) {
				
				nameData.name = name.substr( 0, index );
				
				nameData.number = numberTest;
				
			}
		}
		
		return nameData;
		
	}
	
	function morph_colors_to_face_colors( geometry ) {
		
		var i, l;

		if ( main.is_array( geometry.morphColors ) ) {
			
			var colorMap = geometry.morphColors[ 0 ];

			for ( i = 0, l = colorMap.colors.length; i < l; i++ ) {

				geometry.faces[ i ].color = colorMap.colors[ i ];

			}

		}

	}
	
} ( KAIOPUA ) );