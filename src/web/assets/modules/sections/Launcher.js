/*
 *
 * Launcher.js
 * Interactive environment for loading and launching game.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/sections/Launcher.js",
		_Launcher = {},
		_Game,
		_Water,
        _Sky,
		_ObjectMaker,
        ready = false,
		waitingToShow = false,
        camera,
        scene,
		sceneBG,
		addOnShow = [],
		addBGOnShow = [],
		ambientLight,
		lightSky,
		lightWater,
		fogColor = 0x529ad1,
        water,
        skybox,
        time,
		camRotationBaseQ,
		camRotationOffset,
		camRotationOffsetQ,
        viewShift = { 
            x: 0, 
            y: 0,
            rx: 0,
            ry: 0, 
            rangeTransMaxX: 500, 
            rangeTransMinX: -500,
            rangeTransMaxY: 250, 
            rangeTransMinY: -250,
            speedTransX: 0.01, 
            speedTransY: 0.01,
            rangeRotMaxX: 0,
            rangeRotMinX: -15,
            rangeRotMaxY: 10,
            rangeRotMinY: -10,
            speedRotX: 0.05,
            speedRotY: 0.05
        };
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
    _Launcher.show = show;
    _Launcher.hide = hide;
    _Launcher.remove = remove;
    _Launcher.update = update;
	_Launcher.resize = resize;
	
	main.asset_register( assetPath, { 
		data: _Launcher,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/env/Sky.js",
			"assets/modules/env/Water.js",
			"assets/modules/utils/ObjectMaker.js",
			"assets/textures/skybox_world_posx.jpg",
            "assets/textures/skybox_world_negx.jpg",
			"assets/textures/skybox_world_posy.jpg",
            "assets/textures/skybox_world_negy.jpg",
			"assets/textures/skybox_world_posz.jpg",
            "assets/textures/skybox_world_negz.jpg"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    function init_internal ( g, s, w, om ) {
		
		if ( ready !== true ) {
			console.log('internal launcher');
			_Game = g;
			_Sky = s;
			_Water = w;
			_ObjectMaker = om;
			
			init_environment();
			
			ready = true;
			
			if ( waitingToShow === true ) {
				
				waitingToShow = false;
				
				show();
				
			}
			
		}
		
    }
	
	function init_environment () {
		
		// camera rotation
		
		camRotationBaseQ = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), -Math.PI * 0.5 );
		
		camRotationOffset = new THREE.Vector3();
		
		camRotationOffsetQ = new THREE.Quaternion();
		
		// lights
		
		ambientLight = new THREE.AmbientLight( 0xeeeeee );
		
		//lightSky = new THREE.DirectionalLight( 0xffffff, 1 );
		//lightSky.position = new THREE.Vector3(-1,0.5, 0).normalize();
		
		lightSky = new THREE.PointLight( 0xffffff, 1, 10000 );
		lightSky.position.set( -3000, 4000, 0 );
		
		// skybox
		
		//skybox = init_skybox();
		
		// skybox
		
		skybox = _ObjectMaker.make_skybox( shared.pathToTextures + "skybox_world" );
		
		// water
		
		water = new _Water.Instance();
		water.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), -Math.PI * 0.65 );
		
		/*
		// sky
		
		_Sky.init();
		
		// sky environment
		
		_Sky.environment.position.x = 0;
		_Sky.environment.position.y = 2000;
		
		_Sky.environment.rotation.y = -Math.PI * 0.5;
		*/
		// set items to add on show
		
		addOnShow.push( ambientLight, lightSky, water/*.environment, _Sky.environment*/ );
		
		addBGOnShow.push( skybox );
		
	}
	
	/*function init_skybox () {
		
		var ap,
			images,
			textureCube,
			shader,
			material,
			mesh;
		
		// images
		
		ap = "assets/textures/skybox_launcher";
				 
		// cube texture
		
		textureCube = new THREE.Texture();
		
		main.asset_require( [ ap + "_xz.jpg", ap + "_posy.jpg", ap + "_negy.jpg" ], function ( xz, posy, negy ) {
			
			textureCube.image = [ xz, xz, posy, negy, xz, xz ];
			textureCube.needsUpdate = true;
			
		} );
		
		// shader
		
		shader = THREE.ShaderUtils.lib[ "cube" ];
		shader.uniforms[ "tCube" ].texture = textureCube;
		
		// material
		
		material = new THREE.ShaderMaterial( {

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false
			
		} );
		
		// mesh
		
		mesh = new THREE.Mesh( new THREE.CubeGeometry( 100, 100, 100 ), material );
		mesh.flipSided = true;
        
        return mesh;
		
	}*/
    
    /*===================================================
    
    mouse functions
    
    =====================================================*/
    
    function on_mouse_moved ( e ) {
        
        var mouse = main.get_mouse( e ),
			pctX = ( mouse.x / shared.screenWidth ),
            pctY = ( mouse.y / shared.screenHeight );
        
        viewShift.x = pctX * viewShift.rangeTransMaxX + (1 - pctX) * viewShift.rangeTransMinX;
        viewShift.y = pctY * viewShift.rangeTransMaxY + (1 - pctY) * viewShift.rangeTransMinY;
        
        viewShift.rx = (pctY)* viewShift.rangeRotMaxX + (1 - pctY) * viewShift.rangeRotMinX;
        viewShift.ry = (1 - pctX) * viewShift.rangeRotMaxY + (pctX) * viewShift.rangeRotMinY;
        
    }
    
    /*===================================================
    
    standard
    
    =====================================================*/
    
    function show ( ) {
		
		if ( ready === true ) {
			
			// cameras
			
			camera = _Game.camera;
			//camera.position.set(-5800, 0, 0);
			camera.quaternion.copy( camRotationBaseQ );
			
			// scene
			
			scene = _Game.scene;
			
			sceneBG = _Game.sceneBG;
			
			// environment
			
			//scene.fog = new THREE.Fog( fogColor, -100, 10000 );
			
			water.morphs.play( 'waves', { duration: 4000, loop: true } );
			
			// add items
			
			_Game.add_to_scene( addOnShow, scene );
			
			_Game.add_to_scene( addBGOnShow, sceneBG );
			
			// shared
			
			shared.renderer.sortObjects = false;
			
			shared.signals.mousemoved.add( on_mouse_moved );
			
			shared.signals.update.add( update );
			
		}
		else {
			
			waitingToShow = true;
			
		}
		
    }
    
    function hide () {
		
		waitingToShow = false;
		
		water.morphs.stopAll();
		
		shared.signals.mousemoved.remove( on_mouse_moved );
		
		shared.signals.update.remove( update );
		
    }
    
    function remove () {
		
		if ( ready === true ) {
			
			// enable renderer object sorting
			shared.renderer.sortObjects = true;
			
			// remove added items
			
			_Game.remove_from_scene( addOnShow, scene );
			
			_Game.remove_from_scene( addBGOnShow, sceneBG );
			
		}
		else {
			
			waitingToShow = false;
			
		}
        
    }
    
    function update ( timeDelta ) {
        
        camera.position.z += (  viewShift.x - camera.position.z ) * viewShift.speedTransX;
        camera.position.y += ( -viewShift.y - camera.position.y ) * viewShift.speedTransY;
        
        camRotationOffset.z += ( viewShift.rx - camRotationOffset.z ) * viewShift.speedRotX;
        camRotationOffset.y += ( viewShift.ry - camRotationOffset.y ) * viewShift.speedRotY;
		
		// update rotation
		
		camRotationOffsetQ.setFromEuler( camRotationOffset ).normalize();
        
		camera.quaternion.set( 0, 0, 0, 1 ).multiplySelf( camRotationOffsetQ ).multiplySelf( camRotationBaseQ );
		
        // update environment
        
        //_Sky.wind_blow( timeDelta );
        
        //water.generate_waves( timeDelta );
        
    }
	
	function resize () {
		
	}
    
} ( KAIOPUA ) );