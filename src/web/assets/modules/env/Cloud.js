/*
 *
 * Cloud.js
 * Object used in Sky.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/env/Cloud.js",
		_Cloud = {},
		_Model;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Cloud,
		requirements: [
			"assets/modules/core/Model.js",
			{ path: "assets/models/Cloud_001.js", type: 'model' },
			{ path: "assets/models/Cloud_002.js", type: 'model' }
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, cloudBase1, cloudBase2 ) {
		console.log('internal cloud', _Cloud);
		
		_Model = m;
		
		// properties
		
		_Cloud.geometries = [ cloudBase1, cloudBase2 ];
		
		// instance
		
		_Cloud.Instance = Cloud;
		_Cloud.Instance.prototype = new _Model.Instance();
		_Cloud.Instance.prototype.constructor = _Cloud.Instance;
		_Cloud.Instance.prototype.supr = _Model.Instance.prototype;
		
		_Cloud.Instance.prototype.orbit = orbit;
		_Cloud.Instance.prototype.orbit_stop = orbit_stop;
		
	}
	
	/*===================================================
    
    cloud
    
    =====================================================*/
	
	function Cloud ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.geometry = parameters.geometry || _Cloud.geometries[ Math.round( Math.random() * ( _Cloud.geometries.length - 1 ) ) ];
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// properties
		
		this.orbitOrigin = new THREE.Vector3();
		this.orbitAxis = shared.cardinalAxes.up.clone();
		
	}
	
	/*===================================================
    
    orbit
    
    =====================================================*/
	
	function orbit ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// stop
		
		if ( parameters.stop === true ) {
			
			// properties
			
			this.orbiting = false;
			
			// signal
			
			shared.signals.update.remove( orbit_update, this );
			
		}
		// start
		else {
			
			// properties
			
			this.orbiting = true;
			
			if ( parameters.origin ) {
				
				this.orbitOrigin.copy( parameters.origin );
				
			}
			
			if ( parameters.axis ) {
				
				this.orbitAxis.copy( parameters.axis );
				
			}
			
			this.orbitRadius = parameters.radius || this.position.distanceTo( this.orbitOrigin );
			
			this.orbitWander = typeof parameters.wander === 'boolean' ? parameters.wander : true;
			
			// signal
			
			shared.signals.update.add( orbit_update, this );
			
		}
		
	}
	
	function orbit_stop () {
		
		this.orbit( { stop: true } );
		
	}
	
	function orbit_update () {
		
		
		
	}
	
} (KAIOPUA) );