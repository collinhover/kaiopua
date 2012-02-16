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
        _AssetLoader,
		_ErrorHandler,
		_UIHelper,
		_Launcher,
		_Intro,
		_MenuMaker,
		_Physics,
        transitioner,
        domElement,
        renderer, 
        renderTarget,
		renderComposer,
        renderPasses,
		scene,
		sceneBG,
		sceneDefault,
		sceneBGDefault,
		fog,
		camera,
		cameraBG,
		cameraDefault,
		cameraBGDefault,
		bg,
		menus = {},
        currentSection, 
        previousSection,
        paused = false,
		started = false,
        transitionOut = 1000, 
        transitionIn = 400,
        loadAssetsDelay = 500,
		dependencies = [
			"assets/modules/utils/AssetLoader.js",
            "assets/modules/utils/ErrorHandler.js",
			"assets/modules/utils/UIHelper.js",
			"assets/modules/utils/Dev.js"
		],
        assetsBasic = [
            "js/lib/three/Three.js",
            "js/lib/three/ThreeExtras.js",
            "js/lib/three/postprocessing/ShaderExtras.js",
            "js/lib/three/postprocessing/EffectComposer.js",
            "js/lib/three/postprocessing/RenderPass.js",
            "js/lib/three/postprocessing/ShaderPass.js",
            "js/lib/three/postprocessing/MaskPass.js",
            "assets/modules/effects/FocusVignette.js"
        ],
        assetsLauncher = [
            "assets/modules/sections/Launcher.js",
            "assets/modules/env/WaterLauncher.js",
            "assets/modules/env/SkyLauncher.js",
            "assets/textures/cloud256.png",
            "assets/textures/light_ray.png",
			"assets/textures/skybox_launcher_xz.jpg",
			"assets/textures/skybox_launcher_posy.jpg",
            "assets/textures/skybox_launcher_negy.jpg"
        ],
        assetsGame = [
			/*"js/lib/ammo.js",*/
			"js/lib/three/physics/Collisions.js",
			"js/lib/three/physics/CollisionUtils.js",
			"assets/modules/core/Physics.js",
			"assets/modules/core/World.js",
			"assets/modules/core/Player.js",
			"assets/modules/core/Model.js",
			"assets/modules/core/CameraControls.js",
			"assets/modules/core/Character.js",
			"assets/modules/core/Puzzles.js",
			"assets/modules/utils/ObjectMaker.js",
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/MenuMaker.js",
			"assets/modules/characters/EmptyCharacter.js",
			"assets/modules/characters/Hero.js",
			"assets/modules/env/Water.js",
			"assets/modules/sections/Intro.js",
            { path: "assets/models/Whale_Head.js", type: 'model' },
			{ path: "assets/models/Whale_Tail.js", type: 'model' },
			{ path: "assets/models/Hero.js", type: 'model' },
			{ path: "assets/models/Sun_Moon.js", type: 'model' },
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
			{ path: "assets/models/Volcano_Large.js", type: 'model' },
			{ path: "assets/models/Volcano_Small.js", type: 'model' },
			{ path: "assets/models/Volcano_Rocks_001.js", type: 'model' },
			{ path: "assets/models/Volcano_Rocks_002.js", type: 'model' },
			{ path: "assets/models/Volcano_Rocks_003.js", type: 'model' },
			{ path: "assets/models/Volcano_Rocks_004.js", type: 'model' },
			{ path: "assets/models/Volcano_Rocks_005.js", type: 'model' },
			{ path: "assets/models/Field_Tutorial.js", type: 'model' },
			"assets/textures/skybox_world_posx.jpg",
            "assets/textures/skybox_world_negx.jpg",
			"assets/textures/skybox_world_posy.jpg",
            "assets/textures/skybox_world_negy.jpg",
			"assets/textures/skybox_world_posz.jpg",
            "assets/textures/skybox_world_negz.jpg",
            "assets/textures/waves_512.png"
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
	
    _Game.resume = resume;
    _Game.pause = pause;
	_Game.get_mouse = get_mouse;
	_Game.add_to_scene = add_to_scene;
	_Game.remove_from_scene = remove_from_scene;
	
	// getters and setters
	
	Object.defineProperty(_Game, 'domElement', { 
		get : function () { return domElement; }
	});
	
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
		requirements: dependencies,
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init and loading
    
    =====================================================*/
	
	function init_internal ( al, err, u ) {
		console.log('internal game');
		_AssetLoader = al;
		_ErrorHandler = err;
		_UIHelper = u;
		
		// register error listeners
		
		window.onerror = on_error;
		shared.signals.error.add( on_error );
		
		// check for errors
        
        if (_ErrorHandler.check()) {
			
            _ErrorHandler.process();
			
        }
        // safe to start game
        else {
			
			// set loading messages
			
			_AssetLoader.loadingHeader = loadingHeader;
			_AssetLoader.loadingTips = loadingTips;
			
			// start loading
			
			load_basics();
			
        }
		
	}
	
	function load_basics () {
		
		main.asset_require( assetsBasic, [init_basics, load_launcher] );
		
	}
	
	function load_launcher () {
		
		main.asset_require( assetsLauncher, [init_launcher, load_game] );
		
	}
	
	function load_game () {
		
		// pause for short delay
		
		window.requestTimeout( function () {
			
			// load game assets and init game
			
			main.asset_require( assetsGame, init_game, true, domElement );
			
		}, loadAssetsDelay);
		
	}
	
	/*===================================================
    
    init with basic assets
    
    =====================================================*/
    
    function init_basics () {
		
		var shaderScreen = THREE.ShaderExtras[ "screen" ],
            shaderFocusVignette = main.get_asset_data("assets/modules/effects/FocusVignette");
			/*bg = effects.LinearGradient.generate( {
				colors: [0x0F042E, 0x1D508F, 0x529AD1, 0x529AD1, 0x455AE0],
				stops: [0, 0.4, 0.6, 0.8, 1.0],
				startBottom: true
			} )*/
		
		// modify THREE classes
		
		add_three_modifications();
		
        // transitioner
        transitioner = _UIHelper.make_ui_element({
            classes: 'transitioner'
        });
		
		// cardinal axes
		shared.cardinalAxes = {
			up: new THREE.Vector3( 0, 1, 0 ),
			forward: new THREE.Vector3( 0, 0, 1 ),
			right: new THREE.Vector3( -1, 0, 0 )
		}
        
        // game signals
        shared.signals = shared.signals || {};
        shared.signals.paused = new signals.Signal();
        shared.signals.resumed = new signals.Signal();
        shared.signals.update = new signals.Signal();
		
		// renderer
        renderer = new THREE.WebGLRenderer( { antialias: true, clearColor: 0x000000, clearAlpha: 0/*, maxLights: 10 */} );
        renderer.setSize( shared.screenWidth, shared.screenHeight );
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
        renderTarget = new THREE.WebGLRenderTarget( shared.screenWidth, shared.screenHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter } );
        
        // share renderer
        shared.renderer = renderer;
        shared.renderTarget = renderTarget;
		
		// scenes
		
		sceneDefault = new THREE.Scene();
		sceneBGDefault = new THREE.Scene();
        
        // fog
		
		fog = new THREE.Fog( 0xffffff, -100, 10000 );
		
        sceneDefault.fog = fog;
		
		// camera
		
		cameraDefault = new THREE.PerspectiveCamera(60, shared.screenWidth / shared.screenHeight, 1, 20000);
		cameraBGDefault = new THREE.PerspectiveCamera(60, shared.screenWidth / shared.screenHeight, 1, 20000);
		
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
		
        renderPasses.focusVignette.uniforms[ "screenWidth" ].value = shared.screenWidth;
        renderPasses.focusVignette.uniforms[ "screenHeight" ].value = shared.screenHeight;
        renderPasses.focusVignette.uniforms[ "vingenettingOffset" ].value = 0.6;
        renderPasses.focusVignette.uniforms[ "vingenettingDarkening" ].value = 0.5;
        renderPasses.focusVignette.uniforms[ "sampleDistance" ].value = 0.1;
        renderPasses.focusVignette.uniforms[ "waveFactor" ].value = 0.3;
		
		// set default scene and camera
		
		set_default_cameras_scenes();
		
        // composer
        
        set_render_processing();
		
		// add renderer to game dom element
		
		domElement = shared.html.gameContainer;
		
        domElement.append( renderer.domElement );
		
		// resize
		
        shared.signals.windowresized.add(resize);
		resize(shared.screenWidth, shared.screenHeight);
		
		// set ready
		
		main.asset_ready( assetPath );
        
		// start drawing
        
        animate();
		
    }
	
	function add_three_modifications () {
		
		// quaternion normalized lerp
		
		THREE.Quaternion.nlerp = function ( qa, qb, qr, t ) {
			
			var tFrom = 1 - t;
			
			qr.x = qa.x * tFrom + qb.x * t;
			qr.y = qa.y * tFrom + qb.y * t;
			qr.z = qa.z * tFrom + qb.z * t;
			qr.w = qa.w * tFrom + qb.w * t;
			
			qr.normalize();
			
			return qr;
			
		}
		
		// vector3 normalized lerp
		
		THREE.Vector3.nlerp = function ( va, vb, vr, t ) {
			
			var tFrom = 1 - t;
			
			vr.x = va.x * tFrom + vb.x * t;
			vr.y = va.y * tFrom + vb.y * t;
			vr.z = va.z * tFrom + vb.z * t;
			
			vr.normalize();
			
			return vr;
			
		}
		
	}
	
	/*===================================================
    
    init launcher
    
    =====================================================*/
	
	function init_launcher ( l ) {
		
		_Launcher = l;
		console.log('init launcher', _Launcher);
		set_section( _Launcher );
		
	}
	
	/*===================================================
    
    init game
    
    =====================================================*/
	
    function init_game () {
		
		// assets
		
		_MenuMaker = main.get_asset_data( 'assets/modules/utils/MenuMaker.js' );
		
		// init menus
		
		init_start_menu();
		
		init_pause_menu();
		
		// show start menu
		
		menus.start.ui_show( domElement );
		
    }
	
	/*===================================================
    
    game menus
    
    =====================================================*/
	
	function init_start_menu () {
		var menu;
        
        // init start menu
		
        menu = menus.start = _MenuMaker.make_menu( {
            id: 'start_menu',
			transparent: true,
            width: 570
        } );
        
        menu.add_item( _MenuMaker.make_button( {
            id: 'Start', 
            callback: function () {
                start_game();
            },
            classes: 'item_big',
			circleButton: true
        } ) );
        menu.add_item( _MenuMaker.make_button( {
            id: 'Continue', 
            callback: function () {},
            disabled: true,
			circleButton: true
        } ) );
        menu.add_item( _MenuMaker.make_button( {
            id: 'Options', 
            callback: function () {},
            disabled: true,
			circleButton: true
        } ) );
		
        menu.ui_keep_centered();
        
        menu.ui_hide( true, 0 );
		
	}
	
	function init_pause_menu () {
		var menu;
        
        // init menu
        
        menu = menus.pause = _MenuMaker.make_menu( {
            id: 'pause_menu',
            width: 760,
			transparent: true
        } );
        
        menu.add_item( _MenuMaker.make_button( {
            id: 'Resume', 
            callback: function () {
                resume();
            },
            classes: 'item_big',
			circleButton: true
        } ) );
		menu.add_item( _MenuMaker.make_button( {
            id: 'Options', 
            callback: function () {},
            disabled: true,
			circleButton: true
        } ) );
        menu.add_item( _MenuMaker.make_button( {
            id: 'Save', 
            callback: function () {},
            disabled: true,
			circleButton: true
        } ) );
		menu.add_item( _MenuMaker.make_button( {
            id: 'End Game', 
            callback: function () {
				stop_game();
			},
			circleButton: true
        } ) );
        
        menu.ui_keep_centered();
        
        menu.ui_hide( true, 0 );
        
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
		
		renderComposer = new THREE.EffectComposer( renderer );
		
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
				
				// physics
				
				if ( typeof object3D.physics !== 'undefined' ) {
					
					_Physics.add( object3D.physics );
					
				}
				
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
				
				// physics
				
				if ( typeof object3D.physics !== 'undefined' ) {
					
					_Physics.remove( object3D.physics );
					
				}
				
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
	
	function get_mouse ( parameters ) {
		
		var mouse;
		
		if ( typeof parameters === 'number' ) {
			
			mouse = shared.mice[ parameters ];
			
		}
		else if ( typeof parameters === 'object' && parameters.hasOwnProperty( 'mouseIndex' ) && parameters.mouseIndex > 0 && parameters.mouseIndex < shared.mice.length ) {
			
			mouse = shared.mice[ parameters.mouseIndex ];
			
		}
		else {
			
			mouse = shared.mice[ 0 ];
			
		}
		
		return mouse;
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
				
				$(domElement).append(transitioner.domElement);
				
				section.resize(shared.screenWidth, shared.screenHeight);
				
                section.show();
				
                currentSection = section;
				
				resume();
                
                $(transitioner.domElement).stop(true).fadeTo(transitionOut, 0, function () {
					
                    $(transitioner.domElement).detach();
					
				});
				
				// callback after transition out time
				
				window.requestTimeout( function () {
					if ( typeof callback !== 'undefined' ) {
						
						callback.call();
						
					}
				}, transitionOut );
				
			};
		
		// pause game while switching
		
		pause();
		
        // hide current section
        if (typeof currentSection !== 'undefined') {
			
			hadPreviousSection = true;
            
            previousSection = currentSection;
            
            previousSection.hide();
            
            $(domElement).append(transitioner.domElement);
            
            $(transitioner.domElement).stop(true).fadeTo(transitionIn, 1 );
            
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
					
				}, transitionIn );
			
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
    
    function start_game () {
        var ms = menus.start;
		
		// assets
		
		_Physics = main.get_asset_data( 'assets/modules/core/Physics.js' );
		_Intro = main.get_asset_data( 'assets/modules/sections/Intro.js' );
		
		// hide static menu
		
		$(shared.html.staticMenu).stop(true).fadeTo( transitionIn, 0 );
		
        // disable start menu
		
        ms.disable();
        
        // hide start menu
		
        ms.ui_hide( true );
        
        // set intro section
		
        set_section( _Intro );
		
		// set started
		
		started = true;
		
    }
	
	function stop_game () {
		
		var ms = menus.start,
			mp = menus.pause;
		
		// set started
		
		started = false;
		
		// hide and disable pause menu
		
		if ( typeof mp !== 'undefined' ) {
			
			mp.disable();
		
			mp.ui_hide( true );
			
		}
		
		// show static menu
		
		$(shared.html.staticMenu).stop(true).fadeTo( transitionOut, 1 );
		
		// set launcher section
		
        set_section( _Launcher, function () {
			
			// show / enable start menu
			
			ms.ui_show( domElement );
			
			ms.enable();
			
		});
		
	}
    
    function pause () {
        if (paused === false) {
            
            paused = true;
			
			$(domElement).append(transitioner.domElement);
            
			$(transitioner.domElement).stop(true).fadeTo(transitionIn, 0.75);
			
			if ( started === true ) {
				
				menus.pause.ui_show( domElement );
				
				menus.pause.enable();
				
				$(shared.html.staticMenu).stop(true).fadeTo( transitionOut, 1 );
				
			}
            
            shared.signals.paused.dispatch();
            
        }
    }
    
    function resume () {
		
		var on_menu_hidden = function () {
			
			paused = false;
			
			shared.signals.resumed.dispatch();
			
		};
		
        if (paused === true) {
			
			$(domElement).append(transitioner.domElement);
			
			$(transitioner.domElement).stop(true).fadeTo(transitionOut, 0, function () {
				
				$(transitioner.domElement).detach();
				
			});
			
			if ( started === true ) {
				
				menus.pause.disable();
				
				menus.pause.ui_hide( true, undefined, on_menu_hidden );
				
				$(shared.html.staticMenu).stop(true).fadeTo( transitionIn, 0 );
				
			}
			else {
				
				on_menu_hidden();
				
			}
            
        }
    }
    
    function animate () {
    
    	var timeDelta;
        
        requestAnimationFrame( animate );
		
		// handle time
		
		shared.timeLast = shared.time;
		
		shared.time = new Date().getTime();
		
		timeDelta = shared.time - shared.timeLast;
		
		// update
		
		if ( paused !== true ) {
			
			// update physics
			
			if ( typeof _Physics !== 'undefined' ) {
				_Physics.update( timeDelta );
			}
			
			// update all others
			
			shared.signals.update.dispatch( timeDelta );
			
		}
		
		// have camera bg mimic camera rotation
		
		cameraBG.quaternion.copy( camera.quaternion );
		
		// render
        
        renderer.setViewport( 0, 0, shared.screenWidth, shared.screenHeight );

        renderer.clear();
        
		renderComposer.render();
		
    }
    
    function resize( W, H ) {
		
		// render passes
		
		renderPasses.focusVignette.uniforms[ "screenWidth" ].value = W;
        renderPasses.focusVignette.uniforms[ "screenHeight" ].value = H;
        
        // renderer
		
        renderer.setSize( W, H );
        renderTarget.width = W;
        renderTarget.height = H;
		
		// cameras
		
		camera.aspect = W / H;
        camera.updateProjectionMatrix();
		
		cameraBG.aspect = W / H;
        cameraBG.updateProjectionMatrix();
        
		// composer
		
        renderComposer.reset();
        
    }
	
	function on_error ( error, url, lineNumber ) {
        
		// pause game
		
        pause();
		
		// save game
		// TODO
		
		// debug
        
        if (typeof main.assets.modules.utils.dev !== 'undefined') {
            main.assets.modules.utils.dev.log_error(error, url, lineNumber);
        }
		else {
			throw error + " at " + lineNumber + " in " + url;
		}
        
    }
    
} ( KAIOPUA ) );