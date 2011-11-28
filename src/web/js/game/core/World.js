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
		
		// test materials
		
		var normalMat = new THREE.MeshNormalMaterial();
		
		var normalMatWire = new THREE.MeshBasicMaterial({
			color: 0x000000,
			wireframe: true
		});
		
		var stmatColor = 0xffdd99;
		var shadowTestMat = new THREE.MeshLambertMaterial( { ambient: stmatColor, color: stmatColor, shading: THREE.SmoothShading }  );
		THREE.ColorUtils.adjustHSV( shadowTestMat.color, 0, 0, 0.9 );
		shadowTestMat.ambient = shadowTestMat.color;
		
		// body parts
        
        head = objectmaker.make_model({
            geometry: assets["assets/models/World_Head.js"],
			materials: shadowTestMat,//normalMat,//
			shading: THREE.FlatShading, //THREE.SmoothShading,
			receiveShadow: true
        });
		
		tail = objectmaker.make_model({
            geometry: assets["assets/models/World_Tail.js"],
			materials: shadowTestMat,//normalMat,//
			shading: THREE.FlatShading, //THREE.SmoothShading,
			receiveShadow: true
        });
		
		// rotate
		
		head.mesh.quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI * 0.4 );
		tail.mesh.quaternion.copy( head.mesh.quaternion );
		
		// store
		
		parts = [ head, tail ];
		
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
		
		scene = game.scene;
		
        // fog
        
        scene.fog = new THREE.Fog( 0xffffff, -100, 10000 );
		
		// add parts
		
		game.add_to_scene( parts, scene );
		
	}
	
	function hide () {
		
		game.remove_from_scene( parts, scene );
		
	}
	
	return main;
	
}(KAIOPUA || {}));