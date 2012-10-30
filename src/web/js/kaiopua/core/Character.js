/*
 *
 * Character.js
 * Adds additional functionality to basic model.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/core/Character.js",
		_Character = {},
		_Model,
		_Actions,
		_MathHelper,
		_VectorHelper,
		_ObjectHelper,
		characterName = 'Character';
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Character,
		requirements: [
			"js/kaiopua/core/Model.js",
			"js/kaiopua/core/Actions.js",
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/VectorHelper.js",
			"js/kaiopua/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, ac, mh, vh, oh ) {
		console.log('internal Character', _Character);
		// modules
		
		_Model = m;
		_Actions = ac;
		_MathHelper = mh;
		_VectorHelper = vh;
		_ObjectHelper = oh;
		
		// properties
		
		_Character.options = {
			dynamic: true,
			stats: {
				healthMax: 100,
				invulnerabilityDuration: 1000,
				invulnerabilityOpacityPulses: 3,
				invulnerabilityOpacityMin: 0.5,
				respawnOnDeath: false
			},
			movement: {
				move: {
					speed: 3,
					runThreshold: 0
				},
				rotate: {
					lerpDelta: 1,
					turnSpeed: 0.025
				},
				jump: {
					speedStart: 4,
					speedEnd: 0,
					airControl: 0.1,
					moveDamping: 0.99,
					moveSpeedMod: 0.5,
					durationMin: 100,
					duration: 100,
					startDelay: 125
				}
			},
			animation: {
				durations: {
					walk: 750,
					run: 500,
					idle: 3000,
					jump: 1000,
					jumpStart: 125,
					jumpEnd: 125,
					death: 1000,
					decay: 500,
					decayDelay: 500,
					spawn: 1000,
					clear: 125,
					clearSolo: 125
				}
			}
		};
		
		// character instance
		
		_Character.Instance = Character;
		_Character.Instance.prototype = new _Model.Instance();
		_Character.Instance.prototype.constructor = _Character.Instance;
		
		_Character.Instance.prototype.reset = reset;
		
		_Character.Instance.prototype.hurt = hurt;
		_Character.Instance.prototype.die = die;
		_Character.Instance.prototype.decay = decay;
		
		_Character.Instance.prototype.set_spawn = set_spawn;
		_Character.Instance.prototype.respawn = respawn;
		
		_Character.Instance.prototype.select = select;
		
		_Character.Instance.prototype.move_state_change = move_state_change;
		_Character.Instance.prototype.rotate_by_direction = rotate_by_direction;
		_Character.Instance.prototype.rotate_by_angle = rotate_by_angle;
		_Character.Instance.prototype.stop_jumping = stop_jumping;
		
		_Character.Instance.prototype.update = update;
		
		Object.defineProperty( _Character.Instance.prototype, 'health', { 
			get : function () { return this.state.health; },
			set: function ( health ) {
				
				if ( main.is_number( health ) ) {
					
					this.state.health = _MathHelper.clamp( health, 0, this.options.stats.healthMax );
					
				}
				
			}
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'invulnerable', { 
			get : function () { return this.state.invulnerable; },
			set: function ( invulnerable ) {
				
				var me = this,
					state = this.state,
					stats = this.options.stats,
					durationPerTween = stats.invulnerabilityDuration / ( stats.invulnerabilityOpacityPulses * 2 ),
					tweenShow,
					tweenHide;
				
				state.invulnerable = invulnerable;
				state.invulnerableTime = 0;
				
				// pulse opacity
				
				if ( state.invulnerable === true ) {
					console.log( this, ' is now invulnerable!' );
					this.material.transparent = true;
					
					tweenShow = _ObjectHelper.tween( this.material, { opacity: 1 }, {
						start: false,
						duration: durationPerTween
					} );
					
					tweenHide = _ObjectHelper.tween( this.material, { opacity: stats.invulnerabilityOpacityMin }, {
						start: false,
						duration: durationPerTween
					} );
					
					tweenHide.chain( tweenShow.chain( tweenHide ) ).start();
					
				}
				// tween opacity back to normal
				else {
					
					_ObjectHelper.tween( this.material, { opacity: 1 }, {
						duration: durationPerTween,
						onComplete: function () {
							
							me.material.transparent = false;
							
						}
					} );
					
				}
				
			}
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'moving', { 
			get : function () { return this.state.moving; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'movingHorizontal', { 
			get : function () { return this.state.movingHorizontal; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'jumping', { 
			get : function () { return this.options.movement.jump.active; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'turn', { 
			get : function () { return this.options.movement.rotate.turn; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'facing', { 
			get : function () { return this.options.movement.rotate.facing; }
		});
		
	}
	
	/*===================================================
    
    character
    
    =====================================================*/
	
	// adds functionality to and inherits from Model
	
	function Character ( parameters ) {
		
		var movement,
			move,
			rotate,
			jump,
			state,
			animation,
			durations;
		
		// handle parameters
		
		parameters = parameters || {};
		parameters.options = $.extend( true, {}, _Character.options, parameters.options );
		
		// physics
		
		if ( typeof parameters.physics !== 'undefined' ) {
			
			parameters.physics.dynamic = true;
			parameters.physics.movementDamping = main.is_number( parameters.physics.movementDamping ) ? parameters.physics.movementDamping : 0.5;
			parameters.physics.movementForceLengthMax = main.is_number( parameters.physics.movementForceLengthMax ) ? parameters.physics.movementForceLengthMax : shared.universeGravityMagnitude.length() * 20;
			
		}
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		stats = this.options.stats;
		movement = this.options.movement;
		
		// move
		
		move = movement.move;
		move.direction = new THREE.Vector3();
		
		// rotate
		rotate = movement.rotate;
		rotate.facingDirection = new THREE.Vector3( 0, 0, 1 );
		rotate.facingDirectionLast = rotate.facingDirection.clone();
		rotate.facing = new THREE.Quaternion();
		rotate.facingAngle = 0;
		rotate.turn = new THREE.Quaternion();
		rotate.turnAngle = 0;
		rotate.axis = new THREE.Vector3( 0, 1, 0 );
		rotate.delta = new THREE.Quaternion();
		rotate.vector = new THREE.Quaternion();
		
		// jump
		jump = movement.jump;
		jump.time = 0;
		jump.timeAfterNotGrounded = 0;
		jump.timeAfterNotGroundedMax = 125;
		jump.startDelayTime = 0;
		jump.ready = true;
		jump.active = false;
		jump.holding = false;
		
		// properties
		
		this.name = parameters.name || characterName;
		this.state = {};
		
		this.actions = new _Actions.Instance();
		
		this.onHurt = new signals.Signal();
		this.onDead = new signals.Signal();
		this.onRespawned = new signals.Signal();
		
		this.reset();
		
	}
	
	function reset () {
		
		var state;
		
		state = this.state;
		state.up = 0;
		state.down = 0;
		state.left = 0;
		state.right = 0;
		state.forward = 0;
		state.back = 0;
		state.moving = false;
		state.movingHorizontal = false;
		state.movingBack = false;
		state.invulnerable = false;
		state.invulnerableTime = 0;
		state.dead = false;
		state.decaying = false;
		state.health = stats.healthMax;
		
		this.morphs.clear_all();
		
	}
	
	/*===================================================
	
	health
	
	=====================================================*/
	
	function hurt ( damage ) {
		
		var state = this.state,
			stats = this.options.stats;
		console.log( this, ' trying to hurt for ', damage, ', invulnerable? ', state.invulnerable );
		if ( state.invulnerable !== true && state.dead !== true && main.is_number( damage ) && damage > 0 ) {
			
			this.health -= damage;
			
			this.onHurt.dispatch();
			console.log( ' > hurt for ', damage, ' new hp = ', this.health );
			if ( state.health === 0 ) {
				
				this.die();
				
			}
			else {
			
				// small period of invulnerability after being hurt, handled by update
				
				this.invulnerable = true;
				
			}
			
			return true;
			
		}
		
	}
	
	function die () {
		
		var state = this.state,
			animation = this.options.animation,
			durations = animation.durations;
		
		if ( state.invulnerable !== true ) {
			
			this.health = 0;
			
			state.dead = true;
			console.log( this, ' DEAD ' );
			this.morphs.play( 'die', {
				duration: durations.death,
				solo: true,
				durationClear: durations.clearSolo,
				callback: $.proxy( this.decay, this )
			} );
			
			this.onDead.dispatch();
			
		}
		
	}
	
	function decay () {
		
		var state = this.state,
			stats = this.options.stats,
			animation = this.options.animation,
			durations = animation.durations,
			me = this;
		
		if ( state.dead === true ) {
			
			state.decaying = true;
			console.log( this, ' decaying... ' );
			this.morphs.play( 'decay', {
				duration: durations.decay,
				delay: durations.decayDelay,
				solo: true,
				durationClear: durations.clearSolo
			} );
			
			// opacity to 0
			
			this.material.transparent = true;
			
			_ObjectHelper.tween( this.material, { opacity: 0 }, { 
				duration: durations.decay,
				delay: durations.decayDelay,
				onComplete: function () {
					
					if ( me.parent instanceof THREE.Object3D ) {
						
						me.parent.remove( me );
						
					}
					
					me.material.transparent = false;
					me.material.opacity = 1;
					me.morphs.clear_all();
					
					if ( stats.respawnOnDeath === true ) {
						
						me.respawn();
						
					}
					
				}
			} );
			
		}
		
	}
	
	/*===================================================
	
	spawning
	
	=====================================================*/
	
	function set_spawn ( parent, location ) {
		
		var state = this.state;
		
		state.spawnParent = parent;
		state.spawnLocation = location;
		
	}
	
	function respawn ( parent, location ) {
		
		var state = this.state,
			animation = this.options.animation,
			durations = animation.durations,
			me = this;
		
		this.reset();
		
		if ( parent instanceof THREE.Object3D ) {
			
			this.set_spawn( parent, location );
			
		}
		
		if ( state.spawnParent instanceof THREE.Object3D ) {
			
			this.material.transparent = true;
			this.material.opacity = 0;
			
			// add and position
			
			state.spawnParent.add( this );
			
			if ( state.spawnLocation instanceof THREE.Vector3 ) {
				
				this.position.copy( state.spawnLocation );
				
			}
			console.log( this, ' respawned! ' );
			this.onRespawned.dispatch();
			
			this.invulnerable = true;
			
		}
		
	}
	
	/*===================================================
    
    selection
    
    =====================================================*/
	
	function select ( target ) {
		
		// update target
		
		if ( target instanceof THREE.Object3D && target.interactive === true ) {
			
			this.target = target;
			
		}
		else {
			
			this.target = undefined;
			
		}
		
	}
	
	/*===================================================
	
	move
	
	=====================================================*/
	
	function move_state_change ( propertyName, stop ) {
		
		var movement = this.options.movement,
			state = this.state,
			rotate = movement.rotate,
			rotateFacingDirection = rotate.facingDirection,
			forwardBack;
		
		// handle state property
		
		if ( state.hasOwnProperty( propertyName ) ) {
			
			state[ propertyName ] = stop === true ? 0 : 1;
			
		}
		
		// rotation
		
		if ( state.forward === 1 ) {
			
			rotateFacingDirection.z = 1;
			rotateFacingDirection.x = 0;
			forwardBack = true;
			
		}
		else if ( state.back === 1 ) {
			
			rotateFacingDirection.z = -1;
			rotateFacingDirection.x = 0;
			forwardBack = true;
			
		}
		
		if ( state.left === 1 || state.right === 1 ) {
			
			rotateFacingDirection.x = state.right === 1 ? -state.right : state.left;
			
			if ( forwardBack !== true ) {
				
				rotateFacingDirection.z = 0;
				
			}
			else {
				
				rotateFacingDirection.normalize();
				
			}
			
		}
		
	}
	
	/*===================================================
	
	rotate
	
	=====================================================*/
	
	function rotate_by_direction ( dx, dy, dz ) {
		
		var rotate = this.options.movement.rotate;
		
		// update direction
		
		if ( main.is_number( dx ) ) {
			
			rotate.facingDirection.x = dx;
			
		}
		
		if ( main.is_number( dy ) ) {
			
			rotate.facingDirection.y = dy;
			
		}
		
		if ( main.is_number( dz ) ) {
			
			rotate.facingDirection.z = dz;
			
		}
		
	}
	
	function rotate_by_angle ( rotateAngleDelta ) {
		
		var rotate = this.options.movement.rotate,
			rotateAxis = rotate.axis,
			rotateDelta = rotate.delta,
			rotateAngleTarget = _MathHelper.degree_between_180( rotate.facingAngle + rotateAngleDelta ),
			rotateAngleDeltaShortest = _MathHelper.shortest_rotation_between_angles( rotate.facingAngle, rotateAngleTarget );
		
		// find delta quaternion
		
		rotateDelta.setFromAxisAngle( rotateAxis, rotateAngleDeltaShortest );
		
		// copy deltas
		
		rotateDelta.multiplyVector3( rotate.facingDirection );
		rotate.facingAngle = rotateAngleTarget;
		
	}
	
	/*===================================================
	
	jump
	
	=====================================================*/
	
	function stop_jumping () {
		
		this.options.movement.jump.active = false;
		this.options.movement.jump.holding = false;
		
	}
	
	/*===================================================
	
	update
	
	=====================================================*/
	
	function update ( timeDelta, timeDeltaMod ) {
		
		var rigidBody = this.rigidBody,
			morphs = this.morphs,
			state = this.state,
			options = this.options,
			stats = options.stats,
			movement = options.movement,
			move = movement.move,
			rotate = movement.rotate,
			jump = movement.jump,
			animation = options.animation,
			durations = animation.durations,
			moveDir = move.direction,
			moveSpeed = move.speed * timeDeltaMod,
			rotateTurnAngleDelta,
			rotateAxis = rotate.axis,
			rotateFacingAngleDelta,
			rotateFacingAngleDeltaShortest,
			rotateFacingAngleTarget,
			rotateFacingDirection = rotate.facingDirection,
			rotateFacingDirectionLast = rotate.facingDirectionLast,
			rotateDelta = rotate.delta,
			rotateLerpDelta = rotate.lerpDelta * timeDeltaMod,
			jumpSpeedStart,
			jumpSpeedEnd,
			jumpAirControl,
			jumpMoveDamping,
			jumpTime,
			jumpDuration,
			jumpTimeRatio,
			jumpTimeAfterNotGroundedMax,
			jumpStartDelay,
			grounded,
			sliding,
			velocityGravity,
			velocityGravityForceDelta,
			velocityMovement,
			velocityMovementForceDelta,
			velocityMovementForceRotatedLength,
			velocityMovementDamping,
			dragCoefficient,
			terminalVelocity,
			playSpeedModifier;
		
		// check stats
		
		if ( state.invulnerable === true ) {
			
			state.invulnerableTime += timeDelta;
			
			if ( state.invulnerableTime >= stats.invulnerabilityDuration ) {
				
				this.invulnerable = false;
				
			}
			
		}
		
		// set moving
				
		if ( state.forward === 1 || state.back === 1 || state.left === 1 || state.right === 1 ) {
			
			state.movingHorizontal = true;
			
		}
		else {
			
			state.movingHorizontal = false;
			
		}
		
		if ( state.movingHorizontal || state.up === 1 || state.down === 1 ) {
			
			state.moving = true;
			
		}
		else {
			
			state.moving = false;
			
		}
		
		// update movement
		
		moveDir.z = state.movingHorizontal ? 1 : 0;
		
		// update rotation angles
		
		rotateTurnAngleDelta = ( state.right === 1 ? -state.right : state.left ) * rotate.turnSpeed;
		rotateFacingAngleDelta = _VectorHelper.signed_angle_between_coplanar_vectors( rotateFacingDirectionLast, rotateFacingDirection, rotateAxis ) * rotateLerpDelta;
		
		// if moving
		
		if ( state.movingHorizontal === true ) {
			
			// rotate by turn angle change
			
			if ( rotateTurnAngleDelta !== 0 ) {
				
				rotateDelta.setFromAxisAngle( rotateAxis, rotateTurnAngleDelta );
				
				this.quaternion.multiplySelf( rotateDelta );
				
				// copy new turn angle
				
				rotate.turn.multiplySelf( rotateDelta );
				rotate.turnAngle = _MathHelper.degree_between_180( rotate.turnAngle + rotateTurnAngleDelta );
				
			}
			
			// rotate by direction angle change
			
			if ( rotateFacingAngleDelta !== 0 ) {
				
				rotateFacingAngleTarget = _MathHelper.degree_between_180( rotate.facingAngle + rotateFacingAngleDelta );
				rotateFacingAngleDeltaShortest = _MathHelper.shortest_rotation_between_angles( rotate.facingAngle, rotateFacingAngleTarget );
				rotateDelta.setFromAxisAngle( rotateAxis, rotateFacingAngleDeltaShortest );
				
				this.quaternion.multiplySelf( rotateDelta );
				
				// copy new direction angle
				
				rotate.facing.multiplySelf( rotateDelta );
				rotateDelta.multiplyVector3( rotateFacingDirectionLast );
				rotate.facingAngle = rotateFacingAngleTarget;
				
			}
			
		}
		
		// velocity
		
		if ( typeof rigidBody !== 'undefined' ) {
			
			// properties
			
			jumpTime = jump.time;
			jumpDuration = jump.duration;
			jumpTimeAfterNotGroundedMax = jump.timeAfterNotGroundedMax;
			jumpStartDelay = jump.startDelay;
			jumpSpeedStart = jump.speedStart * timeDeltaMod;
			jumpSpeedEnd = jump.speedEnd * timeDeltaMod;
			jumpAirControl = jump.airControl;
			jumpMoveDamping = jump.moveDamping;
			
			velocityMovement = rigidBody.velocityMovement;
			velocityMovementForceDelta = velocityMovement.forceDelta;
			velocityGravity = rigidBody.velocityGravity;
			velocityGravityForceDelta = velocityGravity.forceDelta;
			
			// jumping
			
			grounded = rigidBody.grounded;
			sliding = rigidBody.sliding;
			
			jump.timeAfterNotGrounded += timeDelta;
			
			// air control
			
			if ( grounded === false && jump.timeAfterNotGrounded >= jumpTimeAfterNotGroundedMax ) {
				
				if ( typeof jump.movementChangeLayer === 'undefined' ) {
					
					jump.movementChangeLayer = _ObjectHelper.temporary_change( velocityMovement, {
						damping: new THREE.Vector3(  jumpMoveDamping, jumpMoveDamping, jumpMoveDamping ),
						speedDelta: new THREE.Vector3(  jumpAirControl, jumpAirControl, jumpAirControl )
					} );
					
				}
				
			}
			else if ( typeof jump.movementChangeLayer !== 'undefined' ) {
				
				_ObjectHelper.revert_change( velocityMovement, jump.movementChangeLayer );
				
				jump.movementChangeLayer = undefined;
				
			}
			
			// if falling but not jumping
			
			if ( jump.active === false && jump.timeAfterNotGrounded >= jumpTimeAfterNotGroundedMax && grounded === false ) {
				
				jump.ready = false;
				
				morphs.play( 'jump', { duration: durations.jump, loop: true, solo: true, durationClear: durations.clearSolo } );
				
			}
			// do jump
			else if ( state.up !== 0 && ( ( grounded === true && sliding === false ) || jump.timeAfterNotGrounded < jumpTimeAfterNotGroundedMax ) && jump.ready === true ) {
				
				jump.time = 0;
				
				jump.startDelayTime = 0;
				
				jump.ready = false;
				
				jump.active = true;
				
				jump.starting = true;
				
				jump.holding = true;
				
			}
			else if ( jump.holding === true && jump.active === true && jump.time < jumpDuration ) {
				
				// count delay
				
				jump.startDelayTime += timeDelta;
				
				if ( state.up === 0 && jump.time >= jump.durationMin ) {
					
					jump.holding = false;
					
				}
				
				// do jump after delay
				
				if ( jump.startDelayTime >= jump.startDelay ) {
					
					// if start delay just finished
					
					if ( jump.starting === true ) {
						
						jump.starting = false;
					
						// reset velocity
						
						velocityGravity.reset();
						
					}
					
					// play jump
					
					morphs.play( 'jump', { duration: durations.jump, loop: true, solo: true, durationClear: durations.clearSolo } );
					
					// properties
					
					jumpTimeRatio = jumpTime / jumpDuration;
					
					// update time total
					
					jump.time += timeDelta;
					
					// add speed to gravity velocity delta
					
					velocityGravityForceDelta.y += jumpSpeedStart * ( 1 - jumpTimeRatio) + jumpSpeedEnd * jumpTimeRatio;
					
				}
				else {
					
					// play jump start
					
					morphs.play( 'jump_start', { duration: durations.jumpStart, loop: false, solo: true, durationClear: durations.clearSolo, callback: function () { morphs.clear( 'jump_start' ); } } );
					
				}
				
			}
			else {
				
				if ( grounded === true && jump.active !== false ) {
					
					this.stop_jumping();
					
					if ( jump.timeAfterNotGrounded >= jumpTimeAfterNotGroundedMax ) {
						
						morphs.clear( 'jump', durations.clear );
						
						morphs.play( 'jump_end', { duration: durations.jumpEnd, loop: false, callback: function () { morphs.clear( 'jump_end', durations.clear ); } } );
						
					}
					
				}
				
				if ( grounded === true && sliding === false && state.up === 0 ) {
					
					jump.timeAfterNotGrounded = 0;
					
					jump.ready = true;
					
				}
				
			}
			
			// movement
			
			if ( sliding !== true ) {
				
				moveDir.multiplyScalar( moveSpeed );
				
				if ( state.movingHorizontal && jump.active === true ) {
					
					moveDir.z += jumpSpeedStart * jump.moveSpeedMod;
					
				}
				
				velocityMovementForceDelta.addSelf( moveDir );
				
				// moving backwards?
				
				if ( moveDir.z < 0 ) {
					
					state.movingBack = true;
					
				}
				else if ( moveDir.z > 0 ) {
					
					state.movingBack = false;
					
				}
				
			}
			
			// walk/run/idle
			
			if ( jump.active === false && grounded === true ) {
				
				// get movement force
				
				velocityMovementForceRotatedLength = velocityMovement.forceRotated.length() / timeDeltaMod;
				
				// walk / run cycles
				
				if ( velocityMovementForceRotatedLength > 0 || sliding === true ) {
					
					// get approximate terminal velocity based on acceleration (moveVec) and damping
					// helps morphs play faster if character is moving faster, or slower if moving slower
					// TODO: account for really low damping (0.95+)
					
					velocityMovementDamping = velocityMovement.damping.z;
					dragCoefficient = ( 0.33758 * Math.pow( velocityMovementDamping, 2 ) ) + ( -0.67116 * velocityMovementDamping ) + 0.33419;
					
					terminalVelocity = Math.round( Math.sqrt( ( 2 * Math.abs( velocityMovement.force.z * 0.5 ) ) / dragCoefficient ) ) * 0.5;
					playSpeedModifier = terminalVelocity / Math.round( velocityMovementForceRotatedLength );
					
					if ( main.is_number( playSpeedModifier ) !== true ) {
						
						playSpeedModifier = 1;
						
					}
					
					if ( velocityMovementForceRotatedLength >= move.runThreshold ) {
						
						this.morphs.play( 'run', { duration: durations.run * playSpeedModifier, loop: true, solo: true, durationClear: durations.clearSolo, reverse: state.movingBack } );
						
					}
					else {
						
						this.morphs.play( 'walk', { duration: durations.walk * playSpeedModifier, loop: true, solo: true, durationClear: durations.clearSolo, reverse: state.movingBack } );
						
					}
					
				}
				// idle cycle
				else {
					
					this.morphs.play( 'idle', { duration: durations.idle, loop: true, solo: true, durationClear: durations.clearSolo, reverse: false } );
					
				}
				
			}
			
		}
		
	}
	
} ( KAIOPUA ) );