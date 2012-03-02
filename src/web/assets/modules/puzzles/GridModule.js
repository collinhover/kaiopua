/*
 *
 * GridModule.js
 * Single module of puzzle grids.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/GridModule.js",
		_GridModule = {},
		_Model,
		states;
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, {
		data: _GridModule,
		requirements: [
			"assets/modules/core/Model.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	function init_internal ( m ) {
		console.log("internal grid module", _GridModule);
		_Model = m;
		
		// states
		
		_GridModule.STATE_BASE = 'base';
		_GridModule.STATE_VACANT = 'vacant';
		_GridModule.STATE_OCCUPIED = 'occupied';
		
		_GridModule.STATES = {};
		_GridModule.STATES[ _GridModule.STATE_BASE ] = { 
			color: 0xe6b266,
			ambient: 0xe6b266,
		};
		_GridModule.STATES[ _GridModule.STATE_VACANT ] = { 
			color: 0x0ccd6f,
			ambient: 0x0ccd6f,
		};
		_GridModule.STATES[ _GridModule.STATE_OCCUPIED ] = { 
			color: 0xff2830,
			ambient: 0xff2830,
		};
	
		// instance
		
		_GridModule.Instance = GridModule;
		_GridModule.Instance.prototype = new _Model.Instance();
		_GridModule.Instance.prototype.constructor = _GridModule.Instance;
		_GridModule.Instance.prototype.reset = reset;
		_GridModule.Instance.prototype.set_state = set_state;
		_GridModule.Instance.prototype.has_face_or_vertex_index = has_face_or_vertex_index;
		_GridModule.Instance.prototype.get_modules_connected = get_modules_connected;
		_GridModule.Instance.prototype.find_and_store_connected = find_and_store_connected;
		
		Object.defineProperty( _GridModule.Instance.prototype, 'connected', { 
			get: function () { this.get_modules_connected(); return this._connected; }
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'connectedList', { 
			get: function () { return this.get_modules_connected(); }
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'grid', { 
			get: function () { return this._grid; },
			set: function ( grid ) {
				
				this._grid = grid;
				
				this._dirtyConnected = true;
				
			}
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'state', { 
			get : function () { return this._state; },
			set: set_state
		});
		
	}
	
	/*===================================================
	
	grid modules
	
	=====================================================*/
	
	function GridModule ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.materials = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, ambient: 0xFFFFFF, transparent: false, opacity: 1 } );
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// store grid reference
		
		this.grid = parameters.grid;
		
		// init connected
		
		this._connected = {};
		this._connectedList = [];
		
		// set to base state
		
		this.reset();
		
	}
	
	function reset () {
			
		this.state = _GridModule.STATE_BASE;
			
	}
		
	function set_state ( id ) {
		console.log('module setting state...');
		if ( typeof this.grid !== 'undefined' && typeof id === 'string' && typeof _GridModule.STATES[ id ] !== 'undefined' ) {
			
			this._state = id;
			
			this.material.color.setHex( _GridModule.STATES[ id ].color );
			
			this.material.ambient.setHex( _GridModule.STATES[ id ].ambient );
			
			console.log('... state set to', this.state );
			
		}
		
	}
	
	function has_face_or_vertex_index( searchFor ) {
		
		var i, l,
			faces,
			face,
			has = false;
		
		// search all faces
		
		faces = this.geometry.faces;
		
		for ( i = 0, l = faces.length; i < l; i++ ) {
			
			face = faces[ i ];
			
			if ( ( ( searchFor instanceof THREE.Face4 || searchFor instanceof THREE.Face3 ) && searchFor === face ) 
				|| ( _MathHelper.is_number( searchFor ) && ( searchFor === face.a || searchFor === face.b || searchFor === face.c || searchFor === face.d ) ) ) {
				
				has = true;
				
				break;
				
			}
			
		}
		
		return has;
		
	}
		
	function get_modules_connected ( connected, recalculate ) {
		
		var i, l,
			j, k,
			faces,
			face;
		
		// handle connected
		
		connected = main.ensure_array( connected );
		
		// if should recalculate
		
		if ( this._dirtyConnected !== false || recalculate === true ) {
			
			// for each face
			
			faces = this.geometry.faces;
			
			for ( i = 0, l = faces.length; i < l; i++ ) {
				
				face = faces[ i ];
				
				// get connected sides
				
				// ab / up
				
				this.find_and_store_connected( face.a, face.b, [ 'ab', 'up' ] );
				
				// bc / right
				
				this.find_and_store_connected( face.b, face.c, [ 'bc', 'right' ] );
				
				// by face type
				
				if ( face instanceof THREE.Face4 ) {
					
					// cd / down
					
					this.find_and_store_connected( face.c, face.d, [ 'cd', 'down' ] );
					
					// da / left
					
					this.find_and_store_connected( face.d, face.a, [ 'da', 'left' ] );
					
				}
				else {
					
					// ca / left / down
					
					this.find_and_store_connected( face.c, face.a, [ 'ca', 'left', 'down' ] );
					
				}
				
				// get connected corners
				
				// a / upleft
				
				this.find_and_store_connected( face.a, undefined, [ 'a', 'upleft' ] );
				
				// b / upright
				
				this.find_and_store_connected( face.b, undefined, [ 'a', 'upright' ] );
				
				// c / downright
				
				this.find_and_store_connected( face.c, undefined, [ 'c', 'downright' ] );
				
				// d / downleft
				
				this.find_and_store_connected( face.d, undefined, [ 'd', 'downleft' ] );
				
			}
			
			// remove flag
			
			this._dirtyConnected = false;
			
		}
		
		// add all direct connections to connected
		
		connected = connected.concat( this._connectedList );
		
		return connected;
		
	}
	
	function find_and_store_connected ( vertexIndexA, vertexIndexB, ids ) {
		
		var i, l,
			searchFor,
			connectedModules,
			connectedModule;
		
		// if grid is valid
		
		if ( typeof this.grid !== 'undefined' ) {
			
			// set search target(s)
			
			if ( typeof vertexIndexB !== 'undefined' ) {
				
				searchFor = [ vertexIndexA, vertexIndexB ];
				
			}
			else {
				
				searchFor = vertexIndexA;
				
			}
			
			// get connected modules
			
			connectedModules = this.grid.get_modules( searchFor, [ this ].concat( this._connectedList ) );
			
			if ( connectedModules.length > 0 ) {
				
				// take just first found module
				
				connectedModule = connectedModules[ 0 ];
				
				// check ids
				
				ids = main.ensure_array( ids );
				
				// store for each id
				
				for ( i = 0, l = ids.length; i < l; i++ ) {
					
					this._connected[ ids[ i ] ] = connectedModule;
					
				}
				
				// store in list
				
				this._connectedList.push( connectedModule );
				
			}
			
		}
		
	}
	
} (KAIOPUA) );