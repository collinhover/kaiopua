/*
 *
 * SlipperyObstacle.js
 * Obstacle that is slippery to walk on, such as ice.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/physics/SlipperyObstacle.js",
		_SlipperyObstacle = {},
		_Obstacle,
		_ObjectHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _SlipperyObstacle,
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
		console.log('internal SlipperyObstacle', _SlipperyObstacle);
		// modules
		
		_Obstacle = ob;
		_ObjectHelper = oh;
		
		// properties
		
		_SlipperyObstacle.damping = new THREE.Vector3( 0.97, 0.97, 0.97 );
		_SlipperyObstacle.speedDelta = new THREE.Vector3( 0.1, 0.1, 0.1 );
		
		// instance
		
		_SlipperyObstacle.Instance = SlipperyObstacle;
		_SlipperyObstacle.Instance.prototype = new _Obstacle.Instance();
		_SlipperyObstacle.Instance.prototype.constructor = _SlipperyObstacle.Instance;
		_SlipperyObstacle.Instance.prototype.supr = _Obstacle.Instance.prototype;
		
		_SlipperyObstacle.Instance.prototype.affect = affect;
		_SlipperyObstacle.Instance.prototype.unaffect = unaffect;
		
	}
	
	/*===================================================
    
    SlipperyObstacle
    
    =====================================================*/
	
	function SlipperyObstacle ( parameters ) {
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_Obstacle.Instance.call( this, parameters );
		
		// properties
		
		this.effects = [];
		this.damping = parameters.damping || _SlipperyObstacle.damping.clone();
		this.speedDelta = parameters.speedDelta || _SlipperyObstacle.speedDelta.clone();
		
	}
	
	/*===================================================
    
    affect
    
    =====================================================*/
	
	function affect ( object ) {
		
		var added = _SlipperyObstacle.Instance.prototype.supr.affect.apply( this, arguments );
		
		if ( added === true ) {
			
			this.effects.push( {
				object: object,
				layer: _ObjectHelper.temporary_change( object.rigidBody.velocityMovement, {
					damping: this.damping,
					speedDelta: this.speedDelta
				} ) 
			} );
			
		}
		
		return added;
		
	}
	
	function unaffect ( object ) {
		
		var removed = _SlipperyObstacle.Instance.prototype.supr.unaffect.apply( this, arguments ),
			index,
			effect;
		
		if ( removed === true ) {
			
			index = main.index_of_property( this.effects, 'object', object );
			
			if ( index !== -1 ) {
				
				effect = this.effects[ index ];
				
				_ObjectHelper.revert_change( object.rigidBody.velocityMovement, effect.layer );
				
				this.effects.splice( index, 1 );
				
			}
			
		}
		
		return removed;
		
	}
	
} ( KAIOPUA ) );