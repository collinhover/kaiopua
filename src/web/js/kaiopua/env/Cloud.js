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
		assetPath = "js/kaiopua/env/Cloud.js",
		_Cloud = {},
		_Model;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Cloud,
		requirements: [
			"js/kaiopua/core/Model.js",
			{ path: "asset/model/Cloud_001.js", type: 'model' },
			{ path: "asset/model/Cloud_002.js", type: 'model' }
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
		
	}
	
	/*===================================================
    
    cloud
    
    =====================================================*/
	
	function Cloud ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.geometry = parameters.geometry || _Cloud.geometries[ Math.round( Math.random() * ( _Cloud.geometries.length - 1 ) ) ];
		
		parameters.material = parameters.material || new THREE.MeshBasicMaterial( { shading: THREE.NoShading, vertexColors: THREE.VertexColors } );
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
	}
	
} (KAIOPUA) );