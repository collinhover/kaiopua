/*
Character.js
Character module, handles generating characters in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		character = core.character = core.character || {},
		ready = false;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	character.make_character = make_character;
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
	function make_character ( parameters ) {
		
		var c = {};
		
		// handle parameters
		
		parameters = parameters || {};
		
		// properties
		
		c.id = 'test make char';
		
		// functions
		
		
		
		return c;
		
	}
	
	return main;
	
}(KAIOPUA || {}));