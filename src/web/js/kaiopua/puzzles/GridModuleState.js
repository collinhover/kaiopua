/*
 *
 * GridModuleState.js
 * State for modules of puzzle grids.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/puzzles/GridModuleState.js",
		_GridModuleState = {},
		stateCount = 0;
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, { data: _GridModuleState } );
	
	// instance
	
	_GridModuleState.Instance = GridModuleState;
	
	_GridModuleState.Instance.prototype.add_property = add_property;
	_GridModuleState.Instance.prototype.get_properties = get_properties;
	_GridModuleState.Instance.prototype.modify_material = modify_material;
	
	Object.defineProperty( _GridModuleState.Instance.prototype, 'active', { 
		get: function () { return this._active; },
		set: function ( active ) {
			
			if ( this.dynamic !== false ) {
				
				this._active = active;
				
			}
			
		}
	});
	
	Object.defineProperty( _GridModuleState.Instance.prototype, 'properties', { 
		get: get_properties
	});

	Object.defineProperty( _GridModuleState.Instance.prototype, 'color', { 
		get: function () { return this.properties.color; }
	});
	
	Object.defineProperty( _GridModuleState.Instance.prototype, 'ambient', { 
		get: function () { return this.properties.ambient; }
	});
	
	Object.defineProperty( _GridModuleState.Instance.prototype, 'transparent', { 
		get: function () { return this.properties.transparent; }
	});
	
	Object.defineProperty( _GridModuleState.Instance.prototype, 'opacity', { 
		get: function () { return this.properties.opacity; }
	});
	
	/*===================================================
	
	instance
	
	=====================================================*/
	
	function GridModuleState ( parameters ) {
		
		stateCount++;
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.id = parameters.id || 'state' + stateCount;
		
		this.active = parameters.active || 0;
		
		this.dynamic = ( typeof parameters.dynamic === 'boolean' ) ? parameters.dynamic : true;
		
		this.constant = ( typeof parameters.constant === 'boolean' ) ? parameters.constant : true;
		
		this.priority = parameters.priority || 0;
		
		this._properties = [];
		
		this.add_property( 0, parameters );
		this.add_property( 1, parameters );
		
	}
	
	function add_property ( activeLevel, parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		this._properties = this._properties || [];
		
		// add property
		
		if ( typeof activeLevel === 'undefined' ) {
			
			activeLevel = 0;
			
		}
		
		this._properties[ activeLevel ] = {
			color: parameters[ 'color' + activeLevel ] || parameters.color || new THREE.Color(),
			ambient: parameters[ 'ambient' + activeLevel ] || parameters.ambient || new THREE.Color(),
			transparent: parameters[ 'transparent' + activeLevel ] || parameters.transparent || false,
			opacity: parameters[ 'opacity' + activeLevel ] || parameters.opacity || 1
		};
		
	}
	
	function get_properties ( activeLevel ) {
		
		var properties;
		
		if ( this._properties.hasOwnProperty( activeLevel ) ) {
			properties = this._properties[ activeLevel ];
		}
		else if ( this._properties.hasOwnProperty( this.active ) ) {
			properties = this._properties[ this.active ];
		}
		else {
			properties = this._properties[ 0 ];
		}
		
		return properties;
		
	}
	
	function modify_material ( material, activeLevel ) {
		
		var p = this.get_properties( typeof activeLevel === 'boolean' ? ( activeLevel ? 1 : 0 ) : activeLevel );
		
		// valid material
		
		if ( material instanceof THREE.Material ) {
			
			material.color.copy( p.color );
			
			material.ambient.copy( p.ambient );
			
			material.transparent = p.transparent;
			
			material.opacity = p.opacity;
			
		}
		
	}
	
} (KAIOPUA) );