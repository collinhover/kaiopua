/*
 *
 * Intro.js
 * Handles introduction to story and teaching user basic game mechanics.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/sections/Intro.js",
		intro = {},
		_Game,
		_Model,
		_WorldIsland,
		_Player,
		_Physics,
        _ready = false,
		waitingToShow = false,
		camera,
        scene,
		sceneBG,
		world,
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
	
	main.asset_register( assetPath, { 
		data: intro,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/core/Physics.js",
			"assets/modules/env/WorldIsland.js",
			"assets/modules/core/Player.js",
			"assets/modules/core/Model.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( g, physx, w, p, m ) {
		console.log('internal intro');
		if ( _ready !== true ) {
			
			// assets
			
			_Game = g;
			_Physics = physx;
			_WorldIsland = w;
			_Player = p;
			_Model = m;
			
			// environment
			
			init_environment();
			
			_ready = true;
			
			if ( waitingToShow === true ) {
				
				waitingToShow = false;
				
				show();
				
			}
			
		}
		
	}
    
    function init_environment () {
		
		world = new _WorldIsland.Instance();
		
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
		
		if ( _ready === true ) {
			
			// camera
			
			camera = _Game.camera;
			
			camera.position.set(0, 0, 4000);
			
			camera.lookAt( new THREE.Vector3(0, 0, 0) );
			
			// scene
			
			scene = _Game.scene;
			
			sceneBG = _Game.sceneBG;
			
			// add world
			
			world.show( scene );
			
			// add items
			
			_Game.add_to_scene( addOnShow, scene );
			
			_Game.add_to_scene( addBGOnShow, sceneBG );
			
			// start player
			
			_Player.show();
			
			_Player.enable();
			
			_Player.character.position.set( 1, 2700, 1 );
			
			//_Player.cameraMode = 'freelook';
			
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
			
			_Player.disable();
			
			_Player.hide();
			
			// hide world
			
			world.hide();
			
			// remove added items
			
			_Game.remove_from_scene( addOnShow, scene );
			
			_Game.remove_from_scene( addBGOnShow, sceneBG );
			
		}
		else {
			
			waitingToShow = false;
			
		}
        
    }
    
    function update () {
		
    }
    
    function resize ( W, H ) {
        
    }
    
} ( KAIOPUA ) );