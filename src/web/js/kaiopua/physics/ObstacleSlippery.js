/*
 *
 * ObstacleSlippery.js
 * Obstacle that is slippery to walk on, such as ice.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/physics/ObstacleSlippery.js",
		_ObstacleSlippery = {},
		_Obstacle,
		_ObjectHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _ObstacleSlippery,
		requirements: [
			"js/kaiopua/physics/Obstacle.js",
			"js/kaiopua/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( ob, oh ) {
		console.log('internal ObstacleSlippery', _ObstacleSlippery);
		// modules
		
		_Obstacle = ob;
		_ObjectHelper = oh;
		
		// properties
		
		_ObstacleSlippery.options = {
			effects: {
				damping: 0.97,
				speedDelta: 0.1
			}
		};
		
		// instance
		
		_ObstacleSlippery.Instance = ObstacleSlippery;
		_ObstacleSlippery.Instance.prototype = new _Obstacle.Instance();
		_ObstacleSlippery.Instance.prototype.constructor = _ObstacleSlippery.Instance;
		_ObstacleSlippery.Instance.prototype.supr = _Obstacle.Instance.prototype;
		
		_ObstacleSlippery.Instance.prototype.affect = affect;
		_ObstacleSlippery.Instance.prototype.unaffect = unaffect;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function ObstacleSlippery ( parameters ) {
		
		parameters = parameters || {};
		parameters.options = $.extend( true, {}, _ObstacleSlippery.options, parameters.options );
		
		// prototype constructor
		
		_Obstacle.Instance.call( this, parameters );
		
		// properties
		
		this.effects = {
			damping: new THREE.Vector3( 1, 1, 1 ).multiplyScalar( this.options.effects.damping ),
			speedDelta: new THREE.Vector3( 1, 1, 1 ).multiplyScalar( this.options.effects.speedDelta )
		};
		
	}
	
	/*===================================================
    
    affect
    
    =====================================================*/
	
	function affect ( object ) {
		
		var numAffected = this.affecting.length,
			affected = _ObstacleSlippery.Instance.prototype.supr.affect.apply( this, arguments );
		
		if ( this.affecting.length !== numAffected ) {
			
			affected.change = _ObjectHelper.temporary_change( object.rigidBody.velocityMovement, this.effects );
			
		}
		
		return affected;
		
	}
	
	function unaffect ( object ) {
		
		var affected = _ObstacleSlippery.Instance.prototype.supr.unaffect.apply( this, arguments );
		
		if ( typeof affected !== 'undefined' ) {
			
			_ObjectHelper.revert_change( object.rigidBody.velocityMovement, affected.change );
			
		}
		
		return affected;
		
	}
	
} ( KAIOPUA ) );