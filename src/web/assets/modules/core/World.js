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
		physics,
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
		sunmoon,
		waterPlane,
		parts = {},
		addOnShow = [],
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
	
	world = main.asset_register( assetPath, world, true );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	main.assets_require( [
		"assets/modules/core/Game",
		"assets/modules/core/Model",
		"assets/modules/core/Physics",
		"assets/modules/utils/ObjectMaker",
		"assets/modules/env/Water"
	], init_internal, true );
	
	function init_internal ( g, m, p, om, w ) {
		console.log('internal world');
		if ( ready !== true ) {
			
			// assets
			
			game = g;
			model = m;
			physics = p;
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
		
		sunLight = new THREE.PointLight( 0xffffff, 1, 10000 );
		sunLight.position.set( 0, 6000, 1000 );
		
		addOnShow.push( ambientLight, sunLight );
		
		// fog
		
		fog = null;//new THREE.Fog( 0x226fb3, 1, 10000 );
		
		// body parts
		
        head = model.instantiate({
            geometry: main.asset_data("assets/models/World_Head.js"),
			physicsParameters: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { ambient: 0xffffff, color: 0xffdd99, shading: THREE.SmoothShading }  ),
			shading: THREE.SmoothShading//THREE.FlatShading
        });
		
		tail = model.instantiate({
            geometry: main.asset_data("assets/models/World_Tail.js"),
			physicsParameters: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { ambient: 0xffffff, color: 0xffdd99, shading: THREE.SmoothShading }  ),//new THREE.MeshNormalMaterial(),
			shading: THREE.SmoothShading//THREE.FlatShading
        });
		
		head.mesh.quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI * 0.4 );
		tail.mesh.quaternion.copy( head.mesh.quaternion ); 
		
		// water
		
		waterPlane = water.instantiate();
		
		// all parts
		
		addOnShow.push( head, tail, waterPlane.container );
		
	}
	
	function init_environment () {
		
		// environment objects
		
		init_sky();
		
		init_land();
		
	}
	
	/*===================================================
    
    sky
    
    =====================================================*/
	
	function init_sky () {
		
		// sun/moon
		
		sunmoon = model.instantiate({
            geometry: main.asset_data("assets/models/Sun_Moon.js"),
			materials: new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.NoShading, vertexColors: THREE.VertexColors } )
        });
		
		sunmoon.mesh.position.set( 0, 3000, 4000 );
		sunmoon.mesh.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI );
		
		physics.rotate_relative_to_source( sunmoon.mesh, head.mesh, shared.cardinalAxes.forward.clone().negate(), shared.cardinalAxes.up );
		
		addOnShow.push( sunmoon );
		
	}
	
	/*===================================================
    
    land
    
    =====================================================*/
	
	function init_land () {
		
		init_home();
		
		init_lava();
		
	}
	
	/*===================================================
    
    hut
    
    =====================================================*/
	
	function init_home () {
		
		var home = new THREE.Object3D();
		
		home.position.set( 500, 1590, 0 );
		
		home.useQuaternion = true;
		
		physics.rotate_relative_to_source( home, head.mesh, shared.cardinalAxes.up, shared.cardinalAxes.forward );
		
		addOnShow.push( home );
		
		// hill for home
		
		var hill = model.instantiate({
            geometry: main.asset_data("assets/models/Hut_Hill.js"),
			physicsParameters: {
				bodyType: 'mesh'
			},
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
        });
		
		addOnShow.push( { addTarget: hill, sceneTarget: home } );
		
		// steps
		
		var steps = model.instantiate({
            geometry: main.asset_data("assets/models/Hut_Steps.js"),
			physicsParameters: {
				bodyType: 'mesh'
			},
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
        });
		
		steps.mesh.position.set( -10, 270, 130 );
		
		addOnShow.push( { addTarget: steps, sceneTarget: home } );	
		
		// hut
		
		var hut = model.instantiate({
            geometry: main.asset_data("assets/models/Hut.js"),
			physicsParameters: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		hut.mesh.position.set( 0, 335, 0 );
		
		addOnShow.push( { addTarget: hut, sceneTarget: home } );		
		
		// bed
		
		var bed = model.instantiate({
            geometry: main.asset_data("assets/models/Bed.js"),
			physicsParameters: {
				bodyType: 'box'
			},
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.FlatShading
        });
		
		bed.mesh.position.set( 0, 340, 0 );
		
		addOnShow.push( { addTarget: bed, sceneTarget: home } );	
		
		// banana leaf door
		
		var bananaLeafDoor = model.instantiate({
            geometry: main.asset_data("assets/models/Banana_Leaf_Door.js"),
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			doubleSided: true,
			rotation: new THREE.Vector3( 0, 0, 5 )
        });
		
		bananaLeafDoor.mesh.position.set( -10, 145, 100 );
		
		addOnShow.push( { addTarget: bananaLeafDoor, sceneTarget: home } );	
		
		// surfboard
		
		var surfboard = model.instantiate({
            geometry: main.asset_data("assets/models/Surfboard.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'box'
			}
        });
		
		surfboard.mesh.position.set( 110, 320, 110 );
		
		addOnShow.push( { addTarget: surfboard, sceneTarget: home } );	
		
		// palm tree
		
		var palmTree = model.instantiate({
            geometry: main.asset_data("assets/models/Palm_Tree.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'mesh'
			}
        });
		
		palmTree.mesh.position.set( 180, 260, 25 );
		
		addOnShow.push( { addTarget: palmTree, sceneTarget: home } );	
		
		// taro plants
		
		var taroPlant1 = model.instantiate({
            geometry: main.asset_data("assets/models/Taro_Plant_001.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		taroPlant1.mesh.position.set( -170, 260, 130 );
		
		addOnShow.push( { addTarget: taroPlant1, sceneTarget: home } );
		
		var taroPlant2 = model.instantiate({
            geometry: main.asset_data("assets/models/Taro_Plant_001.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			rotation: new THREE.Vector3(0, -45, 0)
        });
		
		taroPlant2.mesh.position.set( -190, 245, 105 );
		
		addOnShow.push( { addTarget: taroPlant2, sceneTarget: home } );
		
	}
	
	/*===================================================
    
    lava
    
    =====================================================*/
	
	function init_lava () {
		
		// volcano
		
		var volcano = model.instantiate({
            geometry: main.asset_data("assets/models/Volcano.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'mesh'
			}
        });
		
		volcano.mesh.position.set( -810, 1182, 12 );
		
		var volcanoPos = volcano.mesh.position;
		
		physics.rotate_relative_to_source( volcano.mesh, head.mesh, shared.cardinalAxes.up, shared.cardinalAxes.forward );
		
		addOnShow.push( volcano );
		
		// volcano light, add directly to volcano
		
		var volcanoLight = new THREE.PointLight( 0xffd639, 1, 300 );
		volcanoLight.position.set( 0, 735, 0 );
		
		addOnShow.push( { addTarget: volcanoLight, sceneTarget: volcano } );
		
	}
	
	/*===================================================
    
    interactive functions
    
    =====================================================*/
	
	function show () {
		
		scene = game.scene;
		
        // fog
        
        scene.fog = fog;
		
		// add parts
		
		game.add_to_scene( addOnShow, scene );
		
		// add skybox
		
		game.add_to_scene( skybox, game.sceneBG );
		
		// morph animations
		
		tail.morphs.play( 'swim', { duration: 5000, loop: true } );
		
		sunmoon.morphs.play( 'shine', { duration: 500, loop: true, reverseOnComplete: true, durationShift: 4000 } );

		sunmoon.morphs.play( 'bounce', { duration: 3000, loop: true, loopDelay: 4000, loopChance: 0.1 } );
		
		waterPlane.waves.model.morphs.play( 'waves', { duration: 5000, loop: true } );
		
	}
	
	function hide () {
		
		game.remove_from_scene( addOnShow, scene );
		
		game.remove_from_scene( skybox, game.sceneBG );
		
		tail.morphs.stop();
		
		sunmoon.morphs.stop();
		
		waterPlane.waves.model.morphs.stop();
		
	}
	
	function update ( timeDelta ) {
		
		
		
	}
	
	return main;
	
}(KAIOPUA || {}));