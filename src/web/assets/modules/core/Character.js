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
		characterIDBase = 'kaiopua_character';
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	character.instantiate = instantiate;
	
	character = main.asset_register( assetPath, character, true );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	main.assets_require( [
		"assets/modules/core/Model",
		"assets/modules/characters/EmptyCharacter"
	], init_internal, true );
	
	function init_internal ( m, ec ) {
		console.log('internal character');
		model = m;
		emptyCharacter = ec;
		
		main.asset_ready( assetPath );
		
	}
	
	/*===================================================
    
    character
    
    =====================================================*/
	
	function instantiate ( parameters, instance ) {
		
		var movementInfo;
		
		instance = instance || {};
		
		// handle parameters
		
		parameters = parameters || {};
		
		// type
		
		instance.type = parameters.type || emptyCharacter;
		
		// model
		
		if ( parameters.hasOwnProperty( 'model' ) ) {
			
			instance.model = parameters.model;
			
		}
		else {
			
			parameters.modelInfo = parameters.modelInfo || instance.type.modelInfo || {};
			
			// physics
			
			parameters.modelInfo.physicsParameters = parameters.modelInfo.physicsParameters || instance.type.physicsParameters;
			
			if ( typeof parameters.modelInfo.physicsParameters !== 'undefined' ) {
				
				parameters.modelInfo.physicsParameters.dynamic = true;
				parameters.modelInfo.physicsParameters.movementDamping = parameters.modelInfo.physicsParameters.movementDamping || 0.5;
				
			}
			
			instance.model = model.instantiate( parameters.modelInfo ) ;
			
		}
		
		// give model reference back to parent character
		
		instance.model.character = instance;
		
		// movement
		
		movementInfo = parameters.movementInfo || instance.type.movementInfo || {};
		
		instance.movement = {
			move: {
				speed: movementInfo.moveSpeed || 6,
				direction: new THREE.Vector3(),
				vector: new THREE.Vector3()
			},
			rotate: {
				speed: movementInfo.rotateSpeed || 0.015,
				direction: new THREE.Vector3(),
				delta: new THREE.Quaternion(),
				vector: new THREE.Quaternion(),
				utilQ1: new THREE.Quaternion()
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
		
		instance.id = parameters.id || instance.type.id || characterIDBase;
		
		instance.targeting = {
			
			targets: [],
			targetsToRemove: [],
			targetCurrent: undefined
			
		};
		
		instance.actionData = {};
		
		// functions
		
		instance.action = function ( actionName, parameters ) {
			
			var charType = instance.type;
			
			// if character type has action
			
			if ( charType.hasOwnProperty( actionName ) ) {
				
				// handle parameters
				
				parameters = parameters || {};
				
				parameters.character = instance;
				
				// pass parameters to character type's action
				
				charType[ actionName ]( parameters );
				
			}
			
		};
		
		instance.update = function ( timeDelta ) {
			
			var model = instance.model,
				mesh = model.mesh,
				physics = model.physics,
				rigidBody = physics.rigidBody,
				meshQ = mesh.quaternion,
				movement = instance.movement,
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
			
			instance.rotate_by_delta( rotateDir.x * rotateSpeed, rotateDir.y * rotateSpeed, rotateDir.z * rotateSpeed, 1 );
			
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
		
		instance.rotate_by_delta = function ( dx, dy, dz, dw ) {
			
			var model = instance.model,
				mesh = model.mesh,
				meshQ = mesh.quaternion,
				movement = instance.movement,
				rotate = movement.rotate,
				rotateDelta = rotate.delta,
				rotateVec = rotate.vector,
				rotateUtilQ1 = rotate.utilQ1;
			
			rotateDelta.set( dx || 0, dy || 0, dz || 0, dw || 1 ).normalize();
			
			rotateVec.multiplySelf( rotateDelta );
			
			rotateUtilQ1.multiply( meshQ, rotateDelta );
			
			meshQ.copy( rotateUtilQ1 );
			
		};
		
		return instance;
		
	}
	
	return main;
	
}(KAIOPUA || {}));