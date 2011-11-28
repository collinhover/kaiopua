/*
Hero.js
Hero character module, for use with character module.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		characters = game.characters = game.characters || {},
		hero = characters.hero = characters.hero || {};
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	hero.ability_001_start = select_and_scale_start;
	hero.ability_001_end = select_and_scale_end;
	
	Object.defineProperty( hero, 'id', { 
		get : get_id
	});
	
	Object.defineProperty( hero, 'modelInfo', { 
		get : get_model_info
	});
	
	Object.defineProperty( hero, 'movementInfo', { 
		get : get_movement_info
	});
	
	Object.defineProperty( hero, 'rigidBodyInfo', { 
		get : get_rigid_body_info
	});
	
	/*===================================================
    
    properties
    
    =====================================================*/
	
	function get_id () {
		
		return 'kaiopua_hero';
		
	}
	
	function get_model_info () {
		
		return {
			
			geometryAssetPath: "assets/models/Hero.js",
			materials: new THREE.MeshLambertMaterial( { ambient: 0x999999, color: 0xffeeee, shading: THREE.SmoothShading }  ),//new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading,
			castShadow: true,
			receiveShadow: true
			
		};
		
	}
	
	function get_movement_info () {
		
		return {
			
			moveSpeed: 6,
			rotateSpeed: 0.015,
			jumpSpeedStart: 6,
			jumpSpeedEnd: 0,
			jumpTimeMax: 100
			
		};
		
	}
		
	function get_rigid_body_info () {
		
		return {
			
			bodyType: 'box',
			width: 40,
			height: 100,
			depth: 40,
			movementDamping: 0.5
			
		};
		
	}
	
	/*===================================================
    
    abilities
    
    =====================================================*/
	
	function select_and_scale_start ( parameters ) {
		
		var i, l,
			targetsNum,
			targetsNumMax = 1,
			character = parameters.character,
			targeting = character.targeting,
			targets = targeting.targets,
			target,
			actionData = character.actionData,
			adObj;
		
		// select
		
		parameters.targetsNumMax = targetsNumMax;
		
		targetsNum = game.core.player.select_from_mouse_position( parameters );
		
		// start scale updating, if not already
		
		if ( targetsNum > 0 && typeof actionData.select_and_scale === 'undefined' ) {
			
			console.log('scale start');
			
			// create action data object for select and scale
			
			adObj = actionData.select_and_scale = {
				
				update: function ( e ) {
					
					var mouseOriginal = parameters.mouse;
					var mouseNew = shared.mice[ e.identifier ];
					
					// check mouse given by identifier vs mouse used originally
					
					if ( mouseNew === mouseOriginal ) {
					
						scale_update( parameters );
						
					}
					
				}
				
			};
			
			// create scale record for each target
			// use model id as reference
			
			adObj.scaleRecords = {};
			
			for ( i = 0, l = targets.length; i < l; i += 1 ) {
				
				target = targets[ i ];
				
				adObj.scaleRecords[ target.id ] = target.mesh.scale.clone();
				
			}
			
			// signals
			
			shared.signals.mousemoved.add( adObj.update );
			
		}
	
	}
	
	function select_and_scale_end ( parameters ) {
		
		var mouse = parameters.mouse,
			character = parameters.character,
			actionData = character.actionData,
			adObj;
		
		if ( typeof actionData.select_and_scale !== 'undefined' ) {
			
			console.log('scale end');
			
			adObj = actionData.select_and_scale;
			
			// signals
				
			shared.signals.mousemoved.remove( adObj.update );
			
			// clear action data object
			
			delete actionData.select_and_scale;
		
			// trigger deselect
			
			game.core.player.deselect( parameters );
			
		}
		
	}
	
	function scale_update ( parameters ) {
		
		var i, l,
			mouse = parameters.mouse,
			character = parameters.character,
			actionData = character.actionData,
			adObj,
			targeting = character.targeting,
			targets = targeting.targets,
			targetsToRemove = targeting.targetsToRemove,
			target,
			removeIndex,
			scaleRecords,
			scaleRecord,
			scaleDelta,
			mouseDeltaX,
			mouseDeltaY,
			mouseDelta,
			mouseDeltaDivisorY = shared.screenHeight * 0.1;
		
		if ( typeof actionData.select_and_scale !== 'undefined' ) {
			
			console.log('  scale update, num targets: ' + targets.length);
			
			adObj = actionData.select_and_scale;
			
			scaleRecords = adObj.scaleRecords;
			
			// mouse change
			
			mouseDeltaX = mouse.x - mouse.lx;
			mouseDeltaY = -( mouse.y - mouse.ly );
			mouseDelta = ( mouseDeltaX + mouseDeltaY ) * 0.5;
			
			// scale change
			
			scaleDelta = mouseDelta / mouseDeltaDivisorY;
			
			// for all targets
			for ( i = 0, l = targets.length; i < l; i += 1 ) {
				
				target = targets[ i ];
				
				scaleRecord = scaleRecords[ target.id ];
				
				// if on objects to remove list
				// take out of list
				
				if ( targetsToRemove.length > 0 ) {
					
					removeIndex = targetsToRemove.indexOf( target );
					
					if ( removeIndex !== -1 ) {
						
						targetsToRemove.splice( removeIndex, 1 );
						
					}
					
				}
				
				// scale target
				
				scale_target( target, scaleRecord, scaleDelta );
				
			}
			
		}
		
	}
	
	function scale_target ( target, scaleRecord, scaleDelta ) {
		
		var scaleX, scaleY, scaleZ,
			scaleOrigin = 1,
			scaleMax = 10,
			scaleMin = 0.5,
			scaleSnapOriginPct = 0.1,
			scaleSnapOriginAboveDist = (scaleMax - scaleOrigin) * scaleSnapOriginPct,
			scaleSnapOriginBelowDist = (scaleOrigin - scaleMin) * scaleSnapOriginPct;
		
		// scale based on mouse position change
		
		scaleX = scaleRecord.x = Math.max( scaleMin, Math.min( scaleMax, scaleRecord.x + scaleDelta ) );
		scaleY = scaleRecord.y = Math.max( scaleMin, Math.min( scaleMax, scaleRecord.y + scaleDelta ) );
		scaleZ = scaleRecord.z = Math.max( scaleMin, Math.min( scaleMax, scaleRecord.z + scaleDelta ) );
		
		// snap to origin
		
		if ( scaleOrigin - scaleSnapOriginBelowDist < scaleX && scaleX < scaleOrigin + scaleSnapOriginAboveDist ) {
			
			scaleX = scaleOrigin;
			
		}
		
		if ( scaleOrigin - scaleSnapOriginBelowDist < scaleY && scaleY < scaleOrigin + scaleSnapOriginAboveDist ) {
			
			scaleY = scaleOrigin;
			
		}
		
		if ( scaleOrigin - scaleSnapOriginBelowDist < scaleZ && scaleZ < scaleOrigin + scaleSnapOriginAboveDist ) {
			
			scaleZ = scaleOrigin;
			
		}
		
		// set new scale
		
		target.mesh.scale.set( scaleX, scaleY, scaleZ );
		
	}
	
	return main;
	
}(KAIOPUA || {}));