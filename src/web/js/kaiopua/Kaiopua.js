/*
 *
 * Kaiopua.js
 * Main module of Kaiopua engine.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
var KAIOPUA = (function (main) {
	
	// shared
	
    var shared = main.shared = main.shared || {};
	
	shared.pointers = [];
	shared.originLink = window.location.pathname.toString();
	
	shared.pathToIcons = 'img/';
	shared.pathToAssets = 'asset/';
	shared.pathToModels = shared.pathToAssets + 'model/';
	shared.pathToTextures = shared.pathToAssets + 'texture/';
	
	shared.frameRateMax = 60;
	shared.frameRateMin = 20;
	shared.time = new Date().getTime();
	shared.timeLast = shared.time;
	shared.timeDeltaExpected = 1000 / 60;
	shared.timeDeltaModDec = Math.pow( 10, 2 );
	shared.pointerWheelSpeed = 120;
	shared.pointerHoldPositionShift = 10;
	shared.throttleTimeShort = shared.timeDeltaExpected * 3;
	shared.throttleTimeMedium = 100;
	shared.throttleTimeLong = 250;
	shared.throttleTimeLong = 250;
	shared.focused = true;
	
	shared.domFadeTime = 500;
	shared.domCollapseTime = 500;
	shared.domScrollTime = 500;
	shared.domFadeEasing = 'easeInOutCubic';
	shared.domCollapseEasing = 'easeInOutCubic';
	shared.domScrollEasing = 'easeInOutCubic';
	
	var loader = {},
		worker = {},
		_ErrorHandler,
		_Scene,
		_CameraControls,
		_World,
		_UIQueue,
		_MathHelper,
		_RayHelper,
		_Messenger,
		_Player,
        renderer, 
        renderTarget,
		renderComposer,
        renderPasses,
		setup = false,
		ready = false,
		started = false,
        paused = false,
		pausedWithoutControl = false,
		pausedByFocusLoss = false,
        currentSection, 
        previousSection,
		transitionTime = 500,
		navStartDelayTime = 500,
		sectionChangePauseTime = 500,
        libsPrimaryList = [
            "js/lib/RequestAnimationFrame.js",
            "js/lib/RequestInterval.js",
            "js/lib/RequestTimeout.js",
            "js/lib/signals.min.js",
			"js/lib/jquery-1.8.2.min.js"
        ],
		libsSecondaryList = [
			"js/lib/hammer.custom.js",
			"js/lib/bootstrap.min.js",
			"js/lib/jquery.easing-1.3.min.js",
			"js/lib/jquery.imagesloaded.min.js",
			"js/lib/jquery.throttle-debounce.custom.min.js",
			"js/lib/jquery.scrollbarwidth.min.js",
			"js/lib/jquery.placeholdme.js"
		],
		libsTertiaryList = [
			"js/lib/jquery.multi-sticky.js"
		],
        assetsGameCompatibility = [
			"js/kaiopua/utils/ErrorHandler.js"
        ],
        assetsGameFoundation = [
            "js/lib/three/three.min.js",
			"js/lib/Tween.custom.min.js"
        ],
		assetsGameFoundationExtras = [
			"js/lib/three/ThreeOctree.min.js",
            "js/lib/three/postprocessing/ShaderExtras.js",
            "js/lib/three/postprocessing/EffectComposer.js",
            "js/lib/three/postprocessing/RenderPass.js",
            "js/lib/three/postprocessing/MaskPass.js",
            "js/lib/three/postprocessing/ShaderPass.js"
		],
		assetsGameCore = [
			"js/kaiopua/core/Scene.js",
			"js/kaiopua/core/CameraControls.js",
			"js/kaiopua/env/World.js",
			"js/kaiopua/ui/UIQueue.js",
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/RayHelper.js",
			"js/kaiopua/core/Model.js",
			"js/kaiopua/physics/Physics.js",
			"js/kaiopua/physics/RigidBody.js",
			"js/kaiopua/utils/VectorHelper.js",
			"js/kaiopua/utils/SceneHelper.js",
			"js/kaiopua/utils/ObjectHelper.js",
			"js/kaiopua/utils/PhysicsHelper.js"
		],
        assetsGameLauncher = [
            "js/kaiopua/sections/Launcher.js"
        ],
        assetsGameExtras = [
			"js/kaiopua/sections/Intro.js",
			"js/kaiopua/core/Player.js",
			"js/kaiopua/core/Actions.js",
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
			"js/kaiopua/utils/ObjectMaker.js",
            { path: "asset/model/Whale.js", type: 'model' },
			{ path: "asset/model/Hero.js", type: 'model' },
			{ path: "asset/model/Sun.js", type: 'model' },
			{ path: "asset/model/Cloud_001.js", type: 'model' },
			{ path: "asset/model/Cloud_002.js", type: 'model' },
			{ path: "asset/model/Hut.js", type: 'model' },
			{ path: "asset/model/Hut_Hill.js", type: 'model' },
			{ path: "asset/model/Hut_Steps.js", type: 'model' },
			{ path: "asset/model/Bed.js", type: 'model' },
			{ path: "asset/model/Banana_Leaf_Door.js", type: 'model' },
			{ path: "asset/model/Surfboard.js", type: 'model' },
			{ path: "asset/model/Grass_Clump_001.js", type: 'model' },
			{ path: "asset/model/Grass_Clump_002.js", type: 'model' },
			{ path: "asset/model/Grass_Line_001.js", type: 'model' },
			{ path: "asset/model/Grass_Line_002.js", type: 'model' },
			{ path: "asset/model/Palm_Tree.js", type: 'model' },
			{ path: "asset/model/Palm_Trees.js", type: 'model' },
			{ path: "asset/model/Kukui_Tree.js", type: 'model' },
			{ path: "asset/model/Kukui_Trees.js", type: 'model' },
			{ path: "asset/model/Plant_Dirt_Mound.js", type: 'model' },
			{ path: "asset/model/Plant_Seed.js", type: 'model' },
			{ path: "asset/model/Plant_Taro.js", type: 'model' },
			{ path: "asset/model/Plant_Pineapple.js", type: 'model' },
			{ path: "asset/model/Plant_Rock.js", type: 'model' },
			{ path: "asset/model/Plant_Rock_Purple.js", type: 'model' },
			{ path: "asset/model/Plant_Rock_Blue.js", type: 'model' },
			{ path: "asset/model/Volcano_Large.js", type: 'model' },
			{ path: "asset/model/Volcano_Small.js", type: 'model' },
			{ path: "asset/model/Volcano_Rocks_001.js", type: 'model' },
			{ path: "asset/model/Volcano_Rocks_002.js", type: 'model' },
			{ path: "asset/model/Volcano_Rocks_003.js", type: 'model' },
			{ path: "asset/model/Volcano_Rocks_004.js", type: 'model' },
			{ path: "asset/model/Volcano_Rocks_005.js", type: 'model' },
			{ path: "asset/model/Puzzle_Tutorial.js", type: 'model' },
			{ path: "asset/model/Puzzle_Tutorial_Grid.js", type: 'model' },
			{ path: "asset/model/Puzzle_Tutorial_Toggle.js", type: 'model' },
			{ path: "asset/model/Puzzle_Rolling_Hills.js", type: 'model' },
			{ path: "asset/model/Puzzle_Rolling_Hills_Grid.js", type: 'model' },
			{ path: "asset/model/Puzzle_Rolling_Hills_Toggle.js", type: 'model' },
			{ path: "asset/model/Puzzle_Basics_Abilities.js", type: 'model' },
			{ path: "asset/model/Puzzle_Basics_Abilities_Grid.js", type: 'model' },
			"asset/texture/skybox_world_posx.jpg",
            "asset/texture/skybox_world_negx.jpg",
			"asset/texture/skybox_world_posy.jpg",
            "asset/texture/skybox_world_negy.jpg",
			"asset/texture/skybox_world_posz.jpg",
            "asset/texture/skybox_world_negz.jpg",
            "asset/texture/water_world_512.png",
            "asset/texture/dirt_128.jpg"
        ];
	
	/*===================================================
    
    init
    
    =====================================================*/
    
	// force cache-busting
	$LAB.setGlobalDefaults({ CacheBust: true });
	
    // load scripts
    $LAB.script( libsPrimaryList ).wait().script( libsSecondaryList ).wait().script( libsTertiaryList ).wait( init );
    
    function init () {
		
		shared.domElements = {};
		shared.domElements.$statusInactive = $( '#statusInactive' );
		shared.domElements.$statusActive = $( '#statusActive' );
		shared.domElements.$statusItems = $('.status-item');
		
		shared.supports = {};
		shared.supports.pointerEvents = css_property_supported( 'pointer-events' );
       
        shared.signals = {
			
			onFocusLost: new signals.Signal(),
			onFocusGained: new signals.Signal(),
			
			onScrolled: new signals.Signal(),
    
            onKeyPressed : new signals.Signal(),
            onKeyReleased : new signals.Signal(),
    
            onWindowResized : new signals.Signal(),
			
			onUpdated: new signals.Signal(),
            
            onLoadItemCompleted : new signals.Signal(),
            onLoadListCompleted : new signals.Signal(),
            onLoadAllCompleted : new signals.Signal(),
			
			onAssetReady : new signals.Signal(),
			
			onGamePaused : new signals.Signal(),
			onGameResumed : new signals.Signal(),
			onGameUpdated : new signals.Signal(),
			onGameUpdated : new signals.Signal(),
			onGameStarted : new signals.Signal(),
			onGameStopped : new signals.Signal(),
			
			onGamePointerMoved : new signals.Signal(),
			onGamePointerTapped : new signals.Signal(),
			onGamePointerDoubleTapped : new signals.Signal(),
			onGamePointerHeld : new signals.Signal(),
			onGamePointerDragStarted : new signals.Signal(),
			onGamePointerDragged : new signals.Signal(),
			onGamePointerDragEnded : new signals.Signal(),
			onGamePointerWheel : new signals.Signal()
            
        };
        
        // add listeners for global events
        // each listener dispatches shared signal
		
        $( document )
			.on( 'keydown', on_key_pressed )
			.on( 'keyup', on_key_released );
		
		$( window )
			.on( 'blur', on_focus_lost )
			.on( 'focus', on_focus_gained )
			.on( 'resize', $.throttle( shared.throttleTimeLong, on_window_resized ) );
		
		window.onerror = on_error;
	
		// loader
		
		loader.active = false;
		loader.listCount = 0;
		loader.lists = [];
		loader.listLocations = {};
		loader.listLoaded = {};
		loader.listMessages = {};
		loader.listCallbacks = {};
		loader.loading = [];
		loader.loadingListIDs = [];
		loader.started = [];
		loader.loaded = [];
		loader.loadingOrLoaded = [];
		loader.listCurrent = '';
		loader.loadTypeBase = 'script';
		loader.tips = [];
		
		add_loaded_locations( libsPrimaryList );
		add_loaded_locations( libsSecondaryList );
		add_loaded_locations( libsTertiaryList );
		
		// init worker
		
		worker.$domElement =  $("#worker");
		worker.$progressStarted = worker.$domElement.find( "#workerProgressBarStarted" );
		worker.$progressCompleted = worker.$domElement.find( "#workerProgressBarCompleted" );
		worker.taskCount = 0;
		worker.tasksStartedIds = [];
		worker.tasksStarted = {};
		worker.tasksCompleted = {};
		worker.collapseDelay = 1000;
		
		worker_reset();
		worker.$domElement.on( 'hidden.reset', function () {
			
			worker_reset();
			
		} );
		
		// public functions
		
		main.type = type;
		main.is_number = is_number;
		main.is_array = is_array;
		main.is_image = is_image;
		main.is_image_ext = is_image_ext;
		main.is_event = is_event;
		
		main.extend = extend;
		main.time_test = time_test;
		
		main.to_array = to_array;
		main.ensure_not_array = ensure_not_array;
		main.array_cautious_add = array_cautious_add;
		main.array_cautious_remove = array_cautious_remove;
		main.index_of_value = index_of_value;
		main.last_index_of_value = last_index_of_value;
		main.indices_of_value = indices_of_value;
		main.index_of_values = index_of_values;
		main.index_of_property = index_of_property;
		main.indices_of_property = indices_of_property;
		main.index_of_properties = index_of_properties;
		
		main.css_property_supported = css_property_supported;
		main.str_to_camel = str_to_camel;
		main.str_to_title = str_to_title;
		main.dom_extract = dom_extract;
		main.dom_generate_image = dom_generate_image;
		main.dom_ignore_pointer = dom_ignore_pointer;
		main.dom_fade = dom_fade;
		main.dom_collapse = dom_collapse;
		
		main.get_pointer = get_pointer;
		main.reposition_pointer = reposition_pointer;
		
		main.worker_reset = worker_reset;
		main.worker_start_task = worker_start_task;
		main.worker_complete_task = worker_complete_task;
		
		main.load = load;
		main.get_is_loaded = get_is_loaded;
		main.get_is_loading = get_is_loading;
		main.get_is_loading_or_loaded = get_is_loading_or_loaded;
		
		main.get_asset_path = get_asset_path;
		main.get_ext = get_ext;
		main.add_default_ext = add_default_ext;
		main.remove_ext = remove_ext;
		main.get_alt_path = get_alt_path;
		
		main.asset_register = asset_register;
		main.asset_require = asset_require;
		main.asset_ready = asset_ready;
		main.set_asset = set_asset;
		main.get_asset = get_asset;
		main.get_asset_data = get_asset_data;
		
		main.set_section = set_section;
		
		main.start = start;
		main.resume = resume;
		main.pause = pause;
		
		main.get_pointer_intersection = get_pointer_intersection;
		
		// getters and setters
		
		Object.defineProperty(main, 'paused', { 
			get : function () { return paused; }
		});
		
		Object.defineProperty(main, 'started', { 
			get : function () { return started; }
		});
		
		Object.defineProperty(main, 'setup', { 
			get : function () { return setup; }
		});
		
		Object.defineProperty(main, 'ready', { 
			get : function () { return ready; }
		});
		
		// status items show/hide
		
		shared.domElements.$statusItems.each( function () {
			
			var $item = $( this );
			
			if ( $item.parent().is( shared.domElements.$statusActive ) && $item.is( '.hidden, .collapsed' ) ) {
				
				shared.domElements.$statusInactive.append( $item );
				
			}
			
		} ).on('show.active', function () {
			
			shared.domElements.$statusActive.append( this );
			
		}).on('hidden.active', function () {
			
			shared.domElements.$statusInactive.append( this );
			
		});
		
		// hide preloader and start loading
		
		$("#preloader").one( 'hidden', function () {
			
			$( this ).remove();
			
			// start loading compatibility checks
			
			asset_require( assetsGameCompatibility, compatibility_check, true );
			
		} );
		
		dom_collapse( {
			element: $("#preloader"),
		} );
		
		// begin updating
		
		update();
		
    }
	
	/*===================================================
    
	compatibility
    
    =====================================================*/
	
	function compatibility_check ( err ) {
		console.log('GAME: compatiblity check');
		_ErrorHandler = err;
		
		// check for errors
        
        if ( _ErrorHandler.check() ) {
			
            _ErrorHandler.process();
			
        }
        else {
			
			load_game_foundation();
			
        }
		
	}
	
	function load_game_foundation () {
		
		main.asset_require( assetsGameFoundation, [ load_game_foundation_extras ], true );
		
	}
	
	function load_game_foundation_extras () {
		
		main.asset_require( assetsGameFoundationExtras, [ init_foundation, load_game_core ], true );
		
	}
	
	function load_game_core () {
		
		main.asset_require( assetsGameCore, [ init_setup, load_game_launcher ], true );
		
	}
	
	function load_game_launcher () {
		
		main.asset_require( assetsGameLauncher, [ init_launcher, load_game_extras ], true );
		
	}
	
	function load_game_extras () {
		
		main.asset_require( assetsGameExtras, init_ready, true );
		
	}
	
	/*===================================================
    
	foundation
    
    =====================================================*/
    
    function init_foundation () {
		console.log('GAME: foundation');
		
		// universe gravity
		
		shared.universeGravitySource = new THREE.Vector3( 0, 0, 0 );
		shared.universeGravityMagnitude = new THREE.Vector3( 0, -0.4, 0 );
		
		// cardinal axes
		
		shared.cardinalAxes = {
			up: new THREE.Vector3( 0, 1, 0 ),
			forward: new THREE.Vector3( 0, 0, 1 ),
			right: new THREE.Vector3( -1, 0, 0 )
		}
		
		// renderer
		
        renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 0, maxLights: 4 } );
        renderer.setSize( shared.gameWidth, shared.gameHeight );
        renderer.autoClear = false;
		
        // render target
        renderTarget = new THREE.WebGLRenderTarget( shared.gameWidth, shared.gameHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter } );
        
        // share renderer
        shared.renderer = renderer;
        shared.renderTarget = renderTarget;
		
    }
	
	/*===================================================
    
	setup
    
    =====================================================*/
    
    function init_setup ( sc, cc, w, uiq, mh, rh ) {
		console.log('GAME: setup');
		// utility
		
		_Scene = sc;
		_CameraControls = cc;
		_World = w;
		_UIQueue = uiq;
		_MathHelper = mh;
		_RayHelper = rh;
		
		// scenes
		
		main.scene = new _Scene.Instance();
		main.sceneBG = new _Scene.Instance();
		
        // fog
		
        main.scene.fog = undefined;
		
		// physics
		
		main.physics = main.scene.physics;
		
		// camera
		
		main.camera = new THREE.PerspectiveCamera(60, shared.gameWidth / shared.gameHeight, 1, 20000);
		main.cameraBG = new THREE.PerspectiveCamera(60, shared.gameWidth / shared.gameHeight, 1, 20000);
		main.camera.useQuaternion = main.cameraBG.useQuaternion = true;
		
		// camera controls
		
		main.cameraControls = new _CameraControls.Instance( { camera: main.camera, target: main.world } );
		main.cameraControls.enabled = true;
		main.cameraControls.controllable = true;
		
		// passes
        
        renderPasses = {
			bg: new THREE.RenderPass( main.sceneBG, main.cameraBG ),
            env: new THREE.RenderPass( main.scene, main.camera ),
            screen: new THREE.ShaderPass( THREE.ShaderExtras[ "screen" ] )
        };
		
		renderPasses.env.clear = false;
        renderPasses.screen.renderToScreen = true;
		
        // composer
		
		renderComposer = new THREE.EffectComposer( renderer, renderTarget );
		
		renderComposer.addPass( renderPasses.bg );
		renderComposer.addPass( renderPasses.env );
		renderComposer.addPass( renderPasses.screen );
		
		// ui
		
		init_ui();
		
		setup = true;
		
		// resize once
		
		on_window_resized();
		
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
	
	function init_launcher ( launcher ) {
		
		_Launcher = launcher;
		console.log( '_Launcher', _Launcher );
		set_section( _Launcher );
		
	}
	
	/*===================================================
    
	ready
    
    =====================================================*/
    
    function init_ready ( intro, p ) {
		console.log('GAME: ready');
		
		_Intro = intro;
		_Player = p;
		
		main.player = new _Player.Instance();
		
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
		
		ready = true;
		
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
				
				section.resize( shared.gameWidth, shared.gameHeight );
				
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
    
    start / stop
    
    =====================================================*/
    
    function start () {
		
		if ( started === false ) {
			console.log('GAME: START');
			// set started
			
			started = true;
			
			// hide start nav
			
			main.dom_fade( {
				element: shared.domElements.$navStart
			} );
			
			// set intro section
			
			set_section( _Intro );
			
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
    
    update
    
    =====================================================*/
	
	function update () {
		
		var timeDelta,
			timeDeltaMod;
        
        window.requestAnimationFrame( update );
		
		// handle time
		
		shared.timeLast = shared.time;
		
		shared.time = new Date().getTime();
		
		timeDelta = shared.time - shared.timeLast;
		
		// get time delta modifier from timeDelta vs expected refresh interval
		
		timeDeltaMod = Math.round( ( timeDelta / shared.timeDeltaExpected ) * shared.timeDeltaModDec ) / shared.timeDeltaModDec;
		
		if ( is_number( timeDeltaMod ) !== true ) {
			
			timeDeltaMod = 1;
			
		}
		
		// update master
		
		shared.signals.onUpdated.dispatch( timeDelta, timeDeltaMod );
		
		// update game
		
		if ( paused !== true && setup === true ) {
			
			TWEEN.update();
			
			if ( main.physics ) {
				
				main.physics.update( timeDelta, timeDeltaMod );
				
			}
			
			shared.signals.onGameUpdated.dispatch( timeDelta, timeDeltaMod );
			
			// finish frame
			
			render();
			
		}
		
	}
	
	/*===================================================
    
    render
    
    =====================================================*/
    
	function render() {
		
		if ( setup === true ) {
			
			main.cameraControls.update();
			
			main.cameraBG.quaternion.copy( main.camera.quaternion );
			
			renderer.setViewport( 0, 0, shared.gameWidth, shared.gameHeight );
			
			renderer.clear();
			
			renderComposer.render();
			
		}
		
	}
	
	/*===================================================
    
    type checking
    
    =====================================================*/
	
	function type ( o ) {
		return o==null?o+'':Object.prototype.toString.call(o).slice(8,-1).toLowerCase();
	}
	
	function is_array ( target ) {
		return Object.prototype.toString.call( target ) === '[object Array]';
	}
	
	function is_number ( n ) {
		return !isNaN( n ) && isFinite( n ) && typeof n !== 'boolean';
	}
	
	function is_image ( target ) {
		return ( typeof target !== 'undefined' && target.hasOwnProperty('nodeName') && target.nodeName.toLowerCase() === 'img' );
	}
	
	function is_image_ext ( ext ) {
		
		if ( ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp' ) {
			return true;
		}
		else {
			return false;
		}
		
    }
	
	function is_event ( obj ) {
		return obj && ( obj.type && ( obj.target || obj.srcElement ) );
	}
	
	/*===================================================
    
    general helpers
    
    =====================================================*/
	
	// object cloning/extending
	// copies both enumerable and non-enumerable properties
	// copies getters and setters correctly
	// optional: deep copying while avoiding infinite recursion
	// deep copy only makes one copy of any object, regardless of how many times / places it is referenced
	
	function extend ( source, destination, deep, records ) {
		
		var i, l,
			propertyNames,
			name,
			descriptor,
			value,
			valueType,
			recordSources,
			recordCopies,
			recordSourceIndex,
			recordCopyIndex,
			recordSource,
			recordCopy;
		
		if ( typeof source !== 'undefined' ) {
			
			destination = main.type( destination ) === 'object' ? destination : {};
			
			propertyNames = Object.getOwnPropertyNames( source );
			
			for ( i = 0, l = propertyNames.length; i < l; i++ ) {
				
				name = propertyNames[ i ];
				
				descriptor = Object.getOwnPropertyDescriptor( source, name );
				
				if ( destination.hasOwnProperty( name ) ) {
					
					delete destination[ name ];
					
				}
				
				Object.defineProperty( destination, name, descriptor );
				
				// if deep copy
				
				if ( deep === true ) {
					
					// get descriptor that was just set
					
					descriptor = Object.getOwnPropertyDescriptor( destination, name );
					
					value = descriptor.value;
						
					valueType = type( value );
					
					// if the value of the descriptor is an object or array
					
					if ( valueType === 'object' || valueType === 'array' ) {
						
						records = records || { sources: [], copies: [] };
						
						recordSources = records.sources;
						
						recordCopies = records.copies;
						
						recordSourceIndex = index_of_value( recordSources, value );
						
						// if value does not yet exist in records
						
						if ( recordSourceIndex === -1 ) {
							
							recordSource = recordSources[ recordSources.length ] = value;
							
							recordCopy = recordCopies[ recordCopies.length ] = ( valueType === 'object' ? {} : [] );
							
							// special case when object has a reference to itself
							
							if ( value === source ) {
								value[ name ] = recordCopy;
							}
							
							descriptor.value = extend( value, recordCopy, true, records );
							
						}
						else {
							
							descriptor.value = recordCopies[ recordSourceIndex ];
							
						}
						
						// set descriptor again with new deep copied value
					
						Object.defineProperty( destination, name, descriptor );
						
					}
					
				}
				
			}
			
		}
		
		return destination;
		
	}
	
	function time_test ( fn, iterations, message ) {
		
		var i,
			ta, tb,
			result;
		
		iterations = is_number( iterations ) && iterations > 0 ? iterations : 1;
		
		message = typeof message === 'string' ? message : '';
		
		ta = new Date().getTime();
		
		for ( i = 0; i < iterations; i++ ) {
			
			result = fn.call();
			
		}
		
		tb = new Date().getTime();
		
		console.log( message, ' > time test ( x', iterations, '): ', (tb - ta) );
		
		return result;
		
	}
	
	/*===================================================
    
    array / object helpers
    
    =====================================================*/
	
	function to_array ( target ) {
		
		return target ? ( is_array ( target ) !== true ? [ target ] : target ) : [];
		
	}
	
	function ensure_not_array ( target, index ) {
		
		return is_array ( target ) === true ? target[ index || 0 ] : target;
		
	}
	
	function array_cautious_add ( target, elements ) {
		
		var i, l,
			element,
			index,
			added = false;
		
		target = to_array( target );
		elements = to_array( elements );
		
		// for each element
		
		for ( i = 0, l = elements.length; i < l; i++ ) {
			
			element = elements[ i ];
			
			index = index_of_value( target, element );
			
			if ( index === -1 ) {
				
				target.push( element );
				
				added = true;
				
			}
			
		}
		
		return added;
		
	}
	
	function array_cautious_remove ( target, elements ) {
		
		var i, l,
			element,
			index,
			removed = false;
		
		target = to_array( target );
		elements = to_array( elements );
		
		// for each element
		
		for ( i = 0, l = elements.length; i < l; i++ ) {
			
			element = elements[ i ];
			
			index = index_of_value( target, element );
			
			if ( index !== -1 ) {
				
				target.splice( index, 1 );
				
				removed = true;
				
			}
			
		}
		
		return removed;
		
	}
	
	function index_of_value( array, value ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ] ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function last_index_of_value( array, value ) {
		
		for ( var i = array.length - 1; i >= 0; i-- ) {
			
			if ( value === array[ i ] ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function indices_of_value( array, value ) {
		
		var indices = [];
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ] ) {
				
				indices.push( i );
				
			}
			
		}
		
		return indices;
		
	}
	
	function index_of_values( array, values ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( index_of_value( values, array[ i ] ) !== -1 ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function index_of_property( array, property, value ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ][ property ] ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function indices_of_property( array, property, value ) {
		
		var indices = [];
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ][ property ] ) {
				
				indices.push( i );
				
			}
			
		}
		
		return indices;
		
	}
	
	function index_of_properties( array, properties, values ) {
		
		for ( var i = 0, il = array.length; i < il; i++ ) {
			
			for ( var j = 0, jl = properties.length; j < jl; j++ ) {
				
				if ( values[ j ] === array[ i ][ properties[ j ] ] ) {
					
					return i;
					
				}
				
			}
			
		}
		
		return -1;
		
	}
	
	/*===================================================
    
    pointer
    
    =====================================================*/
	
	function get_pointer ( parameters ) {
		
		parameters = parameters || {};
		
		var id = parameters.identifier = ( parameters.identifier ? parameters.identifier : 0 ),
			pointer = shared.pointers[ id ];

		if ( typeof pointer === 'undefined' ) {
			
			pointer = shared.pointers[ id ] = {};
			pointer.id = id;
			pointer.x = pointer.lx = shared.screenWidth * 0.5;
			pointer.y = pointer.ly = shared.screenHeight * 0.5;
			pointer.deltaX = pointer.deltaY = pointer.angle = pointer.distance = pointer.distanceX = pointer.distanceY = 0;
			pointer.direction = 'none';
		
		}
		
		return pointer;
		
	}
	
	function reposition_pointer ( e ) {
		
		shared.timeSinceInteraction = 0;
		
		var pointer = main.get_pointer( e ),
			position,
			d,
			b;
		
		if ( e ) {
			
			position = e.position;
			
			if ( is_array( position ) && position[ pointer.id ] ) {
				
				position = position[ pointer.id ];
				
			}
			
			if ( typeof position === 'undefined' || is_number( position.x ) !== true || is_number( position.y ) !== true ) {
				
				d = document;
				b = d.body;
				
				position = {
					x: e.pageX || e.clientX + ( d && d.scrollLeft || b && b.scrollLeft || 0 ) - ( d && d.clientLeft || b && b.clientLeft || 0 ),
					y: e.pageY || e.clientY + ( d && d.scrollTop || b && b.scrollTop || 0 ) - ( d && d.clientTop || b && b.clientTop || 0 )
				 };
				
			}
			
			pointer.lx = pointer.x;
			pointer.ly = pointer.y;
			
			pointer.x = position.x;
			pointer.y = position.y;
			
			pointer.deltaX = pointer.x - pointer.lx;
			pointer.deltaY = pointer.y - pointer.ly;
			
			pointer.angle = e.angle || 0;
			pointer.distance = e.distance || 0;
			pointer.distanceX = e.distanceX || 0;
			pointer.distanceY = e.distanceY || 0;
			pointer.direction = e.direction || 'none';
			
		}
		
		return pointer;
		
	}
	
	function get_pointer_intersection ( parameters ) {
		
		var intersection;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.pointer = parameters.pointer || main.get_pointer();
		parameters.camera = parameters.camera || main.camera;
		
		parameters.objects = ( parameters.objects || [] ).concat( main.scene.dynamics );
		parameters.octrees = ( parameters.octrees || [] ).concat( main.scene.octree );
		
		// intersection
		
		return _RayHelper.raycast( parameters );
		
	}
	
	/*===================================================
    
    event functions
    
    =====================================================*/
	
	function on_pointer_moved ( e ) {
		
		var pointer;
		
		pointer = reposition_pointer( e );
		
		shared.signals.onGamePointerMoved.dispatch( e, pointer );
		
	}
	
	function on_pointer_tapped ( e ) {
		
		var pointer;
		
		pointer = reposition_pointer( e );
		
		shared.signals.onGamePointerTapped.dispatch( e, pointer );
		
	}
	
	function on_pointer_doubletapped ( e ) {
		
		var pointer;
		
		pointer = reposition_pointer( e );
		
		shared.signals.onGamePointerDoubleTapped.dispatch( e, pointer );
		
	}
	
	function on_pointer_held ( e ) {
		
		var pointer;
		
		pointer = reposition_pointer( e );
			
		shared.signals.onGamePointerHeld.dispatch( e, pointer );
		
	}
	
	function on_pointer_dragstarted ( e ) {
		
		var pointer;
		
		pointer = reposition_pointer( e );
		
		shared.signals.onGamePointerDragStarted.dispatch( e, pointer );
		
	}
    
    function on_pointer_dragged( e ) {
		
		var pointer;
		
		pointer = reposition_pointer( e );
		
		shared.signals.onGamePointerDragged.dispatch( e, pointer );
		
    }
	
	function on_pointer_dragended ( e ) {
		
		var pointer;
		
		pointer = reposition_pointer( e );
		
		shared.signals.onGamePointerDragEnded.dispatch( e, pointer );
		
	}
	
	function on_pointer_wheel ( e ) {
		
		var eo = e.originalEvent || e;
		
		// normalize scroll across browsers
		// simple implementation, removes acceleration
		
		e.wheelDelta = eo.wheelDelta = ( ( eo.detail < 0 || eo.wheelDelta > 0 ) ? 1 : -1 ) * shared.pointerWheelSpeed;
		
		shared.signals.onGamePointerWheel.dispatch( e );
        
        e.preventDefault();
		
    }
	
	function on_scrolled ( e ) {
		
		shared.signals.onScrolled.dispatch( $( window ).scrollLeft(), $( window ).scrollTop() );
		
	}
	
	function on_context_menu ( e ) {
		
		// disable right click menu while in game
		
		e.preventDefault();
		
	}

    function on_key_pressed( e ) {
		
        shared.signals.onKeyPressed.dispatch( e );
		
    }

    function on_key_released( e ) {
		
        shared.signals.onKeyReleased.dispatch( e );
		
    }
	
	function on_focus_lost ( e ) {
		
		shared.focused = false;
		
		shared.signals.onFocusLost.dispatch( e );
		
	}
	
	function on_focus_gained ( e ) {
		
		shared.focused = true;
		
		shared.signals.onFocusGained.dispatch( e );
		
	}

    function on_window_resized( e ) {
		
		var gameWidth,
			gameHeight,
			heightHeader,
			uiBodyHeight;
        
        shared.screenWidth = $(window).width();
        shared.screenHeight = $(window).height();
		
        shared.signals.onWindowResized.dispatch(shared.screenWidth, shared.screenHeight);
		
		if ( setup === true ) {
			
			heightHeader = shared.domElements.$uiHeader.height();
			uiBodyHeight = shared.screenHeight - heightHeader;
			
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
			
			main.cameraBG.aspect = main.camera.aspect = gameWidth / gameHeight;
			main.camera.updateProjectionMatrix();
			main.cameraBG.updateProjectionMatrix();
			
			renderComposer.reset( renderTarget );
			
			// re-render
			
			render();
			
		}
        
    }
	
	function on_error ( error, url, lineNumber ) {
		
		// pause game
		
        pause( true );
		
		// check error handler state
		
		if ( _ErrorHandler.errorState !== true ) {
			
			_ErrorHandler.generate( error, url, lineNumber );
			
		}
		
		// debug
        
        throw error + " at " + lineNumber + " in " + url;
		
		return true;
		
	}
	
	/*===================================================
    
    css
    
    =====================================================*/
	
	function css_property_supported ( property ) {
		
		var i, l,
			propertyCamel,
			propertySupported;
		
		// format property to camel case
		
		propertyCamel = str_to_camel( property );
		
		// use modernizr to check for correct css
		
		propertySupported = Modernizr.prefixed( propertyCamel );
		
		// cast to opposite boolean twice and return if supported
		
		return !!propertySupported;
		
	}
	
	function str_to_camel ( str ) {
		
		// code based on camelize from prototype library
		
		var parts = str.split('-'), 
			len = parts.length, 
			camelized;
		
		if (len == 1) {
			
			return parts[0];
			
		}

		camelized = str.charAt(0) == '-' ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1) : parts[0];
		
		for (var i = 1; i < len; i++) {
			
			camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
			
		}
		
		return camelized;
		
	}
	
	function str_to_title ( str ) {
		
		return str.toLowerCase().replace( /\b[a-z]/g, function( letter ) {
			return letter.toUpperCase();
		} );
		
	}
	
	/*===================================================
    
    dom
    
    =====================================================*/
	
	function dom_extract ( element ) {
		
		return element instanceof $ ? element.get( 0 ) : element;
		
	}
	
	function dom_ignore_pointer ( $element, state ) {
		
		// use native pointer-events when available
		
		if ( shared.supports.pointerEvents ) {
			
			if ( state === true ) {
				
				$element.addClass( 'ignore-pointer-temporary' );
				
			}
			else {
				
				$element.removeClass( 'ignore-pointer-temporary' );
			
			}
			
		}
		else {
			
			// fallback in-case browser does not support pointer-events property
			// this method is incredibly slow, as it has to hide element, retrigger event to find what is under, then show again
			
			if ( state === true ) {
				
				$element.on( 'tap.pointer doubletap.pointer hold.pointer dragstart.pointer drag.pointer, dragend.pointer', 
					function ( e ) { 
						
						e.preventDefault();
						e.stopPropagation();
						
						$element.stop( true ).addClass( 'invisible' );
						
						$( document.elementFromPoint( e.clientX, e.clientY ) ).trigger( e );
						
						$element.stop( true ).removeClass( 'invisible' );
						
						return false;
						
					}
				);
				
			}
			else {
				
				$element.off( '.pointer' );
				
			}
			
		}
		
	}
	
	function dom_generate_image ( path, callback, context, image ) {
		
		var loadCallback = function () {
			
			if ( typeof callback === 'function' ) {
				
				callback.call( context, image );
				
			}
			
		};
		
		if ( is_image( image ) !== true ) {
			
			image = new Image();
			
		}
		
		image.crossOrigin = '';
		image.src = path;
		
		if ( image.complete ) {
			
			loadCallback();
		}
		else {
			
			image.onload = loadCallback;
			
		}
		
		return image;
		
    }
	
	function dom_fade( parameters ) {
		
		var $element,
			actions,
			time,
			opacity,
			easing,
			callback,
			isHidden,
			isCollapsed,
			fadeComplete = function () {
				
				$element.removeClass( 'hiding' );
				
				// if faded out completely, hide
				
				if ( opacity === 0 ) {
					
					$element.addClass( 'hidden' ).css( 'opacity', '' ).trigger( 'hidden' );
					
					// reenable all buttons and links
					
					dom_ignore_pointer( actions, false );
					
				}
				else {
					
					$element.trigger( 'shown' );
					
					if ( opacity === 1 ) {
						
						$element.css( 'opacity', '' );
						
					}
					
				}
				
				// do callback
				
				if ( typeof callback === 'function' ) {
					
					callback();
					
				}
				
			};
		
		// handle parameters
		
		parameters = parameters || {};
		
		$element = $( parameters.element );
		
		if ( $element.length > 0 ) {
			
			time = is_number( parameters.time ) ? parameters.time : shared.domFadeTime;
			opacity = is_number( parameters.opacity ) ? parameters.opacity : 0;
			easing = typeof parameters.easing === 'string' ? parameters.easing : shared.domFadeEasing;
			callback = parameters.callback;
			
			isHidden = $element.is( '.hidden' );
			isCollapsed = $element.is( '.collapsed' );
			
			// stop animations
			
			$element.stop( true ).removeClass( 'hiding hidden collapsed' );
			
			actions = $element.find( 'a, button' );
			
			dom_ignore_pointer( actions, false );
			
			// if should start at 0 opacity
			
			if ( isHidden === true || isCollapsed === true || parameters.initHidden === true ) {
				
				$element.fadeTo( 0, 0 ).css( 'height', '' );
				
			}
			
			// handle opacity
			
			if ( opacity === 0 ) {
				
				$element.addClass( 'hiding' ).trigger( 'hide' );
				
				// temporarily disable all buttons and links
				
				dom_ignore_pointer( actions, true );
				
			}
			else {
				
				$element.trigger( 'show' );
				
			}
			
			$element.fadeTo( time, opacity, easing, fadeComplete );
			
		}
		
	}
	
	function dom_collapse( parameters ) {
		
		var $elements,
			time,
			show,
			easing,
			callback;
		
		// handle parameters
		
		parameters = parameters || {};
		
		$elements = $( parameters.element );
		show = typeof parameters.show === 'boolean' ? parameters.show : false;
		time = is_number( parameters.time ) ? parameters.time : shared.domCollapseTime;
		easing = typeof parameters.easing === 'string' ? parameters.easing : shared.domCollapseEasing;
		callback = parameters.callback;
		
		// for each element
		
		$elements.each( function () {
			
			var $element = $( this ),
				isCollapsed,
				isHidden,
				heightCurrent,
				heightTarget = 0,
				collapseComplete = function () {
					
					// if shown or hidden
					
					if ( show === true ) {
						
						$element.css( 'height', '' ).trigger( 'shown' );
						
					}
					else {
						
						$element.addClass( 'hidden' ).trigger( 'hidden' );
						
						// enable pointer
						
						dom_ignore_pointer( $element, false );
						
					}
					
					// do callback
					
					if ( typeof callback === 'function' ) {
						
						callback();
						
					}
					
				};
			
			// if should start from hidden
			
			isHidden = $element.is( '.hiding, .hidden' );
			isCollapsed = $element.is( '.collapsed' );
			
			if ( isCollapsed !== true && ( isHidden === true || parameters.initHidden === true ) ) {
				
				$element.css( 'height', 0 ).css( 'opacity', '' );
				isCollapsed = true;
				
			}
			
			// if valid element and not already collapsing / collapsed to same state
			
			if ( isCollapsed === show ) {
				
				// stop any previous animation
				
				$element.stop( true ).removeClass( 'hiding hidden collapsed' );
				
				if ( show === true ) {
					
					// find correct current height and target height
					
					$element.placeholdme().appendTo( 'body' );
					
					heightCurrent = $element.height();
					$element.css( 'height', '' );
					heightTarget = $element.height();
					$element.css( 'height', heightCurrent );
					
					$element.placeholdme( 'revert' );
					
					// enable pointer
					
					dom_ignore_pointer( $element, false );
					
					// show
					
					$element.trigger( 'show' );
					
				}
				else {
					
					// temporarily ignore pointer
					
					dom_ignore_pointer( $element, true );
					
					$element.addClass( 'collapsed' ).trigger( 'hide' );
					
				}
				
				// animate
				
				$element.animate( { height: heightTarget }, { duration: time, easing: easing, complete: collapseComplete } );
				
			}
			
		} );
		
	}
	
	/*===================================================
	
	worker
	
	=====================================================*/
	
	function worker_reset () {
		
		worker.tasksStartedIds = [];
		worker.tasksStarted = {};
		worker.tasksCompleted = {};
		$().add( worker.$progressStarted ).add( worker.$progressCompleted ).children( '.work-task' ).remove();
		
	}
	
	function worker_start_task ( id ) {
		
		var $task;
		
		// if does not have task yet
		
		if ( typeof id === 'string' && id.length > 0 && worker.tasksStarted.hasOwnProperty( id ) !== true ) {
			
			worker.taskCount++;
			
			// clear collapse delay
			
			if ( typeof worker.collapseTimeoutHandle !== 'undefined' ) {
				
				window.clearTimeout( worker.collapseTimeoutHandle );
				worker.collapseTimeoutHandle = undefined;
				
			}
			
			// block ui
            
			main.dom_fade( {
				element: shared.domElements.$uiBlocker,
				opacity: 0.75
			} );
			
			// show if hidden
			
			main.dom_collapse( {
				element: worker.$domElement,
				show: true
			} );
			
			// init task
			
			$task = $( '<img src="img/bar_vertical_color_64.png" id="' + id + '" class="iconk-tiny iconk-widthFollow iconk-tight work-task">' );
			
			// store
			
			worker.tasksStartedIds.push( id );
			worker.tasksStarted[ id ] = $task;
			
			// add into worker started progress bar
			
			worker.$progressStarted.append( $task );
			
		}
		
	}
	
	function worker_complete_task ( id ) {
		
		var $taskStarted,
			$task,
			index;
		
		// if has task
		
		if ( typeof id === 'string' && id.length > 0 && worker.tasksStarted.hasOwnProperty( id ) ) {
			
			// remove previous
			
			index = index_of_value( worker.tasksStartedIds, id );
			if ( index !== -1 ) {
				worker.tasksStartedIds.splice( index, 1 );
			}
			
			worker.tasksStarted[ id ].remove();
			delete worker.tasksStarted[ id ];
			
			// init task
			
			$task = $( '<img src="img/bar_vertical_64.png" id="' + id + '" class="iconk-tiny iconk-widthFollow iconk-tight work-task">' );
			
			// store
			
			worker.tasksCompleted[ id ] = $task;
			
			// add into worker completed progress bar
			
			worker.$progressCompleted.append( $task );
			
			// check length of tasks started
			
			if ( worker.tasksStartedIds.length === 0 ) {
				
				// clear collapse delay
				
				if ( typeof worker.collapseTimeoutHandle !== 'undefined' ) {
					
					window.clearTimeout( worker.collapseTimeoutHandle );
					worker.collapseTimeoutHandle = undefined;
					
				}
				
				// new collapse delay
				
				worker.collapseTimeoutHandle = window.setTimeout( function () {
					
					// hide blocker
					
					main.dom_fade( {
						element: shared.domElements.$uiBlocker
					} );
					
					// collapse
					
					main.dom_collapse( {
						element: worker.$domElement
					} );
					
				}, worker.collapseDelay );
				
			}
			
		}
		
	}
	
	/*===================================================
	
	loading
	
	=====================================================*/
	
	function load ( locationsList, callbackList, listID, loadingMessage ) {
		
		var i, l,
			location,
			path,
			indexLoading,
			indexLoaded,
			allLocationsLoaded = true,
			assetData;
		
		if ( typeof locationsList !== 'undefined' ) {
			
			// get if list is not array
			
			if ( typeof locationsList === 'string' || locationsList.hasOwnProperty( 'length' ) === false ) {
				locationsList = [locationsList];
			}
			
			// make a copy of locations list
			
			locationsList = locationsList.slice( 0 );
			
			// handle list id
			
			if ( typeof listID !== 'string' ||  loader.listLocations.hasOwnProperty( listID )) {
				
				listID = loader.listCount;
				
			}
			
			// increase list count
			
			loader.listCount++;
			
			// permanent store of all loading
			
			for ( i = 0, l = locationsList.length; i < l; i++ ) {
				
				location = locationsList[ i ];
				
				path = get_asset_path( location );
				
				indexLoading = index_of_value( loader.loading, path );
				indexLoaded = index_of_value( loader.loaded, path );
				
				// if not already loading or loaded item
				// load new location
				if ( indexLoading === -1 && indexLoaded == -1 ) {
					
					loader.loading.push( path );
					
					loader.loadingListIDs.push( listID );
					
					worker_start_task( path );
					
					newLocations = true;
					
				}
				
				// if not yet loaded, mark list for loading
				
				if ( indexLoaded === -1 ) {
					
					allLocationsLoaded = false;
					
				}
				
			}
			
			loader.loadingOrLoaded = loader.loaded.concat( loader.loading );
			
			// temporary store locations
			
			loader.listLocations[listID] = locationsList;
			
			// temporary store callback list
			
			if ( typeof callbackList === 'undefined' ) {
				callbackList = [];
			}
			else if ( typeof callbackList === 'function' || callbackList.hasOwnProperty( 'length' ) === false ) {
				callbackList = [callbackList];
			}
			
			loader.listCallbacks[listID] = callbackList;
			
			// store load message
			
			if ( typeof loadingMessage !== 'string' ) {
				
				loadingMessage = loader.tips[ Math.max(0, Math.min(loader.tips.length - 1, Math.round(Math.random() * loader.tips.length) - 1)) ];
			}
			
			loader.listMessages[listID] = loadingMessage;
			
			// init new loaded array
			
			loader.listLoaded[listID] = [];
			
			// add list ID to lists to load
				
			loader.lists.push(listID);
			
			// if all locations in list are already loaded, skip loading process
			
			if ( allLocationsLoaded === true ) {
				
				list_completed( listID );
				
			}
			else {
				
				// start loading
				
				load_next_list();
				
			}
			
		}
		
	}
	
	function load_next_list () {
		
		var i, l,
			locationsList,
			location,
			path;
		
		// if any lists to load
		
		if ( loader.active === false && loader.lists.length > 0 ) {
			
			loader.active = true;
			
			// get next list 
			
			loader.listCurrent = loader.lists[ 0 ];
			
			// get locations, make copy because already loaded items will be removed from list immediately
			
			locationsList = loader.listLocations[loader.listCurrent].slice( 0 );
			
			// for each item location
			
			for (i = 0, l = locationsList.length; i < l; i += 1) {
				
				location = locationsList[ i ];
				
				path = get_asset_path( location );
				
				// if already loaded
				
				if ( index_of_value( loader.loaded, path ) !== -1 ) {
					
					// make duplicate complete event
					
					load_single_completed( location );
					
				}
				// if not started loading yet
				else if ( index_of_value( loader.started, path ) === -1 ) {
					
					// load it
					
					loader.started.push( path );
					
					load_single( location );
					
				}
				
			}
			
		}
		else {
			
			// no longer loading
			
			loader.listCurrent = undefined;
			
			shared.signals.onLoadAllCompleted.dispatch();
			
		}
		
	}
	
	function load_single ( location ) {
		var path, 
			ext, 
			loadType, 
			data,
			defaultCallback = function ( ) {
				load_single_completed( location, data );
			},
			modelCallback = function ( geometry ) {
				load_single_completed( location, geometry );
			};
		
		if ( typeof location !== 'undefined' ) {
			
			// load based on type of location and file extension
			
			// LAB handles scripts (js)
			// THREE handles models (ascii/bin js) and images (jpg/png/gif/bmp)
			
			// get type
			
			loadType = location.type || loader.loadTypeBase;
			
			// get location path
			
			path = get_asset_path( location );
			
			// get extension
			
			ext = get_ext( path );
			
			// ensure path has extension
			
			if ( ext === '' ) {
				
				path = add_default_ext( path );
				
			}
			
			// type and/or extension check
			
			if ( loadType === 'image' || is_image_ext( ext ) ) {
				
				// load
				
				data = dom_generate_image( path, function ( image ) {
					
					data = image;
					
					defaultCallback();
					
				} );
				
				// store empty image data in assets immediately
				
				asset_register( path, { data: data } );
				
			}
			else if ( loadType === 'model' || loadType === 'model_ascii' ) {
				
				// init loader if needed
				
				if ( typeof loader.threeJSON === 'undefined' ) {
					loader.threeJSON = new THREE.JSONLoader( true );
				}
				
				loader.threeJSON.load( path, modelCallback );
				
			}
			// default to script loading
			else {
				
				$LAB.script( path ).wait( defaultCallback );
				
			}
			
		}
		
	}
	
	function load_single_completed ( location, data ) {
		var i, l,
			listID,
			locationsList,
			loadedList,
			index,
			path,
			loadType,
			listsCompleted;
		
		// get location path and type
		
		path = get_asset_path( location );
		
		loadType = get_load_type( location );
		
		// complete task
		
		worker_complete_task( path );
		
		// register asset
		
		asset_register( path, { data: data } );
		
		// add as loaded
		
		add_loaded_locations( path );
		
		// shared signal
		
		if (typeof shared !== 'undefined') {
			
			shared.signals.onLoadItemCompleted.dispatch( path );
			
		}
		
		// for each list loading
		
		for ( i = 0, l = loader.lists.length; i < l; i++ ) {
			
			listID = loader.lists[ i ];
			
			locationsList = loader.listLocations[ listID ];
			
			// get index in locations list
			
			index = index_of_value( locationsList,location);
			
			// if is in list
			
			if ( index !== -1 ) {
				
				loadedList = loader.listLoaded[ listID ];
				
				// remove location from locations list
				
				locationsList.splice(index, index !== -1 ? 1 : 0);
				
				// add location to loaded list
				
				loadedList.push( location );
				
				// if current list is complete, defer until all checked
				
				if ( locationsList.length === 0 ) {
					
					listsCompleted = listsCompleted || [];
					
					listsCompleted.push( listID );
					
				}
				
			}
			
		}
		
		// complete any completed lists
		if ( typeof listsCompleted !== 'undefined' ) {
			
			for ( i = 0, l = listsCompleted.length; i < l; i++ ) {
				
				list_completed( listsCompleted[ i ] );
				
			}
			
		}
		
	}
	
	function list_completed( listID ) {
		var i, l, 
			callbackList, 
			callback,
			listIndex;
		
		// remove list from all lists to load
		
		listIndex = index_of_value( loader.lists, listID );
		
		if ( listIndex !== -1 ) {
			
			loader.lists.splice( listIndex, 1 );
			
		}
		
		// do callbacks before clear
		
		callbackList = loader.listCallbacks[ listID ];
		
		for ( i = 0, l = callbackList.length; i < l; i++ ) {
			
			callback = callbackList[ i ];
			
			if ( typeof callback !== 'undefined' ) {
				
				callback.call( this );
				
			}
			
		}
		
		// shared signal
		
		if (typeof shared !== 'undefined') {
			
			shared.signals.onLoadListCompleted.dispatch( listID );
			
		}
		
		// clear
		
		delete loader.listLocations[ listID ];
		
		delete loader.listCallbacks[ listID ];
		
		delete loader.listMessages[ listID ];
		
		delete loader.listLoaded[ listID ];
		
		loader.active = false;
		
		// start next list
		
		load_next_list();
		
	}
	
	function add_loaded_locations ( locationsList ) {
		
		var i, l,
			location,
			path,
			indexLoaded,
			indexLoading,
			locationAdded = false;
		
		locationsList = to_array( locationsList );
		
		// for each location
		
		for ( i = 0, l = locationsList.length; i < l; i++ ) {
			
			location = locationsList[ i ];
			
			path = get_asset_path( location );
			
			// update all loading
			
			indexLoading = index_of_value( loader.loading, path );
			
			if ( indexLoading !== -1 ) {
				
				loader.loadingListIDs.splice( indexLoading, 1 );
				
				loader.loading.splice( indexLoading, 1 );
				
			}
			
			// update all loaded
			
			indexLoaded = index_of_value( loader.loaded, path );
			
			if ( indexLoaded === -1 ) {
				
				loader.loaded.push( path );
				
				locationAdded = true;
				
			}
			
		}
		
		if ( locationAdded === true ) {
			
			loader.loadingOrLoaded = loader.loaded.concat( loader.loading );
			
		}
		
	}
	
	function get_is_path_in_list ( location, list ) {
		
		var path,
			index;
		
		path = get_asset_path( location );
		
		index = index_of_value( list, path );
		
		if ( index !== -1 ) {
			
			return true;
			
		}
		else {
			
			return false;
			
		}
		
	}
	
	function get_is_loading_or_loaded ( location ) {
		
		return get_is_path_in_list( location, loader.loadingOrLoaded );
		
	}
	
	function get_is_loaded ( location ) {
		
		return get_is_path_in_list( location, loader.loaded );
		
	}
	
	function get_is_loading ( location ) {
		
		return get_is_path_in_list( location, loader.loading );
		
	}
	
	function get_load_type ( location ) {
		
		return location.type || loader.loadTypeBase;
		
	}
	
	/*===================================================
    
	loading helpers
    
    =====================================================*/
	
	function get_asset_path( location ) {
		
		return location.path || location
		
	}
	
	function get_ext( location ) {
		
        var path, dotIndex, ext = '';
		
		path = get_asset_path( location );
        
        dotIndex = path.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            ext = path.substr( dotIndex + 1 ).toLowerCase();
        }
        
        return ext;
        
    }
	
	function add_default_ext( location ) {
		
		var path = remove_ext( location );
		
		path = path.replace(/\./g, "") + ".js";
		
		return path;
		
	}
	
	function remove_ext ( location ) {
		
		var path, dotIndex;
		
        path = get_asset_path( location );
        
        dotIndex = path.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            path = path.substr( 0, dotIndex );
        }
		
		return path;
		
	}
	
	function get_alt_path ( location ) {
		
		var path, ext;
		
		path = get_asset_path( location );
		ext = get_ext( path );
		
		// if has no extension, add default
		
		if ( ext === '' ) {
			
			return add_default_ext( path );
			
		}
		// if has extension, remove
		else {
			
			return remove_ext( path );
			
		}
		
	}
	
	/*===================================================
    
    asset handling
    
    =====================================================*/
	
	function asset_path_cascade( path ) {
		
		var cascade,
			part,
			dotIndex;
		
		// split path based on \ or /
		// each split is a parent module
		// last is actual module
		
		cascade = path.split(/[\\\/]/);
		
		for ( i = 0, l = cascade.length; i < l; i++ ) {
			
			part = cascade[ i ];
			
			// remove all non-alphanumeric
			
			part = part.replace(/[^\w\.-]+/g, "");
			
			// cannot be empty
			
			if ( part === '' ) {
				
				on_error ( 'Invalid asset cascade', 'Main', 'N/A' );
				
				return;
				
			}
			
			cascade[ i ] = part;
			
		}
		
		return cascade;
		
	}
	
	function get_asset ( location, attempts ) {
		
		var path,
			cascade,
			parent,
			assetName,
			asset,
			i, l;
		
		// init parent and asset
		
		asset = parent = main;
		
		// cascade path
		
		path = get_asset_path( location );
		
		cascade = asset_path_cascade( path );
		
		// get asset
		
		for ( i = 0, l = cascade.length; i < l; i++ ) {
			
			// set as parent for next
			
			parent = asset;
			
			assetName = cascade[ i ];
			
			asset = parent[ assetName ];
			
			// if not a valid cascade point
			
			if ( typeof asset === 'undefined' ) {
				
				break;
				
			}
			
		}
		
		// check attempts
		
		attempts = attempts || 1;
		
		// if no asset and this is first attempt at finding
		if ( typeof asset === 'undefined' ) {
			
			// try again with alternate path
			
			if ( attempts === 1 ) {
				
				return get_asset( get_alt_path( path ), attempts + 1 );
				
			}
			
		}
		
		return asset;
		
	}
	
	function set_asset ( location, assetNew ) {
		
		var path,
			cascade,
			parent,
			assetName,
			asset,
			data,
			dataNew,
			i, l;
		
		// if new asset passed
		
		if ( assetNew instanceof GameAsset ) {
			
			// init parent and asset
			
			asset = parent = main;
			
			// cascade path
			
			path = get_asset_path( location );
			
			cascade = asset_path_cascade( path );
			
			// setup asset path
			
			for ( i = 0, l = cascade.length; i < l; i++ ) {
				
				// set as parent for next
				
				parent = asset;
				
				// get name of current point in cascade
				
				assetName = cascade[ i ];
				
				// get or build asset
				
				asset = parent[ assetName ] = parent[ assetName ] || {};
				
			}
			
			// if asset at path and is not empty
			
			if ( asset instanceof GameAsset && asset.is_empty() === false ) {
				
				// if new asset is not empty
				
				if ( assetNew.is_empty() === false ) {
					
					// merge new asset into current
					
					asset.merge_asset_self( assetNew );
					
				}
				
			}
			// else replace current empty asset with new asset
			else {
				
				parent[ assetName ] = asset = assetNew;
				
			}
			
		}
		
		return asset;
		
	}
	
	function get_asset_data ( location ) {
		
		var asset,
			data;
		
		// get asset at location
		
		asset = get_asset( location );
		
		// asset data, assume asset is data if not instance of asset
				
		data = ( asset instanceof GameAsset ) ? asset.data : asset;
		
		return data;
		
	}
	
	function asset_register( path, parameters ) {
		
		var assetNew,
			dataNew,
			assetCurrent = get_asset( path );
		
		if ( assetCurrent instanceof GameAsset !== true || ( parameters && typeof parameters.data !== 'undefined' && parameters.data !== assetCurrent.data ) ) {
			
			// initialize new asset
			
			assetNew = new GameAsset( path, parameters );
			
			dataNew = assetNew.data;
			
		}
		else {
			
			dataNew = assetCurrent.data;
			
		}
		
		// asset is usually only useful internally, return data instead
		
		return dataNew;
		
	}
	
	function asset_ready ( path, asset ) {
		
		var i, l;
		
		asset = asset || get_asset( path );
		
		if ( asset instanceof GameAsset ) {
			
			// ready and not waiting
			
			asset.ready = true;
			
			asset.wait = false;
			
			// dispatch signal
			
			if ( typeof shared.signals !== 'undefined' && typeof shared.signals.onAssetReady !== 'undefined' ) {
				
				shared.signals.onAssetReady.dispatch( path );
				
			}
			
		}
		
	}
	
	function asset_require( requirements, callbackList, waitForAssetsReady, assetSource ) {
		
		var callback_outer,
			on_asset_ready,
			on_all_assets_ready,
			assetsRequired = [],
			assetsWaitingFor = [],
			assetsReady = [],
			listeningForReadySignal = false;
		
		// get if arguments are not array
		
		requirements = to_array( requirements );
		
		callbackList = to_array( callbackList );
		
		// modify original callback to wrap in new function
		// that parses requirements and applies each asset as argument to callback
		// also handle if each asset required needs to be ready before triggering callback
		
		on_asset_ready = function ( path, secondAttempt ) {
			
			var indexWaiting;
			
			indexWaiting = index_of_value( assetsWaitingFor, path );
			
			// if waiting for asset to be ready
			
			if ( indexWaiting !== -1 ) {
				
				assetsWaitingFor.splice( indexWaiting, 1 );
				
				assetsReady.push( path );
				
				// check if no more to wait for
				
				if ( assetsWaitingFor.length === 0 && assetsReady.length === requirements.length ) {
					
					// remove signal
					
					if ( listeningForReadySignal === true ) {
						
						shared.signals.onAssetReady.remove( on_asset_ready );
						
						listeningForReadySignal = false;
						
					}
					
					on_all_assets_ready();
					
				}
				
			}
			// make one extra attempt with alternative path to check if waiting for asset to be ready
			else if ( secondAttempt !== true ) {
				
				on_asset_ready( get_alt_path( path ), true );
				
			}
			
		};
		
		on_all_assets_ready = function () {
			
			var i, l,
				callback;
			
			// apply all required assets to original callbacks
			
			for ( i = 0, l = callbackList.length; i < l; i++ ) {
				
				callback = callbackList[ i ];
				
				callback.apply( this, assetsRequired );
				
			}
			
			// if source asset passed and needs auto ready update
			
			if ( assetSource instanceof GameAsset && assetSource.readyAutoUpdate === true ) {
				
				assetSource.on_ready();
				
			}
			
		};
		
		callback_outer = function () {
			
			var i, l,
				location,
				path,
				asset;
			
			// find all assets
			
			for ( i = 0, l = requirements.length; i < l; i++ ) {
				
				location = requirements[ i ];
				
				path = get_asset_path( location );
				
				// get asset
				
				asset = get_asset( location );
				
				// add data to required list
				
				if ( asset instanceof GameAsset ) {
					
					assetsRequired.push( asset.data );
					
				}
				
				// if needed ready
				
				if ( waitForAssetsReady === true ) {
					
					assetsWaitingFor.push( path );
					
					// check ready status
					
					if ( asset instanceof GameAsset && asset.ready === true ) {
						
						on_asset_ready( path );
						
					}
					// asset not ready, listen for ready signal if not already
					else if ( listeningForReadySignal === false ) {
						
						listeningForReadySignal = true;
						
						shared.signals.onAssetReady.add( on_asset_ready );
						
					}
					
				}
				
			}
			
			// if not waiting for assets to be ready
			
			if ( waitForAssetsReady !== true || requirements.length === 0 ) {
				
				on_all_assets_ready();
				
			}
			
		};
		
		// pass all requirements to loader
		
		load( requirements, callback_outer );
		
	}
	
	/*===================================================
    
    asset instance
    
    =====================================================*/
	
	function GameAsset ( path, parameters ) {
		
		var assetNew = this;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.path = path;
		
		assetNew.merge_asset_self( parameters, true );
		
		// if asset has path
		
		if ( typeof assetNew.path !== 'undefined' ) {
			
			// store this new asset
			// returned asset from store is new asset merged into current asset if exists
			// or this new asset if no assets at path yet
			
			assetNew = set_asset( assetNew.path, assetNew );
			
			// regardless of storage results
			// handle this new asset's readiness and requirements
			
			if ( assetNew === this && this.readyAutoUpdate === true && ( this.requirements.length === 0 || this.wait !== true ) ) {
				
				this.on_ready();
				
			}
			
			if ( this.requirements.length > 0 ) {
				
				asset_require( this.requirements, this.callbacksOnReqs, this.wait, this );
			
			}
			
		}
		
		return assetNew;
		
	}
	
	GameAsset.prototype = new Object();
	GameAsset.prototype.constructor = GameAsset;
	
	GameAsset.prototype.merge_asset_self = function ( asset, includeRequirements ) {
		
		var readyCallbackIndex;
		
		// TODO:
		// make sure merging accounts for new requirements and loading
		
		if ( typeof asset !== 'undefined' ) {
			
			this.path = asset.path;
			
			// merge asset data into this data
			
			this.merge_asset_data_self( asset );
			
			// if either asset is waiting
			
			if ( typeof this.wait !== 'boolean' || this.wait === false ) {
			
				if ( asset.wait === true ) {
					
					this.wait = asset.wait;
					
				}
				else {
					
					this.wait = false;
					
				}
				
			}
			
			// if asset is not ready
			
			if ( this.ready !== true ) {
				
				this.ready = false;
				
			}
			
			// requirements basics
			
			if ( typeof this.readyAutoUpdate !== 'boolean' ) {
			
				if ( asset.hasOwnProperty( 'readyAutoUpdate' ) ) {
					
					this.readyAutoUpdate = asset.readyAutoUpdate;
					
				}
				else {
					
					this.readyAutoUpdate = true;
					
				}
				
			}
			
			this.requirements = to_array( this.requirements );
			
			this.callbacksOnReqs = to_array( this.callbacksOnReqs );
			
			// if should also copy requirements
			
			if ( includeRequirements === true ) {
			
				this.requirements = this.requirements.concat( to_array( asset.requirements ) );
				
				this.callbacksOnReqs = this.callbacksOnReqs.concat( to_array( asset.callbacksOnReqs ) );
				
			}
			
		}
		
	}
	
	GameAsset.prototype.merge_asset_data_self = function ( source ) {
		
		var dataSrc = source.data;
		
		// if source data exists
		
		if ( typeof dataSrc !== 'undefined' ) {
			
			// if this data does not exist or source data is image, set as data instead of merging, as merging causes issues
			
			if ( typeof this.data === 'undefined' || is_image( dataSrc ) ) {
				
				this.data = dataSrc;
				
			}
			else {
				
				// copy properties of source asset data into this data
				// order is important to ensure this data remains an instance of whatever it is
				
				extend( dataSrc, this.data );
				
			}
			
		}
		
	}
	
	GameAsset.prototype.is_empty = function () {
		
		var isEmpty = true;
		
		if ( typeof this.data !== 'undefined' || ( this.ready === false && this.requirements.length > 0 ) ) {
			
			isEmpty = false;
			
		}
		
		return isEmpty;
		
	}
	
	GameAsset.prototype.on_ready = function () {
		
		asset_ready( this.path, this );
		
	}
    
    return main; 
    
} ( KAIOPUA || {} ) );