/*
 *
 * Intro.js
 * Introduction section.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/sections/Intro.js",
		_Intro = {},
		_WorldIsland,
		_Skybox,
		_ObjectHelper,
        _ready = false,
		waitingToShow = false,
		world,
		skybox,
		ambient,
		light;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    _Intro.show = show;
    _Intro.hide = hide;
    _Intro.remove = remove;
    _Intro.update = update;
	
	main.asset_register( assetPath, { 
		data: _Intro,
		requirements: [
			"js/kaiopua/env/WorldIsland.js",
			"js/kaiopua/env/Skybox.js",
			"js/kaiopua/utils/ObjectHelper.js",
			shared.pathToAsset + "skybox_world_posx.jpg",
            shared.pathToAsset + "skybox_world_negx.jpg",
			shared.pathToAsset + "skybox_world_posy.jpg",
            shared.pathToAsset + "skybox_world_negy.jpg",
			shared.pathToAsset + "skybox_world_posz.jpg",
            shared.pathToAsset + "skybox_world_negz.jpg"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( w, sb, oh ) {
		console.log('internal intro', _Intro);
		if ( _ready !== true ) {
			
			// assets
			
			_WorldIsland = w;
			_Skybox = sb;
			_ObjectHelper = oh;
			
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
		
		skybox = new _Skybox.Instance( shared.pathToAsset + "skybox_world" );
		
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
		
		if ( _ready === true ) {
			
			shared.sceneBG.add( skybox );
			world.show();
			
			shared.player.respawn( shared.scene, new THREE.Vector3( 35, 2200, 300 ) );
			
			_ObjectHelper.revert_change( shared.cameraControls.options, true );
			shared.cameraControls.enabled = true;
			shared.cameraControls.controllable = false;
			
			shared.signals.onGameUpdated.add( update );
			
		}
		else {
			
			waitingToShow = true;
			
		}
        
    }
	
	function hide () {
		
		waitingToShow = false;
        
        shared.signals.onGameUpdated.remove( update );
		
    }
    
    function remove () {
		
		if ( _ready === true ) {
			
			shared.scene.remove( shared.player );
			
			world.hide();
			
			shared.sceneBG.remove( skybox );
			
		}
		else {
			
			waitingToShow = false;
			
		}
        
    }
    
    function update () {
		
    }
    
} ( KAIOPUA ) );