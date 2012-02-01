/*
CameraControls.js
Camera controller module, handles controlling cameras in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/CameraControls",
		cameracontrols = {},
		objecthelper,
		mathhelper,
		player,
		camera,
		csRot,
		csPos,
		firstPersonDist = 50,
		firstPerson = false,
		utilVec31Update,
		utilVec32Update,
		utilVec33Update,
		utilQ31Update,
		utilQ32Update;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	cameracontrols.init = init;
	cameracontrols.update = update;
	cameracontrols.rotate = rotate;
	cameracontrols.zoom = zoom;
	
	// getters and setters
	
	Object.defineProperty( cameracontrols, 'camera', { 
		get : function () { return camera; },
		set : set_camera
	});
	
	Object.defineProperty( cameracontrols, 'player', { 
		get : function () { return player; },
		set : set_player
	});
	
	cameracontrols = main.asset_register( assetPath, cameracontrols, true );
	
	/*===================================================
    
	internal init
    
    =====================================================*/
	
	main.assets_require( [
		"assets/modules/utils/ObjectHelper",
		"assets/modules/utils/MathHelper"
	], init_internal, true );
	
	function init_internal ( oh, mh ) {
		console.log('internal cameracontrols');
		// assets
		
		objecthelper = oh;
		mathhelper = mh;
		
		main.asset_ready( assetPath );
		
	}
	
	/*===================================================
    
	external init
    
    =====================================================*/
	
	function init ( player, camera ) {
		
		// utility
		
		utilVec31Update = new THREE.Vector3();
		utilVec32Update = new THREE.Vector3();
		utilVec33Update = new THREE.Vector3();
		utilQ31Update = new THREE.Quaternion();
		utilQ32Update = new THREE.Quaternion();
		
		// camera
		
		set_camera( camera );
		
		// player
		
		set_player( player );
		
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
		csRot.deltaSpeedMax = csRot.deltaSpeedMin = 0.1;
		csRot.baseRevertSpeed = 0.05;
		
		csPos.offsetBase.set( 0, 50, 300 );
		csPos.offset.copy( csPos.offsetBase );
		csPos.offsetMin.set( 0, 0, -25 );
		csPos.offsetMax.set( 0, 50, 1000 );
		csPos.offsetSnap.copy( csPos.offset );
		csPos.offsetSnapToMinDist.set( 0, 0, firstPersonDist );
		csPos.deltaMin.set( -80, -80, -80 );
		csPos.deltaMax.set( 80, 80, 80 );
		csPos.deltaSpeedMin = 0.01;
		csPos.deltaSpeedMax = 0.25;
		csPos.deltaDecay = 0.7;
		
	}
	
	function set_camera ( newCamera ) {
		
		if ( typeof newCamera !== 'undefined' ) {
			
			camera = newCamera;
			
			camera.useQuaternion = true;
			camera.quaternion.setFromRotationMatrix( camera.matrix );
			
		}
		
	}
	
	function set_player ( newPlayer ) {
		
		if ( typeof newPlayer !== 'undefined' ) {
			
			player = newPlayer;
			
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
		cs.offsetSnap = new THREE.Vector3();
		cs.offset = new THREE.Vector3();
		cs.offsetMin = new THREE.Vector3();
		cs.offsetMax = new THREE.Vector3();
		cs.offsetSnapToMinDist = new THREE.Vector3();
		cs.offsetSnapToMaxDist = new THREE.Vector3();
		cs.delta = new THREE.Vector3();
		cs.deltaMin = new THREE.Vector3();
		cs.deltaMax = new THREE.Vector3();
		cs.deltaSpeedMin = 0;
		cs.deltaSpeedMax = 0;
		cs.deltaDecay = 0.8;
		
		return cs;
		
	}
	
	/*===================================================
    
    rotate
    
    =====================================================*/
	
	function rotate ( e, end ) {
		
		var mouse;
		
		// end rotation
		if ( end === true ) {
			
			shared.signals.mousemoved.remove( rotate_update );
			
			csRot.mouse = undefined;
			
		}
		// start rotation
		else {
			
			// store mouse
			
			csRot.mouse = shared.mice[ ( typeof e !== 'undefined' ? e.identifier : 0 ) ];
			
			shared.signals.mousemoved.add( rotate_update );
			
		}
		
	}
	
	function rotate_update ( e ) {
		
		var rotDelta = csRot.delta,
			rotDeltaMin = csRot.deltaMin,
			rotDeltaMax = csRot.deltaMax,
			rotDeltaSpeed = csRot.deltaSpeedMin,
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
			posOffset = csPos.offset,
			posOffsetMin = csPos.offsetMin,
			posOffsetMax = csPos.offsetMax,
			posDelta = csPos.delta,
			posDeltaMin = csPos.deltaMin,
			posDeltaMax = csPos.deltaMax,
			posDeltaSpeed,
			posOffsetZMinMaxDist = posOffsetMax.z - posOffsetMin.z,
			posOffsetPctToMin = (posOffset.z - posOffsetMin.z) / posOffsetZMinMaxDist;
		
		posDeltaSpeed = csPos.deltaSpeedMin * ( 1 - posOffsetPctToMin ) + csPos.deltaSpeedMax * posOffsetPctToMin;
		
		posDelta.z = mathhelper.clamp( posDelta.z - wheelDelta * posDeltaSpeed, posDeltaMin.z, posDeltaMax.z );
		
	}
	
	/*===================================================
    
    standard
    
    =====================================================*/
	
	function update ( timeDelta ) {
		
		var posOffset = csPos.offset,
			posOffsetMin = csPos.offsetMin,
			posOffsetMax = csPos.offsetMax,
			posOffsetSnap = csPos.offsetSnap,
			posOffsetSnapToMinDist = csPos.offsetSnapToMinDist,
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
			playerMoving = player.moving,
			pc = player.character,
			cardinalAxes = shared.cardinalAxes,
			caForward = cardinalAxes.forward,
			caUp = cardinalAxes.up,
			rotOffsetQ,
			rotOffsetAxis,
			pcRotToRotOffsetDist,
			pcRotToRotOffsetAngle,
			pcRotToRotOffsetAxis,
			pcRotToRotOffsetQ;
		
		// add delta to offset
		// snap to min when within snapping dist
		
		if ( posDelta.z > 0 && posOffset.z === posOffsetMin.z ) {
			
			posOffsetSnap.z = posOffsetMin.z + posOffsetSnapToMinDist.z;
			
		}
		
		posOffset.z = posOffsetSnap.z = mathhelper.clamp( posOffsetSnap.z + posDelta.z, posOffsetMin.z, posOffsetMax.z );
		
		if ( posOffsetSnap.z - posOffsetSnapToMinDist.z <= posOffsetMin.z ) {
			
			posOffset.z = posOffsetMin.z;
			
		}
		
		rotOffset.x = mathhelper.clamp( rotOffset.x + rotDelta.x, rotOffsetMin.x, rotOffsetMax.x );
		rotOffset.y = mathhelper.clamp( rotOffset.y + rotDelta.y, rotOffsetMin.y, rotOffsetMax.y );
		
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
		
		// check if should switch between third and first
		
		if ( posOffset.z - firstPersonDist <= posOffsetMin.z ) {
			
			if ( firstPerson !== true && rotOffset.y !== 0 ) {
				
				// get axis and angle between rot offset y rotation and forward
				
				rotOffsetQ = utilQ31Update.setFromAxisAngle( utilVec31Update.copy( caUp ), rotOffset.y * Math.PI / 180 );
				
				rotOffsetAxis = utilVec32Update.copy( caForward );
				
				rotOffsetQ.multiplyVector3( rotOffsetAxis );
				
				pcRotToRotOffsetDist = Math.max( -1, Math.min( 1, caForward.dot( rotOffsetAxis ) ) );
				
				// axis / angle
				
				pcRotToRotOffsetAngle = Math.acos( pcRotToRotOffsetDist );
				pcRotToRotOffsetAxis = utilVec33Update.cross( caForward, rotOffsetAxis );
				pcRotToRotOffsetAxis.normalize();
				
				// rotation change
				
				pcRotToRotOffsetQ = utilQ32Update.setFromAxisAngle( pcRotToRotOffsetAxis, pcRotToRotOffsetAngle );
				
				// update player rotation y
				
				pc.rotate_by_delta( pcRotToRotOffsetQ.x, pcRotToRotOffsetQ.y, pcRotToRotOffsetQ.z, pcRotToRotOffsetQ.w );
				
				// reset rot offset
				
				rotOffset.y = 0;
				
			}
			
			firstPerson = true;
			
		}
		else {
			
			firstPerson = false;
			
		}
		
		// if in first person mode
		// rotate character on y axis with camera
		
		if ( firstPerson === true ) {
			
			// update player rotation y
			
			pc.rotate_by_delta( 0, rotDelta.y / 180, 0, 1 );
			
			// remove rot delta from offset
			// as will be copied when camera follows player
			
			rotOffset.y -= rotDelta.y;
			
		}
		// if player is not in first person and moving but not rotating camera
		// move rotation offset back towards original
		else if ( typeof csRot.mouse === 'undefined' && playerMoving === true ) {
			
			if ( rotOffset.x !== rotOffsetBase.x ) rotOffset.x += (rotOffsetBase.x - rotOffset.x) * rotBaseRevertSpeed;
			if ( rotOffset.y !== rotOffsetBase.y ) rotOffset.y += (rotOffsetBase.y - rotOffset.y) * rotBaseRevertSpeed;
			
		}
		
		// follow player
		
		objecthelper.object_follow_object( player.character.model.mesh, camera, rotBase, rotOffset, posOffset );
		
		// decay deltas
		
		posDelta.multiplyScalar( posDeltaDecay );
		
		rotDelta.multiplyScalar( rotDeltaDecay );
		
	}
	
	return main;
	
}(KAIOPUA || {}));