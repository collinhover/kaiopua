/*
 *
 * World.js
 * Generates worlds.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/env/World.js",
		_World = {},
		_Model,
		gravityMagnitude = 9.8;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _World,
		requirements: [
			"js/kaiopua/core/Model.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m ) {
		console.log('internal world');
		
		// assets
		
		_Model = m;
		
		_World.Instance = World;
		_World.Instance.prototype = new _Model.Instance();
		_World.Instance.prototype.constructor = _World.Instance;
		_World.Instance.prototype.show = show;
		_World.Instance.prototype.hide = hide;
		_World.Instance.prototype.update = update;
		
	}
	
	/*===================================================
    
    world
    
    =====================================================*/
    
    function World ( parameters ) {
    	
    	var me = this;
    	
    	// handle parameters
		
		parameters = parameters || {};
    	
    	// prototype constructor
		
		_Model.Instance.call( me, parameters );
		
		// properties
    	
    	me.gravityMagnitude = parameters.gravityMagnitude || gravityMagnitude;
    	
    	me.parts = {};
    	
    }
    
    /*===================================================
	
	show / hide / update
	
	=====================================================*/
	
	function show () {
		
		// fog
		
		shared.scene.fog = this.fog;
		
		// add self
		
		shared.scene.add( this );
		
	}
	
	function hide () {
		
		shared.scene.remove( this );
		
	}
	
	function update ( timeDelta ) {
		
		
		
	}
	
} ( KAIOPUA ) );