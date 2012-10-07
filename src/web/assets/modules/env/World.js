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
		assetPath = "assets/modules/env/World.js",
		_World = {},
        _Game,
		_Model,
		gravityMagnitude = 9.8;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _World,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/core/Model.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( g, m ) {
		console.log('internal world');
		
		// assets
		
		_Game = g;
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
		
		_Game.scene.fog = this.fog;
		
		// add self
		
		_Game.scene.add( this );
		
	}
	
	function hide () {
		
		_Game.scene.remove( this );
		
	}
	
	function update ( timeDelta ) {
		
		
		
	}
	
} ( KAIOPUA ) );