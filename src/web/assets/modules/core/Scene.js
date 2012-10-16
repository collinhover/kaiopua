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
			"assets/modules/utils/SceneHelper.js",
			"assets/modules/core/Model.js",
			'assets/modules/core/Morphs.js',
			'assets/modules/physics/Physics.js',
			'assets/modules/physics/RigidBody.js'
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( sh, mdl, mph, physx, rb ) {
		console.log('internal scene', _Scene);
		
		// utility
		
		_SceneHelper = sh;
		_Model = mdl;
		_Morphs = mph;
		_Physics = physx;
		_RigidBody = rb;
		
		// instance
		
		_Scene.Instance = Scene;
		_Scene.Instance.prototype = new THREE.Scene();
		_Scene.Instance.prototype.constructor = _Scene.Instance;
		_Scene.Instance.prototype.supr = THREE.Scene.prototype;
		
		_Scene.Instance.prototype.add_interactive = add_interactive;
		_Scene.Instance.prototype.remove_interactive = remove_interactive;
		
		_Scene.Instance.prototype.__addObject = __addObject;
		_Scene.Instance.prototype.__removeObject = __removeObject;
		
		Object.defineProperty( _Model.Instance.prototype, 'interactivesStatic', { 
			get : function () { return this.interactivesOctree.objects; }
		} );
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Scene ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// proto
		
		THREE.Scene.call( this );
		
		// targets
		
		this.interactivesDynamic = [];
		this.interactivesOctree = new THREE.Octree();
		
		// physics
		
		this.physics = new _Physics.Instance();
		
	}
	
	/*===================================================
    
    add
    
    =====================================================*/
	
	function __addObject ( object ) {
		
		_Scene.Instance.prototype.supr.__addObject.call( this, object );
		
		this.add_interactive( object );
		
		if ( object.rigidBody instanceof _RigidBody.Instance ) {
			
			this.physics.add( object );
			
		}
		
	}
	
	/*===================================================
    
    remove
    
    =====================================================*/
	
	function __removeObject ( object ) {
		
		_Scene.Instance.prototype.supr.__removeObject.call( this, object );
		
		if ( object.morphs instanceof _Morphs.Instance ) {
			
			object.morphs.stop_all();
			
		}
		
		this.remove_interactive( object );
		
		if ( object.rigidBody instanceof _RigidBody.Instance ) {
			
			this.physics.remove( object );
			
		}
		
	}
	
	/*===================================================
    
    targets
    
    =====================================================*/
	
	function add_interactive ( object ) {
		
		if ( object.interactive === true ) {
			
			if ( object.rigidBody instanceof _RigidBody.Instance !== true || object.rigidBody.dynamic !== true ) {
				
				this.interactivesOctree.add( object );
				
			}
			else {
				
				main.array_cautious_add( this.interactivesDynamic, object );
				
			}
			
		}
	
	}
	
	function remove_interactive ( object ) {
		
		if ( object.interactive === true ) {
			
			if ( object.rigidBody instanceof _RigidBody.Instance !== true || object.rigidBody.dynamic !== true ) {
				
				this.interactivesOctree.remove( object );
				
			}
			else {
				
				main.array_cautious_remove( this.interactivesDynamic, object );
				
			}
			
		}
		
	}
	
} (KAIOPUA) );