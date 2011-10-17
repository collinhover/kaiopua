/*
World.js
World module, handles world in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		world = core.world = core.world || {},
		assets,
		objectmaker,
		physics,
		scene,
		ambientLight,
		body,
		head,
		head_collision_model,
		tail,
		tail_collision_model,
		gravityMagnitude = 100;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	world.init = init;
	world.get_scene = function () { return game.get_scene(); };
	world.get_head = function () { return head; };
	world.get_tail = function () { return tail; };
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init () {
		
		// assets
		
		assets = main.utils.loader.assets;
		
		// workers
		
		objectmaker = game.workers.objectmaker;
		
		// core
		
		physics = core.physics;
		
		// initialization
		
		init_basics();
		
		init_environment();
		
		init_physics();
		
	}
	
	function init_basics () {
		
		// scene
		
		scene = game.scene;
        
        // fog
        
        scene.fog = new THREE.Fog( 0xffffff, -100, 10000 );
		
	}
	
	function init_environment () {
		
		// body parts
        
        head = objectmaker.make_model({
            geometry: assets["assets/models/World_Head.js"],
			shading: THREE.FlatShading
        });
		
		tail = objectmaker.make_model({
            geometry: assets["assets/models/World_Tail.js"],
			shading: THREE.FlatShading
        });
		
		scene.add( head.mesh );
		scene.add( tail.mesh );
		
	}
	
	function init_physics () {
		
		// change gravity
		
		physics.set_gravity( 0, -gravityMagnitude, 0 );
		
		// init low poly models for physics collisions
		
		head_collision_model = objectmaker.make_model({
            geometry: assets["assets/models/World_Head_low.js"]
        });
		
		tail_collision_model = objectmaker.make_model({
            geometry: assets["assets/models/World_Tail_low.js"]
        });
		
		// add parts
		
		physics.add( head.mesh, {
			bodyType: 'trimesh',
			geometry: head_collision_model.mesh.geometry,
			position: head.mesh.position,
			rotation: head.mesh.quaternion
		});
		
		physics.add( tail.mesh, {
			bodyType: 'trimesh',
			geometry: tail_collision_model.mesh.geometry,
			position: tail.mesh.position,
			rotation: tail.mesh.quaternion
		});
		
	}
	
	return main;
	
}(KAIOPUA || {}));