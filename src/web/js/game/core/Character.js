/*
Character.js
Character module, handles generating characters in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		character = core.character = core.character || {},
		characters = game.characters = game.characters || {}, 
		characterIDBase = 'kaiopua_character';
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	character.make_character = make_character;
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
	function make_character ( parameters ) {
		
		var c = {},
			objectmaker,
			physics;
		
		// setup
		
		objectmaker = game.workers.objectmaker;
		physics = core.physics;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// type
		
		c.type = parameters.type || characters.emptycharacter;
		
		// properties
		
		c.id = parameters.id || c.type.id || characterIDBase;
		
		// model
		
		if ( parameters.hasOwnProperty( 'model' ) ) {
			
			c.model = parameters.model;
			
		}
		else {
			
			parameters.modelInfo = parameters.modelInfo || c.type.modelInfo;
			console.log(parameters.modelInfo);
			c.model = objectmaker.make_model( parameters.modelInfo ) ;
			
		}
		
		// movement
		
		c.movement = {
			move: {
				speed: parameters.moveSpeed || 2,
				direction: new THREE.Vector3(),
				vector: new THREE.Vector3()
			},
			rotate: {
				speed: parameters.rotateSpeed || 0.01,
				direction: new THREE.Vector3(),
				vector: new THREE.Quaternion(),
				utilQ1: new THREE.Quaternion()
			},
			jump: {
				speedStart: parameters.jumpSpeedStart || 6,
				speedEnd: parameters.jumpSpeedEnd || 0,
				timeTotal: 0,
				timeMax: parameters.jumpTimeMax || 250,
				timeAfterNotGrounded: 0,
				timeAfterNotGroundedMax: parameters.jumpTimeAfterNotGroundedMax || 125,
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
				grounded: false
			}
		};
		
		// physics
		
		if ( parameters.hasOwnProperty( 'rigidBody' ) ) {
			
			c.model.rigidBody = parameters.rigidBody;
			
		}
		else {
			
			parameters.rigidBodyInfo = parameters.rigidBodyInfo || c.type.rigidBodyInfo;
			
			if ( typeof parameters.rigidBodyInfo !== 'undefined' ) {
				
				parameters.rigidBodyInfo.movable = true;
				parameters.rigidBodyInfo.movementDamping = parameters.rigidBodyInfo.movementDamping || 0.85;
				parameters.rigidBodyInfo.gravityDamping = parameters.rigidBodyInfo.gravityDamping || 0.95;
				
				c.model.rigidBody = physics.translate( c.model.mesh, parameters.rigidBodyInfo );
				
			}
			
		}
		
		// functions
		
		c.update = function ( timeDelta ) {
			
			var model = c.model,
				mesh = model.mesh,
				rigidBody = model.rigidBody,
				meshQ = mesh.quaternion,
				movement = c.movement,
				state,
				rotate = movement.rotate,
				rotateDir = rotate.direction,
				rotateVec = rotate.vector,
				rotateSpeed = rotate.speed,
				rotateUtilQ1 = rotate.utilQ1,
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
			
			rotateVec.set( rotateDir.x * rotateSpeed, rotateDir.y * rotateSpeed, rotateDir.z * rotateSpeed, 1 ).normalize();
			
			rotateUtilQ1.multiply( meshQ, rotateVec );
			
			meshQ.copy( rotateUtilQ1 );
			
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
		
		return c;
		
	}
	
	return main;
	
}(KAIOPUA || {}));