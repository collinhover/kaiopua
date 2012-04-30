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
		_Model,
		_OrbitUpdater;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Cloud,
		requirements: [
			"assets/modules/core/Model.js",
			"assets/modules/models/OrbitUpdater.js",
			{ path: "assets/models/Cloud_001.js", type: 'model' },
			{ path: "assets/models/Cloud_002.js", type: 'model' }
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, ou, cloudBase1, cloudBase2 ) {
		console.log('internal cloud', _Cloud);
		
		_Model = m;
		_OrbitUpdater = ou;
		
		// properties
		
		_Cloud.geometries = [ cloudBase1, cloudBase2 ];
		
		// instance
		
		_Cloud.Instance = Cloud;
		_Cloud.Instance.prototype = new _Model.Instance();
		_Cloud.Instance.prototype.constructor = _Cloud.Instance;
		_Cloud.Instance.prototype.supr = _Model.Instance.prototype;
		
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
		
		this.orbit = new _OrbitUpdater.Instance( { object: this } );
		
		/*
		this.wander = {
			positionOffsetMax: new THREE.Vector3( 50, 50, 50 ),
			positionOffsetMin: new THREE.Vector3( -50, -50, -50 ),
			properties: new ModifierProperties()
		}*/
		
	}
	
} (KAIOPUA) );