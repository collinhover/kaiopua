/*
 *
 * Intro.js
 * Handles introduction to story and teaching user basic game mechanics.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/sections/Intro.js",
		intro = {},
		game,
		model,
		world,
		player,
		physics,
        _ready = false,
		waitingToShow = false,
		camera,
        scene,
		sceneBG,
		addOnShow = [],
		addBGOnShow = [],
		skybox,
		ambient,
		light;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    intro.show = show;
    intro.hide = hide;
    intro.remove = remove;
    intro.update = update;
    intro.resize = resize;
    intro.domElement = function () {};
	
	main.asset_register( assetPath, { 
		data: intro,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/core/Physics.js",
			"assets/modules/core/World.js",
			"assets/modules/core/Player.js",
			"assets/modules/core/Model.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( g, physx, w, p, m ) {
		console.log('internal intro');
		if ( _ready !== true ) {
			
			// assets
			
			game = g;
			physics = physx;
			world = w;
			player = p;
			model = m;
			
			// environment
			
			init_environment();
			
			_ready = true;
			
			if ( waitingToShow === true ) {
				
				waitingToShow = false;
				
				show();
				
			}
			
		}
		
	}
    
    function init_environment () {
		/*
		//
		//
		//
		// boxes test grid
		//
		//
		//
		
		var normalMat = new THREE.MeshNormalMaterial();
		
		var normalMatWire = new THREE.MeshBasicMaterial({
			color: 0x000000,
			wireframe: true
		});
	
		var make_shape = function ( bodyType, x, y, z, dynamic, w, h, d ) {
			
			var geom,
				bodyType = bodyType || 'box',
				shape;
			
			if ( bodyType === 'sphere' ) {
				
				geom = new THREE.SphereGeometry( Math.max( w || 25, h || 25, d || 25 ) );
				
			}
			else {
				
				geom = new THREE.CubeGeometry( w || 50, h || 50, d || 50, 1, 1 );
				
			}
			
			// shape
			
			var shape = model.instantiate({
				geometry: geom,
				materials: normalMat
			});
			
			shape.mesh.position.set( x, y, z );
			
			shape.physics = physics.translate( shape.mesh, {
				bodyType: bodyType,
				dynamic: typeof dynamic === 'undefined' ? false : dynamic
			});
			
			return shape;
		}
		
		var numRings = 6;
		var radius = 2000;
		
		var deltaRotA = Math.PI / (numRings + 1);
		var rotA = 0;
		
		var numBoxPerRing = 8;
		var deltaRotB = (Math.PI * 2) / (numBoxPerRing);
		var rotB = 0;
		
		var nx, ny, nz;
		
		var i, l;
		
		for ( i = 0, l = numRings; i < l; i ++ ) {
			
			rotB = 0;
			
			rotA += deltaRotA;
			
			if ( rotA > Math.PI ) {
				
				rotA = 0;
				
			}
			
			ny = radius * Math.cos( rotA );
			
			for ( var bi = 0, bl = numBoxPerRing; bi < bl; bi ++ ) {
				
				nx = radius * Math.sin( rotA ) * Math.cos( rotB );
				nz = radius * Math.sin( rotA ) * Math.sin( rotB );
				
				var box = make_shape( 'box', nx, ny, nz );
				
				addOnShow.push( box );
				
				rotB += deltaRotB;
			
			}
			
		}
		
		// movable boxes
		
		addOnShow.push( make_shape( 'box', 100, 2500, 100, true ) );
		addOnShow.push( make_shape( 'sphere', -100, 2500, 100, true ) );
		addOnShow.push( make_shape( 'sphere', 100, 2500, -100, true ) );
		addOnShow.push( make_shape( 'box', -100, 2500, -100, true ) );
		addOnShow.push( make_shape( 'sphere', 75, 2600, 75, true ) );
		addOnShow.push( make_shape( 'box', -75, 2600, 75, true ) );
		addOnShow.push( make_shape( 'box', 75, 2600, -75, true ) );
		addOnShow.push( make_shape( 'sphere', -75, 2600, -75, true ) );
		*/
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
		
		if ( _ready === true ) {
			
			// camera
			
			camera = game.camera;
			
			camera.position.set(0, 0, 4000);
			
			camera.lookAt( new THREE.Vector3(0, 0, 0) );
			
			// scene
			
			scene = game.scene;
			
			sceneBG = game.sceneBG;
			
			// add world
			
			world.show();
			
			// add items
			
			game.add_to_scene( addOnShow, scene );
			
			game.add_to_scene( addBGOnShow, sceneBG );
			
			// start player
			
			player.show();
			
			player.enable();
			
			player.character.position.set( 1, 2700, 1 );
			
			//player.cameraMode = 'freelook';
			
			// signals
			
			shared.signals.windowresized.add( resize );
			
			shared.signals.update.add( update );
			
		}
		else {
			
			waitingToShow = true;
			
		}
        
    }
	
	function hide () {
		
		waitingToShow = false;
		
		shared.signals.windowresized.remove( resize );
        
        shared.signals.update.remove( update );
		
    }
    
    function remove () {
		
		if ( _ready === true ) {
			
			// stop player
			
			player.disable();
			
			player.hide();
			
			// hide world
			
			world.hide();
			
			// remove added items
			
			game.remove_from_scene( addOnShow, scene );
			
			game.remove_from_scene( addBGOnShow, sceneBG );
			
		}
		else {
			
			waitingToShow = false;
			
		}
        
    }
    
    function update () {
		
    }
    
    function resize ( W, H ) {
        
    }
    
} ( KAIOPUA ) );