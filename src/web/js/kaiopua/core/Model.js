/*
 *
 * Model.js
 * Adds additional functionality to basic Mesh.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */

(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/core/Model.js",
		_Model = {},
		_Morphs,
		_RigidBody,
		_SceneHelper,
		_ObjectHelper,
		objectCount = 0;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _Model,
		requirements: [
			"js/kaiopua/core/Morphs.js",
			"js/kaiopua/physics/RigidBody.js",
			"js/kaiopua/utils/SceneHelper.js",
			"js/kaiopua/utils/ObjectHelper.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, rb, sh, oh ) {
		console.log('internal model', _Model);
		_Morphs = m;
		_RigidBody = rb;
		_SceneHelper = sh;
		_ObjectHelper = oh;
		
		// properties
		
		_Model.options = {
			interactive: false,
			dynamic: false,
			intersectable: true,
			morphs: {
				duration: 1000
			}
		};
		
		// instance
		
		_Model.Instance = Model;
		_Model.Instance.prototype = new THREE.Mesh();
		_Model.Instance.prototype.constructor = _Model.Instance;
		_Model.Instance.prototype.clone = clone;
		
		_Model.Instance.prototype.set_intersectable = set_intersectable;
		
		Object.defineProperty( _Model.Instance.prototype, 'interactive', { 
			get : function () { return this.options.interactive; }
		} );
		
		Object.defineProperty( _Model.Instance.prototype, 'dynamic', { 
			get : function () { return this.options.dynamic || ( this.rigidBody && this.rigidBody.dynamic ); }
		} );
		
		Object.defineProperty( _Model.Instance.prototype, 'intersectable', { 
			get : function () { return this.options.intersectable; }
		} );
		
		Object.defineProperty( _Model.Instance.prototype, 'gravityBody', { 
			get : function () { return this.rigidBody ? this.rigidBody.gravityBody : false; }
		} );
		
		Object.defineProperty( _Model.Instance.prototype, 'geometry', { 
			get : function () { return this._geometry; },
			set : function ( geometry ) {
				
				var i, l;
				
				if ( geometry instanceof THREE.Geometry && this._geometry !== geometry ) {
					
					// clear morphs
					
					if ( this.morphs instanceof _Morphs.Instance ) {
						
						this.morphs.clear_all();
						
					}
					
					// store
					
					this._geometry = geometry;

					// calc bound radius

					if( ! this._geometry.boundingSphere ) {

						this._geometry.computeBoundingSphere();

					}

					this.boundRadius = this._geometry.boundingSphere.radius;

					// setup morph targets

					if( this._geometry.morphTargets.length ) {

						this.morphTargetBase = -1;
						this.morphTargetForcedOrder = [];
						this.morphTargetInfluences = [];
						this.morphTargetDictionary = {};
						
						for( i = 0, l = this._geometry.morphTargets.length; i < l; i++ ) {

							this.morphTargetInfluences.push( 0 );
							this.morphTargetDictionary[ this._geometry.morphTargets[ i ].name ] = i;

						}

					}
					
					// re-create morphs handler
					
					this.morphs = new _Morphs.Instance( this, this.options.morphs );
					
				}
				
			}
			
		} );
		
	}
	
	/*===================================================
	
	model
	
	=====================================================*/
	
	function Model ( parameters ) {
		
		var i, l,
			geometry,
			materials,
			material,
			materialToModify,
			rotation,
			position;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// id
		
		this.id = objectCount++;
		
		this.options = $.extend( true, this.options || {}, _Model.options, parameters.options );
		
		// geometry
		
		if ( parameters.geometry instanceof THREE.Geometry ) {
			
			geometry = parameters.geometry;
			
		}
		else if ( typeof parameters.geometry === 'string' ) {
			
			geometry = main.get_asset_data( parameters.geometry );
			
		}
		else {
			
			geometry = new THREE.Geometry();
			
		}
		
		// materials
		
		material = main.ensure_not_array( parameters.material || new THREE.MeshLambertMaterial( { vertexColors: THREE.VertexColors, shading: THREE.SmoothShading } ) );
		
		materials = [ material ];
		
		// if has geometry materials
		
		if ( geometry.materials && geometry.materials.length > 0 ) {
			
			// add to all
			
			for ( i = 0, l = geometry.materials.length; i < l; i ++) {
				
				materials.push( geometry.materials[ i ] );
				
			}
			
		}
		
		// material properties
		
		for ( i = 0, l = materials.length; i < l; i ++) {
			
			materialToModify = materials[i];
			
			// morph targets
			if ( materialToModify.hasOwnProperty( 'morphTargets' ) ) {
				
				materialToModify.morphTargets = geometry.morphTargets && geometry.morphTargets.length > 0 ? true : false;
				
			}
			
			// shading
			// (1 = flat, 2 = smooth )
			if ( parameters.hasOwnProperty( 'shading' ) ) {
				
				materialToModify.shading = parameters.shading;
			
			}
			
			// side
			
			if ( parameters.hasOwnProperty( 'side' ) ) {
				
				materialToModify.side = parameters.side;
				
			}
			else if ( parameters.doubleSided === true ) {
				
				materialToModify.side = THREE.DoubleSide;
				
			}
			else if ( parameters.flipSided === true ) {
				
				materialToModify.side = THREE.BackSide;
				
			}
			
		}
		
		// call prototype constructor
		
		THREE.Mesh.call( this, geometry, material );
		
		// force use quaternion
		
		this.useQuaternion = true;
		
		// rotation
		
		if ( parameters.hasOwnProperty('rotation') ) {
			
			rotation = parameters.rotation;
			
			// quaternion
			if ( rotation instanceof THREE.Quaternion ) {
				
				this.quaternion.copy( rotation );
				
			}
			// vector
			else if ( rotation instanceof THREE.Vector3 ) {
				
				this.quaternion.setFromEuler( rotation );
				
			}
			// matrix
			else if ( rotation instanceof THREE.Matrix4 ) {
				
				this.quaternion.setFromRotationMatrix( rotation );
				
			}
			
		}
		
		// position
		
		if ( parameters.hasOwnProperty('position') && parameters.position instanceof THREE.Vector3 ) {
			
			position = parameters.position;
			
			this.position.copy( position );
			
		}
		
		// boolean properties
		
		this.castShadow = typeof parameters.castShadow === 'boolean' ? parameters.castShadow : false;
		this.receiveShadow = typeof parameters.receiveShadow === 'boolean' ? parameters.receiveShadow : false;
		
		// adjustments
		
		if ( parameters.center === true ) {
			
			_ObjectHelper.center( this );
			
		}
		
		if ( parameters.centerRotation === true ) {
			
			_ObjectHelper.center_rotation( this );
			
		}
		
		if ( parameters.normalizeFaces === true ) {
			
			_ObjectHelper.normalize_faces( this );
			
		}
		
		// physics
		
		if ( parameters.hasOwnProperty( 'physics' ) ) {
			
			this.rigidBody = new _RigidBody.Instance( this, parameters.physics );
			
		}
		
	}
	
	/*===================================================
	
	clone
	
	=====================================================*/
	
	function clone ( c ) {
		
		var i, l,
			geometry = this.geometry,
			material = this.material,
			children = this.children,
			child,
			cChild;
		
		if ( typeof c === 'undefined' ) {
			
			c = new _Model.Instance();
			
		}
		
		if ( c instanceof _Model.Instance ) {
			
			c.options = $.extend( true, {}, this.options );
			
			// geometry
			
			c.geometry = _ObjectHelper.clone_geometry( geometry );
			
			// material
			
			c.material = material.clone();
			
			// three properties
			
			c.name = this.name;
			
			c.parent = this.parent;
			
			c.up.copy( this.up );
			
			c.position.copy( this.position );
			
			if ( c.rotation instanceof THREE.Vector3 ) {
				
				c.rotation.copy( this.rotation );
				
			}
			
			c.eulerOrder = this.eulerOrder;
			
			c.scale.copy( this.scale );
			
			c.dynamic = this.dynamic;
			
			c.renderDepth = this.renderDepth;
			
			c.rotationAutoUpdate = this.rotationAutoUpdate;
			
			c.matrix.copy( this.matrix );
			c.matrixWorld.copy( this.matrixWorld );
			c.matrixRotationWorld.copy( this.matrixRotationWorld );
			
			c.matrixAutoUpdate = this.matrixAutoUpdate;
			c.matrixWorldNeedsUpdate = this.matrixWorldNeedsUpdate;
			
			c.quaternion.copy( this.quaternion );
			c.useQuaternion = this.useQuaternion;
			
			c.boundRadius = this.boundRadius;
			c.boundRadiusScale = this.boundRadiusScale;
			
			c.visible = this.visible;
			
			c.castShadow = this.castShadow;
			c.receiveShadow = this.receiveShadow;
			
			c.frustumCulled = this.frustumCulled;
			
			if ( this.hasOwnProperty( 'rigidBody' ) ) {
				
				c.rigidBody = this.rigidBody.clone( c );
				
			}
			
			// children
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				child = children[ i ];
				
				if ( child instanceof _Model.Instance ) {
					
					cChild = child.clone();
					
				}
				else if ( child instanceof THREE.Object3D ) {
					
					cChild = THREE.SceneUtils.cloneObject( child );
					
				}
				
				c.add( cChild );
				
			}
			
		}
		
		return c;
		
	}
	
	/*===================================================
	
	intersectable
	
	=====================================================*/
	
	function set_intersectable ( intersectable, cascade ) {
		
		var i, l,
			intersectablePrev = this.options.intersectable,
			child,
			parent;
		
		// when in scene, remove from parent and add again to account for intersectable change
		
		if( intersectablePrev !== intersectable ) {
			
			parent = this.parent;
			
			if ( parent instanceof THREE.Object3D ) {
				
				parent.remove( this );
				
			}
			
		}
		
		// modify value
		
		this.options.intersectable = intersectable;
		
		if ( cascade === true ) {
			
			// get all descendants first, as not all may be instanceof Model
			
			children = _SceneHelper.extract_children_from_objects( this );
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				child = this.children[ i ];
				
				if ( child instanceof Model ) {
					
					child.options.intersectable = intersectable;
					
				}
				else {
					
					child.intersectable = intersectable;
					
				}
				
			}
			
		}
		
		// add back again if removed
		
		if ( parent instanceof THREE.Object3D ) {
			
			parent.add( this );
		
		}
		
	}
    
} ( KAIOPUA ) );