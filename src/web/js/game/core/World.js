/*
World.js
World module, handles world in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		world = core.world = core.world || {},
		ready = false,
		assets,
		objectmaker,
		physics,
		scene,
		body,
		head,
		tail,
		parts,
		gravityMagnitude = 9.8;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	world.init = init;
	world.show = show;
	world.hide = hide;
	
	// getters and setters
	
	Object.defineProperty(world, 'gravityMagnitude', { 
		get : function () { return gravityMagnitude; }
	});
	
	Object.defineProperty(world, 'parts', { 
		get : function () { return parts; }
	});
	
	Object.defineProperty(world, 'head', { 
		get : function () { return head; }
	});
	
	Object.defineProperty(world, 'tail', { 
		get : function () { return tail; }
	});
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init () {
		
		if ( ready !== true ) {
		
			// assets
			
			assets = main.utils.loader.assets;
			
			// workers
			
			objectmaker = game.workers.objectmaker;
			
			// core
			
			physics = core.physics;
			
			// initialization
			
			init_environment();
			
			init_physics();
			
			ready = true;
			
		}
			
	}
	
	function init_environment () {
		
		var normalMat = new THREE.MeshNormalMaterial();
		
		var normalMatWire = new THREE.MeshBasicMaterial({
			color: 0x000000,
			wireframe: true
		});
		
		// body parts
        
        head = objectmaker.make_model({
            geometry: assets["assets/models/World_Head.js"],
			materials: [normalMat, normalMatWire],
			shading: THREE.FlatShading
        });
		
		tail = objectmaker.make_model({
            geometry: assets["assets/models/World_Tail.js"],
			materials: [normalMat, normalMatWire],
			shading: THREE.FlatShading
        });
		
		// store
		
		parts = [head, tail];
		
	}
	
	function init_physics () {
		
		// translate model to physics
		
		head.rigidBody = physics.translate( head.mesh, {
			bodyType: 'trimesh',
			geometry: head.mesh.geometry
		});
		
		tail.rigidBody = physics.translate( tail.mesh, {
			bodyType: 'trimesh',
			geometry: tail.mesh.geometry
		});
		
	}
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
	function show () {
		
		var i, l,
			part;
		
		scene = game.scene;
		
        // fog
        
        scene.fog = new THREE.Fog( 0xffffff, -100, 10000 );
		
		// add parts
		
		for ( i = 0, l = parts.length; i < l; i += 1 ) {
			
			part = parts[ i ];
			
			scene.add( part.mesh );
			
			if ( typeof part.rigidBody !== 'undefined' ) {
				
				physics.add( part.mesh, { rigidBody: part.rigidBody } );
				
			}
			
		}
		
	}
	
	function hide () {
		
		var i, l,
			part;
		
		// remove parts
		
		for ( i = 0, l = parts.length; i < l; i += 1 ) {
			
			part = parts[ i ];
			
			scene.remove( part.mesh );
			
			if ( typeof part.rigidBody !== 'undefined' ) {
				
				physics.remove( part.mesh );
				
			}
			
		}
		
	}
	
	return main;
	
}(KAIOPUA || {}));