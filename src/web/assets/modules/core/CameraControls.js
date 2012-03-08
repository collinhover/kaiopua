/*
 *
 * CameraControls.js
 * Adds additional functionality to basic camera.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/CameraControls.js",
		_CameraControls = {},
		_Game,
		_ObjectHelper,
		_MathHelper,
		firstPersonDist = 50,
		rotateRecordedThreshold = 4,
		utilVec31Update,
		utilVec32Update,
		utilVec33Update,
		utilQ31Update,
		utilQ32Update;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _CameraControls,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
	internal init
    
    =====================================================*/
	
	function init_internal ( g, oh, mh ) {
		console.log('internal cameracontrols');
		// assets
		
		_Game = g;
		_ObjectHelper = oh;
		_MathHelper = mh;
		
		// utility
		
		utilVec31Update = new THREE.Vector3();
		utilVec32Update = new THREE.Vector3();
		utilVec33Update = new THREE.Vector3();
		utilQ31Update = new THREE.Quaternion();
		utilQ32Update = new THREE.Quaternion();
		
		// instance
		
		_CameraControls.Instance = CameraControls;
		_CameraControls.Instance.prototype.rotate = rotate;
		_CameraControls.Instance.prototype.rotate_update = rotate_update;
		_CameraControls.Instance.prototype.zoom = zoom;
		_CameraControls.Instance.prototype.update = update;
		
		Object.defineProperty( _CameraControls.Instance.prototype, 'camera', { 
			get : function () { return this._camera; },
			set : function ( newCamera ) {
				
				if ( typeof newCamera !== 'undefined' ) {
					
					this._camera = newCamera;
					
					this.camera.useQuaternion = true;
					this.camera.quaternion.setFromRotationMatrix( this.camera.matrix );
					
				}
				
			}
		});
		
		Object.defineProperty( _CameraControls.Instance.prototype, 'player', { 
			get : function () { return this._player; },
			set : function ( newPlayer ) {
				
				if ( typeof newPlayer !== 'undefined' ) {
					
					this._player = newPlayer;
					
				}
				
			}
		});
		
	}
	
	/*===================================================
    
	external init
    
    =====================================================*/
	
	function CameraControls ( player, camera ) {
		
		var pRot,
			pPos;
		
		// camera
		
		this.camera = camera;
		
		// player
		
		this.player = player;
		
		// controller settings
		
		this.settingsRotation = pRot = new PropertySettings();
		this.settingsPosition = pPos = new PropertySettings();
		
		pRot.base.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI );
		pRot.offsetBase.set( 25, 0, 0 );
		pRot.offset.copy( pRot.offsetBase );
		pRot.offsetMin.set( -75, -360, 0 );
		pRot.offsetMax.set( 75, 360, 0 );
		pRot.deltaMin.set( -40, -40, -40 );
		pRot.deltaMax.set( 40, 40, 40 );
		pRot.deltaSpeedMax = pRot.deltaSpeedMin = 0.1;
		pRot.baseRevertSpeed = 0.05;
		
		pPos.offsetBase.set( 0, 50, 300 );
		pPos.offset.copy( pPos.offsetBase );
		pPos.offsetMin.set( 0, 0, -25 );
		pPos.offsetMax.set( 0, 50, 10000 );
		pPos.offsetSnap.copy( pPos.offset );
		pPos.offsetSnapToMinDist.set( 0, 0, firstPersonDist );
		pPos.deltaMin.set( -80, -80, -80 );
		pPos.deltaMax.set( 80, 80, 80 );
		pPos.deltaSpeedMin = 0.01;
		pPos.deltaSpeedMax = 0.25;
		pPos.deltaDecay = 0.7;
		
		// misc
		
		this.firstPerson = false;
		this.rotatedRecently = false;
		
	}
	
	/*===================================================
    
    property settings
    
    =====================================================*/
	
	function PropertySettings () {
		
		this.base = new THREE.Quaternion();
		this.baseRevertSpeed = 1;
		this.offsetBase = new THREE.Vector3();
		this.offsetSnap = new THREE.Vector3();
		this.offset = new THREE.Vector3();
		this.offsetMin = new THREE.Vector3();
		this.offsetMax = new THREE.Vector3();
		this.offsetSnapToMinDist = new THREE.Vector3();
		this.offsetSnapToMaxDist = new THREE.Vector3();
		this.delta = new THREE.Vector3();
		this.deltaMin = new THREE.Vector3();
		this.deltaMax = new THREE.Vector3();
		this.deltaTotal = new THREE.Vector3();
		this.deltaSpeedMin = 0;
		this.deltaSpeedMax = 0;
		this.deltaDecay = 0.8;
		
	}
	
	/*===================================================
	
	rotate
	
	=====================================================*/
	
	function rotate ( e, end ) {
		
		var rotated = false,
			mouse;
		
		// end rotation
		if ( end === true ) {
			
			// if rotated
			
			rotated = this.rotatedRecently;
			
			// reset
			
			shared.signals.mousemoved.remove( rotate_update, this );
			
			this.settingsRotation.mouse = undefined;
			
			this.rotatedRecently = false;
			
		}
		// start rotation
		else {
			
			// store mouse
			
			this.settingsRotation.mouse = _Game.get_mouse( ( typeof e !== 'undefined' ? e.identifier : 0 ) );
			
			// reset properties
			
			this.settingsRotation.deltaTotal.set( 0, 0, 0 );
			this.settingsRotation.delta.set( 0, 0, 0 );
			this.rotatedRecently = false;
			
			// update
			
			shared.signals.mousemoved.add( rotate_update, this );
			
		}
		
		return rotated;
		
	}
	
	function rotate_update () {
		
		var pRot = this.settingsRotation,
			rotDelta = pRot.delta,
			rotDeltaMin = pRot.deltaMin,
			rotDeltaMax = pRot.deltaMax,
			rotDeltaSpeed = pRot.deltaSpeedMin,
			rotDeltaTotal = pRot.deltaTotal,
			rotDeltaX,
			rotDeltaY,
			mouse = pRot.mouse;
		
		// pitch
		
		rotDelta.x = _MathHelper.clamp( rotDelta.x + mouse.dy * rotDeltaSpeed, rotDeltaMin.x, rotDeltaMax.x );
		
		// yaw
		
		rotDelta.y = _MathHelper.clamp( rotDelta.y - mouse.dx * rotDeltaSpeed, rotDeltaMin.y, rotDeltaMax.y );
		
		// if totals above start threshold
		
		if ( this.rotatedRecently !== true ) {
			
			rotDeltaTotal.addSelf( rotDelta );
			
			if ( rotDeltaTotal.length() > rotateRecordedThreshold ) {
				
				this.rotatedRecently = true;
				
			}
			
		}
		
	}
	
	/*===================================================
	
	zoom
	
	=====================================================*/
	
	function zoom ( e ) {
		
		var eo = e.originalEvent || e,
			wheelDelta = eo.wheelDelta,
			pPos = this.settingsPosition,
			posOffset = pPos.offset,
			posOffsetMin = pPos.offsetMin,
			posOffsetMax = pPos.offsetMax,
			posDelta = pPos.delta,
			posDeltaMin = pPos.deltaMin,
			posDeltaMax = pPos.deltaMax,
			posDeltaSpeed,
			posOffsetZMinMaxDist = posOffsetMax.z - posOffsetMin.z,
			posOffsetPctToMin = (posOffset.z - posOffsetMin.z) / posOffsetZMinMaxDist;
		
		posDeltaSpeed = pPos.deltaSpeedMin * ( 1 - posOffsetPctToMin ) + pPos.deltaSpeedMax * posOffsetPctToMin;
		
		posDelta.z = _MathHelper.clamp( posDelta.z - wheelDelta * posDeltaSpeed, posDeltaMin.z, posDeltaMax.z );
		
	}
	
	/*===================================================
	
	update
	
	=====================================================*/
	
	function update ( timeDelta ) {
		
		var pRot = this.settingsRotation,
			pPos = this.settingsPosition,
			posOffset = pPos.offset,
			posOffsetMin = pPos.offsetMin,
			posOffsetMax = pPos.offsetMax,
			posOffsetSnap = pPos.offsetSnap,
			posOffsetSnapToMinDist = pPos.offsetSnapToMinDist,
			posDelta = pPos.delta,
			posDeltaDecay = pRot.deltaDecay,
			rotBase = pRot.base,
			rotBaseRevertSpeed = pRot.baseRevertSpeed,
			rotOffsetBase = pRot.offsetBase,
			rotOffset = pRot.offset,
			rotOffsetMin = pRot.offsetMin,
			rotOffsetMax = pRot.offsetMax,
			rotDelta = pRot.delta,
			rotDeltaDecay = pRot.deltaDecay,
			player = this.player,
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
		
		posOffset.z = posOffsetSnap.z = _MathHelper.clamp( posOffsetSnap.z + posDelta.z, posOffsetMin.z, posOffsetMax.z );
		
		if ( posOffsetSnap.z - posOffsetSnapToMinDist.z <= posOffsetMin.z ) {
			
			posOffset.z = posOffsetMin.z;
			
		}
		
		rotOffset.x = _MathHelper.clamp( rotOffset.x + rotDelta.x, rotOffsetMin.x, rotOffsetMax.x );
		rotOffset.y = _MathHelper.clamp( rotOffset.y + rotDelta.y, rotOffsetMin.y, rotOffsetMax.y );
		
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
			
			if ( this.firstPerson !== true && rotOffset.y !== 0 ) {
				
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
			
			this.firstPerson = true;
			
		}
		else {
			
			this.firstPerson = false;
			
		}
		
		// if in first person mode
		// rotate character on y axis with camera
		
		if ( this.firstPerson === true ) {
			
			// update player rotation y
			
			pc.rotate_by_delta( 0, rotDelta.y / 180, 0, 1 );
			
			// remove rot delta from offset
			// as will be copied when camera follows player
			
			rotOffset.y -= rotDelta.y;
			
		}
		// if player is not in first person and moving but not rotating camera
		// move rotation offset back towards original
		else if ( typeof pRot.mouse === 'undefined' && player.moving === true ) {
			
			if ( rotOffset.x !== rotOffsetBase.x ) rotOffset.x += (rotOffsetBase.x - rotOffset.x) * rotBaseRevertSpeed;
			if ( rotOffset.y !== rotOffsetBase.y ) rotOffset.y += (rotOffsetBase.y - rotOffset.y) * rotBaseRevertSpeed;
			
		}
		
		// follow player
		
		_ObjectHelper.object_follow_object( pc, this.camera, rotBase, rotOffset, posOffset );
		
		// decay deltas
		
		posDelta.multiplyScalar( posDeltaDecay );
		
		rotDelta.multiplyScalar( rotDeltaDecay );
		
	}
	
} ( KAIOPUA ) );