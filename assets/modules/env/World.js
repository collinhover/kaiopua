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
		
		Object.defineProperty( _World.Instance.prototype, 'scene', { 
			get : function () { return this._scene; },
			set : function ( newScene ) {
				
				if ( typeof newScene !== 'undefined' ) {
					
					// remove from previous
					
					this.hide();
					
					// add to new
					
					this.show( newScene );
					
				}
				
			}
		});
		
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
    	
    	me.addOnShow = [];
    	
    }
    
    /*===================================================
	
	show / hide / update
	
	=====================================================*/
	
	function show ( scene ) {
		
		this._scene = scene || _Game.scene;
		
		// fog
		
		this.scene.fog = this.fog;
		
		// add self
		
		this.scene.add( this );
		
		// TODO, remove following
		
		_Game.add_to_scene( this.addOnShow, this.scene );
		
	}
	
	function hide () {
		
		this.scene.remove( this );
		
		// TODO, remove following
		
		_Game.remove_from_scene( this.addOnShow, this.scene );
		
	}
	
	function update ( timeDelta ) {
		
		
		
	}
	
} ( KAIOPUA ) );