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
		scene,
		ambientLight,
		threeObj,
		body,
		head,
		tail,
		scale = 110;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	world.init = init;
	world.get_scene = function () { return scene; };
	world.get_three_obj = function () { return threeObj; };
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
		
		// initialization
		
		init_basics();
		
		init_environment();
		
	}
	
	function init_basics () {
		
		// scene
		
		scene = new THREE.Scene();
		
		// lights
        
        ambientLight = new THREE.AmbientLight( 0x444444 );
        
        scene.add( ambientLight );
        
        // fog
        
        scene.fog = new THREE.Fog( 0xffffff, -100, 10000 );
		
	}
	
	function init_environment () {
		
		// body parts
        
        head = objectmaker.make_model({
            geometry: assets["assets/models/World_Head.js"],
			scale: scale,
			shading: THREE.FlatShading
        });
		
		tail = objectmaker.make_model({
            geometry: assets["assets/models/World_Tail.js"],
			scale: scale,
			shading: THREE.FlatShading
        });
		
		// add to threeObj
		
		threeObj = new THREE.Object3D();
		
		threeObj.add( head.mesh );
		threeObj.add( tail.mesh );
		
		//scene.add( threeObj );
		
	}
	
	return main;
	
}(KAIOPUA || {}));