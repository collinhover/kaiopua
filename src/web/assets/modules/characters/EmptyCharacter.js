/*
 *
 * EmptyCharacter.js
 * Used as default (fallback) character.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/characters/EmptyCharacter.js",
		_EmptyCharacter = {};
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	Object.defineProperty( _EmptyCharacter, 'id', { 
		get : function () { return; }
	});
	
	Object.defineProperty( _EmptyCharacter, 'modelInfo', { 
		get : function () { return; }
	});
	
	Object.defineProperty( _EmptyCharacter, 'physicsParameters', { 
		get : function () { return; }
	});
	
	main.asset_register( assetPath, { data: _EmptyCharacter } );
	
} ( KAIOPUA ) );