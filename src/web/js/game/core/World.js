/*
World.js
World module, handles world in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		world = core.world = core.world || {},
		ready = false,
		assets,
		objectmaker,
		physics,
		scene,
		body,
		head,
		tail,
		parts,
		gravityMagnitude = 9.8;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	world.init = init;
	world.show = show;
	world.hide = hide;
	
	// getters and setters
	
	Object.defineProperty(world, 'gravityMagnitude', { 
		get : function () { return gravityMagnitude; }
	});
	
	Object.defineProperty(world, 'parts', { 
		get : function () { return [head, tail]; }
	});
	
	Object.defineProperty(world, 'head', { 
		get : function () { return head; }
	});
	
	Object.defineProperty(world, 'tail', { 
		get : function () { return tail; }
	});
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init () {
		
		if ( ready !== true ) {
		
			// assets
			
			assets = main.utils.loader.assets;
			
			// workers
			
			objectmaker = game.workers.objectmaker;
			
			// core
			
			physics = core.physics;
			
			// initialization
			
			init_environment();
			
			init_physics();
			
			ready = true;
			
		}
			
	}
	
	function init_environment () {
		
		var normalMat = new THREE.MeshNormalMaterial();
		
		// body parts
        
        head = objectmaker.make_model({
            geometry: assets["assets/models/World_Head.js"],
			materials: normalMat,
			shading: THREE.FlatShading
        });
		
		tail = objectmaker.make_model({
            geometry: assets["assets/models/World_Tail.js"],
			materials: normalMat,
			shading: THREE.FlatShading
        });
		
		// store
		
		parts = [head, tail];
		
		// test
		
		var groundGeometry = new THREE.PlaneGeometry( 3000, 3000, 1, 1 );
		
		var ground = objectmaker.make_model({
            geometry: groundGeometry,
			materials: normalMat,
			rotation: new THREE.Vector3( -90, 0, 0 )
        });
		
		ground.mesh.position.set( 0, -2000, 0 );
		
		// add to physics
		ground.rigidBody = physics.translate( ground.mesh, {
			bodyType: 'plane'
		});
		
		parts.push( ground );
		
		//
		//
		//
		// boxes test grid
		//
		//
		//
		
		var make_box = function ( x, y, z ) {
			var geom = new THREE.CubeGeometry( 50, 50, 50, 1, 1 );
			
			// box
			
			var box = objectmaker.make_model({
				geometry: geom,
				materials: normalMat
			});
			
			box.mesh.position.set( x, y, z );
			
			box.rigidBody = physics.translate( box.mesh, {
				bodyType: 'box'
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
				
				parts.push( box );
				
				rotB += deltaRotB;
			
			}
			
		}
		
	}
	
	function init_physics () {
		
		// translate model to physics
		
		head.rigidBody = physics.translate( head.mesh, {
			bodyType: 'trimesh',
			geometry: head.mesh.geometry
		});
		
		tail.rigidBody = physics.translate( tail.mesh, {
			bodyType: 'trimesh',
			geometry: tail.mesh.geometry
		});
		
	}
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
	function show () {
		
		var i, l,
			part;
		
		scene = game.scene;
		
        // fog
        
        scene.fog = new THREE.Fog( 0xffffff, -100, 10000 );
		
		// add parts
		
		for ( i = 0, l = parts.length; i < l; i += 1 ) {
			
			part = parts[ i ];
			
			scene.add( part.mesh );
			
			if ( typeof part.rigidBody !== 'undefined' ) {
				
				physics.add( part.mesh, { rigidBody: part.rigidBody } );
				
			}
			
		}
		
	}
	
	function hide () {
		
		var i, l,
			part;
		
		// remove parts
		
		for ( i = 0, l = parts.length; i < l; i += 1 ) {
			
			part = parts[ i ];
			
			scene.remove( part.mesh );
			
			if ( typeof part.rigidBody !== 'undefined' ) {
				
				physics.remove( part.mesh );
				
			}
			
		}
		
	}
	
	return main;
	
}(KAIOPUA || {}));