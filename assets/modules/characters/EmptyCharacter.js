/*
EmptyCharacter.js
Empty character module, for use with character module.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		emptycharacter = {};
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	Object.defineProperty( emptycharacter, 'id', { 
		get : function () { return; }
	});
	
	Object.defineProperty( emptycharacter, 'modelInfo', { 
		get : function () { return; }
	});
	
	Object.defineProperty( emptycharacter, 'physicsParameters', { 
		get : function () { return; }
	});
	
	emptycharacter = main.asset_register( "assets/modules/characters/EmptyCharacter", emptycharacter );
	
	/*===================================================
    
    standard
    
    =====================================================*/
	
	return main;
	
}(KAIOPUA || {}));