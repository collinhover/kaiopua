/*
Section.js
Section module, generic template.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        sections = game.sections = game.sections || {},
        sectionName = sections.sectionName = sections.sectionName || {},
        readyInternal = false,
        readyAll = false,
        assets,
        objectmaker,
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
    sectionName.ready = ready;
    sectionName.domElement = function () {};
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    game.update_section_list();
	
	function init_internal () {
        
        if ( readyInternal !== true ) {
            
            init_basics();
            
            readyInternal = true;
            
        }
        
    }
    
    function init_basics () {
		
		// core
		
		world = game.core.world;
		player = game.core.player;
        
    }
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function ready () { 
        return readyInternal && readyAll; 
    }
    
    function init () {
        
        if ( !ready() ) {
			
            init_internal();
            
            readyAll = true;
            
        }
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
		
		var i, l;
		
		// camera
        
        camera = game.get_camera();
		
		// scene
		
		scene = game.get_scene();
		
		// add items
		
		for ( i = 0, l = addOnShow.length; i < l; i += 1 ) {
			
			scene.add( addOnShow[ i ] );
			
        }
		
		// signals
        
        shared.signals.windowresized.add( resize );
        
        shared.signals.update.add( update );
        
    }
    
    function hide () {
        
        shared.signals.windowresized.remove( resize );
        
        shared.signals.update.remove( update );
        
    }
    
    function remove () {
        
		var i, l;
		
		// remove added items
		
		for ( i = 0, l = addOnShow.length; i < l; i += 1 ) {
		
			scene.remove( addOnShow[ i ] );
			
        }
		
    }
    
    function update () {
        
    }
    
    function resize ( W, H ) {
        
    }
    
    return main; 
    
}(KAIOPUA || {}));