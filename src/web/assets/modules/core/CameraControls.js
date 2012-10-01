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
		_ObjectHelper,
		_MathHelper,
		_VectorHelper,
		_PhysicsHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _CameraControls,
		requirements: [
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/VectorHelper.js",
			"assets/modules/utils/PhysicsHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
	internal init
    
    =====================================================*/
	
	function init_internal ( oh, mh, vh, ph ) {
		console.log('internal cameracontrols');
		// assets
		
		_ObjectHelper = oh;
		_MathHelper = mh;
		_VectorHelper = vh;
		_PhysicsHelper = ph;
		
		// instance
		
		_CameraControls.Instance = CameraControls;
		
		_CameraControls.Instance.prototype.enable = enable;
		_CameraControls.Instance.prototype.disable = disable;
		
		_CameraControls.Instance.prototype.rotate = rotate;
		_CameraControls.Instance.prototype.zoom = zoom;
		_CameraControls.Instance.prototype.update = update;
		
		Object.defineProperty( _CameraControls.Instance.prototype, 'camera', { 
			get : function () { return this._camera; },
			set : function ( camera ) {
				
				if ( typeof camera !== 'undefined' ) {
					
					this._camera = camera;
					
					this._camera.useQuaternion = true;
					this._camera.quaternion.setFromRotationMatrix( this._camera.matrix );
					
				}
				
			}
		});
		
		Object.defineProperty( _CameraControls.Instance.prototype, 'target', { 
			get : function () { return this._target; },
			set : function ( target ) {
				
				this._target = target;
				
				this.boundRadius = this._target instanceof THREE.Object3D ? this._target.boundRadius : this.boundRadiusBase;
				this.boundRadiusPct = _MathHelper.clamp( this.boundRadius / this.boundRadiusBase, this.boundRadiusPctMin, this.boundRadiusPctMax );
				
			}
		});
		
	}
	
	/*===================================================
    
	external init
    
    =====================================================*/
	
	function CameraControls ( camera, target ) {
		
		var pRot,
			pPos;
		
		// utility
		
		this.utilVec31Update = new THREE.Vector3();
		this.utilVec32Update = new THREE.Vector3();
		this.utilQ31Update = new THREE.Quaternion();
		this.utilQ32Update = new THREE.Quaternion();
		
		// properties
		
		this.position = new THREE.Vector3();
		this.quaternion = new THREE.Quaternion();
		
		this.up = shared.cardinalAxes.up.clone();
		this.forward = shared.cardinalAxes.forward.clone();
		
		this.cameraLerpDelta = 0.1;
		this.cameraLerpDeltaWhenNew = 0;
		this.cameraLerpDeltaWhenNewGrow = 0.02;
		
		this.positionBase = new THREE.Vector3();
		this.positionMove = new THREE.Vector3();
		this.positionOffset = new THREE.Vector3();
		this.positionOffsetTarget = new THREE.Vector3();
		this.positionOffsetSpeed = 0.1;
		this.positionOffsetSpeedWhenNew = 0.05;
		this.boundRadiusBase = 500;
		this.boundRadiusModMin = 1.25;
		this.boundRadiusModMax = this.boundRadiusMod = 3;
		this.boundRadiusModSpeed = 0.001;
		this.boundRadiusPctMin = 0.25;
		this.boundRadiusPctMax = this.boundRadiusPct = 1;
		
		this.rotating = false;
		this.rotationOffset = new THREE.Quaternion();
		this.rotationOffsetTarget = new THREE.Quaternion();
		this.rotationConstrained = new THREE.Vector3();
		this.rotationBase = new THREE.Vector3( -Math.PI * 0.2, 0, 0 );
		this.rotationRotated = new THREE.Vector3();
		this.rotationTotal = new THREE.Vector3();
		this.rotationDelta = new THREE.Vector3();
		this.rotationDeltaTotal = new THREE.Vector3();
		this.rotationTarget = new THREE.Quaternion();
		this.rotationCamera = new THREE.Quaternion();
		this.rotationMaxX = Math.PI * 0.5; // not using quaternions, so above 0.5 on X will appear to reverse y rotation
		this.rotationMinX= -Math.PI * 0.5;
		this.rotationMaxY = Math.PI;
		this.rotationMinY = -Math.PI;
		this.rotationSpeed = 0.1;
		this.rotationSpeedDelta = 0.001;
		this.rotationReturnDecay = 0.8;
		this.rotationDeltaDecay = 0.8;
		
		this.distanceThresholdPassed = false;
		this.distanceThresholdMin = 1;
		this.distanceThresholdPct = 0.35;
		this.distanceThresholdMax = this.positionOffset.length() * this.distanceThresholdPct;
		this.distanceSpeedPctMax = 0.25;
		this.distanceSpeedPctMin = 0.01;
		this.distanceSpeedPctAlphaGrow = 0.025;
		this.distanceSpeedPctAlphaShrink = 0.1;
		this.distanceSpeedPctWhenNew = 0;
		this.distanceSpeedPctWhenNewGrow = 0.0005;
		this.distanceSpeedPct = this.distanceSpeedPctMin;
		this.distanceSpeed = 0;
		this.distanceNormal = new THREE.Vector3();
		this.distanceMagnitude = new THREE.Vector3();
		
		// camera and target
		
		this.camera = camera;
		this.target = this.targetLast = target;
		
	}
	
	/*===================================================
	
	enable / disable
	
	=====================================================*/
	
	function enable () {
		
		shared.signals.onGamePointerDragStarted.add( rotate_start, this );
		shared.signals.onGamePointerDragged.add( this.rotate, this );
		shared.signals.onGamePointerDragEnded.add( rotate_stop, this );
		shared.signals.onGamePointerWheel.add( this.zoom, this );
		
	}
	
	function disable () {
		
		shared.signals.onGamePointerDragStarted.remove( rotate_start, this );
		shared.signals.onGamePointerDragged.remove( this.rotate, this );
		shared.signals.onGamePointerDragEnded.remove( rotate_stop, this );
		shared.signals.onGamePointerWheel.remove( this.zoom, this );
		
	}
	
	/*===================================================
	
	rotate
	
	=====================================================*/
	
	function rotate ( e, pointer ) {
		
		var angle,
			sign,
			angleSign,
			angleDiff;
		
		this.rotationDelta.set( -pointer.deltaY * this.rotationSpeedDelta, -pointer.deltaX * this.rotationSpeedDelta, 0 )
		this.rotationDeltaTotal.addSelf( this.rotationDelta );
		
	}
	
	function rotate_start () {
		
		this.rotating = true;
		
	}
	
	function rotate_stop () {
		
		this.rotating = false;
		
	}
	
	function rotate_update () {
		
		var target = this._target;
		
		// while moving, return to 0 rotation offset
		
		if ( this.targetNew === true || ( target && target.moving === true && this.rotating !== true ) ) {
			
			this.rotationRotated.multiplyScalar( this.rotationReturnDecay );
			
		}
		else {
			
			this.rotationRotated.x = _MathHelper.clamp( _MathHelper.rad_between_PI( this.rotationRotated.x + this.rotationDeltaTotal.x ), this.rotationMinX, this.rotationMaxX );
			this.rotationRotated.y = _MathHelper.clamp( _MathHelper.rad_between_PI( this.rotationRotated.y + this.rotationDeltaTotal.y ), this.rotationMinY, this.rotationMaxY );
			
		}
		
		this.rotationConstrained.add( this.rotationBase, this.rotationRotated );
		this.rotationConstrained.x = _MathHelper.clamp( this.rotationConstrained.x, this.rotationMinX, this.rotationMaxX );
		this.rotationConstrained.y = _MathHelper.clamp( this.rotationConstrained.y, this.rotationMinY, this.rotationMaxY );
		
		this.rotationOffsetTarget.setFromEuler( this.rotationConstrained, "YXZ" );
		this.rotationOffset.slerpSelf( this.rotationOffsetTarget, this.rotationSpeed );
		
		this.rotationDeltaTotal.multiplyScalar( this.rotationDeltaDecay );
		
	}
	
	/*===================================================
	
	zoom
	
	=====================================================*/
	
	function zoom ( e ) {
		
		var eo = e.originalEvent || e,
			wheelDelta = eo.wheelDelta;
		
		this.boundRadiusMod -= wheelDelta * ( this.boundRadiusModSpeed / this.boundRadiusPct );
		
	}
	
	function zoom_update() {
		
		this.boundRadiusMod = _MathHelper.clamp( this.boundRadiusMod, this.boundRadiusModMin / this.boundRadiusPct, this.boundRadiusModMax / this.boundRadiusPct );
		this.positionMove.z = this.boundRadius * this.boundRadiusMod;
		
		this.positionOffsetTarget.add( this.positionBase, this.positionMove );
		
		this.positionOffset.lerpSelf( this.positionOffsetTarget, this.targetNew === true ? this.positionOffsetSpeedWhenNew : this.positionOffsetSpeed );
		
		
	}
	
	/*===================================================
	
	update
	
	=====================================================*/
	
	function update () {
		
		var target = this._target,
			scale,
			rigidBody,
			gravityBody,
			gravityMesh,
			upReferencePosition,
			distance,
			distanceDiff,
			distanceSpeedMod,
			distanceSpeedPctAlphaGrow,
			distanceSpeedPctAlphaShrink,
			qToNew,
			positionOffsetScaled = this.utilVec31Update,
			rotationTargetNew = this.utilQ32Update,
			cameraLerpDelta = this.cameraLerpDelta;
		
		// handle target
		
		if ( target instanceof THREE.Object3D !== true ) {
			
			positionOffsetScaled.copy( this.positionOffset );
			
		}
		else {
			
			scale = Math.max( target.scale.x, target.scale.y, target.scale.z );
			rigidBody = target.rigidBody;
			gravityBody = target.gravityBody;
			/*
			// make sure camera and target parents are same
			
			if ( this.camera.parent !== target.parent ) {
				
				target.parent.add( this.camera );
				
			}
			*/
			// first time target is new
			
			if ( this.targetNew !== true && target !== this.targetLast ) {
				
				this.targetNew = true;
				this.distanceSpeedPctWhenNew = 0;
				this.cameraLerpDeltaWhenNew = 0;
					
			}
			
			// get distance to target position
			
			distance = _VectorHelper.distance_to( this.position, target.position );
			
			if ( this.targetNew === true && distance - this.distanceThresholdMin <= this.distanceThresholdMax ) {
				
				this.targetNew = false;
				this.targetLast = target;
				this.distanceThresholdPassed = true;
				
			}
			
			positionOffsetScaled.copy( this.positionOffset ).multiplyScalar( scale );
			
			// handle distance
			
			if ( distance > this.distanceThresholdMin ) {
				
				// update threshold max based on position offset
				
				this.distanceThresholdMax = positionOffsetScaled.length() * this.distanceThresholdPct;
				
				// if greater than max threshold, move with target at max distance
				
				if ( this.targetNew !== true && distance - this.distanceThresholdMin > this.distanceThresholdMax ) {
					
					distanceDiff = distance - this.distanceThresholdMax;
					
					// change flag
					
					this.distanceThresholdPassed = true;
					
					// update speed
					
					this.distanceSpeed = Math.max( this.distanceSpeed, distanceDiff );
					
				}
				// if distance threshold not yet passed, slow movement while target moving, speed up when stopped
				else if ( this.distanceThresholdPassed === false ) {
					
					// get speed pct
					
					if ( target.moving === true ) {
						
						this.distanceSpeedPct += ( this.distanceSpeedPctMin - this.distanceSpeedPct ) * this.distanceSpeedPctAlphaShrink;
						
					}
					else {
						
						if ( this.targetNew === true ) {
							
							distanceSpeedPctAlphaGrow = this.distanceSpeedPctWhenNew;
							this.distanceSpeedPctWhenNew = Math.min( this.distanceSpeedPctAlphaGrow, this.distanceSpeedPctWhenNew + this.distanceSpeedPctWhenNewGrow );
							
						}
						else {
							
							distanceSpeedPctAlphaGrow = this.distanceSpeedPctAlphaGrow;
							
						}
						
						this.distanceSpeedPct += ( this.distanceSpeedPctMax - this.distanceSpeedPct ) * distanceSpeedPctAlphaGrow;
						
					}
					
					// update speed
					
					this.distanceSpeed = Math.max( this.distanceSpeed, distance * this.distanceSpeedPct );
					
				}
				
				// get speed modifier
				
				distanceSpeedMod = Math.min( 1, distance / Math.max( this.distanceSpeed, this.distanceThresholdMax ) );
				
				// normal / magnitude to target
				
				this.distanceNormal.sub( target.position, this.position ).normalize();
				this.distanceMagnitude.copy( this.distanceNormal ).multiplyScalar( this.distanceSpeed * distanceSpeedMod );
				
				// update position
				
				this.position.addSelf( this.distanceMagnitude );
				
			}
			// reset position variables
			else if ( this.distanceThresholdPassed !== false ) {
				
				this.position.copy( target.position );
				this.distanceSpeed = 0;
				this.distanceThresholdPassed = false;
				
			}
			
			// handle gravity body
			
			if ( typeof gravityBody === 'undefined' && rigidBody && rigidBody.gravitySource === true ) {
				
				gravityBody = rigidBody;
				
			}
			
			if ( gravityBody ) {
				
				gravityMesh = gravityBody.mesh;
				upReferencePosition = gravityMesh.matrixWorld.getPosition();
				
			}
			else {
				
				upReferencePosition = shared.universeGravitySource;
				
			}
			
			// rotate quaternion and up/forward
			
			qToNew = _PhysicsHelper.rotate_relative_to_source ( this.quaternion, this.position, upReferencePosition, this.up, this.forward, 1, true );
			
		}
		
		// update
		
		rotate_update.call( this );
		zoom_update.call( this );
		
		// get camera target rotation
		
		rotationTargetNew.copy( this.quaternion );
		
		if ( target && target.turn instanceof THREE.Quaternion ) {
			
			rotationTargetNew.multiplySelf( target.turn );
			
		}
		
		// lerp camera rotation to target
		
		if ( this.targetNew === true ) {
			
			cameraLerpDelta = this.cameraLerpDeltaWhenNew;
			this.cameraLerpDeltaWhenNew = Math.min( this.cameraLerpDelta, this.cameraLerpDeltaWhenNew + ( this.cameraLerpDelta - this.cameraLerpDeltaWhenNew ) * this.cameraLerpDeltaWhenNewGrow );
			
		}
		
		_VectorHelper.lerp_normalized( this.rotationTarget, rotationTargetNew, cameraLerpDelta );
		
		this.rotationCamera.copy( this.rotationTarget ).multiplySelf( this.rotationOffset );
		
		this.camera.quaternion.copy( this.rotationCamera );
		
		// adjust position
		
		this.camera.quaternion.multiplyVector3( positionOffsetScaled );
		
		// apply position
		
		this.camera.position.copy( this.position ).addSelf( positionOffsetScaled );
		
	}
	
} ( KAIOPUA ) );