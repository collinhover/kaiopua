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
		move.walkCycleTime = movementInfo.moveWalkCycleTime || 750;
		move.runCycleTime = movementInfo.moveRunCycleTime || 500;
		move.morphClearTime = movementInfo.moveCycleClearTime || 125;
		move.walkRunChangeTimeThreshold = movementInfo.moveWalkRunChangeTimeThreshold || 0;
		move.walkRunChangeTimeTotal = move.walkRunChangeTimeThreshold;
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
		jump.ready = false;
		jump.stopped = false;
		
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
		state.moving = false;
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
			movingBack = false,
			jump,
			jumpSpeedStart,
			jumpSpeedEnd,
			jumpTimeTotal,
			jumpTimeMax,
			jumpTimeRatio,
			jumpTimeAfterNotGroundedMax,
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
			
			velocityMovement = rigidBody.velocityMovement;
			velocityMovementForce = velocityMovement.force;
			velocityGravity = rigidBody.velocityGravity;
			velocityGravityForce = velocityGravity.force;
			
			// handle time
			
			timeDelta = timeDelta || shared.refreshInterval;
			
			// handle jumping
			
			state.grounded = !velocityGravity.moving;
			
			jump.timeAfterNotGrounded += timeDelta;
			
			if ( state.up !== 0 && jump.stopped === false ) {
				
				if ( ( state.grounded === true || jump.timeAfterNotGrounded < jumpTimeAfterNotGroundedMax ) && jump.ready === true ) {
					
					jump.timeTotal = 0;
					
					jump.ready = false;
					
				}
				else if ( jump.ready === false && jump.timeTotal < jumpTimeMax ) {
					
					// properties
					
					jumpTimeRatio = jumpTimeTotal / jumpTimeMax;
					jumpSpeedStart = jump.speedStart;
					jumpSpeedEnd = jump.speedEnd;
					
					// add speed to gravity velocity
					
					velocityGravityForce.y += jumpSpeedStart * ( 1 - jumpTimeRatio) + jumpSpeedEnd * jumpTimeRatio;
					
					// update time total
					
					jump.timeTotal += timeDelta;
					
				}
			
			}
			else if ( state.grounded === true ) {
				
				jump.timeAfterNotGrounded = 0;
				
				if ( state.up === 0 ) {
					
					jump.stopped = false;
					
					jump.ready = true;
					
				}
				
			}
			
			// add move vec to rigidBody movement
			
			moveVec.copy( moveDir );
			moveVec.x *= moveSpeed;
			moveVec.y *= moveSpeed;
			if ( moveVec.z < 0 || state.back !== 0 ) {
				
				movingBack = true;
				
				moveVec.z *= moveSpeedBack;
				
			}
			else {
				
				moveVec.z *= moveSpeed;
				
			}
			
			velocityMovementForce.addSelf( moveVec );
			
			// walk/run based on speed and jump status
			
			velocityMovementForceLength = velocityMovementForce.length();
			
			if ( jump.ready === true && velocityMovementForceLength > 0 ) {
				
				// get approximate terminal velocity based on acceleration (moveVec) and damping
				// helps morphs play faster if character is moving faster, or slower if moving slower
				// TODO: move equation into physics module
				
				velocityMovementDamping = velocityMovement.damping.z;
				dragCoefficient = ( 0.33758 * Math.pow( velocityMovementDamping, 2 ) ) + ( -0.67116 * velocityMovementDamping ) + 0.33419;
				terminalVelocity = Math.round( Math.sqrt( ( 2 * Math.abs( moveVec.z * 0.5 ) ) / dragCoefficient ) );
				playSpeedModifier = terminalVelocity / Math.round( velocityMovementForceLength );
				
				if ( velocityMovementForceLength > moveRunThreshold ) {
					
					morphCycle ( timeDelta, morphs, move, state, 'run', move.runCycleTime * playSpeedModifier, movingBack );
					
				}
				else {
					
					morphCycle ( timeDelta, morphs, move, state, 'walk', move.walkCycleTime * playSpeedModifier, movingBack );
					
				}
				
			}
			// clear walk/run
			else {
				
				move.walkRunChangeTimeTotal = move.walkRunChangeTimeThreshold;
				
				morphs.clear( state.moveType, move.morphClearTime );
				
				state.moveType = '';
				
			}
			
		}
		
	};
	
	function morphCycle ( timeDelta, morphs, moveInfo, stateInfo, cycleType, duration, reverse ) {
			
		if ( stateInfo.moveType !== cycleType ) {
			
			if ( moveInfo.walkRunChangeTimeTotal < moveInfo.walkRunChangeTimeThreshold ) {
				
				moveInfo.walkRunChangeTimeTotal += timeDelta;
				
			}
			else {
				
				moveInfo.walkRunChangeTimeTotal = 0;
				
				morphs.clear( stateInfo.moveType, moveInfo.morphClearTime );
				
				stateInfo.moveType = cycleType;
				
			}
			
		}
		
		morphs.play( stateInfo.moveType, { duration: duration, loop: true, reverse: reverse } );
		
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