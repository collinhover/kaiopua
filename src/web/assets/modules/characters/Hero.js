/*
 *
 * Hero.js
 * Adds additional functionality to basic character.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/characters/Hero.js",
		_Hero = {},
		_Character,
		_Game,
		_Farming;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Hero,
		requirements: [
			"assets/modules/characters/Character.js",
			"assets/modules/core/Game.js",
			"assets/modules/farming/Farming.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( c, g, f ) {
		console.log('internal hero', _Hero);
		
		_Character = c;
		_Game = g;
		_Farming = f;
		
		_Hero.Instance = Hero;
		_Hero.Instance.prototype = new _Character.Instance();
		_Hero.Instance.prototype.constructor = _Hero.Instance;
		
	}
	
	/*===================================================
    
    hero
    
    =====================================================*/
	
	function Hero ( parameters ) {
		
		var me = this;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.id = 'kaiopua_hero';
		
		parameters.model = parameters.modelInfo || {};
		parameters.model.geometry = main.get_asset_data( "assets/models/Hero.js" );
		parameters.model.material = new THREE.MeshLambertMaterial( { color: 0xFFF7E0, ambient: 0xFFF7E0, vertexColors: THREE.VertexColors } );
		parameters.model.shading = THREE.SmoothShading;
		
		parameters.model.physics = parameters.model.physics || {};
		parameters.model.physics.bodyType = 'capsule';
		parameters.model.physics.movementDamping = 0.5;
		
		parameters.movement = parameters.movement || {};
		parameters.movement.moveSpeed = 6;
		parameters.movement.moveSpeedBack = 2;
		parameters.movement.moveRunThreshold = parameters.movement.moveSpeed;
		parameters.movement.rotateSpeed = 0.019;
		parameters.movement.jumpSpeedStart = 8;
		parameters.movement.jumpSpeedEnd = 0;
		parameters.movement.jumpTimeMax = 100;
		parameters.movement.jumpAnimationTime = 1500;
		
		// prototype constructor
		
		_Character.Instance.call( this, parameters );
		
		// add to actions
		
		this.add_action( { 
			callback: rotate_plant,
			context: this,
			activeCheck: is_planting_rotating,
			activeCheckContext: this,
			actionsNames: [ '001', 'rotate_plant' ]
		} );
		
		this.add_action( { 
			callback: plant,
			context: this,
			activeCheck: is_planting,
			activeCheckContext: this,
			actionsNames: [ '002', 'plant' ]
		} );
		
	}
	
	/*===================================================
	
	farming
	
	=====================================================*/
	
	function plant ( parameters ) {
		
		return _Farming.plant( this, parameters );
		
	}
	
	function rotate_plant ( parameters ) {
		
		parameters = parameters || {};
		
		parameters.rotate = true;
		
		return plant.call( this, parameters );
		
	}
	
	function is_planting () {
		
		return _Farming.is_character_planting( this, 'planting' );
		
	}
	
	function is_planting_rotating () {
		
		return _Farming.is_character_planting( this, 'rotating' );
		
	}
	
} ( KAIOPUA ) );