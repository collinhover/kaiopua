/*
 *
 * Game.js
 * Game specific methods and functionality.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Game.js",
		_Game = {},
		_ErrorHandler,
		_Scene,
		_MathHelper,
		_RayHelper,
		_Messenger,
		_Launcher,
		_Intro,
        renderer, 
        renderTarget,
		renderComposer,
        renderPasses,
		scene,
		sceneBG,
		sceneDefault,
		sceneBGDefault,
		camera,
		cameraBG,
		cameraDefault,
		cameraBGDefault,
		physics,
		menus = {},
        currentSection, 
        previousSection,
        paused = false,
		started = false,
		transitionTime = 500,
		sectionChangePauseTime = 500,
		introMessageDelayTime = 2000,
		assetsInit = [
            "assets/modules/utils/ErrorHandler.js",
		],
        assetsSetup = [
            "js/three/Three.js",
			"js/Tween.js",
			"js/jquery.transform2d.min.js",
			"js/jquery.tipTip.min.js"
        ],
		assetsSetupExtras = [
            "js/three/ThreeExtras.js",
            "js/three/postprocessing/ShaderExtras.js",
            "js/three/postprocessing/EffectComposer.custom.js",
            "js/three/postprocessing/RenderPass.js",
            "js/three/postprocessing/ShaderPass.js",
            "js/three/postprocessing/MaskPass.js",
            "assets/modules/effects/FocusVignette.js",
		],
		assetsCore = [
			"assets/modules/core/Scene.js",
			"assets/modules/core/Model.js",
			"assets/modules/core/Octree.js",
			"assets/modules/physics/Physics.js",
			"assets/modules/physics/RigidBody.js",
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/VectorHelper.js",
			"assets/modules/utils/SceneHelper.js",
			"assets/modules/utils/RayHelper.js",
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/PhysicsHelper.js"
		],
        assetsLauncher = [
            "assets/modules/sections/Launcher.js"
        ],
        assetsGame = [
			"assets/modules/utils/ObjectMaker.js",
			"assets/modules/core/Player.js",
			"assets/modules/core/CameraControls.js",
			"assets/modules/ui/Button.js",
			"assets/modules/ui/Menu.js",
			"assets/modules/ui/Inventory.js",
			"assets/modules/ui/Messenger.js",
			"assets/modules/characters/Character.js",
			"assets/modules/characters/Hero.js",
			"assets/modules/env/World.js",
			"assets/modules/env/WorldIsland.js",
			"assets/modules/env/Water.js",
			"assets/modules/env/Sky.js",
			"assets/modules/puzzles/Puzzle.js",
			"assets/modules/puzzles/Grid.js",
			"assets/modules/puzzles/GridModule.js",
			"assets/modules/puzzles/GridModuleState.js",
			"assets/modules/puzzles/GridModel.js",
			"assets/modules/puzzles/GridElement.js",
			"assets/modules/puzzles/GridElementShapes.js",
			"assets/modules/farming/Farming.js",
			"assets/modules/farming/Planting.js",
			"assets/modules/farming/Field.js",
			"assets/modules/farming/Dirt.js",
			"assets/modules/farming/Plant.js",
			"assets/modules/sections/Intro.js",
            { path: "assets/models/Whale.js", type: 'model' },
			{ path: "assets/models/Hero.js", type: 'model' },
			{ path: "assets/models/Sun.js", type: 'model' },
			{ path: "assets/models/Cloud_001.js", type: 'model' },
			{ path: "assets/models/Cloud_002.js", type: 'model' },
			{ path: "assets/models/Hut.js", type: 'model' },
			{ path: "assets/models/Hut_Hill.js", type: 'model' },
			{ path: "assets/models/Hut_Steps.js", type: 'model' },
			{ path: "assets/models/Bed.js", type: 'model' },
			{ path: "assets/models/Banana_Leaf_Door.js", type: 'model' },
			{ path: "assets/models/Surfboard.js", type: 'model' },
			{ path: "assets/models/Grass_Clump_001.js", type: 'model' },
			{ path: "assets/models/Grass_Clump_002.js", type: 'model' },
			{ path: "assets/models/Grass_Line_001.js", type: 'model' },
			{ path: "assets/models/Grass_Line_002.js", type: 'model' },
			{ path: "assets/models/Palm_Tree.js", type: 'model' },
			{ path: "assets/models/Palm_Trees.js", type: 'model' },
			{ path: "assets/models/Kukui_Tree.js", type: 'model' },
			{ path: "assets/models/Kukui_Trees.js", type: 'model' },
			{ path: "assets/models/Taro_Plant_001.js", type: 'model' },
			{ path: "assets/models/Taro_Plant_002.js", type: 'model' },
			{ path: "assets/models/Taro_Plant_003.js", type: 'model' },
			{ path: "assets/models/Pineapple_Plant_001.js", type: 'model' },
			{ path: "assets/models/Rock.js", type: 'model' },
			{ path: "assets/models/Rock_Purple.js", type: 'model' },
			{ path: "assets/models/Rock_Blue.js", type: 'model' },
			{ path: "assets/models/Volcano_Large.js", type: 'model' },
			{ path: "assets/models/Volcano_Small.js", type: 'model' },
			{ path: "assets/models/Volcano_Rocks_001.js", type: 'model' },
			{ path: "assets/models/Volcano_Rocks_002.js", type: 'model' },
			{ path: "assets/models/Volcano_Rocks_003.js", type: 'model' },
			{ path: "assets/models/Volcano_Rocks_004.js", type: 'model' },
			{ path: "assets/models/Volcano_Rocks_005.js", type: 'model' },
			{ path: "assets/models/Field_Tutorial.js", type: 'model' },
			{ path: "assets/models/Field_Tutorial_Grid.js", type: 'model' },
			{ path: "assets/models/Field_Basics_Split.js", type: 'model' },
			{ path: "assets/models/Field_Basics_Split_Grid.js", type: 'model' },
			{ path: "assets/models/Field_Basics_Abilities.js", type: 'model' },
			{ path: "assets/models/Field_Basics_Abilities_Grid.js", type: 'model' },
			"assets/textures/skybox_world_posx.jpg",
            "assets/textures/skybox_world_negx.jpg",
			"assets/textures/skybox_world_posy.jpg",
            "assets/textures/skybox_world_negy.jpg",
			"assets/textures/skybox_world_posz.jpg",
            "assets/textures/skybox_world_negz.jpg",
            "assets/textures/water_world_512.png",
            "assets/textures/dirt_128.jpg"
        ],
		loadingHeader = 'Hold on, we need some stuff from Hawaii...',
		loadingTips = [
            ///////////////////////////////////////////// = bad sentence size
            "Aloha kaua means may there be friendship or love between us.",
            "Mahalo nui loa means thanks very much.",
            "Kali iki means wait a moment.",
            "Ko'u hoaloha means my friend.",
            "Kane means male or man.",
            "Wahine means female or woman.",
            "Ali'i kane means king or chieftan.",
            "Ali'i wahine means queen or chiefess.",
            "He mea ho'opa'ani means to play a game.",
            "Kai means sea or ocean.",
            "'Opua means puffy clouds.",
			"Kai 'Opua means clouds over the ocean.",
            "Iki means small or little.",
            "Nui means large or huge."
        ];
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
	// functions
	
	_Game.start = start;
	_Game.stop = stop;
    _Game.resume = resume;
    _Game.pause = pause;
	
	_Game.add_to_scene = add_to_scene;
	_Game.remove_from_scene = remove_from_scene;
	
	_Game.get_object_under_mouse = get_object_under_mouse;
	
	_Game.is_event_in_game = is_event_in_game;
	
	// getters and setters
	
	Object.defineProperty(_Game, 'paused', { 
		get : function () { return paused; }
	});
	
	Object.defineProperty(_Game, 'started', { 
		get : function () { return started; }
	});
	
	Object.defineProperty(_Game, 'scene', { 
		get : function () { return scene; },  
		set : set_scene
	});
	
	Object.defineProperty(_Game, 'sceneBG', { 
		get : function () { return sceneBG; },  
		set : set_scene_bg
	});
	
	Object.defineProperty(_Game, 'camera', { 
		get : function () { return camera; },  
		set : set_camera
	});
	
	Object.defineProperty(_Game, 'cameraBG', { 
		get : function () { return cameraBG; },  
		set : set_camera_bg
	});

	main.asset_register( assetPath, { 
		data: _Game,
		readyAutoUpdate: false,
		requirements: assetsInit,
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init and loading
    
    =====================================================*/
	
	function init_internal ( err ) {
		console.log('internal game');
		_ErrorHandler = err;
		
		// register error listeners
		
		shared.signals.error.add( on_error );
		
		// check for errors
        
        if (_ErrorHandler.check()) {
			
            _ErrorHandler.process();
			
        }
        // safe to start game
        else {
			
			// set loading messages
			
			main.loadingHeader = loadingHeader;
			main.loadingTips = loadingTips;
			
			// start loading
			
			load_setup();
			
        }
		
	}
	
	function load_setup () {
		
		main.asset_require( assetsSetup, [ load_setup_extras ], true );
		
	}
	
	function load_setup_extras () {
		
		main.asset_require( assetsSetupExtras, [ init_setup, load_core ], true );
		
	}
	
	function load_core () {
		
		main.asset_require( assetsCore, [ init_core, load_launcher ], true );
		
	}
	
	function load_launcher () {
		
		main.asset_require( assetsLauncher, [init_launcher, load_game], true );
		
	}
	
	function load_game () {
		
		main.asset_require( assetsGame, init_game, true );
		
	}
	
	/*===================================================
    
    setup
    
    =====================================================*/
    
    function init_setup () {
		
		// cardinal axes
		
		shared.cardinalAxes = {
			up: new THREE.Vector3( 0, 1, 0 ),
			forward: new THREE.Vector3( 0, 0, 1 ),
			right: new THREE.Vector3( -1, 0, 0 )
		}
        
        // game signals
		
        shared.signals = shared.signals || {};
        shared.signals.gamePaused = new signals.Signal();
        shared.signals.gameResumed = new signals.Signal();
        shared.signals.gameUpdate = new signals.Signal();
		shared.signals.gamestart = new signals.Signal();
		shared.signals.gamestop = new signals.Signal();
		
		// renderer
		
        renderer = new THREE.WebGLRenderer( { antialias: false, clearColor: 0x000000, clearAlpha: 0, maxLights: 4 } );
        renderer.setSize( shared.gameWidth, shared.gameHeight );
        renderer.autoClear = false;
		
		// shadows
		/*
		renderer.shadowCameraNear = 3;
		renderer.shadowCameraFar = 20000;
		renderer.shadowCameraFov = 90;
		
		renderer.shadowMapBias = 0.0039;
		renderer.shadowMapDarkness = 0.5;
		renderer.shadowMapWidth = 2048;
		renderer.shadowMapHeight = 2048;
		
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true;
		*/
        // render target
        renderTarget = new THREE.WebGLRenderTarget( shared.gameWidth, shared.gameHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter } );
        
        // share renderer
        shared.renderer = renderer;
        shared.renderTarget = renderTarget;
		
    }
	
	function init_core () {
		
		var shaderScreen = THREE.ShaderExtras[ "screen" ],
            shaderFocusVignette = main.get_asset_data("assets/modules/effects/FocusVignette");
		
		// utility
		
		_Scene = main.get_asset_data( "assets/modules/core/Scene.js" );
		_MathHelper = main.get_asset_data( "assets/modules/utils/MathHelper.js" );
		
		// scenes
		
		sceneDefault = new _Scene.Instance();
		sceneBGDefault = new _Scene.Instance();
		
        // fog
		
        sceneDefault.fog = undefined;
		
		// physics
		
		physics = sceneDefault.physics;
		
		// camera
		
		cameraDefault = new THREE.PerspectiveCamera(60, shared.gameWidth / shared.gameHeight, 1, 20000);
		cameraBGDefault = new THREE.PerspectiveCamera(60, shared.gameWidth / shared.gameHeight, 1, 20000);
		
		cameraDefault.useQuaternion = cameraBGDefault.useQuaternion = true;
		
		// passes
        
        renderPasses = {
			bg: new THREE.RenderPass( sceneBGDefault, cameraBGDefault ),
            env: new THREE.RenderPass( sceneDefault, cameraDefault ),
            screen: new THREE.ShaderPass( shaderScreen ),
            focusVignette: new THREE.ShaderPass ( shaderFocusVignette )
        };
        
		// settings
		
		renderPasses.env.clear = false;
		
        renderPasses.screen.renderToScreen = true;
		
        renderPasses.focusVignette.uniforms[ "screenWidth" ].value = shared.gameWidth;
        renderPasses.focusVignette.uniforms[ "screenHeight" ].value = shared.gameHeight;
        renderPasses.focusVignette.uniforms[ "vingenettingOffset" ].value = 0.6;
        renderPasses.focusVignette.uniforms[ "vingenettingDarkening" ].value = 0.5;
        renderPasses.focusVignette.uniforms[ "sampleDistance" ].value = 0.1;
        renderPasses.focusVignette.uniforms[ "waveFactor" ].value = 0.3;
		
		// set default scene and camera
		
		set_default_cameras_scenes();
		
        // composer
        
        set_render_processing();
		
		// add renderer to display
		
		shared.domElements.$game.append( renderer.domElement );
		
		// ui
		
		// if focus lost, pause game
		
		shared.signals.focuslose.add( pause );
		
		// pause / resume buttons
		
		$('#buttonPauseGame').on( 'mouseup touchend', pause );
		$('#buttonResumeGame').on( 'mouseup touchend', resume );
		
		// pause message
		
		shared.domElements.$pauseMessage = $('#pauseMessage');
		
		// pause if page scrolled too far
		
		shared.signals.scroll.add( function ( x, y ) {
			
			if ( y >= shared.domElements.$game.height() * 0.5 ) {
				
				pause();
				
			}
			
		} );
		
		// resize
		
        shared.signals.windowresized.add( resize );
		resize();
		
		// set ready
		
		main.asset_ready( assetPath );
        
		// start updating
        
        shared.signals.update.add( update );
		
	}
	
	/*===================================================
    
    init launcher
    
    =====================================================*/
	
	function init_launcher () {
		
		_Launcher = main.get_asset_data( "assets/modules/sections/Launcher.js" );
		
		set_section( _Launcher );
		
	}
	
	/*===================================================
    
    init game
    
    =====================================================*/
	
    function init_game () {
		console.log( 'init game');
		var l, m, b;
		
		// assets
		
		_RayHelper = main.get_asset_data( "assets/modules/utils/RayHelper.js" );
		_Messenger = main.get_asset_data( "assets/modules/ui/Messenger.js" );
		/*
		// ui
		
		l = _GUI.layers;
		m = _GUI.menus;
		b = _GUI.buttons;
		
		m.start.childrenByID.play.callback = function () {
			start_game();
		};
		m.start.childrenByID.play.context = this;
		
		m.main.childrenByID.resume.callback = function () {
			resume();
		};
		m.main.childrenByID.resume.context = this;
		
		b.end.callback = function () {
			stop_game();
		};
		b.end.context = this;
		
		b.mainMenu.callback = function () {
			_Game.pause();
		};
		b.mainMenu.context = this;
		
		// menus
		
		m.start.alignment = 'center';
		m.main.alignment = 'center';
		
		m.navigation.spacingBottom = 20;
		m.navigation.alignment = 'bottomcenter';
		
		// setup ui groups
		
		_GUI.add_to_group( 'start', [
			{ child: m.start, parent: l.ui }
		] );
		
		_GUI.add_to_group( 'pause', [
			{ child: m.main, parent: l.uiPriority }
		] );
		
		_GUI.add_to_group( 'ingame', [
			{ child: m.navigation, parent: l.ui }
		] );
		
		_GUI.add_to_group( 'constant', [ { child: b.fullscreenEnter, parent: l.ui } ] );
		
		// show initial groups
		
		_GUI.show_group( 'constant' );
		_GUI.show_group( 'start' );
		*/
		
    }
	
	/*===================================================
    
    render functions
    
    =====================================================*/
	
	function set_render_processing ( passesNames ) {
		
		var i, l,
			requiredPre = ['bg', 'env' ],
			requiredPost = ['screen'],
			passName,
			bgPass = renderPasses.bg,
			envPass = renderPasses.env,
			defaultPassIndex;
		
		// init composer
		
		renderComposer = new THREE.EffectComposer( renderer, renderTarget );
		
		// check that passes camera and scene match current
		
		// bg
		
		if ( bgPass.scene !== sceneBG ) {
			bgPass.scene = sceneBG;
		}
		
		if ( bgPass.camera !== cameraBG ) {
			bgPass.camera = cameraBG;
		}
		
		// env
		
		if ( envPass.scene !== scene ) {
			envPass.scene = scene;
		}
		
		if ( envPass.camera !== camera ) {
			envPass.camera = camera;
		}
		
		// if should use default passes
		
		if ( typeof passesNames === 'undefined' || passesNames.hasOwnProperty('length') === false ) {
			
			passesNames = [];
			
		}
		
		// add required
		
		// required pre
		
		for ( i = requiredPre.length - 1; i >= 0; i-- ) {
			
			passName = requiredPre[ i ];
			
			defaultPassIndex = passesNames.indexOf( passName );
			
			if ( defaultPassIndex === -1 ) {
				
				passesNames.unshift( passName );
				
			}
			
		}
		
		// required post
		
		for ( i = requiredPost.length - 1; i >= 0; i-- ) {
			
			passName = requiredPost[ i ];
			
			defaultPassIndex = passesNames.indexOf( passName );
			
			if ( defaultPassIndex === -1 ) {
				
				passesNames.push( passName );
				
			}
			
		}
		
		// add each pass in passes names
		
		for ( i = 0, l = passesNames.length; i < l; i ++ ) {
			
			passName = passesNames[ i ];
			
			if ( typeof renderPasses[ passName ] !== 'undefined' ) {
				
				renderComposer.addPass( renderPasses[ passName ] );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    scene functions
    
    =====================================================*/
	
	function set_scene ( sceneNew ) {
		
		var scenePrev = scene;
		
		renderPasses.env.scene = scene = sceneNew || sceneDefault;
		
		if( scene !== scenePrev && typeof camera !== 'undefined') {
			
			if ( typeof scenePrev !== 'undefined' ) {
				scenePrev.remove( camera );
			}
			
			scene.add( camera );
			
		}
		
	}
	
	function set_scene_bg ( sceneNew ) {
		
		var sceneBGPrev = sceneBG;
		
		renderPasses.bg.scene = sceneBG = sceneNew || sceneBGDefault;
		
		if( sceneBG !== sceneBGPrev && typeof cameraBG !== 'undefined') {
			
			if ( typeof sceneBGPrev !== 'undefined' ) {
				sceneBGPrev.remove( cameraBG );
			}
			
			sceneBG.add( cameraBG );
			
		}
		
	}
	
	function add_to_scene ( objects, sceneDefault ) {
		
		var i, l,
			object,
			object3D,
			sceneTarget,
			callback;
		
		// handle parameters
		
		sceneDefault = sceneDefault || scene;
		
		// for each object
		
		if ( objects.hasOwnProperty('length') === false ) {
			objects = [ objects ];
		}
		
		for ( i = 0, l = objects.length; i < l; i ++ ) {
		
			object = objects[ i ];
			
			callback = object.callbackAdd;
			
			sceneTarget = object.sceneTarget || sceneDefault;
			
			object3D = object.addTarget || object;
			
			// add
			
			if ( typeof object3D !== 'undefined' ) {
				
				sceneTarget.add( object3D );
				
			}
			
			// if callback passed
			
			if ( typeof callback === 'function' ) {
				
				callback.call( this );
				
			}
			
        }
		
	}
	
	function remove_from_scene ( objects, sceneDefault ) {
		
		var i, l,
			object,
			object3D,
			sceneTarget,
			callback;
		
		// handle parameters
		
		sceneDefault = sceneDefault || scene;
		
		// for each object
		
		if ( objects.hasOwnProperty('length') === false ) {
			objects = [ objects ];
		}
		
		for ( i = 0, l = objects.length; i < l; i ++ ) {
		
			object = objects[ i ];
			
			callback = object.callbackRemove;
			
			sceneTarget = object.sceneTarget || sceneDefault;
			
			object3D = object.addTarget || object;
			
			// remove
			
			if ( typeof object3D !== 'undefined' ) {
				
				sceneTarget.remove( object3D );
				
			}
			
			// if callback passed
			
			if ( typeof callback === 'function' ) {
				
				callback.call( this );
				
			}
			
        }
		
	}
	
	/*===================================================
    
    camera functions
    
    =====================================================*/
	
	function set_camera ( cameraNew ) {
		
		var cameraPrev = camera;
		
		if ( typeof cameraPrev !== 'undefined' && typeof scene !== 'undefined' ) {
			
			scene.remove( cameraPrev );
			
		}
		
		renderPasses.env.camera = camera = cameraNew || cameraDefault;
		
		if ( typeof scene !== 'undefined' ) {
			
			scene.add( camera );
			
		}
		
	}
	
	function set_camera_bg ( cameraNew ) {
		
		var cameraBGPrev = cameraBG;
		
		if ( typeof cameraBGPrev !== 'undefined' && typeof sceneBG !== 'undefined' ) {
			
			sceneBG.remove( cameraBGPrev );
			
		}
		
		renderPasses.bg.camera = cameraBG = cameraNew || cameraBGDefault;
		
		if ( typeof sceneBG !== 'undefined' ) {
			
			sceneBG.add( cameraBG );
			
		}
		
	}
	
	/*===================================================
    
    mouse functions
    
    =====================================================*/
	
	function get_object_under_mouse ( parameters ) {
		
		var intersection;
		
		// handle parameters
		
		parameters = parameters || {};
		
		if ( typeof parameters.objects === 'undefined' ) {
			
			parameters.octree = parameters.octree || scene.octree;
			
		}
		
		parameters.mouse = parameters.mouse || main.get_mouse();
		parameters.camera = parameters.camera || camera;
		
		// intersection
		
		intersection = _RayHelper.raycast( parameters );
		
		if ( typeof intersection !== 'undefined' ) {
			
			return intersection.object;
			
		}
		
	}
	
	/*===================================================
    
    section functions
    
    =====================================================*/
	
	function set_default_cameras_scenes () {
		
		set_scene();
		set_scene_bg();
		
		set_camera();
		set_camera_bg();
		
	}

    function set_section ( section, callback ) {
		
		var hadPreviousSection = false,
			newSectionCallback = function () {
				
				if ( typeof previousSection !== 'undefined' ) {
					
					previousSection.remove();
					
				}
				
				section.resize(shared.gameWidth, shared.gameHeight);
				
                section.show();
				
                currentSection = section;
				
				resume();
				
				if ( typeof callback !== 'undefined' ) {
					
					callback.call();
					
				}
				
			};
		
		// pause game while switching
		
		pause( true );
		
        // hide current section
        if (typeof currentSection !== 'undefined') {
			
			hadPreviousSection = true;
            
            previousSection = currentSection;
            
            previousSection.hide();
            
			main.dom_fade( {
				element: shared.domElements.$transitioner,
				time: transitionTime,
				opacity: 1
			} );
            
        }
		
        // no current section
		
        currentSection = undefined;
		
		// default scene and camera
		
		set_default_cameras_scenes();
		
		// set started
		
		if ( typeof startedValue !== 'undefined' ) {
		
			started = startedValue;
			
		}
        
        // start and show new section
        if (typeof section !== 'undefined') {
			
            // wait for transitioner to finish fading in
			
			if ( hadPreviousSection === true ) {
				
				window.requestTimeout( function () {
					
					newSectionCallback();
					
				}, transitionTime );
			
			}
			// no previous section, create new immediately
			else {
				
				newSectionCallback();
				
			}
            
        }
		
    }
	
	/*===================================================
    
    start / stop game
    
    =====================================================*/
    
    function start () {
		console.log('start game');
		// assets
		
		_Intro = main.get_asset_data( 'assets/modules/sections/Intro.js' );
		
		// TODO: hide launcher ui
        
		// set intro section
		
        set_section( _Intro, function () {
			
			// TODO: show in game ui
			
			// TODO: show intro messages
			/*
			window.requestTimeout( function () {
				
				_Messenger.show_message( { 
					image: shared.pathToIcons + "character_rev_64.png",
					title: "Hey, welcome to Kai 'Opua!",
					body: _GUI.messages.gameplay,
					priority: true,
					transitionerOpacity: 0.9
				} );
				
				_Messenger.show_message( {
					title: "Here's how to play:",
					body: _GUI.messages.controls,
					priority: true,
					transitionerOpacity: 0.9
				} );
				
			}, introMessageDelayTime );
			*/
		} );
		
		// signal
		
		shared.signals.gamestart.dispatch();
		
		// set started
		
		started = true;
		
    }
	
	function stop () {
		
		started = false;
		
		// TODO: clear in game ui
		
		// signal
		
		shared.signals.gamestop.dispatch();
		
		// set launcher section
		
        set_section( _Launcher, function () {
		
			// TODO: show launcher ui
			
		});
		
	}
	
	/*===================================================
    
    pause / resume
    
    =====================================================*/
    
    function pause ( preventDefault ) {
		console.log('GAME PAUSE');
		// set state
		
        if (paused === false) {
            
            paused = true;
			
			// swap pause/resume buttons
			
			$('#buttonPauseGame').addClass( 'hidden' );
			$('#buttonResumeGame').removeClass( 'hidden' );
			
			// transitioner
			
			main.dom_fade( {
				element: shared.domElements.$transitioner,
				time: transitionTime,
				opacity: 0.75
			} );
			
			// default actions
			
			if ( preventDefault !== true ) {
				
				// add listener for click on transitioner
				
				shared.domElements.$transitioner.on( 'mouseup.resume touchend.resume', resume );
				
				// show pause message
				
				main.dom_collapse( {
					element: shared.domElements.$pauseMessage,
					show: true
				} );
				shared.domElements.$pauseMessage.on( 'mouseup.resume touchend.resume', resume );
				
			}
			
			// when started
			
			if ( started === true ) {
				
				
				
			}
			
			// signal
            
            shared.signals.gamePaused.dispatch();
			
			// render once to ensure user is not surprised when resuming
			
			render();
            
        }
		
    }
    
    function resume () {
		console.log('GAME resume?');
        if ( paused === true && _ErrorHandler.errorState !== true && ( typeof _Messenger === 'undefined' || _Messenger.active !== true ) ) {
			console.log(' > GAME RESUME');
			// transitioner
			
			shared.domElements.$transitioner.off( '.resume' );
			main.dom_fade( {
				element: shared.domElements.$transitioner,
				time: transitionTime,
				opacity: 0
			} );
			
			// swap pause/resume buttons
			
			$('#buttonPauseGame').removeClass( 'hidden' );
			$('#buttonResumeGame').addClass( 'hidden' );
			
			// pause modal
			
			shared.domElements.$pauseMessage.off( '.resume' );
			main.dom_collapse( {
				element: shared.domElements.$pauseMessage
			} );
			
			// when started
			
			if ( started === true ) {
				
				
				
			}
			
			paused = false;
			
			shared.signals.gameResumed.dispatch();
            
        }
    }
	
	/*===================================================
    
    update / render
    
    =====================================================*/
    
    function update ( timeDelta, timeDeltaMod ) {
		
		// update
		
		if ( paused !== true ) {
			
			// tween update
			
			TWEEN.update();
			
			// update physics
			
			if ( physics ) {
				
				physics.update( timeDelta, timeDeltaMod );
				
			}
			
			// update all others
			
			shared.signals.gameUpdate.dispatch( timeDelta, timeDeltaMod );
			
			// have camera bg mimic camera rotation
			
			cameraBG.quaternion.copy( camera.quaternion );
			
			// finish frame
			
			render();
			
		}
			
    }
	
	function render() {
		
		renderer.setViewport( 0, 0, shared.gameWidth, shared.gameHeight );
		
        renderer.clear();
        
		renderComposer.render();
		
	}
    
    function resize() {
		
		var gameWidth = shared.gameWidth = shared.domElements.$game.width(),
			gameHeight = shared.gameHeight = shared.domElements.$game.height();
		
		// render passes
		
		renderPasses.focusVignette.uniforms[ "screenWidth" ].value = gameWidth;
        renderPasses.focusVignette.uniforms[ "screenHeight" ].value = gameHeight;
        
        // renderer
		
        renderer.setSize( gameWidth, gameHeight );
        renderTarget.width = gameWidth;
        renderTarget.height = gameHeight;
		
		// cameras
		
		camera.aspect = gameWidth / gameHeight;
        camera.updateProjectionMatrix();
		
		cameraBG.aspect = gameWidth / gameHeight;
        cameraBG.updateProjectionMatrix();
        
		// composer
		
        renderComposer.reset( renderTarget );
		
		// re-render
		
		render();
        
    }
	
	/*===================================================
	
	utility
	
	=====================================================*/
	
	function is_event_in_game ( e ) {
		
		var result = false;
		
		if ( shared.domElements.$game ) {
			
			result = shared.domElements.$game.find( e.target ).length > 0;
			
		}
		
		return result;
		
	}
	
	function on_error ( error, url, lineNumber ) {
        
		// pause game
		
        pause( true );
		
		// check error handler state
		
		if ( _ErrorHandler.errorState !== true ) {
			
			_ErrorHandler.generate( error, url, lineNumber );
			
		}
		
		// save game
		// TODO
		
		// debug
        
        throw error + " at " + lineNumber + " in " + url;
        
    }
    
} ( KAIOPUA ) );