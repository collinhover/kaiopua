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
		_Model;
	
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
		
		// instance
		
		_GridModule.Instance = GridModule;
		_GridModule.Instance.prototype = new _Model.Instance();
		_GridModule.Instance.prototype.constructor = _GridModule.Instance;
		_GridModule.Instance.prototype.reset = reset;
		_GridModule.Instance.prototype.set_state = set_state;
		_GridModule.Instance.prototype.get_modules_connected = get_modules_connected;
		
		Object.defineProperty( _GridModule.Instance.prototype, 'connected', { 
			get: get_modules_connected
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'grid', { 
			get: function () { return this._grid; },
			set: function ( grid ) {
				
				this._grid = grid;
				
				this.dirtyConnected = true;
				
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
		
		parameters.materials = new THREE.MeshLambertMaterial( { color: 0xAAAAAA, ambient: 0xFFFFFF, transparent: false, opacity: 1 } );
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// store grid reference
		
		this.grid = parameters.grid;
		
		this.reset();
		
	}
	
	function reset () {
			
		this.set_state( _GridModule.STATE_BASE );
			
	}
		
	function set_state ( id ) {
		console.log('module setting state...');
		if ( typeof this.grid !== 'undefined' && typeof id === 'string' ) {
			
			this._state = id;
			
			this.material.color.setRGB( Math.random(), Math.random(), Math.random() );
			
			console.log('... state set to', this.state );
			
		}
		
	}
		
	function get_modules_connected ( connected, recalculate ) {
		
		var i, l,
			faceVertexIndices,
			faceVertexIndex,
			modulePotential;
		
		// handle connected
		
		connected = main.ensure_array( connected );
		
		// if should recalculate
		
		if ( typeof this._connected === 'undefined' || this.dirtyConnected !== false || recalculate === true ) {
				
			// get indices of vertices in face of module
			
			if ( this.face instanceof THREE.Face3 ) {
				
				faceVertexIndices = [ this.face.a, this.face.b, this.face.c ];
				
			}
			else if ( this.face instanceof THREE.Face4 ) {
				
				faceVertexIndices = [ this.face.a, this.face.b, this.face.c, this.face.d ];
				
			}
			
			// if grid is valid
			
			if ( typeof this.grid !== 'undefined' ) {
				
				// init direct connections list
				
				this._connected = [];
				
				// for each vertex index in face, find modules that share
				// add to direct connections list
				this._connected = this.grid.get_modules( [ faceVertexIndices[ 0 ], faceVertexIndices[ 1 ] ], this, this._connected );
				/*
				for ( i = 0, l = faceVertexIndices.length; i < l; i++ ) {
					
					faceVertexIndex = faceVertexIndices[ i ];
					
					this._connected = this.grid.get_modules( faceVertexIndex, this, this._connected );
					
				}
				*/
				// remove flag
				
				this.dirtyConnected = false;
				
			}
			
		}
		
		// add all direct connections to connected
		
		connected = connected.concat( this._connected );
		
		return connected;
		
	}
	
} (KAIOPUA) );