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
		_ObjectHelper,
		utilVec31Grow;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Plant,
		requirements: [
			"assets/modules/puzzles/GridElement.js",
			"assets/modules/puzzles/GridModule.js",
			"assets/modules/utils/ObjectHelper.js",
			{ path: "assets/models/Taro_Plant_001.js", type: 'model' }
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( ge, gm, oh, plantGeometry ) {
		console.log('internal plant', _Plant);
		
		_GridElement = ge;
		_GridModule = gm;
		_ObjectHelper = oh;
		
		utilVec31Grow = new THREE.Vector3();
		
		// properties
		
		_Plant.geometryBase = plantGeometry;
		_Plant.timeGrow = 500;
		_Plant.timeShow = 125;
		_Plant.timeHide = 125;
		_Plant.opacitySeed = 0.75;
		_Plant.opacityVacant = 0.5;
		_Plant.opacityVacantSeed = 0.9;
		_Plant.opacityOccupied = 0.5;
		_Plant.opacityOccupiedSeed = 0.9;
		_Plant.opacityRotator = 0.5;
		
		// instance
		
		_Plant.Instance = Plant;
		_Plant.Instance.prototype = new _GridElement.Instance();
		_Plant.Instance.prototype.constructor = _Plant.Instance;
		_Plant.Instance.prototype.supr = _GridElement.Instance.prototype;
		
		_Plant.Instance.prototype.reset = reset;
		_Plant.Instance.prototype.clone = clone;
		
		_Plant.Instance.prototype.reset_material = reset_material;
		
		_Plant.Instance.prototype.change_seed = change_seed;
		_Plant.Instance.prototype.change_module = change_module;
		
		_Plant.Instance.prototype.show_last_modules_tested = show_last_modules_tested;
		_Plant.Instance.prototype.occupy_modules = occupy_modules;
		
	}
	
	/*===================================================
    
    plant
    
    =====================================================*/
	
	function Plant ( parameters ) {
		
		var c;
		
		// handle parameters
		
		parameters = parameters || {};
		
		if ( typeof parameters.geometry === 'undefined' ) {
			
			parameters.geometry = new THREE.CubeGeometry( 20, 40, 20 );
			
		}
		
		c = parameters.customizations = parameters.customizations || {};
		c.geometry = c.geometry || new THREE.CubeGeometry( 60, 120, 60 );//_Plant.geometryBase;
		
		// prototype constructor
		
		_GridElement.Instance.call( this, parameters );
		
		// properties
		
		this.timeGrow = main.is_number( parameters.timeGrow ) ? parameters.timeGrow : _Plant.timeGrow;
		this.materialBase = new THREE.MeshLambertMaterial();
		
		// ui
		
		this.change_seed( parameters.seed );
		
		// reset
		
		this.reset();
		
	}
	
	/*===================================================
	
	reset
	
	=====================================================*/
	
	function reset () {
		
		this.planted = false;
		
		this.materialBase.color.copy( this.material.color );
		this.materialBase.ambient.copy( this.material.ambient );
		this.materialBase.vertexColors = this.material.vertexColors;
		
	}
	
	/*===================================================
	
	clone
	
	=====================================================*/
	
	function clone ( c ) {
		
		var i, l,
			model,
			modelCustom;
		
		if ( typeof c === 'undefined' ) {
			
			c = new _Plant.Instance();
			
		}
		
		if ( c instanceof _Plant.Instance ) {
			
			// proto
			
			c = _Plant.Instance.prototype.supr.clone.call( this, c );
			
			// properties
			
			c.timeGrow = this.timeGrow;
			
			// models
			
			for ( i = 0, l = c.models.length; i < l; i++ ) {
				
				model = c.models[ i ];
				model.scale.set( 1, 1, 1 );
				
				if ( c.hasCustomModels ) {
					
					modelCustom = c.customizations.models[ i ];
					modelCustom.scale.set( 1, 1, 1 );
					
				}
				
			}
			
			// reset
			
			c.reset();
			
		}
		
		return c;
		
	}
	
	/*===================================================
    
    seed
    
    =====================================================*/
	
	function change_seed( parameters ) {
		
		// if exists, remove
		
		if ( this.$seed ) {
			
			
			
		}
		
		// handle parameters
		
		parameters = parameters || {};
		//parameters.$element
		//parameters.image = parameters.image || shared.pathToIcons + 'plant_64.png';
		parameters.timeShow = main.is_number( parameters.timeShow ) ? parameters.timeShow : _Plant.timeShow;
		parameters.timeHide = main.is_number( parameters.timeHide ) ? parameters.timeHide : _Plant.timeHide;
		parameters.opacityShow = main.is_number( parameters.opacityShow ) ? parameters.opacityShow : _Plant.opacitySeed;
		
		// create new
		
	}
	
	/*===================================================
    
    material
    
    =====================================================*/
	
	function reset_material () {
		
		this.material.color.copy( this.materialBase.color );
		this.material.ambient.copy( this.materialBase.ambient );
		this.material.vertexColors = this.materialBase.vertexColors;
		this.material.transparent = false;
		this.material.opacity = 1;
		
	}
	
	/*===================================================
    
    module
    
    =====================================================*/
	
	function change_module () {
		
		// reset material
		
		this.reset_material();
		
		// proto
		
		_Plant.Instance.prototype.supr.change_module.apply( this, arguments );
		
	}
	
	function show_last_modules_tested ( force ) {
		
		var dirtyModuleTest = this._dirtyModuleTest;
		
		// proto
		
		_Plant.Instance.prototype.supr.show_last_modules_tested.apply( this, arguments );
		
		if ( dirtyModuleTest === true || force === true ) {
			
			// if successful
			
			if ( this.testSuccess === true ) {
				
				this.material.color.copy( _GridModule.colors.vacant );
				this.material.ambient.copy( _GridModule.colors.vacant );
				this.material.transparent = true;
				this.material.opacity = _Plant.opacityVacant;
				
				//this.$seed = this.$seedSuccess
				
			}
			// unsuccessful, but tested on an actual module
			else if ( this.testModule instanceof _GridModule.Instance ) {
				
				this.material.color.copy( _GridModule.colors.occupied );
				this.material.ambient.copy( _GridModule.colors.occupied );
				this.material.transparent = true;
				this.material.opacity = _Plant.opacityOccupied;
				
				//this.$seed = this.$seedFail
			
			}
			// base state
			else {
				
				this.reset_material();
				
				//this.$seed = this.$seedBase
					
			}
			
		}
		
	}
	
	function occupy_modules () {
		
		var i, l,
			model;
		
		// proto
		
		_Plant.Instance.prototype.supr.occupy_modules.apply( this, arguments );
		
		// if has module
		
		if ( this.hasModule ) {
			console.log(' PLANT OCCUPY MODULES' );
			// for each model
			
			for ( i = 0, l = this.modelsCurrent.length; i < l; i++ ) {
				
				model = this.modelsCurrent[ i ];
				
				// set scale to 0
				
				model.scale.set( 0, 0, 0 );
				
				// tween scale to 1
				
				model.tween_properties( {
					time: this.timeGrow,
					easing: TWEEN.Easing.Back.EaseOut,
					scale: utilVec31Grow.set( 1, 1, 1 )
				} );
				
			}
			
		}
		
	}
	
} (KAIOPUA) );