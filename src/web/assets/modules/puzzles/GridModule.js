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
		_GridModule = {};
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, { data: _GridModule } );
	
	/*===================================================
	
	grid modules
	
	=====================================================*/
	
	_GridModule.Instance = GridModule;
	
	function GridModule ( face, grid ) {
		
		this.face = face;
		
		this.grid = grid;
		
		this.reset();
		
	}
	
	GridModule.prototype = {
		
		reset: function () {
			
			if ( typeof this.face !== 'undefined' && typeof this.grid !== 'undefined' ) {
				
				this.face.materialIndex = this.grid.stateMaterialsMap.base;
				
			}
			
			this.occupied = false;
			
		},
		
		get_modules_connected: function ( connected, recalculate ) {
			
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
					
					for ( i = 0, l = faceVertexIndices.length; i < l; i++ ) {
						
						faceVertexIndex = faceVertexIndices[ i ];
						
						this._connected = this.grid.get_modules( faceVertexIndex, this, this._connected );
						
					}
					
					// remove flag
					
					this.dirtyConnected = false;
					
				}
				
			}
			
			// add all direct connections to connected
			
			connected = connected.concat( this._connected );
			
			return connected;
			
		},
		
	};
	
	/*===================================================
	
	get / set
	
	=====================================================*/
	
	Object.defineProperty( GridModule.prototype, 'connected', { 
		get : GridModule.prototype.get_modules_connected
	});
	
	Object.defineProperty( GridModule.prototype, 'grid', { 
		get : function () { return this._grid; },
		set: function ( grid ) {
			
			this._grid = grid;
			
			this.dirtyConnected = true;
			
		}
	});
	
	Object.defineProperty( GridModule.prototype, 'face', { 
		get : function () { return this._face; },
		set: function ( face ) {
			
			this._face = face;
			
			this.dirtyConnected = true;
			
		}
	});
	
} (KAIOPUA) );