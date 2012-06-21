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
		assetPath = "assets/modules/core/Scene.js",
		_Scene = {},
		_SceneHelper,
		_Octree,
		_Model,
		_Physics,
		_RigidBody;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _Scene,
		requirements: [
			"assets/modules/utils/SceneHelper.js",
			"assets/modules/core/Octree.js",
			"assets/modules/core/Model.js",
			'assets/modules/physics/Physics.js',
			'assets/modules/physics/RigidBody.js'
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( sh, oc, mdl, physx, rb ) {
		console.log('internal scene', _Scene);
		
		// utility
		
		_SceneHelper = sh;
		_Octree = oc;
		_Model = mdl;
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
		
		// octree
		
		this.octree = new _Octree.Instance( /*{ scene: this }*/ );
		
		// physics
		
		this.physics = new _Physics.Instance();
		
	}
	
	/*===================================================
    
    add
    
    =====================================================*/
	
	function __addObject ( object ) {
		
		// proto
		
		_Scene.Instance.prototype.supr.__addObject.call( this, object );
		
		// if object is model
		
		if ( object instanceof _Model.Instance ) {
			
			// octree
			
			if ( object.addWorldOctree === true ) {
				
				this.octree.add( object, object.useFaces );
				
			}
			
			// physics
			
			if ( object.rigidBody instanceof _RigidBody.Instance ) {
				
				this.physics.add( object );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    remove
    
    =====================================================*/
	
	function __removeObject ( object ) {
		
		// proto
		
		_Scene.Instance.prototype.supr.__removeObject.call( this, object );
		
		// if object is model
		
		if ( object instanceof _Model.Instance ) {
			
			// stop morphs
			
			if ( typeof object.morphs !== 'undefined' ) {
				
				object.morphs.stop();
				
			}
			
			// octree
			
			if ( object.addWorldOctree === true ) {
				
				this.octree.remove( object );
				
			}
			
			// physics
			
			if ( object.rigidBody instanceof _RigidBody.Instance ) {
				
				this.physics.remove( object );
				
			}
			
		}
		
	}
	
} (KAIOPUA) );