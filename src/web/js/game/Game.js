/*
Game.js
Game module, handles sections of game.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        utils = main.utils = main.utils || {},
        loader = utils.loader = utils.loader || {},
        uihelper = utils.uihelper = utils.uihelper || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
        sections = game.sections = game.sections || {},
        workers = game.workers = game.workers || {},
        menus = game.menus = game.menus || {},
        transitioner,
        domElement,
        menumaker,
        renderer, 
        renderTarget,
		physics,
		world,
		player,
        sectionNames = [],
        currentSection, 
        previousSection, 
        paused = true,
        transitionOut = 1000, 
        transitionIn = 400,
        loadAssetsDelay = 500,
        dependencies = [
            "js/lib/three/Three.js",
            "js/lib/three/ThreeExtras.js",
            "js/lib/three/postprocessing/ShaderExtras.js",
            "js/lib/three/postprocessing/EffectComposer.js",
            "js/lib/three/postprocessing/RenderPass.js",
            "js/lib/three/postprocessing/ShaderPass.js",
            "js/lib/three/postprocessing/MaskPass.js",
            "js/effects/LinearGradient.js",
            "js/effects/FocusVignette.js"
        ],
        launcherAssets = [
            "js/game/sections/LauncherSection.js",
            "js/game/sections/launcher/Water.js",
            "js/game/sections/launcher/Sky.js",
            "assets/textures/cloud256.png",
            "assets/textures/light_ray.png"
        ],
        gameAssets = [
			/* JigLib Physics Library (2)
			 * TODO: Minify and Concat */
			"js/lib/jiglibjs2/jiglib.js",
			"js/lib/jiglibjs2/geom/glMatrix.js",
			"js/lib/jiglibjs2/geom/Vector3D.js",
			"js/lib/jiglibjs2/geom/Matrix3D.js",
			"js/lib/jiglibjs2/math/JMatrix3D.js",
			"js/lib/jiglibjs2/math/JMath3D.js",
			"js/lib/jiglibjs2/math/JNumber3D.js",
			"js/lib/jiglibjs2/cof/JConfig.js",
			"js/lib/jiglibjs2/data/CollOutData.js",
			"js/lib/jiglibjs2/data/ContactData.js",
			"js/lib/jiglibjs2/data/PlaneData.js",
			"js/lib/jiglibjs2/data/EdgeData.js",
			"js/lib/jiglibjs2/data/TerrainData.js",
			"js/lib/jiglibjs2/geometry/JAABox.js",
			"js/lib/jiglibjs2/data/OctreeCell.js",
			"js/lib/jiglibjs2/data/CollOutBodyData.js",
			"js/lib/jiglibjs2/data/TriangleVertexIndices.js",
			"js/lib/jiglibjs2/data/SpanData.js",
			"js/lib/jiglibjs2/physics/constraint/JConstraint.js",
			"js/lib/jiglibjs2/physics/constraint/JConstraintMaxDistance.js",
			"js/lib/jiglibjs2/physics/constraint/JConstraintWorldPoint.js",
			"js/lib/jiglibjs2/physics/constraint/JConstraintPoint.js",
			"js/lib/jiglibjs2/physics/MaterialProperties.js",
			"js/lib/jiglibjs2/geometry/JTriangle.js",
			"js/lib/jiglibjs2/geometry/JSegment.js",
			"js/lib/jiglibjs2/collision/CollPointInfo.js",
			"js/lib/jiglibjs2/collision/CollisionInfo.js",
			"js/lib/jiglibjs2/collision/CollDetectInfo.js",
			"js/lib/jiglibjs2/collision/CollDetectFunctor.js",
			"js/lib/jiglibjs2/collision/CollDetectBoxTerrain.js",
			"js/lib/jiglibjs2/collision/CollDetectSphereMesh.js",
			"js/lib/jiglibjs2/collision/CollDetectCapsuleBox.js",
			"js/lib/jiglibjs2/collision/CollDetectSphereCapsule.js",
			"js/lib/jiglibjs2/collision/CollDetectCapsuleTerrain.js",
			"js/lib/jiglibjs2/collision/CollDetectSphereBox.js",
			"js/lib/jiglibjs2/collision/CollDetectSphereTerrain.js",
			"js/lib/jiglibjs2/collision/CollDetectBoxBox.js",
			"js/lib/jiglibjs2/collision/CollDetectBoxMesh.js",
			"js/lib/jiglibjs2/collision/CollDetectBoxPlane.js",
			"js/lib/jiglibjs2/collision/CollDetectCapsuleCapsule.js",
			"js/lib/jiglibjs2/collision/CollDetectSphereSphere.js",
			"js/lib/jiglibjs2/collision/CollDetectSpherePlane.js",
			"js/lib/jiglibjs2/collision/CollDetectCapsulePlane.js",
			"js/lib/jiglibjs2/collision/CollisionSystemAbstract.js",
			"js/lib/jiglibjs2/collision/CollisionSystemGridEntry.js",
			"js/lib/jiglibjs2/collision/CollisionSystemGrid.js",
			"js/lib/jiglibjs2/collision/CollisionSystemBrute.js",
			"js/lib/jiglibjs2/geometry/JIndexedTriangle.js",
			"js/lib/jiglibjs2/geometry/JOctree.js",
			"js/lib/jiglibjs2/geometry/JRay.js",
			"js/lib/jiglibjs2/events/JCollisionEvent.js",
			"js/lib/jiglibjs2/physics/PhysicsController.js",
			"js/lib/jiglibjs2/physics/CachedImpulse.js",
			"js/lib/jiglibjs2/physics/HingeJoint.js",
			"js/lib/jiglibjs2/physics/BodyPair.js",
			"js/lib/jiglibjs2/physics/PhysicsState.js",
			"js/lib/jiglibjs2/physics/PhysicsSystem.js",
			"js/lib/jiglibjs2/physics/RigidBody.js",
			"js/lib/jiglibjs2/geometry/JSphere.js",
			"js/lib/jiglibjs2/geometry/JTriangleMesh.js",
			"js/lib/jiglibjs2/geometry/JPlane.js",
			"js/lib/jiglibjs2/geometry/JTerrain.js",
			"js/lib/jiglibjs2/geometry/JBox.js",
			"js/lib/jiglibjs2/geometry/JCapsule.js",
			"js/lib/jiglibjs2/vehicles/JChassis.js",
			"js/lib/jiglibjs2/vehicles/JWheel.js",
			"js/lib/jiglibjs2/vehicles/JCar.js",
			/* end JigLib 2 library */
			"js/game/workers/MenuMaker.js",
			"js/game/workers/ObjectMaker.js",
			"js/game/core/Physics.js",
			"js/game/core/World.js",
			"js/game/core/Player.js",
			"js/game/core/Character.js",
            "js/game/sections/IntroSection.js",
            { path: "assets/models/World_Head.js", type: 'model' },
			{ path: "assets/models/World_Tail.js", type: 'model' },
			{ path: "assets/models/World_Head_low.js", type: 'model' },
			{ path: "assets/models/World_Tail_low.js", type: 'model' },
			{ path: "assets/models/Hero.js", type: 'model' }
        ];
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    game.init = init;
    game.resume = resume;
    game.pause = pause;
    game.update_section_list = update_section_list;
    game.get_dom_element = function () { return domElement; };
    game.paused = function () { return paused; };
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init() {
        
        domElement = shared.html.gameContainer;
        
        // get dependencies
        
        loader.load( dependencies , function () {
            init_basics();
        });
        
    }
	
	/*===================================================
    
    init basics
    
    =====================================================*/
    
    function init_basics () {
        var i, l;
        
        // transitioner
        transitioner = uihelper.make_ui_element({
            classes: 'transitioner'
        });
        
        // init three 
        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: false, clearColor: 0x000000, clearAlpha: 0 } );
        renderer.setSize( shared.screenWidth, shared.screenHeight );
        renderer.autoClear = false;
        
        // render target
        renderTarget = new THREE.WebGLRenderTarget( shared.screenWidth, shared.screenHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter } );
        
        // add to game dom element
        domElement.append( renderer.domElement );
        
        // share
        shared.renderer = renderer;
        shared.renderTarget = renderTarget;
        
        // game signals
        shared.signals = shared.signals || {};
        shared.signals.paused = new signals.Signal();
        shared.signals.resumed = new signals.Signal();
        shared.signals.update = new signals.Signal();
        
        // resize listener
        resize(shared.screenWidth, shared.screenHeight);
        shared.signals.windowresized.add(resize);
        
        // start drawing
        
        animate();
        
        // get launcher
        loader.load( launcherAssets , function () {
            init_launcher();
        });
        
    }
	
	/*===================================================
    
    init launcher
    
    =====================================================*/
    
    function init_launcher () {
        // set launcher section
        
        set_section( sections.launcher );
        
        // pause for short delay
        // start loading all game assets
        
        window.requestTimeout( function () {
            
            loader.ui_hide( false, 0);
            
            loader.ui_show( domElement );
            
            loader.load( gameAssets , function () {
                loader.ui_hide( true, undefined, function () {
                    init_game();
                });
            });
            
        }, loadAssetsDelay);
    }
	
	/*===================================================
    
    init game
    
    =====================================================*/
    
    function init_game () {
		
		// start menu
		
		init_start_menu();
		
    }
	
	function init_start_menu () {
		var ms;
		
		// workers
        
        menumaker = game.workers.menumaker;
        
        // init start menu
        
        ms = menus.start = menumaker.make_menu( {
            id: 'start_menu',
            width: 260
        } );
        
        ms.add_item( menumaker.make_button( {
            id: 'Start', 
            callback: function () {
                start_game();
            },
            staticPosition: true,
            classes: 'item_big'
        } ) );
        ms.add_item( menumaker.make_button( {
            id: 'Continue', 
            callback: function () {},
            staticPosition: true,
            disabled: true
        } ) );
        ms.add_item( menumaker.make_button( {
            id: 'Options', 
            callback: function () {},
            staticPosition: true,
            disabled: true
        } ) );
        
        ms.ui_keep_centered();
        
        // hide instantly then show start menu
        
        ms.ui_hide( false, 0 );
        
        ms.ui_show( domElement );
        
	}
    
    /*===================================================
    
    start
    
    =====================================================*/
    
    function start_game() {
        var ms = menus.start;
		
		// core
		
		init_core();
        
        // disable start menu
        ms.disable();
        
        // hide start menu
        ms.ui_hide( true );
        
        // set intro section
        set_section( sections.intro );
		
		// resume game
		resume();
		
    }
	
	function init_core () {
		
		// physics
		
		physics = core.physics;
		
		physics.init();
		
		// world
		
		world = core.world;
		
		world.init();
		
		// player
		
		player = core.player;
		
		player.init();
		
		
		start_physics_test();
		
	}
	
	function start_physics_test () {
		// test
		
		var mat = new THREE.MeshNormalMaterial();
		
		var g1 = new THREE.PlaneGeometry( 3000, 3000, 1, 1 );
		
		var m1 = workers.objectmaker.make_model({
            geometry: g1,
			materials: mat,
			rotation: new THREE.Vector3( -90, 0, 0 )
        });
		m1.mesh.doubleSided = true;
		m1.mesh.position.set( 0, -1640, 0 );
		
		// add to scene
		
		world.get_scene().add( m1.mesh );
		
		// add to physics
		physics.add( m1.mesh, {
			bodyType: 'plane',
			position: m1.mesh.position,
			rotation: m1.mesh.quaternion
		});
		
		var yinit = 1900;
		var xinit = 200;
		var zinit = 200;
		
		for( i = 0; i < 50; i++ ) {
			
			// random between cube or sphere
			if ( Math.random() > 0.5 ) {
			
				var g2 = new THREE.CubeGeometry( 50, 50, 50 );
			
				var m2 = workers.objectmaker.make_model({
					geometry: g2,
					materials: mat
				});
				
				world.get_scene().add( m2.mesh );
				
				m2.mesh.position.set( xinit, yinit, zinit );
			
				physics.add( m2.mesh, {
					bodyType: 'box',
					position: m2.mesh.position
				});
				
			}
			else {
				
				var geom3 = new THREE.SphereGeometry( 25 );
				
				var mat3 = new THREE.MeshLambertMaterial();
				
				var m3 = workers.objectmaker.make_model({
					geometry: geom3,
					materials: mat
				});
				
				world.get_scene().add( m3.mesh );
				
				m3.mesh.position.set( xinit, yinit, zinit );
				
				physics.add( m3.mesh, {
					bodyType: 'sphere',
					position: m3.mesh.position
				});
				
			}
			
			xinit -= 100;
			
			if ( xinit <= -200 ) {
				
				xinit = 200;
				
				zinit -= 100;
				
				if ( zinit <= -200 ) {
					
					zinit = 200;
					
					yinit += 100;
					
				}
			}
		}
		
	}
    
    /*===================================================
    
    functions
    
    =====================================================*/
    
    function update_section_list () {
        var i, l,
            name,
            prevNames = sectionNames.slice(0);
        
        // reset names
        
        sectionNames = [];
        
        // get all names
        
        for ( name in sections ) {
           if ( sections.hasOwnProperty( name ) ) {
               sectionNames.push( name );
           }
        }
        
    }

    function set_section ( section ) {
        
        // hide current section
        if (typeof currentSection !== 'undefined') {
            
            previousSection = currentSection;
            
            previousSection.hide();
            
            $(domElement).append(transitioner.domElement);
            
            $(transitioner.domElement).fadeTo(transitionIn, 1).promise().done( function () {
                
                $(transitioner.domElement).detach();
                
                previousSection.remove();
                
            });
            
        }
        
        // no current section
        currentSection = undefined;
        
        // start and show new section
        if (typeof section !== 'undefined') {
            
            // wait for transitioner to finish fading in
            $(transitioner.domElement).promise().done(function () {
                
                $(domElement).append(transitioner.domElement);
                
                section.init();
                
                section.resize(shared.screenWidth, shared.screenHeight);
                
                section.show();
                
                currentSection = section;
                
                $(transitioner.domElement).fadeTo(transitionOut, 0).promise().done(function () {
                    $(transitioner.domElement).detach();
                });
                
            });
            
        }
    }
    
    function pause () {
        if (paused === false) {
            
            paused = true;
            
            shared.signals.paused.dispatch();
            
        }
    }
    
    function resume () {
        if (paused === true) {
            
            paused = false;
            
            shared.signals.resumed.dispatch();
            
        }
    }
    
    function animate () {
        
        requestAnimationFrame( animate );
        
        shared.signals.update.dispatch();
        
    }
    
    function resize( W, H ) {
        
        // resize three
        renderer.setSize( W, H );
        renderTarget.width = W;
        renderTarget.height = H;
        
    }
        
    return main; 
    
}(KAIOPUA || {}));