/*
EmptyCharacter.js
Empty character module, for use with character module.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		characters = game.characters = game.characters || {},
		emptycharacter = characters.emptycharacter = characters.emptycharacter || {};
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	Object.defineProperty( emptycharacter, 'id', { 
		get : function () { return; }
	});
	
	Object.defineProperty( emptycharacter, 'modelInfo', { 
		get : function () { return; }
	});
	
	Object.defineProperty( emptycharacter, 'rigidBodyInfo', { 
		get : function () { return; }
	});
	
	/*===================================================
    
    standard
    
    =====================================================*/
	
	return main;
	
}(KAIOPUA || {}));