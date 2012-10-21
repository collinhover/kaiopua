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
		assetPath = "js/kaiopua/env/WorldIsland.js",
		_WorldIsland = {},
		_World,
		_Model,
		_PuzzleLibrary,
		_Water,
		_Sky,
		_PhysicsHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _WorldIsland,
		requirements: [
			"js/kaiopua/env/World.js",
			"js/kaiopua/core/Model.js",
			"js/kaiopua/env/Water.js",
			"js/kaiopua/env/Sky.js",
			"js/kaiopua/utils/PhysicsHelper.js",
            { path: "asset/model/Whale.js", type: 'model' },
			{ path: "asset/model/Sun.js", type: 'model' },
			{ path: "asset/model/Hut.js", type: 'model' },
			{ path: "asset/model/Hut_Hill.js", type: 'model' },
			{ path: "asset/model/Hut_Steps.js", type: 'model' },
			{ path: "asset/model/Bed.js", type: 'model' },
			{ path: "asset/model/Banana_Leaf_Door.js", type: 'model' },
			{ path: "asset/model/Surfboard.js", type: 'model' },
			{ path: "asset/model/Grass_Clump_001.js", type: 'model' },
			{ path: "asset/model/Grass_Clump_002.js", type: 'model' },
			{ path: "asset/model/Grass_Line_001.js", type: 'model' },
			{ path: "asset/model/Grass_Line_002.js", type: 'model' },
			{ path: "asset/model/Palm_Tree.js", type: 'model' },
			{ path: "asset/model/Palm_Trees.js", type: 'model' },
			{ path: "asset/model/Kukui_Tree.js", type: 'model' },
			{ path: "asset/model/Kukui_Trees.js", type: 'model' },
			{ path: "asset/model/Volcano_Large.js", type: 'model' },
			{ path: "asset/model/Volcano_Small.js", type: 'model' },
			{ path: "asset/model/Volcano_Rocks_001.js", type: 'model' },
			{ path: "asset/model/Volcano_Rocks_002.js", type: 'model' },
			{ path: "asset/model/Volcano_Rocks_003.js", type: 'model' },
			{ path: "asset/model/Volcano_Rocks_004.js", type: 'model' },
			{ path: "asset/model/Volcano_Rocks_005.js", type: 'model' },
            shared.pathToTextures + "water_world_512.png"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( world, m, w, sky, ph ) {
		console.log('internal world island');
		
		// assets
		
		_World = world;
		_Model = m;
		_Water = w;
		_Sky = sky;
		_PhysicsHelper = ph;
		
		_WorldIsland.Instance = WorldIsland;
		_WorldIsland.Instance.prototype = new _World.Instance();
		_WorldIsland.Instance.prototype.constructor = _WorldIsland.Instance;
		
	}
	
	/*===================================================
    
    world
    
    =====================================================*/
    
    function WorldIsland ( parameters ) {
    	
    	var me = this;
    	
    	// prototype constructor
		
		_World.Instance.call( me, parameters );
		
		// public
		
		me.show = show;
		me.hide = hide;
		
		/*===================================================
		
		body
		
		=====================================================*/
		
		// body
		
    	me.parts.body = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Whale.js"),
			physics: {
				bodyType: 'mesh',
				gravitySource: true
			},
			options: {
				morphs: {
					duration: 5000
				}
			}
        });
		
		me.parts.body.quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI * 0.4 );
		
		me.add( me.parts.body );
		
		// ambient
		
		me.parts.ambientLight = new THREE.AmbientLight( 0x999999 );
		
		me.add( me.parts.ambientLight );
		
		// fog
		
		me.parts.fog = null;//new THREE.Fog( 0x226fb3, 1, 10000 );
		
		/*===================================================
		
		environment
		
		=====================================================*/
		
		// water
		
		me.parts.waterRing = new _Water.Instance( { 
			wavesTexture: shared.pathToTextures + "water_world_512.png"
		} );
		
		me.add( me.parts.waterRing );
		
		// sun/moon
		
		me.parts.sun = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Sun.js"),
			material: new THREE.MeshBasicMaterial( { shading: THREE.NoShading, vertexColors: THREE.VertexColors } ),
			physics: {
				bodyType: 'mesh',
				gravitySource: true
			},
			options: {
				morphs: {
					duration: 6000
				}
			}
        });
		
		me.parts.sun.position.set( 0, 4000, 0 );
		me.parts.sun.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI );
		
		_PhysicsHelper.rotate_relative_to_source( me.parts.sun.quaternion, me.parts.sun.position, me.parts.body, shared.cardinalAxes.forward.clone().negate(), shared.cardinalAxes.up );
		
		me.add( me.parts.sun );
		
		// sun light
		
		me.parts.sunLight = new THREE.PointLight( 0xffffff, 1, 10000 );
		
		me.parts.sun.add( me.parts.sunLight );
		
		// sky
		
		me.parts.sky = new _Sky.Instance( {
			world: me.parts.body,
			numClouds: 20,
			cloudParameters: {
				physics: {
					bodyType: 'mesh',
					gravitySource: true,
					radiusGravityAddition: 300
				},
				options: {
					morphs: {
						duration: 1000
					}
				}
			},
			layout: [
				{ position: new THREE.Vector3( 119, 2604, 990 ), scale: 0.85 },
				{ position: new THREE.Vector3( 438, 3022, 1350 ), scale: 2.23 },
				{ position: new THREE.Vector3( -281, 3250, 1362 ), scale: 1.60 },
				{ position: new THREE.Vector3( -700, 3246, 1456 ), scale: 2.34 },
				{ position: new THREE.Vector3( -1403, 3148, 1895 ), scale: 1.08 },
				{ position: new THREE.Vector3( -777, 2984, 2231 ), scale: 0.61 },
				{ position: new THREE.Vector3( -1932, 2222, 2340 ), scale: 3.56 },
				{ position: new THREE.Vector3( -2157, 1563, 3030 ), scale: 1.67 },
				{ position: new THREE.Vector3( -2377, 993, 2980 ), scale: 0.61 },
				{ position: new THREE.Vector3( -2150, 626, 3434 ), scale: 3.52 },
				{ position: new THREE.Vector3( -1870, 398, 3697 ), scale: 2.23 },
				{ position: new THREE.Vector3( -1095, 511, 4275 ), scale: 1.25 },
				
				{ position: new THREE.Vector3( 515, 2070, 2969 ), scale: 2.02 },
				{ position: new THREE.Vector3( 1467, 1960, 2516 ), scale: 0.88 },
				{ position: new THREE.Vector3( 1170, 1361, 3514 ), scale: 2.34 },
				{ position: new THREE.Vector3( 2119, 716, 3196 ), scale: 4.22 },
				{ position: new THREE.Vector3( 1650, 438, 3098 ), scale: 2.17 },
				
				{ position: new THREE.Vector3( 122, -20, 4103 ), scale: 2.82 },
				{ position: new THREE.Vector3( 980, -587, 3804 ), scale: 3.28 },
				{ position: new THREE.Vector3( 505, -1121, 3776 ), scale: 0.84 },
				{ position: new THREE.Vector3( -131, -1234, 3401 ), scale: 0.84 },
				{ position: new THREE.Vector3( 413, -1570, 3572 ), scale: 1.59 },
				{ position: new THREE.Vector3( -484, -2012, 3453 ), scale: 4.45 }
			]
		} );
		
		me.parts.body.add( me.parts.sky );
		
		/*===================================================
		
		home
		
		=====================================================*/
		
		me.parts.home = new _Model.Instance();
		
		me.parts.body.add( me.parts.home );
		
		// hill for home
		
		me.parts.hill = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Hut_Hill.js"),
			physics: {
				bodyType: 'mesh'
			},
			center: true
        });
		
		me.parts.home.add( me.parts.hill );
		
		// steps
		
		me.parts.steps = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Hut_Steps.js"),
			physics: {
				bodyType: 'mesh'
			},
			center: true
        });
		
		me.parts.home.add( me.parts.steps );	
		
		// hut
		
		me.parts.hut = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Hut.js"),
			physics: {
				bodyType: 'mesh'
			},
			center: true
        });
		
		me.parts.home.add( me.parts.hut );
		
		// banana leaf door
		
		me.parts.bananaLeafDoor = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Banana_Leaf_Door.js"),
			center: true,
			side: THREE.DoubleSide
        });
		
		me.parts.home.add( me.parts.bananaLeafDoor );
		
		// surfboard
		
		me.parts.surfboard = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Surfboard.js"),
			center: true
        });
		
		me.parts.home.add( me.parts.surfboard );	
		
		/*===================================================
		
		volcano
		
		=====================================================*/
		
		me.parts.volcano = new _Model.Instance();
		
		me.parts.body.add( me.parts.volcano );
		
		// volcano large
		
		me.parts.volcanoLarge = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Volcano_Large.js"),
			physics: {
				bodyType: 'mesh'
			},
			center: true
        });
		
		me.parts.volcano.add( me.parts.volcanoLarge );
		
		// volcano small
		
		me.parts.volcanoSmall = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Volcano_Small.js"),
			physics: {
				bodyType: 'mesh'
			},
			center: true
        });
		
		me.parts.volcano.add( me.parts.volcanoSmall );
		
		// volcano rocks
		
		me.parts.volcanoRocks001 = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Volcano_Rocks_001.js"),
			physics: {
				bodyType: 'mesh'
			},
			center: true
        });
		
		me.parts.volcano.add( me.parts.volcanoRocks001 );
		
		me.parts.volcanoRocks002 = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Volcano_Rocks_002.js"),
			physics: {
				bodyType: 'mesh'
			},
			center: true
        });
		
		me.parts.volcano.add( me.parts.volcanoRocks002 );
		
		me.parts.volcanoRocks003 = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Volcano_Rocks_003.js"),
			physics: {
				bodyType: 'mesh'
			},
			center: true
        });
		
		me.parts.volcano.add( me.parts.volcanoRocks003 );
		
		me.parts.volcanoRocks004 = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Volcano_Rocks_004.js"),
			physics: {
				bodyType: 'mesh'
			},
			center: true
        });
		
		me.parts.volcano.add( me.parts.volcanoRocks004 );
		
		me.parts.volcanoRocks005 = new _Model.Instance({
            geometry: main.get_asset_data("asset/model/Volcano_Rocks_005.js"),
			physics: {
				bodyType: 'mesh'
			},
			center: true
        });
		
		me.parts.volcano.add( me.parts.volcanoRocks005 );
		
		/*===================================================
		
		trees
		
		=====================================================*/
		
		me.parts.trees = new _Model.Instance();
		
		me.parts.body.add( me.parts.trees );
		
		// kukui trees
		
		me.parts.kukuiTrees = new _Model.Instance({
			geometry: "asset/model/Kukui_Trees.js",
		});
		
		me.parts.trees.add( me.parts.kukuiTrees );
		
		// palm trees
		
		me.parts.palmTrees = new _Model.Instance({
			geometry: "asset/model/Palm_Trees.js",
		});
		
		me.parts.trees.add( me.parts.palmTrees );
		
		/*===================================================
		
		puzzles
		
		=====================================================*/
		
		main.asset_require( [
				"js/kaiopua/puzzles/PuzzleLibrary.js"
			],
			init_puzzles,
			true
		);
		
		function init_puzzles ( pb ) {
			
			_PuzzleLibrary = pb;
			
			// tutorial
			
			me.parts.puzzleTutorial = _PuzzleLibrary.build( 'tutorial' );
			me.parts.body.add( me.parts.puzzleTutorial );
			
			// basics abilities
			
			me.parts.puzzleBasicsAbilities = _PuzzleLibrary.build( 'abilities' );
			me.parts.body.add( me.parts.puzzleBasicsAbilities );
			
			// rolling hills
			
			me.parts.puzzleRollingHills = _PuzzleLibrary.build( 'rollinghills' );
			me.parts.body.add( me.parts.puzzleRollingHills );
			
		}
		
		// functions
		
		/*===================================================
		
		show / hide
		
		=====================================================*/
		
		function show () {
			
			// proto
			
			_World.Instance.prototype.show.call( me );
			
			// morph animations
			
			me.parts.waterRing.morphs.play( 'waves', { duration: 4000, loop: true } );
			
		}
		
		function hide () {
			
			// proto
			
			_World.Instance.prototype.hide.call( me );
			
		}
    	
    }
	
} ( KAIOPUA ) );