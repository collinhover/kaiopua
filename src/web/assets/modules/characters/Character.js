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
		assetPath = "assets/modules/characters/Character.js",
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
			"assets/modules/core/Game.js",
			"assets/modules/core/Model.js",
			"assets/modules/core/Actions.js",
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/VectorHelper.js",
			"assets/modules/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( g, m, ac, mh, vh, oh ) {
		console.log('internal Character', _Character);
		// modules
		
		_Game = g;
		_Model = m;
		_Actions = ac;
		_MathHelper = mh;
		_VectorHelper = vh;
		_ObjectHelper = oh;
		
		// character instance
		
		_Character.Instance = Character;
		_Character.Instance.prototype = new _Model.Instance();
		_Character.Instance.prototype.constructor = _Character.Instance;
		
		_Character.Instance.prototype.move_state_change = move_state_change;
		_Character.Instance.prototype.rotate_by_direction = rotate_by_direction;
		_Character.Instance.prototype.rotate_by_angle = rotate_by_angle;
		_Character.Instance.prototype.stop_jumping = stop_jumping;
		_Character.Instance.prototype.morph_cycle = morph_cycle;
		
		_Character.Instance.prototype.update = update;
		
		Object.defineProperty( _Character.Instance.prototype, 'scene', { 
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
		
		Object.defineProperty( _Character.Instance.prototype, 'moving', { 
			get : function () { return this.movement.state.moving; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'movingHorizontal', { 
			get : function () { return this.movement.state.movingHorizontal; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'jumping', { 
			get : function () { return this.movement.jump.active; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'turn', { 
			get : function () { return this.movement.rotate.turn; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'facing', { 
			get : function () { return this.movement.rotate.facing; }
		});
		
	}
	
	/*===================================================
    
    character
    
    =====================================================*/
	
	// adds functionality to and inherits from Model
	
	function Character ( parameters ) {
		
		var parametersModel,
			parametersMovement,
			movement,
			move,
			rotate,
			jump,
			state;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parametersModel = parameters.model || {};
		
		parametersMovement = parameters.movement || {};
		
		// movement
		
		movement = this.movement = {};
		
		// move
		
		move = movement.move = {};
		move.speed = main.is_number( parametersMovement.moveSpeed ) ? parametersMovement.moveSpeed : 3;
		move.runThreshold = main.is_number( parametersMovement.moveRunThreshold ) ? parametersMovement.moveRunThreshold : 0;
		move.walkAnimationTime = main.is_number( parametersMovement.moveWalkAnimationTime ) ? parametersMovement.moveWalkAnimationTime : 750;
		move.runAnimationTime = main.is_number( parametersMovement.moveRunAnimationTime ) ? parametersMovement.moveRunAnimationTime : 500;
		move.idleAnimationTime = main.is_number( parametersMovement.moveIdleAnimationTime ) ? parametersMovement.moveIdleAnimationTime : 3000;
		move.morphClearTime = main.is_number( parametersMovement.moveCycleClearTime ) ? parametersMovement.moveCycleClearTime : 125;
		move.animationChangeTimeThreshold = main.is_number( parametersMovement.animationChangeTimeThreshold ) ? parametersMovement.animationChangeTimeThreshold : 0;
		move.animationChangeTimeTotal = move.animationChangeTimeThreshold;
		move.direction = new THREE.Vector3();
		
		// rotate
		rotate = this.movement.rotate = {};
		rotate.lerpDelta = main.is_number( parametersMovement.rotateLerpDelta ) ? parametersMovement.rotateLerpDelta : 1;
		rotate.facingDirection = new THREE.Vector3( 0, 0, 1 );
		rotate.facingDirectionLast = rotate.facingDirection.clone();
		rotate.facing = new THREE.Quaternion();
		rotate.facingAngle = 0;
		rotate.turn = new THREE.Quaternion();
		rotate.turnAngle = 0;
		rotate.turnSpeed = main.is_number( parametersMovement.rotateTurnSpeed ) ? parametersMovement.rotateTurnSpeed : 0.025;
		rotate.axis = new THREE.Vector3( 0, 1, 0 );
		rotate.delta = new THREE.Quaternion();
		rotate.vector = new THREE.Quaternion();
		
		// jump
		jump = this.movement.jump = {};
		jump.speedStart = main.is_number( parametersMovement.jumpSpeedStart ) ? parametersMovement.jumpSpeedStart : move.speed * ( 4 / 3 );
		jump.speedEnd = main.is_number( parametersMovement.jumpSpeedEnd ) ? parametersMovement.jumpSpeedEnd : 0;
		jump.airControl = main.is_number( parametersMovement.jumpAirControl ) ? parametersMovement.jumpAirControl : 0.1;
		jump.moveDamping = main.is_number( parametersMovement.jumpMoveDamping ) ? parametersMovement.jumpMoveDamping : 0.99;
		jump.moveSpeedMod = main.is_number( parametersMovement.jumpMoveSpeedMod ) ? parametersMovement.jumpMoveSpeedMod : 0.5;
		jump.timeTotal = 0;
		jump.timeMin = main.is_number( parametersMovement.jumpTimeMin ) ? parametersMovement.jumpTimeMin : 100;
		jump.timeMax = main.is_number( parametersMovement.jumpTimeMax ) ? parametersMovement.jumpTimeMax : 100;
		jump.timeAfterNotGrounded = 0;
		jump.timeAfterNotGroundedMax = 125;
		jump.startDelay = main.is_number( parametersMovement.jumpStartDelay ) ? parametersMovement.jumpStartDelay : 125;
		jump.startDelayTime = 0;
		jump.animationTime = main.is_number( parametersMovement.jumpAnimationTime ) ? parametersMovement.jumpAnimationTime : 1000;
		jump.startAnimationTime = main.is_number( parametersMovement.jumpStartAnimationTime ) ? parametersMovement.jumpStartAnimationTime : jump.startDelay;
		jump.endAnimationTime = main.is_number( parametersMovement.jumpEndAnimationTime ) ? parametersMovement.jumpEndAnimationTime : move.morphClearTime;
		jump.ready = true;
		jump.active = false;
		jump.holding = false;
		
		// state
		state = this.movement.state = {};
		state.up = 0;
		state.down = 0;
		state.left = 0;
		state.right = 0;
		state.forward = 0;
		state.back = 0;
		state.moving = false;
		state.movingHorizontal = false;
		state.movingBack = false;
		state.moveType = '';
		
		// physics
		
		if ( typeof parametersModel.physics !== 'undefined' ) {
			
			parametersModel.physics.dynamic = true;
			parametersModel.physics.movementDamping = main.is_number( parametersModel.physics.movementDamping ) ? parametersModel.physics.movementDamping : 0.5;
			parametersModel.physics.movementForceLengthMax = main.is_number( parametersModel.physics.movementForceLengthMax ) ? parametersModel.physics.movementForceLengthMax : shared.universeGravityMagnitude.length() * 20;
			
		}
		
		// prototype constructor
		
		_Model.Instance.call( this, parametersModel );
		
		// properties
		
		this.name = parameters.name || characterName;
		this.targeting = {
			
			targets: [],
			targetsToRemove: [],
			targetCurrent: undefined
			
		};
		
		this.actions = new _Actions.Instance();
		
	}
	
	/*===================================================
	
	move
	
	=====================================================*/
	
	function move_state_change ( propertyName, stop ) {
		
		var movement = this.movement,
			state = movement.state,
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
		
		var rotate = this.movement.rotate;
		
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
		
		var rotate = this.movement.rotate,
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
		
		this.movement.jump.active = false;
		this.movement.jump.holding = false;
		
	}
	
	/*===================================================
	
	morph cycling
	
	=====================================================*/
	
	function morph_cycle ( timeDelta, cycleType, duration, loop, reverse ) {
		
		var morphs = this.morphs,
			movement = this.movement,
			move = movement.move,
			state = movement.state;
		
		if ( state.moveType !== cycleType ) {
			
			if ( move.animationChangeTimeTotal < move.animationChangeTimeThreshold ) {
				
				move.animationChangeTimeTotal += timeDelta;
				
			}
			else {
				
				move.animationChangeTimeTotal = 0;
				
				morphs.clear( state.moveType, move.morphClearTime );
				
				state.moveType = cycleType;
				
			}
			
		}
		
		morphs.play( state.moveType, { duration: duration, loop: loop, reverse: reverse } );
		
	}
	
	/*===================================================
	
	update
	
	=====================================================*/
	
	function update ( timeDelta, timeDeltaMod ) {
		
		var rigidBody = this.rigidBody,
			morphs = this.morphs,
			movement = this.movement,
			move = movement.move,
			rotate = movement.rotate,
			jump = movement.jump,
			state = movement.state,
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
			jumpTimeTotal,
			jumpTimeMax,
			jumpTimeRatio,
			jumpTimeAfterNotGroundedMax,
			jumpStartDelay,
			grounded,
			sliding,
			velocityGravity,
			velocityGravityForceDelta,
			velocityMovement,
			velocityMovementForceDelta,
			velocityMovementForceLength,
			velocityMovementDamping,
			dragCoefficient,
			terminalVelocity,
			playSpeedModifier;
		
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
			
			jumpTimeTotal = jump.timeTotal;
			jumpTimeMax = jump.timeMax;
			jumpTimeAfterNotGroundedMax = jump.timeAfterNotGroundedMax;
			jumpStartDelay = jump.startDelay;
			jumpSpeedStart = jump.speedStart * timeDeltaMod;
			jumpSpeedEnd = jump.speedEnd * timeDeltaMod;
			jumpAirControl = jump.airControl;
			jumpMoveDamping = jump.moveDamping;
			
			velocityMovement = rigidBody.velocityMovement;
			velocityMovementForce = velocityMovement.force;
			velocityMovementForceDelta = velocityMovement.forceDelta;
			velocityGravity = rigidBody.velocityGravity;
			velocityGravityForceDelta = velocityGravity.forceDelta;
			
			// jumping
			
			grounded = rigidBody.grounded;
			sliding = rigidBody.sliding;
			
			jump.timeAfterNotGrounded += timeDelta;
			
			// if falling but not jumping
			
			if ( jump.active === false && jump.timeAfterNotGrounded >= jumpTimeAfterNotGroundedMax && grounded === false ) {
				
				jump.ready = false;
				
				this.morph_cycle( timeDelta, 'jump', jump.animationTime, true );
				
			}
			// do jump
			else if ( state.up !== 0 && ( ( grounded === true && sliding === false ) || jump.timeAfterNotGrounded < jumpTimeAfterNotGroundedMax ) && jump.ready === true ) {
				
				jump.timeTotal = 0;
				
				jump.startDelayTime = 0;
				
				jump.ready = false;
				
				jump.active = true;
				
				jump.starting = true;
				
				jump.holding = true;
				
			}
			else if ( jump.holding === true && jump.active === true && jump.timeTotal < jumpTimeMax ) {
				
				// count delay
				
				jump.startDelayTime += timeDelta;
				
				if ( state.up === 0 && jump.timeTotal >= jump.timeMin ) {
					
					jump.holding = false;
					
				}
				
				// do jump after delay
				
				if ( jump.startDelayTime >= jump.startDelay ) {
					
					// if start delay just finished
					
					if ( jump.starting === true ) {
						
						jump.starting = false;
					
						// reset velocity
						
						velocityGravity.reset();
						
						jump.movementChangeLayer = _ObjectHelper.temporary_change( velocityMovement, {
							damping: new THREE.Vector3(  jumpMoveDamping, jumpMoveDamping, jumpMoveDamping ),
							speedDelta: new THREE.Vector3(  jumpAirControl, jumpAirControl, jumpAirControl )
						} );
						
					}
					
					// play jump
					
					this.morph_cycle ( timeDelta, 'jump', jump.animationTime, true );
					
					// properties
					
					jumpTimeRatio = jumpTimeTotal / jumpTimeMax;
					
					// update time total
					
					jump.timeTotal += timeDelta;
					
					// add speed to gravity velocity delta
					
					velocityGravityForceDelta.y += jumpSpeedStart * ( 1 - jumpTimeRatio) + jumpSpeedEnd * jumpTimeRatio;
					
				}
				else {
					
					// play jump start
					
					morphs.play( 'jump_start', { duration: jump.startAnimationTime, loop: false, callback: function () { morphs.clear( 'jump_start' ); } } );
					
				}
				
			}
			else {
				
				if ( grounded === true && jump.active !== false ) {
					
					_ObjectHelper.revert_change( velocityMovement, jump.movementChangeLayer );
					
					this.stop_jumping();
					
					if ( jump.timeAfterNotGrounded >= jumpTimeAfterNotGroundedMax ) {
						
						morphs.clear( 'jump', move.morphClearTime );
					
						morphs.play( 'jump_end', { duration: jump.endAnimationTime, loop: false, callback: function () { morphs.clear( 'jump_end', move.morphClearTime ); } } );
					
					}
					
				}
				
				if ( grounded === true && sliding === false && state.up === 0 ) {
					
					jump.timeAfterNotGrounded = 0;
					
					jump.ready = true;
					
				}
				
			}
			
			// movement
			
			velocityMovementForceDelta.copy( moveDir );
			
			if ( state.movingHorizontal && jump.active === true ) {
				
				velocityMovementForceDelta.z += jumpSpeedStart * jump.moveSpeedMod;
				
			}
			
			velocityMovementForceDelta.multiplyScalar( moveSpeed );
			
			// moving backwards?
			
			if ( velocityMovementForceDelta.z < 0 ) {
				
				state.movingBack = true;
				
			}
			else if ( velocityMovementForceDelta.z > 0 ) {
				
				state.movingBack = false;
				
			}
			
			// get movement force
			
			velocityMovementForceLength = velocityMovement.force.length() / timeDeltaMod;
			
			// walk/run/idle
			
			if ( jump.active === false && grounded === true ) {
				
				// walk / run cycles
				
				if ( velocityMovementForceLength > 0 || sliding === true ) {
					
					// get approximate terminal velocity based on acceleration (moveVec) and damping
					// helps morphs play faster if character is moving faster, or slower if moving slower
					// TODO: move equation into physics module
					
					velocityMovementDamping = velocityMovement.damping.z;
					dragCoefficient = ( 0.33758 * Math.pow( velocityMovementDamping, 2 ) ) + ( -0.67116 * velocityMovementDamping ) + 0.33419;
					
					terminalVelocity = Math.round( Math.sqrt( ( 2 * Math.abs( velocityMovement.force.z * 0.5 ) ) / dragCoefficient ) ) * 0.5;
					playSpeedModifier = terminalVelocity / Math.round( velocityMovementForceLength );
					
					if ( main.is_number( playSpeedModifier ) !== true ) {
						
						playSpeedModifier = 1;
						
					}
					
					if ( velocityMovementForceLength >= move.runThreshold ) {
						
						this.morph_cycle ( timeDelta, 'run', move.runAnimationTime * playSpeedModifier, true, state.movingBack );
						
					}
					else {
						
						this.morph_cycle ( timeDelta, 'walk', move.walkAnimationTime * playSpeedModifier, true, state.movingBack );
						
					}
					
				}
				// idle cycle
				else {
					
					this.morph_cycle ( timeDelta, 'idle', move.idleAnimationTime, true, false );
					
				}
				
			}
			
		}
		
	}
	
} ( KAIOPUA ) );