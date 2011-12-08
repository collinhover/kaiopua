/*
CameraControls.js
Camera controller module, handles controlling cameras in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		cameracontrols = core.cameracontrols = core.cameracontrols || {},
		mathhelper,
		camera,
		player,
		csRot,
		csPos;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	cameracontrols.init = init;
	cameracontrols.update = update;
	cameracontrols.rotate = rotate;
	cameracontrols.zoom = zoom;
	
	// getters and setters
	
	Object.defineProperty(cameracontrols, 'camera', { 
		get : function () { return camera; },
		set : set_camera 
	});
	
	/*===================================================
    
    init / set
    
    =====================================================*/
	
	function init ( parameters ) {
		
		// utility
		
		mathhelper = game.workers.mathhelper;
		
		// core
		
		player = core.player;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// camera
		
		set_camera( parameters.camera || game.camera );
		
		// controller settings
		
		csRot = make_controller_settings();
		csPos = make_controller_settings();
		
		csRot.base.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI );
		csRot.offsetBase.set( 25, 0, 0 );
		csRot.offset.copy( csRot.offsetBase );
		csRot.offsetMin.set( -75, -360, 0 );
		csRot.offsetMax.set( 75, 360, 0 );
		csRot.deltaMin.set( -40, -40, -40 );
		csRot.deltaMax.set( 40, 40, 40 );
		csRot.deltaSpeed = 0.1;
		csRot.baseRevertSpeed = 0.05;
		
		csPos.offsetBase.set( 0, 50, 300 );
		csPos.offset.copy( csPos.offsetBase );
		csPos.offsetMin.set( 0, 0, -25 );
		csPos.offsetMax.set( 0, 50, 1000 );
		csPos.deltaMin.set( -20, -20, -20 );
		csPos.deltaMax.set( 20, 20, 20 );
		csPos.deltaSpeed = 0.025;
		
	}
	
	function set_camera ( newCamera ) {
		
		if ( typeof newCamera !== 'undefined' ) {
			
			camera = newCamera;
			
			camera.useQuaternion = true;
			camera.quaternion.setFromRotationMatrix( camera.matrix );
			
		}
		
	}
	
	/*===================================================
    
    controller settings
    
    =====================================================*/
	
	function make_controller_settings () {
		
		var cs = {};
		
		cs.base = new THREE.Quaternion();
		cs.baseRevertSpeed = 1;
		cs.offsetBase = new THREE.Vector3();
		cs.offset = new THREE.Vector3();
		cs.offsetMin = new THREE.Vector3();
		cs.offsetMax = new THREE.Vector3();
		cs.delta = new THREE.Vector3();
		cs.deltaMin = new THREE.Vector3();
		cs.deltaMax = new THREE.Vector3();
		cs.deltaSpeed = 0;
		cs.deltaDecay = 0.8;
		
		return cs;
		
	}
	
	/*===================================================
    
    rotate
    
    =====================================================*/
	
	function rotate ( e, end ) {
		
		var mouse = shared.mice[ e.identifier ];
		
		// end rotation
		if ( end === true ) {
			
			shared.signals.mousemoved.remove( rotate_update );
			
			csRot.mouse = undefined;
			
		}
		// start rotation
		else {
			
			// store mouse
			
			csRot.mouse = mouse;
			
			shared.signals.mousemoved.add( rotate_update );
			
		}
		
	}
	
	function rotate_update ( e ) {
		
		var rotDelta = csRot.delta,
			rotDeltaMin = csRot.deltaMin,
			rotDeltaMax = csRot.deltaMax,
			rotDeltaSpeed = csRot.deltaSpeed,
			mouse = csRot.mouse;
		
		// pitch
		
		rotDelta.x = mathhelper.clamp( rotDelta.x + mouse.dy * rotDeltaSpeed, rotDeltaMin.x, rotDeltaMax.x );
		
		// yaw
		
		rotDelta.y = mathhelper.clamp( rotDelta.y - mouse.dx * rotDeltaSpeed, rotDeltaMin.y, rotDeltaMax.y );
		
	}
	
	/*===================================================
    
    zoom
    
    =====================================================*/
	
	function zoom ( e ) {
		
		var eo = e.originalEvent || e,
			wheelDelta = eo.wheelDelta,
			posDelta = csPos.delta,
			posDeltaMin = csPos.deltaMin,
			posDeltaMax = csPos.deltaMax,
			posDeltaSpeed = csRot.deltaSpeed;
		
		posDelta.z = mathhelper.clamp( posDelta.z - wheelDelta * posDeltaSpeed, posDeltaMin.z, posDeltaMax.z );
		
	}
	
	/*===================================================
    
    standard
    
    =====================================================*/
	
	function update ( timeDelta ) {
		
		var posOffset = csPos.offset,
			posOffsetMin = csPos.offsetMin,
			posOffsetMax = csPos.offsetMax,
			posDelta = csPos.delta,
			posDeltaDecay = csRot.deltaDecay,
			rotBase = csRot.base,
			rotBaseRevertSpeed = csRot.baseRevertSpeed,
			rotOffsetBase = csRot.offsetBase,
			rotOffset = csRot.offset,
			rotOffsetMin = csRot.offsetMin,
			rotOffsetMax = csRot.offsetMax,
			rotDelta = csRot.delta,
			rotDeltaDecay = csRot.deltaDecay,
			playerMoving = player.moving;
		
		// add delta to offset
		
		posOffset.z = mathhelper.clamp( posOffset.z + posDelta.z, posOffsetMin.z, posOffsetMax.z );
		
		rotOffset.x = mathhelper.clamp( rotOffset.x + rotDelta.x, rotOffsetMin.x, rotOffsetMax.x );
		rotOffset.y = mathhelper.clamp( rotOffset.y + rotDelta.y, rotOffsetMin.y, rotOffsetMax.y );
		
		// decay
		
		posDelta.multiplyScalar( posDeltaDecay );
		
		rotDelta.multiplyScalar( rotDeltaDecay );
		
		// normalize rotation (between 180 and -180)
		
		if ( rotOffset.x > 180 ) {
			rotOffset.x -= 360;
		}
		else if ( rotOffset.x < -180 ) {
			rotOffset.x += 360;
		}
		if ( rotOffset.y > 180 ) {
			rotOffset.y -= 360;
		}
		else if ( rotOffset.y < -180 ) {
			rotOffset.y += 360;
		}
		
		// if player is moving but not rotating camera
		// move rotation offset back towards original
		
		if ( typeof csRot.mouse === 'undefined' && playerMoving === true ) {
			
			if ( rotOffset.x !== rotOffsetBase.x ) rotOffset.x += (rotOffsetBase.x - rotOffset.x) * rotBaseRevertSpeed;
			if ( rotOffset.y !== rotOffsetBase.y ) rotOffset.y += (rotOffsetBase.y - rotOffset.y) * rotBaseRevertSpeed;
			
		}
		
		// follow player
		
		game.object_follow_object( player.character.model.mesh, camera, rotBase, rotOffset, posOffset );
		
		/*
		// 
		//
		// BROKEN
		// issue is camera follows player character regardless, even if camera is turning player character
		// probably need to pull camera follow character function internal to camera
		// that way camera decides either to lead or to follow
		//
		//
		
		// check if should switch between third and first
		
		cameraFollowSettings.firstPersonMode = true;
		
		// if in first person mode
		// rotate character on y axis with camera
		
		if ( cameraFollowSettings.firstPersonMode === true && playerMoving === false ) {
			
			
			console.log('-----');
			console.log(rotationOffset.y);
			console.log((rotationOffset.y / 360));
			console.log(playerMovementRotateVec.y);
			
			playerMovementRotate.delta.set( 0, (rotationOffset.y / 360) - playerMovementRotateVec.y, 0, 1 ).normalize();
			
			playerMovementRotateVec.multiplySelf( playerMovementRotate.delta ).normalize();
			
			playerMovementRotate.utilQ1.multiply( playerCharacter.model.mesh.quaternion, playerMovementRotate.delta );
			
			playerCharacter.model.mesh.quaternion.copy( playerMovementRotate.utilQ1 );
			
		}
		*/
		
		
	}
	
	return main;
	
}(KAIOPUA || {}));