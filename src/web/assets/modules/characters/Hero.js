/*
 *
 * Hero.js
 * Adds additional functionality to basic character.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/characters/Hero.js",
		_Hero = {},
		_Character,
		_Game,
		_Puzzles;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Hero,
		requirements: [
			"assets/modules/characters/Character.js",
			"assets/modules/core/Game.js",
			"assets/modules/puzzles/Puzzles.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( c, g, p ) {
		console.log('internal hero', _Hero);
		
		_Character = c;
		_Game = g;
		_Puzzles = p;
		
		_Hero.Instance = Hero;
		_Hero.Instance.prototype = new _Character.Instance();
		_Hero.Instance.constructor = _Hero.Instance;
		
	}
	
	/*===================================================
    
    hero
    
    =====================================================*/
	
	function Hero ( parameters ) {
		
		var me = this,
			actionsMap;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.id = 'kaiopua_hero';
		
		parameters.model = parameters.modelInfo || {};
		parameters.model.geometryAssetPath = "assets/models/Hero.js";
		parameters.model.materials = new THREE.MeshLambertMaterial( { color: 0xFFF7E0, ambient: 0xFFF7E0, vertexColors: THREE.VertexColors } );
		parameters.model.shading = THREE.SmoothShading;
		
		parameters.model.physics = parameters.model.physics || {};
		parameters.model.physics.bodyType = 'capsule';
		parameters.model.physics.movementDamping = 0.5;
		
		parameters.movement = parameters.movement || {};
		parameters.movement.moveSpeed = 6;
		parameters.movement.moveSpeedBack = 2;
		parameters.movement.moveRunThreshold = parameters.movement.moveSpeed;
		parameters.movement.rotateSpeed = 0.019;
		parameters.movement.jumpSpeedStart = 6;
		parameters.movement.jumpSpeedEnd = 0;
		parameters.movement.jumpTimeMax = 100;
		
		// prototype constructor
		
		_Character.Instance.call( me, parameters );
		
		// public
		
		me.action = action;
		
		// map generic numbers to actions
    	
    	actionsMap = {
    		
    		'001': plant
    	
    	};
    	
    	// functions
    	
    	/*===================================================
		
		actions
		
		=====================================================*/
		
		function action ( actionTypeName, parameters ) {
			
			// if action type is in actions map, do it
			
			if ( actionsMap.hasOwnProperty( actionTypeName ) ) {
				
				me.acting = true;
				
				actionsMap[ actionTypeName ].call( me, parameters );
				
			}
			else {
				
				me.acting = false;
				
			}
			
		}
		
		/*===================================================
		
		planting
		
		=====================================================*/
		
		function plant () {
			
			var intersection,
				targetModel,
				targetFace,
				grid,
				module;
			
			// find intersection from mouse
			
			intersection = _Game.get_intersection_from_mouse( me.scene );
			
			console.log( 'intersection from mouse?', intersection );
			
			// if is puzzle
			
			if ( typeof intersection !== 'undefined' ) {
			
				// store info
				
				targetModel = intersection.object;
				
				targetFace = intersection.face;
				
				// if is puzzle
				
				if ( targetModel instanceof _Puzzles.Instance ) {
					
					console.log(' > intersected model is puzzle!');
					
					// get puzzle grid
					
					grid = targetModel.grid;
					
					// find module based on face
					
					module = grid.get_modules( targetFace )[ 0 ];
					
					console.log(' >> intersected grid module is', module, ', with ', module.connected.length, ' connected modules: ', module.connected );
					
				}
				
			}
			
		}
		
	}
    
	/*
	// OLD SCALE ACTION
	// NOT IN USE, SAVE ANYWAY
	
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
		
		targetsNum = main.assets.modules.core.Player.select_from_mouse_position( parameters );
		
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
			
			for ( i = 0, l = targets.length; i < l; i ++ ) {
				
				target = targets[ i ];
				
				if ( target.interactive === true ) {
				
					adObj.scaleRecords[ target.id ] = target.scale.clone();
					
				}
				
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
			
			main.assets.modules.core.Player.deselect( parameters );
			
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
			mouseDelta,
			mouseDeltaDivisorY = shared.screenHeight * 0.1;
		
		if ( typeof actionData.select_and_scale !== 'undefined' ) {
			
			console.log('  scale update, num targets: ' + targets.length);
			
			adObj = actionData.select_and_scale;
			
			scaleRecords = adObj.scaleRecords;
			
			// mouse change
			
			mouseDelta = ( mouse.dx - mouse.dy ) * 0.5;
			
			// scale change
			
			scaleDelta = mouseDelta / mouseDeltaDivisorY;
			
			// for all interactive targets
			for ( i = 0, l = targets.length; i < l; i ++ ) {
				
				target = targets[ i ];
				
				if ( target.interactive === true ) {
					
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
		
		target.scale.set( scaleX, scaleY, scaleZ );
		
	}
	*/
	
} ( KAIOPUA ) );