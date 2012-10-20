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
		assetPath = "js/kaiopua/core/CameraControls.js",
		_CameraControls = {},
		_MathHelper,
		_VectorHelper,
		_ObjectHelper,
		_PhysicsHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _CameraControls,
		requirements: [
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/VectorHelper.js",
			"js/kaiopua/utils/ObjectHelper.js",
			"js/kaiopua/utils/PhysicsHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
	internal init
    
    =====================================================*/
	
	function init_internal ( mh, vh, oh, ph ) {
		console.log('internal cameracontrols');
		// assets
		
		_MathHelper = mh;
		_VectorHelper = vh;
		_ObjectHelper = oh;
		_PhysicsHelper = ph;
		
		// properties
		
		_CameraControls.options = {
			cameraLerpDeltaWhenNewGrow: 0.02,
			positionBaseX: 0,
			positionBaseY: 0,
			positionBaseZ: 0,
			positionBaseSpeed: 0.1,
			positionOffsetSpeed: 0.1,
			positionOffsetSpeedWhenNew: 0.05,
			boundRadiusBase: 500,
			boundRadiusModMin: 1.25,
			boundRadiusModMax: 3,
			boundRadiusModSpeed: 0.001,
			boundRadiusPctMin: 0.25,
			boundRadiusPctMax: 1,
			rotationMaxX: Math.PI * 0.5, // not using quaternions, so above 0.5 on X will appear to reverse y rotation
			rotationMinX: -Math.PI * 0.5,
			rotationMaxY: Math.PI,
			rotationMinY: -Math.PI,
			rotationSpeed: 0.1,
			rotationSpeedDelta: 0.001,
			rotationReturnDecay: 0.8,
			rotationDeltaDecay: 0.8,
			distanceThresholdMin: 1,
			distanceThresholdPct: 0.35,
			distanceSpeedPctMax: 0.25,
			distanceSpeedPctMin: 0.01,
			distanceSpeedPctAlphaGrow: 0.025,
			distanceSpeedPctAlphaShrink: 0.1,
			distanceSpeedPctWhenNew: 0,
			distanceSpeedPctWhenNewGrow: 0.0005
		};
		
		// instance
		
		_CameraControls.Instance = CameraControls;
		
		_CameraControls.Instance.prototype.rotate_start = rotate_start;
		_CameraControls.Instance.prototype.rotate = rotate;
		_CameraControls.Instance.prototype.rotate_stop = rotate_stop;
		
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
				
				this.targetLast = this._target;
				this._target = target;
				
				this.boundRadius = this._target instanceof THREE.Object3D ? this._target.boundRadius : this.options.boundRadiusBase;
				this.boundRadiusPct = _MathHelper.clamp( this.boundRadius / this.options.boundRadiusBase, this.options.boundRadiusPctMin, this.options.boundRadiusPctMax );
				
				if ( this._target !== this.targetLast ) {
					
					this.targetTransitioned = false;
					
				}
				
			}
		});
		
		Object.defineProperty( _CameraControls.Instance.prototype, 'enabled', { 
			get : function () { return this._enabled; },
			set : function ( enabled ) {
				
				var enabledPrev = this._enabled;
				
				this._enabled = enabled;
				
				if ( this._enabled === true && enabledPrev !== true ) {
					
					this.position.copy( this.camera.position );
					this.rotationTarget.copy( this.camera.quaternion );
					
				}
				
			}
		} );
		
		Object.defineProperty( _CameraControls.Instance.prototype, 'controllable', { 
			get : function () { return this._controllable; },
			set : function ( controllable ) {
				
				this._controllable = controllable;
				
				if ( this._controllable === true ) {
					
					shared.signals.onGamePointerDragStarted.add( this.rotate_start, this );
					shared.signals.onGamePointerDragged.add( this.rotate, this );
					shared.signals.onGamePointerDragEnded.add( this.rotate_stop, this );
					shared.signals.onGamePointerWheel.add( this.zoom, this );
					
				}
				else {
					
					shared.signals.onGamePointerDragStarted.remove( this.rotate_start, this );
					shared.signals.onGamePointerDragged.remove( this.rotate, this );
					shared.signals.onGamePointerDragEnded.remove( this.rotate_stop, this );
					shared.signals.onGamePointerWheel.remove( this.zoom, this );
					
				}
				
			}
		});
		
	}
	
	/*===================================================
    
	external init
    
    =====================================================*/
	
	function CameraControls ( parameters ) {
		
		parameters = parameters || {};
		
		// utility
		
		this.utilVec31Update = new THREE.Vector3();
		this.utilVec32Update = new THREE.Vector3();
		this.utilQ31Update = new THREE.Quaternion();
		this.utilQ32Update = new THREE.Quaternion();
		
		// options
		
		this.options = $.extend( true, this.options || {}, _CameraControls.options, parameters.options );
		
		// properties
		
		this.position = new THREE.Vector3();
		
		this.up = shared.cardinalAxes.up.clone();
		this.forward = shared.cardinalAxes.forward.clone();
		
		this.positionBase = new THREE.Vector3();
		this.positionBaseTarget = new THREE.Vector3();
		this.positionMove = new THREE.Vector3();
		this.positionOffset = new THREE.Vector3();
		this.positionOffsetTarget = new THREE.Vector3();
		
		this.rotating = false;
		this.rotateTarget = false;
		this.rotationOffset = new THREE.Quaternion();
		this.rotationOffsetTarget = new THREE.Quaternion();
		this.rotationConstrained = new THREE.Vector3();
		this.rotationBase = new THREE.Vector3( -Math.PI * 0.2, Math.PI, 0 );
		this.rotationRotated = new THREE.Vector3();
		this.rotationRotatedLast = new THREE.Vector3();
		this.rotationRotatedDelta = new THREE.Vector3();
		this.rotationTotal = new THREE.Vector3();
		this.rotationDelta = new THREE.Vector3();
		this.rotationDeltaTotal = new THREE.Vector3();
		this.rotationTarget = new THREE.Quaternion();
		this.rotationCamera = new THREE.Quaternion();
		
		this.distanceNormal = new THREE.Vector3();
		this.distanceMagnitude = new THREE.Vector3();
		
		this.cameraLerpDelta = 0.1;
		this.cameraLerpDeltaWhenNew = 0;
		this.distanceThresholdPassed = false;
		this.distanceThresholdMax = this.positionOffset.length() * this.options.distanceThresholdPct;
		this.distanceSpeed = 0;
		this.distanceSpeedPct = this.options.distanceSpeedPctMin;
		this.boundRadius = this.options.boundRadiusBase;
		this.boundRadiusPct = this.options.boundRadiusPctMax;
		this.boundRadiusMod = this.options.boundRadiusModMax;
		
		this.camera = parameters.camera;
		this.target = parameters.target;
		
		this.enabled = false;
		this.controllable = false;
		
	}
	
	/*===================================================
	
	rotate
	
	=====================================================*/
	
	function rotate ( e, pointer ) {
		
		var angle,
			sign,
			angleSign,
			angleDiff;
		
		pointer = pointer || main.get_pointer( e );
		
		this.rotationDelta.set( -pointer.deltaY * this.options.rotationSpeedDelta, -pointer.deltaX * this.options.rotationSpeedDelta, 0 )
		this.rotationDeltaTotal.addSelf( this.rotationDelta );
		
	}
	
	function rotate_start () {
		
		this.rotating = true;
		
	}
	
	function rotate_stop () {
		
		this.rotating = false;
		
	}
	
	function rotate_update () {
		
		var target = this._target,
			targetRotateAxis;
		
		this.rotationConstrained.copy( this.rotationBase );
		
		// while moving, return to 0 rotation offset
		
		if ( this.targetNew === true || ( target && target.moving === true && this.rotating !== true && this.rotateTarget !== true ) ) {
			
			this.rotationRotated.multiplyScalar( this.options.rotationReturnDecay );
			this.rotationConstrained.addSelf( this.rotationRotated );
			
		}
		else {
			
			this.rotationRotatedLast.copy( this.rotationRotated );
			
			this.rotationRotated.x = _MathHelper.clamp( _MathHelper.rad_between_PI( this.rotationRotated.x + this.rotationDeltaTotal.x ), this.options.rotationMinX, this.options.rotationMaxX );
			this.rotationRotated.y = _MathHelper.clamp( _MathHelper.rad_between_PI( this.rotationRotated.y + this.rotationDeltaTotal.y ), this.options.rotationMinY, this.options.rotationMaxY );
			
			// if controls should also rotate target around y axis
			
			if ( this.rotateTarget === true ) {
				
				this.rotationRotatedDelta.sub( this.rotationRotated, this.rotationRotatedLast );
				
				// rotation axis
				
				if ( target.options && target.options.movement && target.options.movement.rotate ) {
					
					targetRotateAxis = target.options.movement.rotate.axis;
					
				}
				else if ( target.rigidBody ) {
					
					targetRotateAxis = target.rigidBody.axes.up;
					
				}
				else {
					
					targetRotateAxis = this.up;
					
				}
				
				target.quaternion.multiplySelf( new THREE.Quaternion().setFromAxisAngle( targetRotateAxis, this.rotationRotatedDelta.y ) );
				
				// since we add the rotation delta y to the target, we only add the rotation delta x to the constrained / offset
				
				this.rotationConstrained.x += this.rotationRotated.x;
				
			}
			else {
				
				this.rotationConstrained.addSelf( this.rotationRotated );
				
			}
		
		}
		
		this.rotationConstrained.x = _MathHelper.clamp( _MathHelper.rad_between_PI( this.rotationConstrained.x ), this.options.rotationMinX, this.options.rotationMaxX );
		this.rotationConstrained.y = _MathHelper.clamp( _MathHelper.rad_between_PI( this.rotationConstrained.y ), this.options.rotationMinY, this.options.rotationMaxY );
		
		this.rotationOffsetTarget.setFromEuler( this.rotationConstrained, "YXZ" );
		this.rotationOffset.slerpSelf( this.rotationOffsetTarget, this.options.rotationSpeed );
		
		this.rotationDeltaTotal.multiplyScalar( this.options.rotationDeltaDecay );
		
	}
	
	/*===================================================
	
	zoom
	
	=====================================================*/
	
	function zoom ( e ) {
		
		if ( e ) {
			
			e = e.event ? e.event : e;
			
			var eo = e.originalEvent || e,
				wheelDelta = eo.wheelDelta;
			
			this.boundRadiusMod -= wheelDelta * ( this.options.boundRadiusModSpeed / this.boundRadiusPct );
			
		}
	}
	
	function zoom_update() {
		
		this.boundRadiusMod = _MathHelper.clamp( this.boundRadiusMod, this.options.boundRadiusModMin / this.boundRadiusPct, this.options.boundRadiusModMax / this.boundRadiusPct );
		this.positionMove.z = this.boundRadius * this.boundRadiusMod;
		
		this.positionBaseTarget.set( this.options.positionBaseX, this.options.positionBaseY, this.options.positionBaseZ );
		this.positionBase.lerpSelf( this.positionBaseTarget, this.options.positionBaseSpeed );
		
		this.positionOffsetTarget.add( this.positionBase, this.positionMove );
		
		this.positionOffset.lerpSelf( this.positionOffsetTarget, this.targetNew === true ? this.options.positionOffsetSpeedWhenNew : this.options.positionOffsetSpeed );
		
		
	}
	
	/*===================================================
	
	update
	
	=====================================================*/
	
	function update () {
		
		var target = this._target,
			scale,
			rigidBody,
			distance,
			distanceDiff,
			distanceSpeedMod,
			distanceSpeedPctAlphaGrow,
			distanceSpeedPctAlphaShrink,
			qToNew,
			positionOffsetScaled = this.utilVec31Update,
			rotationTargetNew = this.utilQ32Update,
			cameraLerpDelta = this.cameraLerpDelta;
		
		if ( this.enabled === true ) {
			
			// first time target is new
			
			if ( this.targetNew !== true && this.targetTransitioned !== true  ) {
				
				this.targetNew = true;
				this.distanceSpeedPctWhenNew = 0;
				this.cameraLerpDeltaWhenNew = 0;
				
			}
			
			// handle target
			
			if ( target instanceof THREE.Object3D !== true ) {
				
				positionOffsetScaled.copy( this.positionOffset );
				
			}
			else {
				
				rigidBody = target.rigidBody;
				scale = Math.max( target.scale.x, target.scale.y, target.scale.z );
				positionOffsetScaled.copy( this.positionOffset ).multiplyScalar( scale );
				
				/*
				// make sure camera and target parents are same
				
				if ( this.camera.parent !== target.parent ) {
					
					target.parent.add( this.camera );
					
				}
				*/
				
				// get distance to target position
				
				distance = _VectorHelper.distance_to( this.position, target.position );
				
				if ( this.targetNew === true && distance - this.options.distanceThresholdMin <= this.distanceThresholdMax ) {
					
					this.targetNew = false;
					this.targetTransitioned = true;
					this.distanceThresholdPassed = true;
					
				}
				
				// handle distance
				
				if ( distance > this.options.distanceThresholdMin ) {
					
					// update threshold max based on position offset
					
					this.distanceThresholdMax = positionOffsetScaled.length() * this.options.distanceThresholdPct;
					
					// if greater than max threshold, move with target at max distance
					
					if ( this.targetNew !== true && distance - this.options.distanceThresholdMin > this.distanceThresholdMax ) {
						
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
							
							this.distanceSpeedPct += ( this.options.distanceSpeedPctMin - this.distanceSpeedPct ) * this.options.distanceSpeedPctAlphaShrink;
							
						}
						else {
							
							if ( this.targetNew === true ) {
								
								distanceSpeedPctAlphaGrow = this.distanceSpeedPctWhenNew;
								this.distanceSpeedPctWhenNew = Math.min( this.options.distanceSpeedPctAlphaGrow, this.distanceSpeedPctWhenNew + this.options.distanceSpeedPctWhenNewGrow );
								
							}
							else {
								
								distanceSpeedPctAlphaGrow = this.options.distanceSpeedPctAlphaGrow;
								
							}
							
							this.distanceSpeedPct += ( this.options.distanceSpeedPctMax - this.distanceSpeedPct ) * distanceSpeedPctAlphaGrow;
							
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
				
				// get camera target rotation
				
				rotationTargetNew.copy( target.quaternion );
				
				if ( target && target.facing instanceof THREE.Quaternion ) {
					
					var antiFacing= new THREE.Quaternion().copy( target.facing ).inverse();
					rotationTargetNew.multiplySelf( antiFacing );
					
				}
				
			}
			
			// update
			
			rotate_update.call( this );
			zoom_update.call( this );
			
			// lerp camera rotation to target
			
			if ( this.targetNew === true ) {
				
				cameraLerpDelta = this.cameraLerpDeltaWhenNew;
				this.cameraLerpDeltaWhenNew = Math.min( this.cameraLerpDelta, this.cameraLerpDeltaWhenNew + ( this.cameraLerpDelta - this.cameraLerpDeltaWhenNew ) * this.options.cameraLerpDeltaWhenNewGrow );
				
			}
			
			this.rotationTarget.slerpSelf( rotationTargetNew, cameraLerpDelta );
			
			this.rotationCamera.copy( this.rotationTarget ).multiplySelf( this.rotationOffset );
			
			this.camera.quaternion.copy( this.rotationCamera );
			
			// adjust position
			
			this.camera.quaternion.multiplyVector3( positionOffsetScaled );
			
			// apply position
			
			this.camera.position.copy( this.position ).addSelf( positionOffsetScaled );
			
		}
		
	}
	
} ( KAIOPUA ) );