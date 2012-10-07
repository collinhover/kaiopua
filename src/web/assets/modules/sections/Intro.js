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
        _ready = false,
		waitingToShow = false,
		world,
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
	
	function init_internal ( g, w, p, m ) {
		console.log('internal intro');
		if ( _ready !== true ) {
			
			// assets
			
			_Game = g;
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
			
			_Game.cameraControls.reset();
			_Game.cameraControls.enabled = true;
			_Game.cameraControls.controllable = true;
			
			// add world
			
			world.show();
			
			// start player
			
			_Player.character.position.set( 35, 2200, 300 );
			
			_Player.show();
			
			_Player.enable();
			
			// signals
			
			shared.signals.onWindowResized.add( resize );
			
			shared.signals.onGameUpdated.add( update );
			
		}
		else {
			
			waitingToShow = true;
			
		}
        
    }
	
	function hide () {
		
		waitingToShow = false;
		
		shared.signals.onWindowResized.remove( resize );
        
        shared.signals.onGameUpdated.remove( update );
		
    }
    
    function remove () {
		
		if ( _ready === true ) {
			
			// stop player
			
			_Player.disable();
			
			_Player.hide();
			
			// hide world
			
			world.hide();
			
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