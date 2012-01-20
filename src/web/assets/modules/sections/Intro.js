/*
IntroSection.js
Intro module, handles introduction to story and teaching user basic game mechanics.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/sections/Intro",
		intro = {},
		game,
		model,
		world,
		player,
		physics,
        _ready = false,
		waitingToShow = false,
		camera,
        scene,
		sceneBG,
		addOnShow = [],
		addBGOnShow = [],
		skybox,
		ambient,
		light;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    intro.show = show;
    intro.hide = hide;
    intro.remove = remove;
    intro.update = update;
    intro.resize = resize;
    intro.domElement = function () {};
	
	intro = main.asset_register( assetPath, intro, true );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	main.assets_require( [ 
		"assets/modules/core/Game",
		"assets/modules/core/Physics",
		"assets/modules/core/World",
		"assets/modules/core/Player",
		"assets/modules/core/Model"
	], init_internal, true );
	
	function init_internal ( g, physx, w, p, m ) {
		console.log('internal intro');
		if ( _ready !== true ) {
			
			// assets
			
			game = g;
			physics = physx;
			world = w;
			player = p;
			model = m;
			
			// environment
			
			init_environment();
			
			_ready = true;
			
			main.asset_ready( assetPath, intro );
			
			if ( waitingToShow === true ) {
				
				waitingToShow = false;
				
				show();
				
			}
			
		}
		
	}
    
    function init_environment () {
		
		//
		//
		//
		// boxes test grid
		//
		//
		//
		
		var normalMat = new THREE.MeshNormalMaterial();
		
		var normalMatWire = new THREE.MeshBasicMaterial({
			color: 0x000000,
			wireframe: true
		});
		
		var make_box = function ( x, y, z, movable ) {
			var geom = new THREE.CubeGeometry( 50, 50, 50, 1, 1 );
			
			// box
			
			var box = model.instantiate({
				geometry: geom,
				materials: normalMat
			});
			
			box.mesh.position.set( x, y, z );
			
			box.rigidBody = physics.translate( box.mesh, {
				bodyType: 'box',
				movable: typeof movable === 'undefined' ? false : movable
			});
			
			return box;
		}
		
		var numRings = 6;
		var radius = 2000;
		
		var deltaRotA = Math.PI / (numRings + 1);
		var rotA = 0;
		
		var numBoxPerRing = 8;
		var deltaRotB = (Math.PI * 2) / (numBoxPerRing);
		var rotB = 0;
		
		for ( var i = 0, l = numRings; i < l; i ++ ) {
			
			rotB = 0;
			
			rotA += deltaRotA;
			
			if ( rotA > Math.PI ) {
				
				rotA = 0;
				
			}
			
			var ny = radius * Math.cos( rotA );
			
			for ( var bi = 0, bl = numBoxPerRing; bi < bl; bi ++ ) {
				
				var nx = radius * Math.sin( rotA ) * Math.cos( rotB );
				var nz = radius * Math.sin( rotA ) * Math.sin( rotB );
				
				var box = make_box( nx, ny, nz );
				
				addOnShow.push( box );
				
				rotB += deltaRotB;
			
			}
			
		}
		
		/*
		// movable boxes
		addOnShow.push( make_box( 1, 2000, 100, true ) );
		addOnShow.push( make_box( 1, 2000, -100, true ) );
		addOnShow.push( make_box( 100, 2000, 1, true ) );
		addOnShow.push( make_box( -100, 2000, 1, true ) );
		addOnShow.push( make_box( -100, 2400, 1, true ) );
		*/
		
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
		
		if ( _ready === true ) {
			
			// camera
			
			camera = game.camera;
			
			camera.position.set(0, 0, 4000);
			
			camera.lookAt( new THREE.Vector3(0, 0, 0) );
			
			// scene
			
			scene = game.scene;
			
			sceneBG = game.sceneBG;
			
			// add world
			
			world.show();
			
			// add items
			
			game.add_to_scene( addOnShow, scene );
			
			game.add_to_scene( addBGOnShow, sceneBG );
			
			// start player
			
			player.show();
			
			player.enable();
			
			player.character.model.mesh.position.set( 0, 3000, 0 );
			
			//player.cameraMode = 'freelook';
			
			// signals
			
			shared.signals.windowresized.add( resize );
			
			shared.signals.update.add( update );
			
		}
		else {
			
			waitingToShow = true;
			
		}
        
    }
	
	function hide () {
		
		waitingToShow = false;
		
		shared.signals.windowresized.remove( resize );
        
        shared.signals.update.remove( update );
		
    }
    
    function remove () {
		
		if ( _ready === true ) {
			
			// stop player
			
			player.disable();
			
			player.hide();
			
			// hide world
			
			world.hide();
			
			// remove added items
			
			game.remove_from_scene( addOnShow, scene );
			
			game.remove_from_scene( addBGOnShow, sceneBG );
			
		}
		else {
			
			waitingToShow = false;
			
		}
        
    }
    
    function update () {
		
    }
    
    function resize ( W, H ) {
        
    }
    
    return main; 
    
}(KAIOPUA || {}));