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
		_Field,
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
			"assets/modules/farming/Field.js",
			"assets/modules/utils/ObjectMaker.js",
			"assets/modules/env/Water.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( g, world, m, physics, f, om, w ) {
		console.log('internal world island');
		
		// assets
		
		_Game = g;
		_World = world;
		_Model = m;
		_Physics = physics;
		_Field = f;
		_ObjectMaker = om;
		_Water = w;
		
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
		
		environment
		
		=====================================================*/
    	
    	// skybox
		
		me.parts.skybox = _ObjectMaker.make_skybox( "assets/textures/skybox_world" );
    	
    	// world base
    	
    	me.parts.body = new _Model.Instance();
		
		me.parts.body.quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI * 0.4 );
		
		me.add( me.parts.body );
		
		// ambient
		
		me.parts.ambientLight = new THREE.AmbientLight( 0x999999 );
		
		me.add( me.parts.ambientLight );
		
		// fog
		
		me.parts.fog = null;//new THREE.Fog( 0x226fb3, 1, 10000 );
		
		// body parts
		
        me.parts.head = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Whale_Head.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { color: 0xFFF7E0, ambient: 0xFFF7E0, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		me.parts.body.add( me.parts.head );
		
		me.parts.tail = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Whale_Tail.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { color: 0xFFF7E0, ambient: 0xFFF7E0, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		me.parts.body.add( me.parts.tail );
		
		// water
		
		me.parts.waterRing = new _Water.Instance( { wavesTexturePath: "assets/textures/waves_512.png" } );
		
		me.add( me.parts.waterRing );
		
		// sky
		
		// sun/moon
		
		me.parts.sunmoon = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Sun_Moon.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.NoShading, vertexColors: THREE.VertexColors } )
        });
		
		me.parts.sunmoon.position.set( 0, 4000, 0 );
		me.parts.sunmoon.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI );
		
		_Physics.rotate_relative_to_source( me.parts.sunmoon, me.parts.body, shared.cardinalAxes.forward.clone().negate(), shared.cardinalAxes.up );
		
		me.add( me.parts.sunmoon );
		
		// sun light
		
		me.parts.sunmoonLight = new THREE.PointLight( 0xffffff, 1, 10000 );
		
		me.parts.sunmoon.add( me.parts.sunmoonLight );
		
		// home
		
		me.parts.home = new _Model.Instance();
		
		me.parts.body.add( me.parts.home );
		
		// hill for home
		
		me.parts.hill = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Hut_Hill.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
        });
		
		me.parts.home.add( me.parts.hill );
		
		// steps
		
		me.parts.steps = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Hut_Steps.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
        });
		
		me.parts.home.add( me.parts.steps );	
		
		// hut
		
		me.parts.hut = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Hut.js"),
			physics: {
				bodyType: 'mesh'
			},
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		me.parts.home.add( me.parts.hut );
		
		// banana leaf door
		
		me.parts.bananaLeafDoor = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Banana_Leaf_Door.js"),
			materials:  new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			doubleSided: true
        });
		
		me.parts.home.add( me.parts.bananaLeafDoor );
		
		// surfboard
		
		me.parts.surfboard = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Surfboard.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'box'
			}
        });
		
		me.parts.home.add( me.parts.surfboard );	
		
		// volcano
		
		me.parts.volcano = new _Model.Instance();
		
		me.parts.body.add( me.parts.volcano );
		
		// volcano large
		
		me.parts.volcanoLarge = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Large.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		me.parts.volcano.add( me.parts.volcanoLarge );
		
		// volcano small
		
		me.parts.volcanoSmall = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Small.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		me.parts.volcano.add( me.parts.volcanoSmall );
		
		// volcano rocks
		
		me.parts.volcanoRocks001 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_001.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		me.parts.volcano.add( me.parts.volcanoRocks001 );
		
		me.parts.volcanoRocks002 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_002.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		me.parts.volcano.add( me.parts.volcanoRocks002 );
		
		me.parts.volcanoRocks003 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_003.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		me.parts.volcano.add( me.parts.volcanoRocks003 );
		
		me.parts.volcanoRocks004 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_004.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		me.parts.volcano.add( me.parts.volcanoRocks004 );
		
		me.parts.volcanoRocks005 = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Volcano_Rocks_005.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading,
			physics: {
				bodyType: 'mesh'
			}
        });
		
		me.parts.volcano.add( me.parts.volcanoRocks005 );
		
		// trees
		
		me.parts.trees = new _Model.Instance();
		
		me.parts.body.add( me.parts.trees );
		
		// kukui trees
		
		me.parts.kukuiTrees = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Kukui_Trees.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		me.parts.trees.add( me.parts.kukuiTrees );
		
		// palm trees
		
		me.parts.palmTrees = new _Model.Instance({
            geometry: main.get_asset_data("assets/models/Palm_Trees.js"),
			materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
			shading: THREE.SmoothShading
        });
		
		me.parts.trees.add( me.parts.palmTrees );
		
		/*===================================================
		
		puzzles
		
		=====================================================*/
		
		// puzzles
		
		me.parts.fieldTutorial = new _Field.Instance( {
			grid: {
				modulesGeometry: main.get_asset_data("assets/models/Field_Tutorial.js")
			}
		});
		
		me.parts.body.add( me.parts.fieldTutorial );
		
		// functions
		
		/*===================================================
		
		show / hide
		
		=====================================================*/
		
		function show ( scene ) {
			
			// proto
			
			_World.Instance.prototype.show.call( me, scene );
			
			// skybox
			
			_Game.sceneBG.add( me.parts.skybox );
			
			// morph animations
			
			me.parts.tail.morphs.play( 'swim', { duration: 5000, loop: true } );
			
			me.parts.sunmoon.morphs.play( 'shine', { duration: 500, loop: true, reverseOnComplete: true, durationShift: 4000 } );
	
			me.parts.sunmoon.morphs.play( 'bounce', { duration: 3000, loop: true, loopDelay: 4000, loopChance: 0.1 } );
			
			me.parts.waterRing.morphs.play( 'waves', { duration: 5000, loop: true } );
			
		}
		
		function hide () {
			
			// proto
			
			_World.Instance.prototype.hide.call( me );
			
			// skybox
			
			_Game.sceneBG.remove( me.parts.skybox );
			
			// morphs
			
			me.parts.tail.morphs.stopAll();
			
			me.parts.sunmoon.morphs.stopAll();
			
			me.parts.waterRing.morphs.stopAll();
			
		}
    	
    }
	
} ( KAIOPUA ) );