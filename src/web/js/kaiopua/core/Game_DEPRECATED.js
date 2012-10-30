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
		assetPath = "js/kaiopua/core/Game.js",
		_Game = {},
		_ErrorHandler,
		_Scene,
		_CameraControls,
		_UIQueue,
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
		camera,
		cameraBG,
		cameraControls,
		physics,
		menus = {},
        currentSection, 
        previousSection,
		started = false,
        paused = false,
		pausedWithoutControl = false,
		pausedByFocusLoss = false,
		transitionTime = 500,
		navStartDelayTime = 500,
		sectionChangePauseTime = 500,
		introMessageDelayTime = 2000,
		assetsInit = [
            "js/kaiopua/utils/ErrorHandler.js",
		],
        assetsSetup = [
            "js/lib/three/three.min.js",
			"js/lib/Tween.custom.min.js",
        ],
		assetsSetupExtras = [
			"js/lib/three/ThreeOctree.min.js",
            "js/lib/three/postprocessing/ShaderExtras.js",
            "js/lib/three/postprocessing/EffectComposer.js",
            "js/lib/three/postprocessing/RenderPass.js",
            "js/lib/three/postprocessing/ShaderPass.js",
            "js/lib/three/postprocessing/MaskPass.js",
            "js/kaiopua/effects/FocusVignette.js",
		],
		assetsCore = [
			"js/kaiopua/core/Scene.js",
			"js/kaiopua/core/Model.js",
			"js/kaiopua/core/CameraControls.js",
			"js/kaiopua/physics/Physics.js",
			"js/kaiopua/physics/RigidBody.js",
			"js/kaiopua/ui/UIQueue.js",
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/VectorHelper.js",
			"js/kaiopua/utils/SceneHelper.js",
			"js/kaiopua/utils/RayHelper.js",
			"js/kaiopua/utils/ObjectHelper.js",
			"js/kaiopua/utils/PhysicsHelper.js"
		],
        assetsLauncher = [
            "js/kaiopua/sections/Launcher.js"
        ],
        assetsGame = [
			"js/kaiopua/utils/ObjectMaker.js",
			"js/kaiopua/core/Player.js",
			"js/kaiopua/core/Actions.js",
			"js/kaiopua/ui/Messenger.js",
			"js/kaiopua/core/Character.js",
			"js/kaiopua/env/World.js",
			"js/kaiopua/env/WorldIsland.js",
			"js/kaiopua/env/Water.js",
			"js/kaiopua/env/Sky.js",
			"js/kaiopua/puzzles/Puzzle.js",
			"js/kaiopua/puzzles/PuzzleLibrary.js",
			"js/kaiopua/puzzles/Grid.js",
			"js/kaiopua/puzzles/GridModule.js",
			"js/kaiopua/puzzles/GridModuleState.js",
			"js/kaiopua/puzzles/GridModel.js",
			"js/kaiopua/puzzles/GridElement.js",
			"js/kaiopua/puzzles/GridElementLibrary.js",
			"js/kaiopua/farming/Planting.js",
			"js/kaiopua/farming/Dirt.js",
			"js/kaiopua/sections/Intro.js",
            { path: shared.pathToAsset + "Whale.js", type: 'model' },
			{ path: shared.pathToAsset + "Hero.js", type: 'model' },
			{ path: shared.pathToAsset + "Sun.js", type: 'model' },
			{ path: shared.pathToAsset + "Cloud_001.js", type: 'model' },
			{ path: shared.pathToAsset + "Cloud_002.js", type: 'model' },
			{ path: shared.pathToAsset + "Hut.js", type: 'model' },
			{ path: shared.pathToAsset + "Hut_Hill.js", type: 'model' },
			{ path: shared.pathToAsset + "Hut_Steps.js", type: 'model' },
			{ path: shared.pathToAsset + "Bed.js", type: 'model' },
			{ path: shared.pathToAsset + "Banana_Leaf_Door.js", type: 'model' },
			{ path: shared.pathToAsset + "Surfboard.js", type: 'model' },
			{ path: shared.pathToAsset + "Grass_Clump_001.js", type: 'model' },
			{ path: shared.pathToAsset + "Grass_Clump_002.js", type: 'model' },
			{ path: shared.pathToAsset + "Grass_Line_001.js", type: 'model' },
			{ path: shared.pathToAsset + "Grass_Line_002.js", type: 'model' },
			{ path: shared.pathToAsset + "Palm_Tree.js", type: 'model' },
			{ path: shared.pathToAsset + "Palm_Trees.js", type: 'model' },
			{ path: shared.pathToAsset + "Kukui_Tree.js", type: 'model' },
			{ path: shared.pathToAsset + "Kukui_Trees.js", type: 'model' },
			{ path: shared.pathToAsset + "Plant_Dirt_Mound.js", type: 'model' },
			{ path: shared.pathToAsset + "Plant_Seed.js", type: 'model' },
			{ path: shared.pathToAsset + "Plant_Taro.js", type: 'model' },
			{ path: shared.pathToAsset + "Plant_Pineapple.js", type: 'model' },
			{ path: shared.pathToAsset + "Plant_Rock.js", type: 'model' },
			{ path: shared.pathToAsset + "Plant_Rock_Purple.js", type: 'model' },
			{ path: shared.pathToAsset + "Plant_Rock_Blue.js", type: 'model' },
			{ path: shared.pathToAsset + "Volcano_Large.js", type: 'model' },
			{ path: shared.pathToAsset + "Volcano_Small.js", type: 'model' },
			{ path: shared.pathToAsset + "Volcano_Rocks_001.js", type: 'model' },
			{ path: shared.pathToAsset + "Volcano_Rocks_002.js", type: 'model' },
			{ path: shared.pathToAsset + "Volcano_Rocks_003.js", type: 'model' },
			{ path: shared.pathToAsset + "Volcano_Rocks_004.js", type: 'model' },
			{ path: shared.pathToAsset + "Volcano_Rocks_005.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Tutorial.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Tutorial_Grid.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Tutorial_Toggle.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Rolling_Hills.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Rolling_Hills_Grid.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Rolling_Hills_Toggle.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Basics_Abilities.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Basics_Abilities_Grid.js", type: 'model' },
			shared.pathToAsset + "skybox_world_posx.jpg",
            shared.pathToAsset + "skybox_world_negx.jpg",
			shared.pathToAsset + "skybox_world_posy.jpg",
            shared.pathToAsset + "skybox_world_negy.jpg",
			shared.pathToAsset + "skybox_world_posz.jpg",
            shared.pathToAsset + "skybox_world_negz.jpg",
            shared.pathToAsset + "water_world_512.png",
            shared.pathToAsset + "dirt_128.jpg"
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
	
	_Game.get_pointer_intersection = get_pointer_intersection;
	
	// getters and setters
	
	Object.defineProperty(_Game, 'paused', { 
		get : function () { return paused; }
	});
	
	Object.defineProperty(_Game, 'started', { 
		get : function () { return started; }
	});
	
	Object.defineProperty(_Game, 'scene', { 
		get : function () { return scene; }
	});
	
	Object.defineProperty(_Game, 'sceneBG', { 
		get : function () { return sceneBG; }
	});
	
	Object.defineProperty(_Game, 'camera', { 
		get : function () { return camera; }
	});
	
	Object.defineProperty(_Game, 'cameraBG', { 
		get : function () { return cameraBG; }
	});
	
	Object.defineProperty(_Game, 'cameraControls', { 
		get : function () { return cameraControls; }
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
		
		shared.signals.onError.add( on_error );
		
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
		
		// universe gravity
		
		shared.universeGravitySource = new THREE.Vector3( 0, 0, 0 );
		shared.universeGravityMagnitude = new THREE.Vector3( 0, -1, 0 );
		
		// cardinal axes
		
		shared.cardinalAxes = {
			up: new THREE.Vector3( 0, 1, 0 ),
			forward: new THREE.Vector3( 0, 0, 1 ),
			right: new THREE.Vector3( -1, 0, 0 )
		}
        
        // game signals
		
        shared.signals = shared.signals || {};
		
        shared.signals.onGamePaused = new signals.Signal();
        shared.signals.onGameResumed = new signals.Signal();
        shared.signals.onGameUpdated = new signals.Signal();
		shared.signals.onGameStarted = new signals.Signal();
		shared.signals.onGameStopped = new signals.Signal();
		
		shared.signals.onGamePointerMoved = new signals.Signal();
		shared.signals.onGamePointerTapped = new signals.Signal();
		shared.signals.onGamePointerDoubleTapped = new signals.Signal();
		shared.signals.onGamePointerHeld = new signals.Signal();
		shared.signals.onGamePointerDragStarted = new signals.Signal();
		shared.signals.onGamePointerDragged = new signals.Signal();
		shared.signals.onGamePointerDragEnded = new signals.Signal();
		shared.signals.onGamePointerWheel = new signals.Signal();
		
		// renderer
		
        renderer = new THREE.WebGLRenderer( { antialias: true, clearColor: 0x000000, clearAlpha: 0, maxLights: 4 } );
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
            shaderFocusVignette = main.get_asset_data("js/kaiopua/effects/FocusVignette");
		
		// utility
		
		_Scene = main.get_asset_data( "js/kaiopua/core/Scene.js" );
		_CameraControls = main.get_asset_data( "js/kaiopua/core/CameraControls.js" );
		_UIQueue = main.get_asset_data( "js/kaiopua/ui/UIQueue.js" );
		_MathHelper = main.get_asset_data( "js/kaiopua/utils/MathHelper.js" );
		
		// scenes
		
		scene= new _Scene.Instance();
		sceneBG = new _Scene.Instance();
		
        // fog
		
        scene.fog = undefined;
		
		// physics
		
		physics = scene.physics;
		
		// camera
		
		camera = new THREE.PerspectiveCamera(60, shared.gameWidth / shared.gameHeight, 1, 20000);
		cameraBG = new THREE.PerspectiveCamera(60, shared.gameWidth / shared.gameHeight, 1, 20000);
		camera.useQuaternion = cameraBG.useQuaternion = true;
		
		// camera controls
		
		cameraControls = new _CameraControls.Instance( { camera: camera } );
		//cameraControls.enable();
		
		// passes
        
        renderPasses = {
			bg: new THREE.RenderPass( sceneBG, cameraBG ),
            env: new THREE.RenderPass( scene, camera ),
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
		
        // composer
        
        set_render_processing();
		
		// ui
		
		init_ui();
		
		// resize
		
        shared.signals.onWindowResized.add( resize );
		resize();
		
		// set ready
		
		main.asset_ready( assetPath );
        
		// start updating
        
        shared.signals.onUpdated.add( update );
		
	}
	
	/*===================================================
    
    init ui
    
    =====================================================*/
	
	function init_ui () {
		
		shared.domElements = shared.domElements || {};
		
		shared.domElements.cloneables = shared.domElements.cloneables || {};
		
		shared.domElements.cloneables.$reward = $( '<div class="reward"><button class="btn btn-large btn-circle-large"><img src="" class="iconk-giant reward-icon"></button><p class="reward-name"></p><p><small class="reward-type"></small></p></div>' );
		
		shared.domElements.$game = $('#game');
		shared.domElements.$uiGameDimmer = $('#uiGameDimmer');
		shared.domElements.$uiBlocker = $('#uiBlocker');
		shared.domElements.$ui = $('#ui');
		shared.domElements.$uiHeader = $( '#uiHeader' );
		shared.domElements.$uiBody = $( '#uiBody' );
		shared.domElements.$uiInGame = $( '#uiInGame' );
		shared.domElements.$uiOutGame = $( '#uiOutGame' );
		
		shared.domElements.$dropdowns = $( '.dropdown' );
		
        shared.domElements.$tabToggles = $( '.tab-toggles' ).find( '[href^="#"]' ).not( '.tab-toggle-empty' );
		
		shared.domElements.$stickied = $( ".is-sticky" );
		
		shared.domElements.$actionsActive = $( '#actionsActive' );
		shared.domElements.$actionsInactive = $( '#actionsInactive' );
		shared.domElements.$actionItems = $('.action-item');
		shared.domElements.$pauseMessage = $('#pauseMessage');
		
		shared.domElements.$menus = shared.domElements.$uiOutGame.find( '.menu' );
		shared.domElements.$menuDefault = $();
		shared.domElements.$menusInner = $();
		shared.domElements.$menuToggles = $();
		shared.domElements.$menuToggleDefault = $();
		shared.domElements.$menuActive = $( '#menuActive' );
		shared.domElements.$menuInactive = $( '#menuInactive' );
		shared.domElements.$menuFarming = $('#menuFarming');
		shared.domElements.$menuOptions = $('#menuOptions');
		
		shared.domElements.$navbars = $( '.navbar, .subnavbar' );
		shared.domElements.$navMenus = $('#navMenus');
		shared.domElements.$navMenusButtons = shared.domElements.$navMenus.find( ".nav li a" );
		shared.domElements.$navStart = $( '#navStart' );
		
		// major buttons
		
		shared.domElements.$buttonGamePause = $('#buttonGamePause');
		shared.domElements.$buttonsGamePause = $('.game-pause');
		shared.domElements.$buttonGameResume = $('#buttonGameResume');
		shared.domElements.$buttonsGameResume = $('.game-resume');
		shared.domElements.$menuFarmingToggle = $('a[href="#menuFarming"]');
		
		// ui menus
		
		shared.domElements.$tools = $('#puzzleTools');
		
		shared.domElements.$puzzle = $('#puzzle');
		shared.domElements.$puzzleActive = $( "#puzzleActive" );
		shared.domElements.$puzzleActiveWarning = $( "#puzzleActiveWarning" );
		shared.domElements.$puzzleActiveStarted = $( "#puzzleActiveStarted" );
		shared.domElements.$puzzleActiveStartedPlan = $( "#puzzleActiveStartedPlan" );
		shared.domElements.$puzzleActiveStartedPlanReady = $( "#puzzleActiveStartedPlanReady" );
		shared.domElements.$puzzleActiveName = $( ".puzzle-active-name" );
		shared.domElements.$puzzleActiveScoreBar = $( "#puzzleActiveScoreBar" );
		shared.domElements.$puzzleActiveElementCount = $( ".puzzle-active-elementCount" );
		shared.domElements.$puzzleActiveNumElementsMin = $( ".puzzle-active-numElementsMin" );
		shared.domElements.$puzzleActiveShapesCounter = $( "#puzzleActiveShapesCounter" );
		shared.domElements.$puzzleActiveNumShapesChosen = $( ".puzzle-active-numShapesChosen" );
		shared.domElements.$puzzleActiveNumShapesRequired = $( ".puzzle-active-numShapesRequired" );
		shared.domElements.$puzzleActiveShapes = $( "#puzzleActiveShapes" );
		shared.domElements.$puzzleActiveShapesRequiredWarning = $( "#puzzleActiveShapesRequiredWarning" );
		shared.domElements.$puzzleActiveShapesPicker = $( "#puzzleActiveShapesPicker" );
		shared.domElements.$puzzleActiveStatusIcons = $( ".puzzle-statusIcon" );
		shared.domElements.$puzzleActiveCompletionIcons = $( ".puzzle-completionIcon" );
		shared.domElements.$puzzleActiveStatusText = $( "#puzzleActiveStatusText" );
		shared.domElements.$puzzleActiveCompletionText = $( "#puzzleActiveCompletionText" );
		shared.domElements.$puzzleActiveReady = $( "#puzzleActiveReady" );
		shared.domElements.$puzzleActiveMap = $( "#puzzleActiveMap" );
		shared.domElements.$puzzleActiveRewards = $( "#puzzleActiveRewards" );
		
		shared.domElements.$score = $( "#score" );
		shared.domElements.$scorePuzzleName = $( ".score-puzzle-name" );
		shared.domElements.$scoreTitle = $( "#scoreTitle" );
		shared.domElements.$scoreElementCount = $( ".score-element-count" );
		shared.domElements.$scoreElementCountGoal = $( ".score-element-count-goal" );
		shared.domElements.$scoreBar = $( "#scoreBar" );
		shared.domElements.$scorePoor = $( "#scorePoor" );
		shared.domElements.$scoreGood = $( "#scoreGood" );
		shared.domElements.$scorePerfect = $( "#scorePerfect" );
		shared.domElements.$scorePct = $( ".score-pct" );
		shared.domElements.$scoreRewards = $( "#scoreRewards" );
		shared.domElements.$rewardsPoor = $( "#rewardsPoor" );
		shared.domElements.$rewardsGood = $( "#rewardsGood" );
		shared.domElements.$rewardsPerfect = $( "#rewardsPerfect" );
		shared.domElements.$rewardsPoorList = shared.domElements.$rewardsPoor.find( ".reward-list" );
		shared.domElements.$rewardsGoodList = shared.domElements.$rewardsGood.find( ".reward-list" );
		shared.domElements.$rewardsPerfectList = shared.domElements.$rewardsPerfect.find( ".reward-list" );
		shared.domElements.$scoreHint = $( "#scoreHint" );
		
		shared.domElements.$plant = $('#plant');
		shared.domElements.$plantActive = $("#plantActive");
		shared.domElements.$plantActiveWarning = $("#plantActiveWarning");
		shared.domElements.$plantActivePortrait = $("#plantActivePortrait");
		shared.domElements.$plantActiveShape = $("#plantActiveShape");
		shared.domElements.$plantActiveShapeIcon = $("#plantActiveShapeIcon");
		shared.domElements.$plantActiveSkin = $("#plantActiveSkin");
		shared.domElements.$plantActiveSkinIcon = $("#plantActiveSkinIcon");
		
		shared.domElements.$collection = $('#collection');
		
		// set all images to not draggable
		
		if ( Modernizr.draganddrop ) {
			
			$( 'img' ).attr( 'draggable', false );
			
		}
		
		// all links that point to a location in page
		
		$( 'a[href^="#"]' ).each( function () {
			
			var $element = $( this ),
				$section = $( $element.data( 'section' ) ),
				$target = $( $element.attr( 'href' ) );
			
			// remove click
			
			$element.attr( 'onclick', 'return false;' );
			
			// if has section or target, prioritize section over target
			
			if ( $section.length > 0 || $target.length > 0 ) {
				
				$element.on( 'tap', function () {
					
					( $section[0] || $target[0] ).scrollIntoView( true );
					
				} );
				
			}
				
		} );
		
		// handle disabled items only if pointer-events are not supported
		
		if ( shared.supports.pointerEvents === false ) {
			
			main.dom_ignore_pointer( $(".ignore-pointer, .disabled"), true );
			
		}
		
		// primary action items
		
		shared.domElements.$actionItems.each( function () {
			
			var $item = $( this );
			
			if ( $item.parent().is( shared.domElements.$actionsActive ) && $item.is( '.hidden, .collapsed' ) ) {
				
				shared.domElements.$actionsInactive.append( $item );
				
			}
			
		} ).on('show.active', function () {
			
			shared.domElements.$actionsActive.append( this );
			
		})
		.on('hidden.active', function () {
			
			shared.domElements.$actionsInactive.append( this );
			
		});
		
		// for all drop downs
		
		shared.domElements.$dropdowns.each( function () {
			
			var $dropdown = $( this );
			
			// close when drop down item is selected
			
			$dropdown.find( '.dropdown-menu a' ).each( function () {
				
				var $button = $( this );
				
				$button.on( 'tap', function () {
						
						$button.parent().removeClass( 'active' );
						
						$dropdown.removeClass('open');
						
					} );
				
			} );
			
		} );
		
		// for each navbar
		
		shared.domElements.$navbars.each( function () {
			
			var $navbar = $( this ),
				$buttonCollapse = $navbar.find( '[data-toggle="collapse"]' ),
				$navCollapse = $navbar.find( '.nav-collapse' );
			
			// if has collapsable
			
			if ( $buttonCollapse.length > 0 && $navCollapse.length > 0 ) {
				
				$navCollapse.find( 'a' ).each( function () {
					
					var $button = $( this );
					
					$button.on( 'tap', function () {
							
							if( $buttonCollapse.is( '.collapsed' ) !== true ) {
								
								$buttonCollapse.trigger( 'click' );
								
							}
							
						} );
					
				} );
				
			}
			
		} );
		
		// sticky elements
		
		shared.domElements.$stickied.each( function () {
			
			var $stickied = $( this ),
				$relative = $( $stickied.data( "relative" ) ),
				$target = $( $stickied.data( "target" ) );
			
			// if relative empty, assume uiHeader
			
			if ( $relative.length === 0 ) {
				
				$relative = shared.domElements.$uiHeader;
				
			}
			
			// if target empty, assume uiOutGame
			
			if ( $target.length === 0 ) {
				
				$target = shared.domElements.$uiOutGame;
				
			}
			
			$stickied.removeClass( 'is-sticky' ).sticky( {
				
				topSpacing: function () {
					
					return $relative.offset().top + $relative.outerHeight( true );
					
				},
				scrollTarget: $target,
				handlePosition: false
				
			} );
			
		} );
		
		// for each menu
		
		shared.domElements.$menus.each( function () {
			
			var $menu = $( this ),
				$inner = $menu.find( '.menu-inner' ),
				$toggle = shared.domElements.$navMenusButtons.filter( '[href="#' + $menu.attr( 'id' ) + '"]' ),
				activate,
				deactivate,
				first,
				last,
				open,
				close,
				toggle;
			
			$menu.data( '$inner', $inner );
			$menu.data( '$toggle', $toggle );
			$menu.data( 'scrollTop', 0 );
			
			shared.domElements.$menusInner = shared.domElements.$menusInner.add( $inner );
			
			// functions
			
			activate = function () {
				
				pause( false, true );
				
				if ( $toggle.length > 0 ) {
					
					$toggle.closest( 'li' ).addClass( 'active' );
						
				}
				
				$menu.addClass( 'active' );
				
				main.dom_fade( {
					element: $menu,
					opacity: 1
				} );
				
				// resize and scroll to last location for this tab
				
				$( window ).trigger( 'resize' );
				
				shared.domElements.$uiOutGame.scrollTop( $menu.data( 'scrollTop' ) );
				
			};
			
			deactivate = function () {
				
				// store scroll position
				
				$menu.data( 'scrollTop', shared.domElements.$uiOutGame.scrollTop() );
				
				if ( $toggle.length > 0 ) {
					
					$toggle.closest( 'li' ).removeClass( 'active' );
					
				}
				
				$menu.removeClass( 'active' );
				
				main.dom_fade( {
					element: $menu,
					time: 0
				} );
				
			};
			
			first = function () {
				
				pause( false, true );
				
			};
			
			last = function () {
				
				main.dom_fade( {
					element: shared.domElements.$uiOutGame
				} );
				
				resume();
				
			};
			
			open = function () {
				
				_UIQueue.add( {
						element: $menu,
						container: shared.domElements.$uiOutGame,
						activate: activate,
						deactivate: deactivate,
						first: first,
						last: last
					} );
				
			};
			
			close = function () {
				
				_UIQueue.remove( $menu );
				
			};
			
			toggle = function () {
				
				if ( $menu.is( '.active' ) === true ) {
					
					$menu.trigger( 'close' );
					
				}
				else {
					
					$menu.trigger( 'open' );
					
				}
				
			};
			
			$menu.on( 'open', open )
				.on( 'close', close )
				.on( 'toggle', toggle );
			
			// attach events to toggle when present
			
			if ( $toggle.length > 0 ) {
				
				$toggle.data( '$menu', $menu );
				
				shared.domElements.$menuToggles = shared.domElements.$menuToggles.add( $toggle );
				
				// events
				
				$toggle.on( 'tap',  toggle );
				
			}
			
			// find default menu
			
			if ( shared.domElements.$menuDefault.length === 0 && $menu.is( '.active' ) === true ) {
				
				shared.domElements.$menuDefault = $menu;
				shared.domElements.$menuToggleDefault = $toggle;
				
				deactivate();
				
			}
			
		} );
		
		// for each tab toggle
		
		 shared.domElements.$tabToggles.each( function () {
			
			var $toggle = $( this ),
				$tab = $( $toggle.attr( 'href' ) );
				
				$toggle.data( '$tab', $tab );
				
				// make toggle-able
				
				$toggle.on( 'tap', function ( e ) {
					
					if ( $tab.is( '.active' ) === true ) {
						
						$toggle.trigger( 'showing' );
						
					}
					else {
						
						$toggle.tab('show');
						
					}
					
				} )
				.on( 'shown', function () {
					
					$toggle.trigger( 'showing' );
					
				} );
			
		} );
		
		// pause / resume
		
		shared.domElements.$buttonsGamePause.on( 'tap', pause );
		shared.domElements.$buttonsGameResume.on( 'tap', resume );
		
		// pause / resume on focus
		
		shared.signals.onFocusLost.add( function () {
			
			if ( paused !== true ) {
				
				pausedByFocusLoss = true;
				
				main.dom_collapse( {
					element: shared.domElements.$pauseMessage,
					show: true
				} );
			
			}
			
			pause( true );
			
		} );
		
		shared.signals.onFocusGained.add( function () {
			
			if ( pausedByFocusLoss === true ) {
				
				pausedByFocusLoss = false;
				
				resume();
				
			}
			
		} );
		
		// add renderer to display
		
		shared.domElements.$game.prepend( renderer.domElement );
		
		// events
		
		shared.domElements.$game
			.on( 'mousemove', $.throttle( shared.throttleTimeShort, on_pointer_moved ) )
			.on( 'tap', on_pointer_tapped )
			.on( 'doubletap', on_pointer_doubletapped )
			.on( 'hold', on_pointer_held )
			.on( 'dragstart', on_pointer_dragstarted )
			.on( 'drag', $.throttle( shared.throttleTimeShort, true, on_pointer_dragged ) )
			.on( 'dragend', on_pointer_dragended )
			.on( 'mousewheel DOMMouseScroll', on_pointer_wheel )
			.on( 'contextmenu', on_context_menu );
			
		shared.domElements.$uiOutGame
			.on( 'scroll scrollstop', $.throttle( shared.throttleTimeLong, on_scrolled ) );
		
		// hide uiOutGame
		
		main.dom_fade( {
			element: shared.domElements.$uiOutGame,
			time: 0
		} );
		
		// show menus nav
		
		main.dom_fade( {
			element: shared.domElements.$navMenus,
			opacity: 1
		} );
		
	}
	
	/*===================================================
    
    init launcher
    
    =====================================================*/
	
	function init_launcher () {
		
		_Launcher = main.get_asset_data( "js/kaiopua/sections/Launcher.js" );
		
		set_section( _Launcher );
		
	}
	
	/*===================================================
    
    init game
    
    =====================================================*/
	
    function init_game () {
		console.log( 'init game');
		var l, m, b;
		
		// assets
		
		_RayHelper = main.get_asset_data( "js/kaiopua/utils/RayHelper.js" );
		_Messenger = main.get_asset_data( "js/kaiopua/ui/Messenger.js" );
		
		// ui
		
		$( '#buttonStart' ).on( 'tap', start );
		$( '#buttonExitGame' ).on( 'tap', stop );
		
		// fade start menu in after short delay
		
		setTimeout( function () {
			
			main.dom_fade( {
				element: shared.domElements.$navStart,
				opacity: 1
			} );
			
		}, navStartDelayTime );
		
		/*
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
    
    event functions
    
    =====================================================*/
	
	function on_pointer_moved ( e ) {
		
		var pointer;
		
		pointer = main.reposition_pointer( e );
		
		shared.signals.onGamePointerMoved.dispatch( e, pointer );
		
	}
	
	function on_pointer_tapped ( e ) {
		
		var pointer;
		
		pointer = main.reposition_pointer( e );
		
		shared.signals.onGamePointerTapped.dispatch( e, pointer );
		
	}
	
	function on_pointer_doubletapped ( e ) {
		
		var pointer;
		
		pointer = main.reposition_pointer( e );
		
		shared.signals.onGamePointerDoubleTapped.dispatch( e, pointer );
		
	}
	
	function on_pointer_held ( e ) {
		
		var pointer;
		
		pointer = main.reposition_pointer( e );
			
		shared.signals.onGamePointerHeld.dispatch( e, pointer );
		
	}
	
	function on_pointer_dragstarted ( e ) {
		
		var pointer;
		
		pointer = main.reposition_pointer( e );
		
		shared.signals.onGamePointerDragStarted.dispatch( e, pointer );
		
	}
    
    function on_pointer_dragged( e ) {
		
		var pointer;
		
		pointer = main.reposition_pointer( e );
		
		shared.signals.onGamePointerDragged.dispatch( e, pointer );
		
    }
	
	function on_pointer_dragended ( e ) {
		
		var pointer;
		
		pointer = main.reposition_pointer( e );
		
		shared.signals.onGamePointerDragEnded.dispatch( e, pointer );
		
	}
	
	function on_pointer_wheel ( e ) {
		
		var eo = e.originalEvent || e;
		
		shared.timeSinceInteraction = 0;
		
		// normalize scroll across browsers
		// simple implementation, removes acceleration
		
		e.wheelDelta = eo.wheelDelta = ( ( eo.detail < 0 || eo.wheelDelta > 0 ) ? 1 : -1 ) * shared.pointerWheelSpeed;
		
		shared.signals.onGamePointerWheel.dispatch( e );
        
        e.preventDefault();
		
    }
	
	function on_scrolled ( e ) {
		
		shared.timeSinceInteraction = 0;
		
		shared.signals.onScrolled.dispatch( $( window ).scrollLeft(), $( window ).scrollTop() );
		
	}
	
	function on_context_menu ( e ) {
		
		// disable right click menu while in game
		
		e.preventDefault();
		
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
			
			defaultPassIndex = main.index_of_value( passesNames, passName );
			
			if ( defaultPassIndex === -1 ) {
				
				passesNames.unshift( passName );
				
			}
			
		}
		
		// required post
		
		for ( i = requiredPost.length - 1; i >= 0; i-- ) {
			
			passName = requiredPost[ i ];
			
			defaultPassIndex = main.index_of_value( passesNames, passName );
			
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
    
    pointer functions
    
    =====================================================*/
	
	function get_pointer_intersection ( parameters ) {
		
		var intersection;
		
		// handle parameters
		
		// TODO: remove the need for this function entirely
		
		parameters = parameters || {};
		
		parameters.pointer = parameters.pointer || main.get_pointer( parameters );
		parameters.camera = parameters.camera || camera;
		
		parameters.objects = ( parameters.objects || [] ).concat( scene.dynamics );
		parameters.octrees = ( parameters.octrees || [] ).concat( scene.octree );
		
		// intersection
		
		return _RayHelper.raycast( parameters );
		
	}
	
	/*===================================================
    
    section functions
    
    =====================================================*/

    function set_section ( section, callback ) {
		
		var hadPreviousSection = false,
			newSectionCallback = function () {
				
				if ( typeof previousSection !== 'undefined' ) {
					
					previousSection.remove();
					
				}
				
				section.resize(shared.gameWidth, shared.gameHeight);
				
                section.show();
				
                currentSection = section;
				
				// hide blocker
				
				main.dom_fade( {
					element: shared.domElements.$uiBlocker
				} );
				
				resume();
				
				if ( typeof callback !== 'undefined' ) {
					
					callback.call();
					
				}
				
			};
		
		// pause game while changing sections
		
		pause( true );
		
        // hide current section
        if (typeof currentSection !== 'undefined') {
			
			hadPreviousSection = true;
            
            previousSection = currentSection;
            
            previousSection.hide();
			
			// block ui
            
			main.dom_fade( {
				element: shared.domElements.$uiBlocker,
				opacity: 1
			} );
            
        }
		
        // no current section
		
        currentSection = undefined;
		
		// set started
		
		if ( typeof startedValue !== 'undefined' ) {
		
			started = startedValue;
			
		}
        
        // start and show new section
        if (typeof section !== 'undefined') {
			
            // wait for blocker to finish fading in
			
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
		
		if ( started === false ) {
			console.log('GAME: START');
			// set started
			
			started = true;
			
			// assets
			
			_Intro = main.get_asset_data( 'js/kaiopua/sections/Intro.js' );
			
			// hide start nav
			
			main.dom_fade( {
				element: shared.domElements.$navStart
			} );
			
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
						uiGameDimmerOpacity: 0.9
					} );
					
					_Messenger.show_message( {
						title: "Here's how to play:",
						body: _GUI.messages.controls,
						priority: true,
						uiGameDimmerOpacity: 0.9
					} );
					
				}, introMessageDelayTime );
				*/
			} );
			
			// signal
			
			shared.signals.onGameStarted.dispatch();
			
		}
		
    }
	
	function stop () {
		
		if ( started === true ) {
			console.log('GAME: STOP');
			started = false;
			
			// TODO: clear in game ui
			
			// signal
			
			shared.signals.onGameStopped.dispatch();
			
			// set launcher section
			
			set_section( _Launcher, function () {
			
				// show start menu
				
				main.dom_fade( {
					element: shared.domElements.$navStart,
					opacity: 1
				} );
				
			});
		
		}
		
	}
	
	/*===================================================
    
    pause / resume
    
    =====================================================*/
	
    function pause ( preventDefault, preventMenuChange ) {
		// set state
		
        if (paused === false) {
            console.log('GAME: PAUSE');
            paused = true;
			pausedWithoutControl = preventDefault;
			
			// hide pause button
			
			main.dom_fade( {
				element: shared.domElements.$buttonGamePause,
				time: 0
			} );
			
			// pause priority
			
			if ( pausedWithoutControl === true ) {
				
				// block ui
				
				main.dom_fade( {
					element: shared.domElements.$uiBlocker,
					opacity: 0.9
				} );
				
			}
			else {
				
				// uiGameDimmer
				
				main.dom_fade( {
					element: shared.domElements.$uiGameDimmer,
					opacity: 0.9
				} );
				
				// swap to default menu
				
				if ( preventMenuChange !== true && shared.domElements.$menuToggleDefault.length > 0 ) {
					
					shared.domElements.$menuToggleDefault.trigger( 'tap' );
					
				}
				
				// show resume button
				
				main.dom_fade( {
					element: shared.domElements.$buttonGameResume,
					opacity: 1
				} );
				
				// add listener for click on uiGameDimmer
				
				shared.domElements.$uiGameDimmer.on( 'tap.resume', resume );
				
			}
			
			// when started
			
			if ( started === true ) {
				
				
				
			}
			
			// signal
            
            shared.signals.onGamePaused.dispatch();
			
			// render once to ensure user is not surprised when resuming
			
			render();
            
        }
		
    }
    
    function resume () {
		
        if ( paused === true && _ErrorHandler.errorState !== true && ( typeof _Messenger === 'undefined' || _Messenger.active !== true ) ) {
			console.log('GAME: RESUME');
			
			// hide resume button
			
			main.dom_fade( {
				element: shared.domElements.$buttonGameResume,
				time: 0
			} );
			
			// hide pause message
			
			main.dom_collapse( {
				element: shared.domElements.$pauseMessage
			} );
			
			// unblock ui
			
			main.dom_fade( {
				element: shared.domElements.$uiBlocker
			} );
			
			_UIQueue.clear( shared.domElements.$uiOutGame );
			
			// uiGameDimmer
			
			shared.domElements.$uiGameDimmer.off( '.resume' );
			main.dom_fade( {
				element: shared.domElements.$uiGameDimmer
			} );
			
			// show pause button
			
			main.dom_fade( {
				element: shared.domElements.$buttonGamePause,
				opacity: 1
			} );
			
			// when started
			
			if ( started === true ) {
				
				
				
			}
			
			paused = false;
			pausedWithoutControl = false;
			
			shared.signals.onGameResumed.dispatch();
            
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
			
			shared.signals.onGameUpdated.dispatch( timeDelta, timeDeltaMod );
			
			// finish frame
			
			render();
			
		}
			
    }
	
	function render() {
		
		cameraControls.update();
		
		cameraBG.quaternion.copy( camera.quaternion );
		
		renderer.setViewport( 0, 0, shared.gameWidth, shared.gameHeight );
		
        renderer.clear();
        
		renderComposer.render();
		
	}
    
    function resize( screenWidth, screenHeight ) {
		
		var gameWidth,
			gameHeight,
			heightHeader = shared.domElements.$uiHeader.height(),
			uiBodyHeight =( screenHeight || shared.screenHeight ) - heightHeader;
		
		// ui
		
		shared.domElements.$uiBody.css( {
			'height' : uiBodyHeight,
			'top' : heightHeader
		} );
		
		// because ui out game is scrollable, its grids are not aligned to main header grids
		// so we need to pad left side of the individual containers to correct for this
		
		if ( shared.domElements.$uiOutGame[0].scrollHeight > uiBodyHeight ) {
			
			shared.domElements.$menusInner.css( 'padding-left', $.scrollbarWidth() );
			
		}
		
        // renderer
		
		gameWidth = shared.gameWidth = shared.domElements.$game.width();
		gameHeight = shared.gameHeight = shared.domElements.$game.height();
		
        renderer.setSize( gameWidth, gameHeight );
        renderTarget.width = gameWidth;
        renderTarget.height = gameHeight;
		
		renderPasses.focusVignette.uniforms[ "screenWidth" ].value = gameWidth;
        renderPasses.focusVignette.uniforms[ "screenHeight" ].value = gameHeight;
		
		camera.aspect = gameWidth / gameHeight;
        camera.updateProjectionMatrix();
		
		cameraBG.aspect = gameWidth / gameHeight;
        cameraBG.updateProjectionMatrix();
		
        renderComposer.reset( renderTarget );
		
		// re-render
		
		render();
        
    }
	
	/*===================================================
	
	utility
	
	=====================================================*/
	
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