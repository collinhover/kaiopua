/*
Character.js
Character module, handles generating characters in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Character.js",
		character = {},
		model,
		emptyCharacter, 
		characterIDBase = 'kaiopua_character',
		utilQ1Rotate;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: character,
		requirements: [
			"assets/modules/core/Model.js",
			"assets/modules/characters/EmptyCharacter.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, ec ) {
		console.log('internal character');
		// modules
		
		model = m;
		emptyCharacter = ec;
		
		// utils
		
		utilQ1Rotate = new THREE.Quaternion();
		
		// character instance
		console.log(character);
		console.log(model);
		character.Instance = KaiopuaCharacter;
		character.Instance.prototype = new model.Instance();
		character.Instance.prototype.constructor = character.Instance;
		character.Instance.prototype.action = action;
		character.Instance.prototype.update = update;
		character.Instance.prototype.rotate_by_delta = rotate_by_delta;
		
	}
	
	/*===================================================
    
    character
    
    =====================================================*/
	
	// adds functionality to and inherits from Model
	
	function KaiopuaCharacter ( parameters ) {
		
		var modelInfo,
			movementInfo,
			move,
			rotate,
			jump,
			state;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// type
		
		this.type = parameters.type || emptyCharacter;
		
		// model
		
		modelInfo = parameters.modelInfo || this.type.modelInfo || {};
		
		// physics
		
		modelInfo.physicsParameters = modelInfo.physicsParameters || this.type.physicsParameters;
		
		if ( typeof modelInfo.physicsParameters !== 'undefined' ) {
			
			modelInfo.physicsParameters.dynamic = true;
			modelInfo.physicsParameters.movementDamping = modelInfo.physicsParameters.movementDamping || 0.5;
			
		}
		
		// prototype constructor
		
		model.Instance.call( this, modelInfo );
		
		// movement
		
		movementInfo = parameters.movementInfo || this.type.movementInfo || {};
		
		this.movement = {};
		
		// move
		
		move = this.movement.move = {};
		move.speed = movementInfo.moveSpeed || 6;
		move.speedBack = movementInfo.moveSpeedBack || move.speed;
		move.runThreshold = movementInfo.moveRunThreshold || 0;
		move.walkAnimationTime = movementInfo.moveWalkAnimationTime || 750;
		move.runAnimationTime = movementInfo.moveRunAnimationTime || 500;
		move.morphClearTime = movementInfo.moveCycleClearTime || 125;
		move.animationChangeTimeThreshold = movementInfo.animationChangeTimeThreshold || 0;
		move.animationChangeTimeTotal = move.animationChangeTimeThreshold;
		move.direction = new THREE.Vector3();
		move.vector = new THREE.Vector3();
		
		// rotate
		rotate = this.movement.rotate = {};
		rotate.speed = movementInfo.rotateSpeed || 0.015;
		rotate.direction = new THREE.Vector3();
		rotate.delta = new THREE.Quaternion();
		rotate.vector = new THREE.Quaternion();
		
		// jump
		jump = this.movement.jump = {};
		jump.speedStart = movementInfo.jumpSpeedStart || 6;
		jump.speedEnd = movementInfo.jumpSpeedEnd || 0;
		jump.timeTotal = 0;
		jump.timeMax = movementInfo.jumpTimeMax || 50;
		jump.timeAfterNotGrounded = 0;
		jump.timeAfterNotGroundedMax = 125;
		jump.startDelay = movementInfo.jumpStartDelay || 125;
		jump.startDelayTime = 0;
		jump.animationTime = movementInfo.jumpAnimationTime || 700;
		jump.ready = true;
		jump.active = false;
		
		// state
		state = this.movement.state = {};
		state.up = 0;
		state.down = 0;
		state.left = 0;
		state.right = 0;
		state.forward = 0;
		state.back = 0;
		state.turnLeft = 0;
		state.turnRight = 0;
		state.grounded = false;
		state.groundedLast = false;
		state.moving = false;
		state.movingBack = false;
		state.moveType = '';
		
		// properties
		
		this.id = parameters.id || this.type.id || this.id || characterIDBase;
		
		this.targeting = {
			
			targets: [],
			targetsToRemove: [],
			targetCurrent: undefined
			
		};
		
		this.actionData = {};
		
	}
	
	function action ( actionName, parameters ) {
		
		// if character type has action
		
		if ( this.type.hasOwnProperty( actionName ) ) {
			
			// handle parameters
			
			parameters = parameters || {};
			
			parameters.character = this;
			
			// pass parameters to character type's action
			
			this.type[ actionName ]( parameters );
			
		}
		
	};
	
	function update ( timeDelta ) {
		
		var physics = this.physics,
			rigidBody = physics.rigidBody,
			morphs = this.morphs,
			movement = this.movement,
			state,
			rotate = movement.rotate,
			rotateDir = rotate.direction,
			rotateDelta = rotate.delta,
			rotateSpeed = rotate.speed,
			move,
			moveDir,
			moveVec,
			moveSpeed,
			moveSpeedBack,
			moveRunThreshold,
			jump,
			jumpSpeedStart,
			jumpSpeedEnd,
			jumpTimeTotal,
			jumpTimeMax,
			jumpTimeRatio,
			jumpTimeAfterNotGroundedMax,
			jumpStartDelay,
			jumpAnimationTime,
			velocityGravity,
			velocityGravityForce,
			velocityMovement,
			velocityMovementForce,
			velocityMovementForceLength,
			velocityMovementDamping,
			dragCoefficient,
			terminalVelocity,
			playSpeedModifier;
		
		// rotate self
		
		this.rotate_by_delta( rotateDir.x * rotateSpeed, rotateDir.y * rotateSpeed, rotateDir.z * rotateSpeed, 1 );
		
		// velocity
		
		if ( typeof rigidBody !== 'undefined' ) {
			
			// properties
			
			move = movement.move;
			moveDir = move.direction;
			moveVec = move.vector;
			moveSpeed = move.speed;
			moveSpeedBack = move.speedBack;
			moveRunThreshold = move.runThreshold;
			
			state = movement.state;
			
			jump = movement.jump;
			jumpTimeTotal = jump.timeTotal;
			jumpTimeMax = jump.timeMax;
			jumpTimeAfterNotGroundedMax = jump.timeAfterNotGroundedMax;
			jumpStartDelay = jump.startDelay;
			jumpAnimationTime = jump.animationTime;
			
			velocityMovement = rigidBody.velocityMovement;
			velocityMovementForce = velocityMovement.force;
			velocityGravity = rigidBody.velocityGravity;
			velocityGravityForce = velocityGravity.force;
			
			// handle time
			
			timeDelta = timeDelta || shared.refreshInterval;
			
			// handle jumping
			
			state.groundedLast = state.grounded;
			
			state.grounded = !velocityGravity.moving;
			
			jump.timeAfterNotGrounded += timeDelta;
			
			// do jump
				
			if ( state.up !== 0 && ( state.grounded === true || jump.timeAfterNotGrounded < jumpTimeAfterNotGroundedMax ) && jump.ready === true ) {
				
				jump.timeTotal = 0;
				
				jump.startDelayTime = 0;
				
				jump.ready = false;
				
			}
			else if ( jump.ready === false && jump.timeTotal < jumpTimeMax ) {
				
				jump.active = true;
				
				// play jump
				
				morphCycle ( timeDelta, morphs, move, state, 'jump', jumpAnimationTime, false );
				
				// count delay
				
				jump.startDelayTime += timeDelta;
				
				// do jump after delay
				
				if ( jump.startDelayTime >= jump.startDelay ) {
					
					// properties
					
					jumpTimeRatio = jumpTimeTotal / jumpTimeMax;
					jumpSpeedStart = jump.speedStart;
					jumpSpeedEnd = jump.speedEnd;
					
					// update time total
					
					jump.timeTotal += timeDelta;
					
					// add speed to gravity velocity
					
					velocityGravityForce.y += jumpSpeedStart * ( 1 - jumpTimeRatio) + jumpSpeedEnd * jumpTimeRatio;
					
				}
				
			}
			else {
				
				if ( state.grounded === true && state.groundedLast !== state.grounded ) {
					
					jump.active = false;
					
					morphs.clear( 'jump', move.morphClearTime );
					
				}
				
				if ( state.grounded === true && state.up === 0 ) {
					
					jump.timeAfterNotGrounded = 0;
					
					jump.ready = true;
					
				}
				
			}
			
			// add move vec to rigidBody movement
			
			moveVec.copy( moveDir );
			moveVec.x *= moveSpeed;
			moveVec.y *= moveSpeed;
			if ( moveDir.z < 0 ) {
				
				moveVec.z *= moveSpeedBack;
				
			}
			else {
				
				moveVec.z *= moveSpeed;
				
			}
			
			velocityMovementForce.addSelf( moveVec );
			
			// moving backwards?
			
			if ( velocityMovementForce.z < 0 ) {
				
				state.movingBack = true;
				
			}
			else if ( velocityMovementForce.z > 0 ) {
				
				state.movingBack = false;
				
			}
			
			// get movement force
			
			velocityMovementForceLength = velocityMovementForce.length();
			
			// walk/run/idle
			
			if ( jump.ready === true || ( state.grounded === true && jump.active === false ) ) {
				
				// walk / run cycles
				
				if ( velocityMovementForceLength > 0 ) {
					
					// get approximate terminal velocity based on acceleration (moveVec) and damping
					// helps morphs play faster if character is moving faster, or slower if moving slower
					// TODO: move equation into physics module
					
					velocityMovementDamping = velocityMovement.damping.z;
					dragCoefficient = ( 0.33758 * Math.pow( velocityMovementDamping, 2 ) ) + ( -0.67116 * velocityMovementDamping ) + 0.33419;
					terminalVelocity = Math.round( Math.sqrt( ( 2 * Math.abs( moveVec.z * 0.5 ) ) / dragCoefficient ) );
					playSpeedModifier = terminalVelocity / Math.round( velocityMovementForceLength );
					
					if ( velocityMovementForceLength > moveRunThreshold ) {
						
						morphCycle ( timeDelta, morphs, move, state, 'run', move.runAnimationTime * playSpeedModifier, true, state.movingBack );
						
					}
					else {
						
						morphCycle ( timeDelta, morphs, move, state, 'walk', move.walkAnimationTime * playSpeedModifier, true, state.movingBack );
						
					}
					
				}
				// idle cycle
				else {
					
					morphCycle ( timeDelta, morphs, move, state, 'idle', 3000, true, false );
					
				}
				
			}
			
		}
		
	};
	
	function morphCycle ( timeDelta, morphs, moveInfo, stateInfo, cycleType, duration, loop, reverse ) {
			
		if ( stateInfo.moveType !== cycleType ) {
			
			if ( moveInfo.animationChangeTimeTotal < moveInfo.animationChangeTimeThreshold ) {
				
				moveInfo.animationChangeTimeTotal += timeDelta;
				
			}
			else {
				
				moveInfo.animationChangeTimeTotal = 0;
				
				morphs.clear( stateInfo.moveType, moveInfo.morphClearTime );
				
				stateInfo.moveType = cycleType;
				
			}
			
		}
		
		morphs.play( stateInfo.moveType, { duration: duration, loop: loop, reverse: reverse } );
		
	}
	
	function rotate_by_delta ( dx, dy, dz, dw ) {
		
		var q = this.quaternion,
			movement = this.movement,
			rotate = movement.rotate,
			rotateDelta = rotate.delta,
			rotateVec = rotate.vector,
			rotateUtilQ1 = utilQ1Rotate;
		
		rotateDelta.set( dx || 0, dy || 0, dz || 0, dw || 1 ).normalize();
		
		rotateVec.multiplySelf( rotateDelta );
		
		rotateUtilQ1.multiply( q, rotateDelta );
		
		q.copy( rotateUtilQ1 );
		
	};
	
	return main;
	
} ( KAIOPUA ) );