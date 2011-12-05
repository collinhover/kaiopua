/*
World.js
World module, handles world in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		world = core.world = core.world || {},
		env = game.env = game.env || {},
		ready = false,
		assets,
		objectmaker,
		scene,
		skybox,
		ambientLight,
		sunLight,
		fog,
		body,
		head,
		tail,
		water,
		parts = [],
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
			
			// initialization
			
			init_world_base();
			
			init_environment();
			
			ready = true;
			
		}
			
	}
	
	function init_world_base () {
		
		// skybox
		
		skybox = objectmaker.make_skybox( "assets/textures/skybox_world" );
		
		// lights
		
		ambientLight = new THREE.AmbientLight( 0x999999 );
		
		sunLight = new THREE.PointLight( 0xffffcc, 1, 10000 );
		sunLight.position.set( 0, 6000, 0 );
		
		parts.push( ambientLight, sunLight );
		
		// fog
		
		fog = null;//new THREE.Fog( 0x226fb3, 1, 10000 );
		
		// test materials
		
		var shadowTestMat = new THREE.MeshLambertMaterial( { ambient: 0x333333, color: 0xffdd99, shading: THREE.SmoothShading }  );
		//THREE.ColorUtils.adjustHSV( shadowTestMat.color, 0, 0, 0.9 );
		//shadowTestMat.ambient = shadowTestMat.color;
		
		// body parts
        
        head = objectmaker.make_model({
            geometry: assets["assets/models/World_Head.js"],
			rigidBodyInfo: {
				bodyType: 'trimesh'
			},
			materials: shadowTestMat,//normalMat,//
			shading: THREE.SmoothShading,//THREE.FlatShading, //
			targetable: false,
			interactive: false
        });
		
		tail = objectmaker.make_model({
            geometry: assets["assets/models/World_Tail.js"],
			rigidBodyInfo: {
				bodyType: 'trimesh'
			},
			materials: shadowTestMat,//normalMat,//
			shading: THREE.SmoothShading,//THREE.FlatShading, //
			targetable: false,
			interactive: false
        });
		
		head.mesh.quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI * 0.4 );
		tail.mesh.quaternion.copy( head.mesh.quaternion ); 
		
		parts.push( head, tail );
		
	}
	
	function init_environment () {
		
		// environment objects
		
		// hill for hut
		
		var hutHill = objectmaker.make_model({
            geometry: assets["assets/models/Hut_Hill.js"],
			rigidBodyInfo: {
				bodyType: 'trimesh'
			},
			materials: new THREE.MeshNormalMaterial(),//shadowTestMat,//
			shading: THREE.SmoothShading,//THREE.FlatShading, //
			targetable: false,
			interactive: false
        });
		
		hutHill.mesh.position.set( 0, 1590, 0 );
		
		parts.push( hutHill );
		
		// steps
		
		var steps = objectmaker.make_model({
            geometry: assets["assets/models/Hut_Steps.js"],
			rigidBodyInfo: {
				bodyType: 'trimesh'
			},
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading,
        });
		
		steps.mesh.position.set( -10, 1860, 130 );
		
		parts.push( steps );
		
		// hut
		
		var hut = objectmaker.make_model({
            geometry: assets["assets/models/Hut.js"],
			rigidBodyInfo: {
				bodyType: 'trimesh'
			},
			materials: new THREE.MeshNormalMaterial(),//shadowTestMat,//
			shading: THREE.FlatShading
        });
		
		hut.mesh.position.set( 0, 1925, 0 );
		
		parts.push( hut );
		
		// bed
		
		var bed = objectmaker.make_model({
            geometry: assets["assets/models/Bed.js"],
			rigidBodyInfo: {
				bodyType: 'box'
			},
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.FlatShading
        });
		
		bed.mesh.position.set( 0, 1930, 0 );
		
		parts.push( bed );
		
		// banana leaf door
		
		var bananaLeafDoor = objectmaker.make_model({
            geometry: assets["assets/models/Banana_Leaf_Door.js"],
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading,
			doubleSided: true,
			rotation: new THREE.Vector3( 0, 0, 5 )
        });
		
		bananaLeafDoor.mesh.position.set( -10, 2070, 100 );
		
		parts.push( bananaLeafDoor );
		
		// surfboard
		
		var surfboard = objectmaker.make_model({
            geometry: assets["assets/models/Surfboard.js"],
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading,
			rigidBodyInfo: {
				bodyType: 'box'
			}
        });
		
		surfboard.mesh.position.set( 110, 1860, 110 );
		
		parts.push( surfboard );
		
		// palm tree
		
		var palmTree = objectmaker.make_model({
            geometry: assets["assets/models/Palm_Tree.js"],
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading,
			rigidBodyInfo: {
				bodyType: 'trimesh'
			}
        });
		
		palmTree.mesh.position.set( 180, 1850, 25 );
		
		parts.push( palmTree );
		
		// taro plants
		
		var taroPlant1 = objectmaker.make_model({
            geometry: assets["assets/models/Taro_Plant.js"],
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading
        });
		
		taroPlant1.mesh.position.set( -170, 1850, 130 );
		
		parts.push( taroPlant1 );
		
		var taroPlant2 = objectmaker.make_model({
            geometry: assets["assets/models/Taro_Plant.js"],
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading,
			rotation: new THREE.Vector3(0, -45, 0)
        });
		
		taroPlant2.mesh.position.set( -190, 1835, 105 );
		
		parts.push( taroPlant2 );
		
		// water
		
		water = env.water.make_water_env();
		
		parts.push( water.container );
		
	}
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
	function show () {
		
		scene = game.scene;
		
        // fog
        
        scene.fog = fog;
		
		// add parts
		
		game.add_to_scene( parts, scene );
		
		// add skybox
		
		game.add_to_scene( skybox, game.sceneBG );
		
		// start water
		
		water.waves.model.morphs.play( 'waves', { duration: 5000, loop: true } );
		
	}
	
	function hide () {
		
		game.remove_from_scene( parts, scene );
		
		game.remove_from_scene( skybox, game.sceneBG );
		
		water.waves.model.morphs.stop('waves');
		
	}
	
	function update ( timeDelta ) {
		
		
		
	}
	
	return main;
	
}(KAIOPUA || {}));