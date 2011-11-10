/*
Hero.js
Hero character module, for use with character module.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		characters = game.characters = game.characters || {},
		hero = characters.hero = characters.hero || {};
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	Object.defineProperty( hero, 'id', { 
		get : get_id
	});
	
	Object.defineProperty( hero, 'modelInfo', { 
		get : get_model_info
	});
	
	Object.defineProperty( hero, 'rigidBodyInfo', { 
		get : get_rigid_body_info
	});
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
	function get_id () {
		
		return 'kaiopua_hero';
		
	}
	
	function get_model_info () {
		
		return {
			
			geometryAssetPath: "assets/models/Hero.js",
			materials: [ new THREE.MeshNormalMaterial() ]
			
		};
		
	}
		
	function get_rigid_body_info () {
		
		return {
			
			bodyType: 'box',
			width: 40,
			height: 100,
			depth: 40
			
		};
		
	}
	
	return main;
	
}(KAIOPUA || {}));