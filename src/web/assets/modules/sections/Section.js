/*
 *
 * Section.js
 * Generic section of game.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/sections/SectionName.js",
        _Section = {},
		game,
        ready = false,
		waitingToShow = false,
        assets,
        model,
		world,
		player,
		camera,
        scene,
		addOnShow = [];
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
	_Section.init = init;
    _Section.show = show;
    _Section.hide = hide;
    _Section.remove = remove;
    _Section.update = update;
    _Section.resize = resize;
    _Section.domElement = function () {};
	
	main.asset_register( assetPath, { 
		data: _Section,
		requirements: [
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
    
    /*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal () {
		
		if ( ready !== true ) {
			
			init_basics();
			
			ready = true;
			
			if ( waitingToShow === true ) {
				
				waitingToShow = false;
				
				show();
				
			}
			
		}
		
    }
    
    function init_basics () {
        
    }
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init () {
		
	}
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
		
		if ( ready === true ) {
			
			var i, l;
			
			// camera
			
			camera = game.get_camera();
			
			// scene
			
			scene = game.get_scene();
			
			// add items
			
			for ( i = 0, l = addOnShow.length; i < l; i ++ ) {
				
				scene.add( addOnShow[ i ] );
				
			}
			
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
        
		if ( ready === true ) {
			
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