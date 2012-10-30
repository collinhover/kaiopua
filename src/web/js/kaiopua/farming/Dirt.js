/*
 *
 * Dirt.js
 * Type of puzzle grid module.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/farming/Dirt.js",
		_Dirt = {},
		_GridModule;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Dirt,
		requirements: [
			"js/kaiopua/puzzles/GridModule.js",
			shared.pathToAsset + 'dirt_128.jpg'
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( gm, dirtImage ) {
		console.log('internal dirt', _Dirt);
		
		_GridModule = gm;
		
		// properties
		
		_Dirt.texture = new THREE.Texture( dirtImage );
		_Dirt.texture.needsUpdate = true;
		
		// instance
		
		_Dirt.Instance = Dirt;
		_Dirt.Instance.prototype = new _GridModule.Instance();
		_Dirt.Instance.prototype.constructor = _Dirt.Instance;
		_Dirt.Instance.prototype.supr = _GridModule.Instance.prototype;
		
	}
	
	/*===================================================
    
    dirt
    
    =====================================================*/
	
	function Dirt ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.material = parameters.material || new THREE.MeshLambertMaterial( { map: _Dirt.texture } );
		
		// prototype constructor
		
		_GridModule.Instance.call( this, parameters );
		
	}
	
} (KAIOPUA) );