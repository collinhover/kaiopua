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
    	
    	// skybox
		
		this.parts.skybox = _ObjectMaker.make_skybox( "assets/textures/skybox_world" );
    	
    	// world base
    	
    	this.parts.body = new _Model.Instance();
		
		this.parts.body.quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI * 0.4 );
		
		this.add( this.parts.body );
		
		// ambient
		
		this.parts.ambientLight = new THREE.AmbientLight( 0x999999 );
		
		this.add( this.parts.ambientLight );
		
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
		
		this.parts.body.add( this.parts.head );
		
		this.parts.tail = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Whale_Tail.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { color: 0xFFF7E0, ambient: 0xFFF7E0, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		this.parts.body.add( this.parts.tail );
		
		// water
		
		this.parts.waterRing = new _Water.Instance();
		
		this.add( this.parts.waterRing );
		
		// sky
		
		// sun/moon
		
		this.parts.sunmoon = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Sun_Moon.js"),
			materials: new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.NoShading, vertexColors: THREE.VertexColors } )
        });
		
		this.parts.sunmoon.position.set( 0, 4000, 0 );
		this.parts.sunmoon.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI );
		
		_Physics.rotate_relative_to_source( this.parts.sunmoon, this.parts.body, shared.cardinalAxes.forward.clone().negate(), shared.cardinalAxes.up );
		
		this.add( this.parts.sunmoon );
		
		// sun light
		
		this.parts.sunmoonLight = new THREE.PointLight( 0xffffff, 1, 10000 );
		
		this.parts.sunmoon.add( this.parts.sunmoonLight );
		
		// home
		
		this.parts.home = new _Model.Instance();
		
		this.parts.body.add( this.parts.home );
		
		// hill for home
		
		this.parts.hill = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Hut_Hill.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
        });
		
		this.parts.home.add( this.parts.hill );
		
		// steps
		
		this.parts.steps = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Hut_Steps.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
        });
		
		this.parts.home.add( this.parts.steps );	
		
		// hut
		
		this.parts.hut = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Hut.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		this.parts.home.add( this.parts.hut );
		
		// banana leaf door
		
		this.parts.bananaLeafDoor = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Banana_Leaf_Door.js"),
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			doubleSided: true
        });
		
		this.parts.home.add( this.parts.bananaLeafDoor );
		
		// surfboard
		
		this.parts.surfboard = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Surfboard.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'box'
			}
        });
		
		this.parts.home.add( this.parts.surfboard );	
		
		// volcano
		
		this.parts.volcano = new _Model.Instance();
		
		this.parts.body.add( this.parts.volcano );
		
		// volcano large
		
		this.parts.volcanoLarge = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Large.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		this.parts.volcano.add( this.parts.volcanoLarge );
		
		// volcano small
		
		this.parts.volcanoSmall = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Small.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		this.parts.volcano.add( this.parts.volcanoSmall );
		
		// volcano rocks
		
		this.parts.volcanoRocks001 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_001.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		this.parts.volcano.add( this.parts.volcanoRocks001 );
		
		this.parts.volcanoRocks002 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_002.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		this.parts.volcano.add( this.parts.volcanoRocks002 );
		
		this.parts.volcanoRocks003 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_003.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		this.parts.volcano.add( this.parts.volcanoRocks003 );
		
		this.parts.volcanoRocks004 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_004.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		this.parts.volcano.add( this.parts.volcanoRocks004 );
		
		this.parts.volcanoRocks005 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_005.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		this.parts.volcano.add( this.parts.volcanoRocks005 );
		
		/*
		// volcano light, add directly to volcano
		
		this.parts.volcanoLight = new THREE.PointLight( 0xffd639, 1, 300 );
		this.parts.volcanoLight.position.set( 0, 750, 0 );
		
		this.addOnShow.push( { addTarget: this.parts.volcanoLight, sceneTarget: this.parts.volcano } );
		*/
		
		// trees
		
		this.parts.trees = new _Model.Instance();
		
		this.parts.body.add( this.parts.trees );
		
		// kukui trees
		
		this.parts.kukuiTrees = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Kukui_Trees.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		this.parts.trees.add( this.parts.kukuiTrees );
		
		// palm trees
		
		this.parts.palmTrees = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Palm_Trees.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		this.parts.trees.add( this.parts.palmTrees );
		
		// puzzles
		
		this.parts.puzzleTutorial = new _Puzzles.Instance( {
			geometry: main.get_asset_data("assets/models/Field_Tutorial.js")
		});
		
		this.parts.body.add( this.parts.puzzleTutorial );
    	
    }
	
	/*===================================================
    
    interactive functions
    
    =====================================================*/
	
	function show ( scene ) {
		
		// proto
		
		_World.Instance.prototype.show.call( this, scene );
		
		// skybox
		
		_Game.sceneBG.add( this.parts.skybox );
		
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
		
		_Game.sceneBG.remove( this.parts.skybox );
		
		// morphs
		
		this.parts.tail.morphs.stopAll();
		
		this.parts.sunmoon.morphs.stopAll();
		
		this.parts.waterRing.morphs.stopAll();
		
	}
	
} ( KAIOPUA ) );