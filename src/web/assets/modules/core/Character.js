/*
Character.js
Character module, handles generating characters in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Character",
		character = {},
		model,
		emptyCharacter, 
		characterIDBase = 'kaiopua_character',
		utilQ1Rotate;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	character = main.asset_register( assetPath, character, true );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	main.asset_require( [
		"assets/modules/core/Model",
		"assets/modules/characters/EmptyCharacter"
	], init_internal, true );
	
	function init_internal ( m, ec ) {
		console.log('internal character');
		// modules
		
		model = m;
		emptyCharacter = ec;
		
		// utils
		
		utilQ1Rotate = new THREE.Quaternion();
		
		// character instance
		
		character.Instance = KaiopuaCharacter;
		character.Instance.prototype = new model.Instance();
		character.Instance.prototype.constructor = character.Instance;
		character.Instance.prototype.action = action;
		character.Instance.prototype.update = update;
		character.Instance.prototype.rotate_by_delta = rotate_by_delta;
		
		// ready
		
		main.asset_ready( assetPath );
		
	}
	
	/*===================================================
    
    character
    
    =====================================================*/
	
	// adds functionality to and inherits from Model
	
	function KaiopuaCharacter ( parameters ) {
		
		var modelInfo,
			movementInfo;
		
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
		
		this.movement = {
			move: {
				speed: movementInfo.moveSpeed || 6,
				direction: new THREE.Vector3(),
				vector: new THREE.Vector3()
			},
			rotate: {
				speed: movementInfo.rotateSpeed || 0.015,
				direction: new THREE.Vector3(),
				delta: new THREE.Quaternion(),
				vector: new THREE.Quaternion()
			},
			jump: {
				speedStart: movementInfo.jumpSpeedStart || 6,
				speedEnd: movementInfo.jumpSpeedEnd || 0,
				timeTotal: 0,
				timeMax: movementInfo.jumpTimeMax || 50,
				timeAfterNotGrounded: 0,
				timeAfterNotGroundedMax: 125,
				ready: false,
				stopped: false
			},
			state: {
				up: 0,				
				down: 0, 
				left: 0, 
				right: 0, 
				forward: 0, 
				back: 0, 
				turnLeft: 0, 
				turnRight: 0,
				grounded: false,
				moving: false
			}
		};
		
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
			jump,
			jumpSpeedStart,
			jumpSpeedEnd,
			jumpTimeTotal,
			jumpTimeMax,
			jumpTimeRatio,
			jumpTimeAfterNotGroundedMax,
			velocityMovement,
			velocityMovementForce,
			velocityGravity,
			velocityGravityForce;
		
		// rotate self
		
		this.rotate_by_delta( rotateDir.x * rotateSpeed, rotateDir.y * rotateSpeed, rotateDir.z * rotateSpeed, 1 );
		
		// velocity
		
		if ( typeof rigidBody !== 'undefined' ) {
			
			// properties
			
			move = movement.move;
			moveDir = move.direction;
			moveVec = move.vector;
			moveSpeed = move.speed;
			
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
			
			moveVec.copy( moveDir ).multiplyScalar( moveSpeed );
			
			velocityMovementForce.addSelf( moveVec );
			
		}
		
	};
	
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