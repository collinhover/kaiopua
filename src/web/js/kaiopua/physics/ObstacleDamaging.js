/*
 *
 * ObstacleDamaging.js
 * Obstacle that damages anything running into it.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/physics/ObstacleDamaging.js",
		_ObstacleDamaging = {},
		_Obstacle,
		_ObjectHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _ObstacleDamaging,
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
		console.log('internal ObstacleDamaging', _ObstacleDamaging);
		// modules
		
		_Obstacle = ob;
		_ObjectHelper = oh;
		
		// properties
		
		_ObstacleDamaging.options = {
			damage: 1,
			pushback: {
				speedStart: 4,
				speedEnd: 0,
				duration: 200
			},
			effects: {
				speedDelta: 0
			}
		};
		
		// instance
		
		_ObstacleDamaging.Instance = ObstacleDamaging;
		_ObstacleDamaging.Instance.prototype = new _Obstacle.Instance();
		_ObstacleDamaging.Instance.prototype.constructor = _ObstacleDamaging.Instance;
		_ObstacleDamaging.Instance.prototype.supr = _Obstacle.Instance.prototype;
		
		_ObstacleDamaging.Instance.prototype.affect = affect;
		_ObstacleDamaging.Instance.prototype.unaffect = unaffect;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function ObstacleDamaging ( parameters ) {
		
		parameters = parameters || {};
		parameters.options = $.extend( true, {}, _ObstacleDamaging.options, parameters.options );
		
		// prototype constructor
		
		_Obstacle.Instance.call( this, parameters );
		
		// utility
		
		this.effects = {
			speedDelta: new THREE.Vector3( 1, 1, 1 ).multiplyScalar( this.options.effects.speedDelta )
		};
		
	}
	
	/*===================================================
    
    affect
    
    =====================================================*/
	
	function affect ( object, parameters ) {
		
		var me = this,
			numAffected = this.affecting.length,
			affected = _ObstacleDamaging.Instance.prototype.supr.affect.apply( this, arguments ),
			options = this.options,
			pushback = options.pushback,
			affected,
			velocity,
			damaged,
			rigidBody,
			collision;
		
		parameters = parameters || {};
		velocity = parameters.velocity;
		
		// damage
		
		if ( typeof object.hurt === 'function' && affected.cooldown !== true ) {
			
			damaged = object.hurt( options.damage );
			
			// start pushback when damaged
			
			collision = velocity.collision;
			rigidBody = object.rigidBody;
			
			if ( damaged === true && collision && typeof rigidBody !== 'undefined' ) {
				
				affected.cooldown = true;
				
				// effect change
				
				if ( typeof affected.change !== 'undefined' ) {
					
					_ObjectHelper.revert_change( rigidBody.velocityMovement, affected.change );
					delete affected.change;
					
				}
				
				if ( affected.collision !== collision ) {
					
					affected.change = _ObjectHelper.temporary_change( rigidBody.velocityMovement, this.effects );
					
				}
				
				affected.collision = collision;
				
				// collision normal is local to collision object, i.e. this
				
				affected.pushbackDelta = affected.collision.normal.clone();
				this.matrixWorld.rotateAxis( affected.pushbackDelta );
				
				// reset movement velocity
				
				rigidBody.velocityMovement.clear();
				rigidBody.velocityMovement.dampingPre.set( 1, 1, 1 );
				
				// tween pushback speed
				
				affected.tweenFrom = { speed: pushback.speedStart };
				affected.tweenTo = { speed: pushback.speedEnd };
				
				_ObjectHelper.tween( affected.tweenFrom, affected.tweenTo, {
					duration: pushback.duration,
					onUpdate: function () {
						
						// apply pushback to force rotated
						
						affected.pushbackDelta.multiplyScalar( affected.tweenFrom.speed );
						
						rigidBody.velocityMovement.forceRotated.addSelf( affected.pushbackDelta );
						
					},
					onComplete: function () {
						
						affected.cooldown = false;
						
						me.unaffect( object );
						
					}
				});
				
			}
			
		}
		
		return affected;
		
	}
	
	function unaffect ( object ) {
		
		var affected = _ObstacleDamaging.Instance.prototype.supr.unaffect.apply( this, arguments );
		
		if ( typeof affected !== 'undefined' ) {
			
			_ObjectHelper.revert_change( object.rigidBody.velocityMovement, affected.change );
			
		}
		
		return affected;
		
	}
	
} ( KAIOPUA ) );