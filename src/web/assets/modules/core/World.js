/*
World.js
World module, handles world in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/World.js",
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
	
	main.asset_register( assetPath, { 
		data: world,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/core/Model.js",
			"assets/modules/core/Physics.js",
			"assets/modules/utils/ObjectMaker.js",
			"assets/modules/env/Water.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
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
		
		// body
		
		body = new model.Instance({});
		
		body.quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI * 0.4 );
		
		// body parts
		
        head = new model.Instance({
            geometry: main.get_asset_data("assets/models/Whale_Head.js"),
			physicsParameters: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { color: 0xFFF7E0, ambient: 0xFFF7E0, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		addOnShow.push( { addTarget: head, sceneTarget: body } );
		
		tail = new model.Instance({
            geometry: main.get_asset_data("assets/models/Whale_Tail.js"),
			physicsParameters: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { color: 0xFFF7E0, ambient: 0xFFF7E0, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
	
		addOnShow.push( { addTarget: tail, sceneTarget: body } );
		
		// water
		
		waterPlane = water.instantiate();
		
		addOnShow.push( body, waterPlane.container );
		
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
		
		sunmoon = new model.Instance({
            geometry: main.get_asset_data("assets/models/Sun_Moon.js"),
			materials: new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.NoShading, vertexColors: THREE.VertexColors } )
        });
		
		sunmoon.position.set( -500, 1700, -4000 );
		sunmoon.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI );
		
		physics.rotate_relative_to_source( sunmoon, body, shared.cardinalAxes.forward.clone().negate(), shared.cardinalAxes.up );
		
		addOnShow.push( sunmoon );
		
	}
	
	/*===================================================
    
    land
    
    =====================================================*/
	
	function init_land () {
		
		init_home();
		
		init_volcano();
		
		init_trees();
		
	}
	
	/*===================================================
    
    hut
    
    =====================================================*/
	
	function init_home () {
		
		var home = new model.Instance({});
		
		addOnShow.push( { addTarget: home, sceneTarget: body } );
		
		/*
		home.position.set( 600, 1600, 0 );
		
		addOnShow.push( { 
			addTarget: home, 
			callbackAdd: function () {
				
				physics.rotate_relative_to_source( home, head, shared.cardinalAxes.up, shared.cardinalAxes.forward );
				
				physics.pull_to_source( home, head );
				
			}
		} );
		*/
		
		// hill for home
		
		var hill = new model.Instance({
            geometry: main.get_asset_data("assets/models/Hut_Hill.js"),
			physicsParameters: {
				bodyType: 'mesh'
			},
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
        });
		
		addOnShow.push( { addTarget: hill, sceneTarget: home } );
		
		// steps
		
		var steps = new model.Instance({
            geometry: main.get_asset_data("assets/models/Hut_Steps.js"),
			physicsParameters: {
				bodyType: 'mesh'
			},
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
        });
		
		//steps.position.set( -10, 270, 130 );
		
		addOnShow.push( { addTarget: steps, sceneTarget: home } );	
		
		// hut
		
		var hut = new model.Instance({
            geometry: main.get_asset_data("assets/models/Hut.js"),
			physicsParameters: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		//hut.position.set( 0, 335, 0 );
		
		addOnShow.push( { addTarget: hut, sceneTarget: home } );
		
		// banana leaf door
		
		var bananaLeafDoor = new model.Instance({
            geometry: main.get_asset_data("assets/models/Banana_Leaf_Door.js"),
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			doubleSided: true,
			//rotation: new THREE.Vector3( 0, 0, 5 )
        });
		
		//bananaLeafDoor.position.set( -10, 470, 100 );
		
		addOnShow.push( { addTarget: bananaLeafDoor, sceneTarget: home } );	
		
		// surfboard
		
		var surfboard = new model.Instance({
            geometry: main.get_asset_data("assets/models/Surfboard.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'box'
			}
        });
		
		//surfboard.position.set( 110, 320, 110 );
		
		addOnShow.push( { addTarget: surfboard, sceneTarget: home } );	
		
		/*
		// bed
		
		var bed = new model.Instance({
            geometry: main.get_asset_data("assets/models/Bed.js"),
			physicsParameters: {
				bodyType: 'box'
			},
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.FlatShading
        });
		
		bed.position.set( 0, 340, 0 );
		
		addOnShow.push( { addTarget: bed, sceneTarget: home } );
		
		// palm tree
		
		var palmTree = new model.Instance({
            geometry: main.get_asset_data("assets/models/Palm_Tree.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		palmTree.position.set( 180, 260, 25 );
		
		addOnShow.push( { addTarget: palmTree, sceneTarget: home } );	
		
		// taro plants
		
		var taroPlant1 = new model.Instance({
            geometry: main.get_asset_data("assets/models/Taro_Plant_001.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		taroPlant1.position.set( -170, 260, 130 );
		
		addOnShow.push( { addTarget: taroPlant1, sceneTarget: home } );
		
		var taroPlant2 = new model.Instance({
            geometry: main.get_asset_data("assets/models/Taro_Plant_001.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			rotation: new THREE.Vector3(0, -45, 0)
        });
		
		taroPlant2.position.set( -190, 245, 105 );
		
		addOnShow.push( { addTarget: taroPlant2, sceneTarget: home } );
		
		*/
		
	}
	
	/*===================================================
    
    volcano
    
    =====================================================*/
	
	function init_volcano () {
		
		// volcano
		
		var volcano = new model.Instance({});
		
		addOnShow.push( { addTarget: volcano, sceneTarget: body } );
		
		// volcano large
		
		var volcanoLarge = new model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Large.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'mesh'
			}
        });
		
		//volcanoLarge.position.set( -335, 1350, 0 );
		
		//physics.rotate_relative_to_source( volcano, head, shared.cardinalAxes.up, shared.cardinalAxes.forward );
		
		addOnShow.push( { addTarget: volcanoLarge, sceneTarget: volcano } );
		
		// volcano small
		
		var volcanoSmall = new model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Small.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'mesh'
			}
        });
		
		addOnShow.push( { addTarget: volcanoSmall, sceneTarget: volcano } );
		
		// volcano rocks
		
		var volcanoRocks001 = new model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_001.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'mesh'
			}
        });
		
		addOnShow.push( { addTarget: volcanoRocks001, sceneTarget: volcano } );
		
		var volcanoRocks002 = new model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_002.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'mesh'
			}
        });
		
		addOnShow.push( { addTarget: volcanoRocks002, sceneTarget: volcano } );
		
		var volcanoRocks003 = new model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_003.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'mesh'
			}
        });
		
		addOnShow.push( { addTarget: volcanoRocks003, sceneTarget: volcano } );
		
		var volcanoRocks004 = new model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_004.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'mesh'
			}
        });
		
		addOnShow.push( { addTarget: volcanoRocks004, sceneTarget: volcano } );
		
		var volcanoRocks005 = new model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_005.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physicsParameters: {
				bodyType: 'mesh'
			}
        });
		
		addOnShow.push( { addTarget: volcanoRocks005, sceneTarget: volcano } );
		
		/*
		// volcano light, add directly to volcano
		
		var volcanoLight = new THREE.PointLight( 0xffd639, 1, 300 );
		volcanoLight.position.set( 0, 750, 0 );
		
		addOnShow.push( { addTarget: volcanoLight, sceneTarget: volcano } );
		*/
		
	}
	
	/*===================================================
    
    trees
    
    =====================================================*/
	
	function init_trees () {
		
		// trees
		
		var trees = new model.Instance({});
		
		addOnShow.push( { addTarget: trees, sceneTarget: body } );
		
		// kukui trees
		
		var kukuiTrees = new model.Instance({
            geometry: main.get_asset_data("assets/models/Kukui_Trees.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		addOnShow.push( { addTarget: kukuiTrees, sceneTarget: trees } );
		
		// palm trees
		
		var palmTrees = new model.Instance({
            geometry: main.get_asset_data("assets/models/Palm_Trees.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		addOnShow.push( { addTarget: palmTrees, sceneTarget: trees } );
		
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
		
		tail.morphs.stopAll();
		
		sunmoon.morphs.stopAll();
		
		waterPlane.waves.model.morphs.stopAll();
		
	}
	
	function update ( timeDelta ) {
		
		
		
	}
	
	return main;
	
} ( KAIOPUA ) );