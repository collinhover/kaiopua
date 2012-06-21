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
		_UIElement,
		_Button,
		_GUI,
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
			"assets/modules/ui/UIElement.js",
			"assets/modules/ui/Button.js",
			"assets/modules/ui/GUI.js",
			"assets/modules/utils/ObjectHelper.js",
			{ path: "assets/models/Taro_Plant_001.js", type: 'model' }
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( ge, gm, uie, btn, gui, oh, plantGeometry ) {
		console.log('internal plant', _Plant);
		
		_GridElement = ge;
		_GridModule = gm;
		_UIElement = uie;
		_Button = btn;
		_GUI = gui;
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
		
		_Plant.Instance.prototype.change_rotator = change_rotator;
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
		this.change_rotator( parameters.rotator );
		
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
			
			// TODO 
			// actually clone uielements
			
			c.change_seed( this.seed );
			c.change_rotator( this.rotator );
			
			// reset
			
			c.reset();
			
		}
		
		return c;
		
	}
	
	/*===================================================
    
    seed
    
    =====================================================*/
	
	function change_rotator ( parameters ) {
		
		var parentPrevious = false;
		
		// if exists, hide/clear
		
		if ( this.rotator instanceof _UIElement.Instance ) {
			
			parentPrevious = this.rotator.parent;
			
			this.rotator.hide( { remove: true, time: 0 } );
			
		}
		
		// if is uielement
		if ( parameters instanceof _UIElement.Instance ) {
		
			this.rotator = parameters;
			
		}
		// else create uielement
		else {
			
			// handle parameters
			
			parameters = parameters || {};
			
			parameters.id = parameters.id || 'plant_rotator';
			parameters.image = parameters.image || shared.pathToIcons + 'rotate_64.png';
			parameters.imageSize = main.is_number( parameters.imageSize ) ? parameters.imageSize : _UIElement.sizes.iconLarge;
			parameters.width = main.is_number( parameters.width ) ? parameters.width : _UIElement.sizes.iconLargeContainer;
			parameters.height = main.is_number( parameters.height ) ? parameters.height : _UIElement.sizes.iconLargeContainer;
			parameters.timeShow = main.is_number( parameters.timeShow ) ? parameters.timeShow : _Plant.timeShow;
			parameters.timeHide = main.is_number( parameters.timeHide ) ? parameters.timeHide : _Plant.timeHide;
			parameters.opacityShow = main.is_number( parameters.opacityShow ) ? parameters.opacityShow : _Plant.opacityRotator;
			parameters.pointerEvents = false;
			parameters.circle = true;
			
			this.rotator = new _Button.Instance( parameters );
			
			this.rotator.hide( { time: 0 } );
			
			if ( parentPrevious ) {
				
				this.rotator.show( { parent: parentPrevious } );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    seed
    
    =====================================================*/
	
	function change_seed( parameters ) {
		
		var parentPrevious = false;
		
		// if exists, hide/clear
		
		if ( this.seed instanceof _UIElement.Instance ) {
			
			parentPrevious = this.seed.parent;
			
			this.seed.hide( { remove: true, time: 0 } );
			
		}
		
		// if is uielement
		if ( parameters instanceof _UIElement.Instance ) {
		
			this.seed = parameters;
			
		}
		// else create uielement
		else {
			
			// handle parameters
			
			parameters = parameters || {};
			
			parameters.id = parameters.id || 'plant_seed';
			parameters.image = parameters.image || shared.pathToIcons + 'plant_64.png';
			parameters.imageSize = main.is_number( parameters.imageSize ) ? parameters.imageSize : _UIElement.sizes.iconMedium;
			parameters.width = main.is_number( parameters.width ) ? parameters.width : _UIElement.sizes.iconMediumContainer;
			parameters.height = main.is_number( parameters.height ) ? parameters.height : _UIElement.sizes.iconMediumContainer;
			parameters.timeShow = main.is_number( parameters.timeShow ) ? parameters.timeShow : _Plant.timeShow;
			parameters.timeHide = main.is_number( parameters.timeHide ) ? parameters.timeHide : _Plant.timeHide;
			parameters.opacityShow = main.is_number( parameters.opacityShow ) ? parameters.opacityShow : _Plant.opacitySeed;
			parameters.pointerEvents = false;
			parameters.circle = true;
			
			this.seed = new _Button.Instance( parameters );
			
			this.seed.hide( { time: 0 } );
			
			if ( parentPrevious ) {
				
				this.seed.show( { parent: parentPrevious } );
				
			}
			
		}
		
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
				
				this.seed.apply_css( 'background-color', _GridModule.colors.vacant.getContextStyle() );
				
				this.seed.show( { opacity: _Plant.opacityVacantSeed } );
				
			}
			// unsuccessful, but tested on an actual module
			else if ( this.testModule instanceof _GridModule.Instance ) {
				
				this.material.color.copy( _GridModule.colors.occupied );
				this.material.ambient.copy( _GridModule.colors.occupied );
				this.material.transparent = true;
				this.material.opacity = _Plant.opacityOccupied;
				
				this.seed.apply_css( 'background-color', _GridModule.colors.occupied.getContextStyle() );
				
				this.seed.show( { opacity: _Plant.opacityOccupiedSeed } );
			
			}
			// base state
			else {
				
				this.reset_material();
				
				this.seed.apply_css( this.seed.theme.stateLast );
				
				this.seed.show( { opacity: _Plant.opacitySeed } );
					
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