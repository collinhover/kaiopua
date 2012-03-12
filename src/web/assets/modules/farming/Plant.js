/*
 *
 * Plant.js
 * Basic element of farming.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/farming/Plant.js",
		_Plant = {},
		_GridElement,
		_GridModule,
		_ObjectHelper;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Plant,
		requirements: [
			"assets/modules/puzzles/GridElement.js",
			"assets/modules/puzzles/GridModule.js",
			"assets/modules/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( ge, gm, oh ) {
		console.log('internal plant', _Plant);
		
		_GridElement = ge;
		_GridModule = gm;
		_ObjectHelper = oh;
		
		_Plant.Instance = Plant;
		_Plant.Instance.prototype = new _GridElement.Instance();
		_Plant.Instance.prototype.constructor = _Plant.Instance;
		_Plant.Instance.prototype.supr = _GridElement.Instance.prototype;
		
		
		_Plant.Instance.prototype.grow = grow;
		_Plant.Instance.prototype.uproot = uproot;
		_Plant.Instance.prototype.change_module = change_module;
		_Plant.Instance.prototype.update = update;
		
	}
	
	/*===================================================
    
    plant
    
    =====================================================*/
	
	function Plant ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_GridElement.Instance.call( this, parameters );
		
		// properties
		
		this.seed = parameters.seed;
		
		this.planted = false;
		
	}
	
	/*===================================================
    
    module
    
    =====================================================*/
	
	function change_module () {
		
		// prototype call
		
		_Plant.Instance.prototype.supr.change_module.apply( this, arguments );
		
		// handle planted state
		
		if ( this.module instanceof _GridModule.Instance ) {
			
			this.planted = true;
			
			this.grow();
			
		}
		else {
			
			this.planted = false;
			
		}
		
	}
	
	/*===================================================
    
    grow
    
    =====================================================*/
	
	function grow () {
		
		// TODO: grow
		
	}
	
	/*===================================================
    
    uproot
    
    =====================================================*/
	
	function uproot () {
		
		// clear module
		
		this.change_module();
		
	}
	
	/*===================================================
    
    update
    
    =====================================================*/
	
	function update () {
		
		_Plant.Instance.prototype.supr.update.apply( this, arguments );
		
	}
	
} (KAIOPUA) );