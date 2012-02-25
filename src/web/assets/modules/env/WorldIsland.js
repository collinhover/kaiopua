/*
 *
 * WorldIsland.js
 * Generates island world.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/env/WorldIsland.js",
		_WorldIsland = {},
		_World,
        _Game,
		_Model,
		_Physics,
		_Puzzles,
		_ObjectMaker,
		_Water;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _WorldIsland,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/env/World.js",
			"assets/modules/core/Model.js",
			"assets/modules/core/Physics.js",
			"assets/modules/puzzles/Puzzles.js",
			"assets/modules/utils/ObjectMaker.js",
			"assets/modules/env/Water.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( g, world, m, physics, puzzles, om, w ) {
		console.log('internal world island');
		
		// assets
		
		_Game = g;
		_World = world;
		_Model = m;
		_Physics = physics;
		_Puzzles = puzzles;
		_ObjectMaker = om;
		_Water = w;
		
		_WorldIsland.Instance = WorldIsland;
		_WorldIsland.Instance.prototype = new _World.Instance();
		_WorldIsland.Instance.prototype.constructor = _WorldIsland.Instance;
		_WorldIsland.Instance.prototype.show = show;
		_WorldIsland.Instance.prototype.hide = hide;
		
	}
	
	/*===================================================
    
    world
    
    =====================================================*/
    
    function WorldIsland ( parameters ) {
    	
    	// prototype constructor
		
		_World.Instance.call( this, parameters );
    	
    	// environment
    	
    	// world base
    	
    	// basic position / rotation
		
		this.quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI * 0.4 );
		
		// skybox
		
		this.parts.skybox = _ObjectMaker.make_skybox( "assets/textures/skybox_world" );
		
		// ambient
		
		this.parts.ambientLight = new THREE.AmbientLight( 0x999999 );
		
		this.addOnShow.push( this.parts.ambientLight );
		
		// fog
		
		this.parts.fog = null;//new THREE.Fog( 0x226fb3, 1, 10000 );
		
		// body parts
		
        this.parts.head = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Whale_Head.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { color: 0xFFF7E0, ambient: 0xFFF7E0, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		this.addOnShow.push( { addTarget: this.parts.head, sceneTarget: this } );
		
		this.parts.tail = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Whale_Tail.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { color: 0xFFF7E0, ambient: 0xFFF7E0, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
	
		this.addOnShow.push( { addTarget: this.parts.tail, sceneTarget: this } );
		
		// water
		
		this.parts.waterRing = new _Water.Instance();
		
		this.addOnShow.push( this.parts.waterRing );
		
		// sky
		
		// sun/moon
		
		this.parts.sunmoon = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Sun_Moon.js"),
			materials: new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.NoShading, vertexColors: THREE.VertexColors } )
        });
		
		this.parts.sunmoon.position.set( 0, 4000, 0 );
		this.parts.sunmoon.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI );
		
		_Physics.rotate_relative_to_source( this.parts.sunmoon, this, shared.cardinalAxes.forward.clone().negate(), shared.cardinalAxes.up );
		
		this.addOnShow.push( this.parts.sunmoon );
		
		// sun light
		
		this.parts.sunmoonLight = new THREE.PointLight( 0xffffff, 1, 10000 );
		//this.parts.sunmoonLight.position.set( 0, 6000, 1000 );
		
		this.parts.sunmoon.add( this.parts.sunmoonLight );
		
		//init_puzzles();
    	
    }
	
	/*===================================================
    
    environment
    
    =====================================================*/
	
	function init_environment () {
		
		init_land();
		
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
		
		var home = new _Model.Instance({});
		
		addOnShow.push( { addTarget: home, sceneTarget: body } );
		
		/*
		home.position.set( 600, 1600, 0 );
		
		addOnShow.push( { 
			addTarget: home, 
			callbackAdd: function () {
				
				_Physics.rotate_relative_to_source( home, head, shared.cardinalAxes.up, shared.cardinalAxes.forward );
				
				_Physics.pull_to_source( home, head );
				
			}
		} );
		*/
		
		// hill for home
		
		var hill = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Hut_Hill.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
        });
		
		addOnShow.push( { addTarget: hill, sceneTarget: home } );
		
		// steps
		
		var steps = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Hut_Steps.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
        });
		
		//steps.position.set( -10, 270, 130 );
		
		addOnShow.push( { addTarget: steps, sceneTarget: home } );	
		
		// hut
		
		var hut = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Hut.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		//hut.position.set( 0, 335, 0 );
		
		addOnShow.push( { addTarget: hut, sceneTarget: home } );
		
		// banana leaf door
		
		var bananaLeafDoor = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Banana_Leaf_Door.js"),
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			doubleSided: true,
			//rotation: new THREE.Vector3( 0, 0, 5 )
        });
		
		//bananaLeafDoor.position.set( -10, 470, 100 );
		
		addOnShow.push( { addTarget: bananaLeafDoor, sceneTarget: home } );	
		
		// surfboard
		
		var surfboard = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Surfboard.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'box'
			}
        });
		
		//surfboard.position.set( 110, 320, 110 );
		
		addOnShow.push( { addTarget: surfboard, sceneTarget: home } );	
		
		/*
		// bed
		
		var bed = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Bed.js"),
			physics: {
				bodyType: 'box'
			},
			materials: new THREE.MeshNormalMaterial(),
			shading: THREE.FlatShading
        });
		
		bed.position.set( 0, 340, 0 );
		
		addOnShow.push( { addTarget: bed, sceneTarget: home } );
		
		// palm tree
		
		var palmTree = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Palm_Tree.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		palmTree.position.set( 180, 260, 25 );
		
		addOnShow.push( { addTarget: palmTree, sceneTarget: home } );	
		
		// taro plants
		
		var taroPlant1 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Taro_Plant_001.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		taroPlant1.position.set( -170, 260, 130 );
		
		addOnShow.push( { addTarget: taroPlant1, sceneTarget: home } );
		
		var taroPlant2 = new _Model.Instance({
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
		
		var volcano = new _Model.Instance({});
		
		addOnShow.push( { addTarget: volcano, sceneTarget: body } );
		
		// volcano large
		
		var volcanoLarge = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Large.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		//volcanoLarge.position.set( -335, 1350, 0 );
		
		//_Physics.rotate_relative_to_source( volcano, head, shared.cardinalAxes.up, shared.cardinalAxes.forward );
		
		addOnShow.push( { addTarget: volcanoLarge, sceneTarget: volcano } );
		
		// volcano small
		
		var volcanoSmall = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Small.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		addOnShow.push( { addTarget: volcanoSmall, sceneTarget: volcano } );
		
		// volcano rocks
		
		var volcanoRocks001 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_001.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		addOnShow.push( { addTarget: volcanoRocks001, sceneTarget: volcano } );
		
		var volcanoRocks002 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_002.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		addOnShow.push( { addTarget: volcanoRocks002, sceneTarget: volcano } );
		
		var volcanoRocks003 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_003.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		addOnShow.push( { addTarget: volcanoRocks003, sceneTarget: volcano } );
		
		var volcanoRocks004 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_004.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		addOnShow.push( { addTarget: volcanoRocks004, sceneTarget: volcano } );
		
		var volcanoRocks005 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_005.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
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
		
		var trees = new _Model.Instance({});
		
		addOnShow.push( { addTarget: trees, sceneTarget: body } );
		
		// kukui trees
		
		var kukuiTrees = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Kukui_Trees.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		addOnShow.push( { addTarget: kukuiTrees, sceneTarget: trees } );
		
		// palm trees
		
		var palmTrees = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Palm_Trees.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		addOnShow.push( { addTarget: palmTrees, sceneTarget: trees } );
		
	}
	
	/*===================================================
    
    puzzles
    
    =====================================================*/
	
	function init_puzzles () {
		
		var puzzleTutorial = new _Puzzles.Instance( {
			geometry: main.get_asset_data("assets/models/Field_Tutorial.js")
		});
		
		addOnShow.push( { addTarget: puzzleTutorial, sceneTarget: body } );
		
	}
	
	/*===================================================
    
    interactive functions
    
    =====================================================*/
	
	function show ( scene ) {
		
		// proto
		
		_World.Instance.prototype.show.call( this, scene );
		
		// add skybox
		
		_Game.add_to_scene( this.parts.skybox, _Game.sceneBG );
		
		// morph animations
		
		this.parts.tail.morphs.play( 'swim', { duration: 5000, loop: true } );
		
		this.parts.sunmoon.morphs.play( 'shine', { duration: 500, loop: true, reverseOnComplete: true, durationShift: 4000 } );

		this.parts.sunmoon.morphs.play( 'bounce', { duration: 3000, loop: true, loopDelay: 4000, loopChance: 0.1 } );
		
		this.parts.waterRing.morphs.play( 'waves', { duration: 5000, loop: true } );
		
	}
	
	function hide () {
		
		// proto
		
		_World.Instance.prototype.hide.call( this );
		
		// skybox
		
		_Game.remove_from_scene( this.parts.skybox, _Game.sceneBG );
		
		// morphs
		
		this.parts.tail.morphs.stopAll();
		
		this.parts.sunmoon.morphs.stopAll();
		
		this.parts.waterRing.morphs.stopAll();
		
	}
	
} ( KAIOPUA ) );