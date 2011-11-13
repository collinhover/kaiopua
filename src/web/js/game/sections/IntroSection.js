/*
IntroSection.js
Intro module, handles introduction to story and teaching user basic game mechanics.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        sections = game.sections = game.sections || {},
        intro = sections.intro = sections.intro || {},
        readyInternal = false,
        readyAll = false,
        assets,
        objectmaker,
		world,
		player,
		physics,
		camera,
        scene,
		addOnShow = [],
		light;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    intro.init = init;
    intro.show = show;
    intro.hide = hide;
    intro.remove = remove;
    intro.update = update;
    intro.resize = resize;
    intro.ready = ready;
    intro.domElement = function () {};
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    game.update_section_list();
	
	function init_internal () {
        
        if ( readyInternal !== true ) {
            
            init_basics();
            
            readyInternal = true;
            
        }
        
    }
    
    function init_basics () {
		
		// core
		
		world = game.core.world;
		player = game.core.player;
		physics = game.core.physics;
		
		// workers
		
		objectmaker = game.workers.objectmaker;
        
    }
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function ready () { 
        return readyInternal && readyAll; 
    }
    
    function init () {
        
        if ( !ready() ) {
			
            init_internal();
            
            init_environment();
            
            readyAll = true;
            
        }
    }
    
    function init_environment () {
		
		// light
		
		light = new THREE.SpotLight( 0xffffff );
        light.position = new THREE.Vector3(-1, 0, 1).normalize();
		
		// add on show items
		
		addOnShow.push( light );
		
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
		
		var make_box = function ( x, y, z, movable ) {
			var geom = new THREE.CubeGeometry( 50, 50, 50, 1, 1 );
			
			// box
			
			var box = objectmaker.make_model({
				geometry: geom,
				materials: [normalMat, normalMatWire]
			});
			
			box.mesh.position.set( x, y, z );
			
			box.rigidBody = physics.translate( box.mesh, {
				bodyType: 'box',
				movable: typeof movable === 'undefined' ? false : movable
			});
			
			return box;
		}
		
		var numRings = 6;
		var radius = 2000;
		
		var deltaRotA = Math.PI / (numRings + 1);
		var rotA = 0;
		
		var numBoxPerRing = 8;
		var deltaRotB = (Math.PI * 2) / (numBoxPerRing);
		var rotB = 0;
		
		for ( var i = 0, l = numRings; i < l; i += 1 ) {
			
			rotB = 0;
			
			rotA += deltaRotA;
			
			if ( rotA > Math.PI ) {
				
				rotA = 0;
				
			}
			
			var ny = radius * Math.cos( rotA );
			
			for ( var bi = 0, bl = numBoxPerRing; bi < bl; bi += 1 ) {
				
				var nx = radius * Math.sin( rotA ) * Math.cos( rotB );
				var nz = radius * Math.sin( rotA ) * Math.sin( rotB );
				
				var box = make_box( nx, ny, nz );
				
				addOnShow.push( box );
				
				rotB += deltaRotB;
			
			}
			
		}
		
		addOnShow.push( make_box( 1, 3000, 100, true ) );
		
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
		
		var i, l,
			item;
		
		// camera
        
        camera = game.camera;
		
		camera.position.set(0, 0, 4000);
		
		camera.lookAt( new THREE.Vector3(0, 0, 0) );
		
		// scene
		
		scene = game.scene;
		
		// add world
		
		world.show();
		
		// add items
		
		for ( i = 0, l = addOnShow.length; i < l; i += 1 ) {
			
			item = addOnShow[ i ];
			
			if ( typeof item.mesh !== 'undefined' ) {
			
				scene.add( item.mesh );
			
				if ( typeof item.rigidBody !== 'undefined' ) {
					
					physics.add( item.mesh, { rigidBody: item.rigidBody } );
					
				}
				
			}
			else {
				
				scene.add( item );
				
			}
			
        }
		
		// start player
		
		player.show();
		
		player.enable();
		
		//player.cameraMode = 'freelook';
		
		//setTimeout( game.pause, 1000 );
		
		// signals
        
        shared.signals.windowresized.add( resize );
        
        shared.signals.update.add( update );
        
    }
    
    function hide () {
        
        shared.signals.windowresized.remove( resize );
        
        shared.signals.update.remove( update );
        
    }
    
    function remove () {
        
		var i, l,
			item;
		
		// stop player
		
		player.hide();
		
		player.disable();
		
		// hide world
		
		world.hide();
		
		// remove added items
		
		for ( i = 0, l = addOnShow.length; i < l; i += 1 ) {
		
			item = addOnShow[ i ];
			
			if ( typeof item.mesh !== 'undefined' ) {
			
				scene.remove( item.mesh );
			
				if ( typeof item.rigidBody !== 'undefined' ) {
					
					physics.remove( item.mesh );
					
				}
				
			}
			else {
				
				scene.remove( item );
				
			}
			
        }
		
    }
    
    function update () {
		
		// position point light to always be 
        // above and infront of camera
		
        var camP = camera.position.clone();
        var newP = new THREE.Vector3( 0, 200, -100);
		
        camera.quaternion.multiplyVector3( newP );
        
        newP.addSelf( camera.position );
        
		light.position = newP;
        
    }
    
    function resize ( W, H ) {
        
    }
    
    return main; 
    
}(KAIOPUA || {}));