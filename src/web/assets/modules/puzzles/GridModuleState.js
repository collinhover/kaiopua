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
		assetPath = "assets/modules/puzzles/GridModuleState.js",
		_GridModuleState = {},
		stateCount = 0;
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, { data: _GridModuleState } );
	
	// instance
	
	_GridModuleState.Instance = GridModuleState;
	
	_GridModuleState.Instance.prototype.add_property = add_property;
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
		get: function () { return ( this._properties.hasOwnProperty( this.active ) ? this._properties[ this.active ] : this._properties[ 0 ] ); }
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
	
	function add_property ( activeState, parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		this._properties = this._properties || [];
		
		// add property
		
		if ( typeof activeState === 'undefined' ) {
			
			activeState = 0;
			
		}
		
		this._properties[ activeState ] = {
			color: parameters[ 'color' + activeState ] || parameters.color || 0xffffff,
			ambient: parameters[ 'ambient' + activeState ] || parameters.ambient || 0xffffff,
			transparent: parameters[ 'transparent' + activeState ] || parameters.transparent || false,
			opacity: parameters[ 'opacity' + activeState ] || parameters.opacity || 1
		};
		
	}
	
	function modify_material ( material ) {
		
		var p = this.properties;
		
		// valid material
		
		if ( material instanceof THREE.Material ) {
			
			material.color.setHex( p.color );
			
			material.ambient.setHex( p.ambient );
			
			material.transparent = p.transparent;
			
			material.opacity = p.opacity;
			
		}
		
	}
	
} (KAIOPUA) );