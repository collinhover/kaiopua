/*
World.js
World module, handles world in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/World",
		world = {},
        game,
		model,
		objectmaker,
		water,
		ready = false,
		scene,
		skybox,
		ambientLight,
		sunLight,
		fog,
		body,
		head,
		tail,
		waterPlane,
		parts = [],
		gravityMagnitude = 9.8;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
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
	
	world = main.asset_register( assetPath, world, true );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	main.assets_require( [
		"assets/modules/core/Game",
		"assets/modules/core/Model",
		"assets/modules/utils/ObjectMaker",
		"assets/modules/env/Water"
	], init_internal, true );
	
	function init_internal ( g, m, om, w ) {
		console.log('internal world');
		if ( ready !== true ) {
			
			// assets
			
			game = g;
			model = m;
			objectmaker = om;
			water = w;
			
			init_world_base();
			
			init_environment();
			
			ready = true;
			
			main.asset_ready( assetPath );
			
		}
		
	}
	
	function init_world_base () {
		
		// skybox
		
		skybox = objectmaker.make_skybox( "assets/textures/skybox_world" );
		
		// lights
		
		ambientLight = new THREE.AmbientLight( 0x999999 );
		
		sunLight = new THREE.PointLight( 0xffffcc, 1.5, 10000 );
		sunLight.position.set( 0, 6000, 0 );
		
		parts.push( ambientLight, sunLight );
		
		// fog
		
		fog = null;//new THREE.Fog( 0x226fb3, 1, 10000 );
		
		// body parts
		
        head = model.instantiate({
            geometry: main.asset_data("assets/models/World_Head.js"),
			physicsParameters: {
				bodyType: 'trimesh'
			},
			materials: new THREE.MeshLambertMaterial( { ambient: 0x333333, color: 0xffdd99, shading: THREE.SmoothShading }  ),
			shading: THREE.SmoothShading,//THREE.FlatShading, //
			targetable: false,
			interactive: false
        });
		
		tail = model.instantiate({
            geometry: main.asset_data("assets/models/World_Tail.js"),
			physicsParameters: {
				bodyType: 'trimesh'
			},
			materials: new THREE.MeshLambertMaterial( { ambient: 0x333333, color: 0xffdd99, shading: THREE.SmoothShading }  ),//new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading,//THREE.FlatShading, //
			targetable: false,
			interactive: false
        });
		
		head.mesh.quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI * 0.4 );
		tail.mesh.quaternion.copy( head.mesh.quaternion ); 
		
		// water
		
		waterPlane = water.instantiate();
		
		// all parts
		
		parts.push( head, tail, waterPlane.container );
		
	}
	
	function init_environment () {
		
		// environment objects
		
		// hill for hut
		
		var hutHill = model.instantiate({
            geometry: main.asset_data("assets/models/Hut_Hill.js"),
			physicsParameters: {
				bodyType: 'trimesh'
			},
			materials: new THREE.MeshNormalMaterial(),//shadowTestMat,//
			shading: THREE.SmoothShading,//THREE.FlatShading, //
			targetable: false,
			interactive: false
        });
		
		var hhPos = new THREE.Vector3( 0, 1590, 0 );
		
		hutHill.mesh.position = hhPos;
		
		parts.push( hutHill );
		
		// steps
		
		var steps = model.instantiate({
            geometry: main.asset_data("assets/models/Hut_Steps.js"),
			physicsParameters: {
				bodyType: 'trimesh'
			},
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading,
        });
		
		steps.mesh.position.set( hhPos.x - 10, hhPos.y + 270, hhPos.z + 130 );
		//steps.mesh.position.set( -10, 270, 130 );
		
		parts.push( steps );
		//hutHill.mesh.add( steps.mesh );
		
		// hut
		
		var hut = model.instantiate({
            geometry: main.asset_data("assets/models/Hut.js"),
			physicsParameters: {
				bodyType: 'trimesh'
			},
			materials: new THREE.MeshNormalMaterial(),//shadowTestMat,//
			shading: THREE.FlatShading
        });
		
		hut.mesh.position.set( hhPos.x, hhPos.y + 335, hhPos.z );
		//hut.mesh.position.set( 0, 335, 0 );
		
		parts.push( hut );
		//hutHill.mesh.add( hut.mesh );
		
		// bed
		
		var bed = model.instantiate({
            geometry: main.asset_data("assets/models/Bed.js"),
			physicsParameters: {
				bodyType: 'box'
			},
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.FlatShading
        });
		
		bed.mesh.position.set( 0, 1930, 0 );
		
		parts.push( bed );
		
		// banana leaf door
		
		var bananaLeafDoor = model.instantiate({
            geometry: main.asset_data("assets/models/Banana_Leaf_Door.js"),
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading,
			doubleSided: true,
			rotation: new THREE.Vector3( 0, 0, 5 )
        });
		
		//bananaLeafDoor.mesh.position.set( -10, 2070, 100 );
		bananaLeafDoor.mesh.position.set( -10, 145, 100 );
		
		//parts.push( bananaLeafDoor );
		hut.mesh.add( bananaLeafDoor.mesh );
		
		// surfboard
		
		var surfboard = model.instantiate({
            geometry: main.asset_data("assets/models/Surfboard.js"),
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'box'
			}
        });
		
		surfboard.mesh.position.set( 110, 1860, 110 );
		
		parts.push( surfboard );
		
		// palm tree
		
		var palmTree = model.instantiate({
            geometry: main.asset_data("assets/models/Palm_Tree.js"),
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'trimesh'
			}
        });
		
		palmTree.mesh.position.set( 180, 1850, 25 );
		
		parts.push( palmTree );
		
		// taro plants
		
		var taroPlant1 = model.instantiate({
            geometry: main.asset_data("assets/models/Taro_Plant.js"),
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading
        });
		
		taroPlant1.mesh.position.set( -170, 1850, 130 );
		
		parts.push( taroPlant1 );
		
		var taroPlant2 = model.instantiate({
            geometry: main.asset_data("assets/models/Taro_Plant.js"),
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading,
			rotation: new THREE.Vector3(0, -45, 0)
        });
		
		taroPlant2.mesh.position.set( -190, 1835, 105 );
		
		parts.push( taroPlant2 );
		
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
		
		waterPlane.waves.model.morphs.play( 'waves', { duration: 5000, loop: true } );
		
		// start swim
		
		tail.morphs.play( 'swim', { duration: 5000, loop: true } );
		
	}
	
	function hide () {
		
		game.remove_from_scene( parts, scene );
		
		game.remove_from_scene( skybox, game.sceneBG );
		
		waterPlane.waves.model.morphs.stop('waves');
		
		tail.morphs.stop( 'swim' );
		
	}
	
	function update ( timeDelta ) {
		
		
		
	}
	
	return main;
	
}(KAIOPUA || {}));