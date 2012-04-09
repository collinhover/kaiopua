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
		plantGeometryBase,
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
	
	function init_internal( ge, gm, uie, btn, gui, oh, plant ) {
		console.log('internal plant', _Plant);
		
		_GridElement = ge;
		_GridModule = gm;
		_UIElement = uie;
		_Button = btn;
		_GUI = gui;
		_ObjectHelper = oh;
		plantGeometryBase = plant;
		
		utilVec31Grow = new THREE.Vector3();
		
		// properties
		
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
		
		_Plant.Instance.prototype.reset_material = reset_material;
		
		_Plant.Instance.prototype.change_rotator = change_rotator;
		_Plant.Instance.prototype.change_seed = change_seed;
		_Plant.Instance.prototype.change_module = change_module;
		
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
		
		if ( typeof parameters.geometry === 'undefined' ) {
			
			parameters.geometry = plantGeometryBase;
			
			parameters.layout = [ [ 1 ] ];
			
		}
		/*
		parameters.layout = $M( [
				[ Math.round( Math.random() ), Math.round( Math.random() ), Math.round( Math.random() ) ],
				[ Math.round( Math.random() ), Math.round( Math.random() ), Math.round( Math.random() ) ],
				[ Math.round( Math.random() ), Math.round( Math.random() ), Math.round( Math.random() ) ]
			] );
		*/
		
		parameters.materials = parameters.materials || new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } );
		
		// prototype constructor
		
		_GridElement.Instance.call( this, parameters );
		console.log(' new plant with geometry', this );
		// properties
		
		this.timeGrow = main.is_number( parameters.timeGrow ) ? parameters.timeGrow : _Plant.timeGrow;
		
		this.planted = false;
		
		this.materialBase = new THREE.MeshLambertMaterial();
		this.materialBase.color.copy( this.material.color );
		this.materialBase.ambient.copy( this.material.ambient );
		this.materialBase.vertexColors = this.material.vertexColors;
		
		this.change_seed( parameters.seed );
		
		this.change_rotator( parameters.rotator );
		
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
			this.material.transparent = true;
			this.material.opacity = _Plant.opacityVacant;
			
			this.seed.apply_css( 'background-color', _GridModule.colors.vacant.getContextStyle() );
			
			this.seed.show( { opacity: _Plant.opacityVacantSeed } );
			
		}
		// unsuccessful, but tested on an actual module
		else if ( testModule instanceof _GridModule.Instance ) {
			
			this.material.color.copy( _GridModule.colors.occupied );
			this.material.ambient.copy( _GridModule.colors.occupied );
			this.material.transparent = true;
			this.material.opacity = _Plant.opacityOccupied;
			
			this.seed.apply_css( 'background-color', _GridModule.colors.occupied.getContextStyle() );
			
			this.seed.show( { opacity: _Plant.opacityOccupiedSeed } );
			
		}
		// unsuccessful, no module
		else {
			
			this.reset_material();
			
			this.seed.apply_css( this.seed.theme.stateLast );
			
			this.seed.show( { opacity: _Plant.opacitySeed } );
				
		}
		
		return success;
		
	}
	
	/*===================================================
    
    grow
    
    =====================================================*/
	
	function grow () {
		console.log('plant grow!');
		// set scale to 0
		
		this.scale.set( 0, 0, 0 );
		
		// tween scale to 1
		
		this.tween_properties( {
			time: this.timeGrow,
			easing: TWEEN.Easing.Back.EaseOut,
			scale: utilVec31Grow.set( 1, 1, 1 )
		} );
		
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