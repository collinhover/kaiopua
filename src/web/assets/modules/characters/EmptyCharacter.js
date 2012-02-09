/*
EmptyCharacter.js
Empty character module, for use with character module.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/characters/EmptyCharacter.js",
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
	
	main.asset_register( assetPath, { data: emptycharacter } );
	
	/*===================================================
    
    standard
    
    =====================================================*/
	
	return main;
	
} ( KAIOPUA ) );