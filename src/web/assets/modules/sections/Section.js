/*
Section.js
Section module, generic template.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/sections/SectionName",
        sectionName = {},
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
    
	sectionName.init = init;
    sectionName.show = show;
    sectionName.hide = hide;
    sectionName.remove = remove;
    sectionName.update = update;
    sectionName.resize = resize;
    sectionName.domElement = function () {};
	
	sectionName = main.asset_register( sectionName, sectionName, true );
    
    /*===================================================
    
    internal init
    
    =====================================================*/
	
	main.asset_require( [
	], init_internal, true );
	
	function init_internal () {
		
		if ( ready !== true ) {
			
			init_basics();
			
			main.asset_ready( assetPath );
			
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
    
    return main; 
    
} ( KAIOPUA ) );