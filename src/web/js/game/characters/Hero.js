/*
Hero.js
Hero character module, generates hero and properties for use with character module.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		characters = game.characters = game.characters || {},
		hero = characters.hero = characters.hero || {},
		ready = false;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	hero.get_properties = get_properties;
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init () {
		
		if ( ready !== true ) {
			
			ready = true;
			
		}
		
	}
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
	function get_properties () {
		
		var p = {};
		
		
		return p;
		
	}
	
	return main;
	
}(KAIOPUA || {}));