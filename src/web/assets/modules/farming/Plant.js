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
		_GUI,
		_ObjectHelper;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Plant,
		requirements: [
			"assets/modules/puzzles/GridElement.js",
			"assets/modules/puzzles/GridModule.js",
			"assets/modules/ui/UIElement.js",
			"assets/modules/core/GUI.js",
			"assets/modules/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( ge, gm, uie, gui, oh ) {
		console.log('internal plant', _Plant);
		
		_GridElement = ge;
		_GridModule = gm;
		_UIElement = uie;
		_GUI = gui;
		_ObjectHelper = oh;
		
		// properties
		
		_Plant.timeShow = 125;
		_Plant.timeHide = 125;
		_Plant.opacityBase = 0.75;
		_Plant.opacityVacant = 0.9;
		_Plant.opacityOccupied = 0.5;
		
		// instance
		
		_Plant.Instance = Plant;
		_Plant.Instance.prototype = new _GridElement.Instance();
		_Plant.Instance.prototype.constructor = _Plant.Instance;
		_Plant.Instance.prototype.supr = _GridElement.Instance.prototype;
		
		_Plant.Instance.prototype.reset_material = reset_material;
		
		_Plant.Instance.prototype.change_module = change_module;
		_Plant.Instance.prototype.change_seed = change_seed;
		
		_Plant.Instance.prototype.test_occupy_module = test_occupy_module;
		
		_Plant.Instance.prototype.grow = grow;
		_Plant.Instance.prototype.uproot = uproot;
		
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
		
		this.planted = false;
		
		this.materialBase = new THREE.MeshLambertMaterial();
		this.materialBase.color.copy( this.material.color );
		this.materialBase.ambient.copy( this.material.ambient );
		this.materialBase.vertexColors = this.material.vertexColors;
		
		this.change_seed( parameters.seed );
		
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
    
    seed
    
    =====================================================*/
	
	function change_seed( parameters ) {
		
		var parametersImage,
			parametersUnsuccessful,
			seedImgSrc;
		
		// if exists, hide/clear
		
		if ( this.seed instanceof _UIElement.Instance ) {
			
			this.seed.hide( { remove: true } );
			
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
			parameters.theme = parameters.theme || 'white';
			parameters.width = main.is_number( parameters.width ) ? parameters.width : _GUI.sizes.iconMediumContainer;
			parameters.height = main.is_number( parameters.height ) ? parameters.height : _GUI.sizes.iconMediumContainer;
			parameters.timeShow = main.is_number( parameters.timeShow ) ? parameters.timeShow : _Plant.timeShow;
			parameters.timeHide = main.is_number( parameters.timeHide ) ? parameters.timeHide : _Plant.timeHide;
			parameters.opacityShow = main.is_number( parameters.opacityShow ) ? parameters.opacityShow : _Plant.opacityBase;
			parameters.pointerEvents = false;
			parameters.circle = true;
			
			parametersImage = parameters.image || {};
			
			if ( typeof parametersImage === 'string' ) {
				
				seedImgSrc = parametersImage;
				
				parametersImage = {};
				
			}
			
			parametersImage.id = parameters.id + '_image';
			parametersImage.elementType = 'img';
			parametersImage.src = parametersImage.src || seedImgSrc || shared.pathToIcons + 'plant_64.png';
			parametersImage.width = main.is_number( parametersImage.width ) ? parametersImage.width : _GUI.sizes.iconMedium;
			parametersImage.height = main.is_number( parametersImage.height ) ? parametersImage.height : _GUI.sizes.iconMedium;
			parametersImage.pointerEvents = false;
			
			// container
			
			this.seed = new _UIElement.Instance( parameters );
			
			this.seed.hide( { time: 0 } );
		
			// image
		
			this.seedImage = new _UIElement.Instance( parametersImage );
			this.seedImage.align_once( 'center' );
			
			this.seedImage.show( { parent: this.seed, time: 0 } );
			
		}
		
	}
	
	/*===================================================
    
    module
    
    =====================================================*/
	
	function change_module () {
		
		// prototype call
		
		_Plant.Instance.prototype.supr.change_module.apply( this, arguments );
		
		// reset material
		
		this.reset_material();
		
		// handle planted state
		
		if ( this.module instanceof _GridModule.Instance ) {
			
			this.planted = true;
			
			this.grow();
			
		}
		else {
			
			this.planted = false;
			
		}
		
	}
	
	function test_occupy_module ( testModule ) {
		
		var success;
		
		// proto
		
		success = _Plant.Instance.prototype.supr.test_occupy_module.apply( this, arguments );
		
		// if successful
		
		if ( success === true ) {
			
			this.material.color.copy( _GridModule.colors.vacant );
			this.material.ambient.copy( _GridModule.colors.vacant );
			this.material.vertexColors = false;
			this.material.transparent = true;
			this.material.opacity = 0.5;
			
			this.seed.apply_css( 'background-color', _GridModule.colors.vacant.getContextStyle() );
			
			this.seed.show( { opacity: _Plant.opacityVacant } );
			
		}
		// unsuccessful, but tested on an actual module
		else if ( testModule instanceof _GridModule.Instance ) {
			
			this.material.color.copy( _GridModule.colors.occupied );
			this.material.ambient.copy( _GridModule.colors.occupied );
			this.material.vertexColors = false;
			this.material.transparent = true;
			this.material.opacity = 0.5;
			
			this.seed.apply_css( 'background-color', _GridModule.colors.occupied.getContextStyle() );
			
			this.seed.show( { opacity: _Plant.opacityOccupied } );
			
		}
		// unsuccessful, no module
		else {
			
			this.reset_material();
			
			this.seed.apply_css( this.seed.theme.stateLast );
			
			this.seed.show( { opacity: _Plant.opacityBase } );
				
		}
		
		return success;
		
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