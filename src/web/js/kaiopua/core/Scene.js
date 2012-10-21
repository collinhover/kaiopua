/*
 *
 * Scene.js
 * Extends basic scene with additional functionality.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/core/Scene.js",
		_Scene = {},
		_Model,
		_Morphs,
		_Physics,
		_RigidBody;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _Scene,
		requirements: [
			"js/kaiopua/core/Model.js",
			'js/kaiopua/core/Morphs.js',
			'js/kaiopua/physics/Physics.js',
			'js/kaiopua/physics/RigidBody.js'
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( mdl, mph, physx, rb ) {
		console.log('internal scene', _Scene);
		
		// utility
		
		_Model = mdl;
		_Morphs = mph;
		_Physics = physx;
		_RigidBody = rb;
		
		// instance
		
		_Scene.Instance = Scene;
		_Scene.Instance.prototype = new THREE.Scene();
		_Scene.Instance.prototype.constructor = _Scene.Instance;
		_Scene.Instance.prototype.supr = THREE.Scene.prototype;
		
		_Scene.Instance.prototype.__addObject = __addObject;
		_Scene.Instance.prototype.__removeObject = __removeObject;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Scene ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// proto
		
		THREE.Scene.call( this );
		
		// properties
		
		this.dynamics = [];
		this.octree = new THREE.Octree();
		this.physics = new _Physics.Instance();
		
	}
	
	/*===================================================
    
    add
    
    =====================================================*/
	
	function __addObject ( object ) {
		
		var objectsCount = this.__objects.length;
		
		_Scene.Instance.prototype.supr.__addObject.call( this, object );
		
		// when object actually added
		
		if ( this.__objects.length !== objectsCount && object instanceof _Model.Instance ) {
			
			if ( object.intersectable === true ) {
				
				if ( object.dynamic !== true ) {
					
					this.octree.add( object, true );
					
				}
				else {
					
					main.array_cautious_add( this.dynamics, object );
					
				}
				
				if ( object.rigidBody instanceof _RigidBody.Instance ) {
					
					this.physics.add( object );
					
				}
				
			}
			
		}
		
	}
	
	/*===================================================
    
    remove
    
    =====================================================*/
	
	function __removeObject ( object ) {
		
		var objectsCount = this.__objects.length;
		
		_Scene.Instance.prototype.supr.__removeObject.call( this, object );
		
		// when object actually removed
		
		if ( this.__objects.length !== objectsCount && object instanceof _Model.Instance ) {
			
			if ( object.morphs instanceof _Morphs.Instance ) {
				
				object.morphs.stop_all();
				
			}
			
			if ( object.intersectable === true ) {
				
				if ( object.dynamic !== true ) {
					
					this.octree.remove( object );
					
				}
				else {
					
					main.array_cautious_remove( this.dynamics, object );
					
				}
				
				if ( object.rigidBody instanceof _RigidBody.Instance ) {
					
					this.physics.remove( object );
					
				}
				
			}
			
		}
		
	}
	
} (KAIOPUA) );