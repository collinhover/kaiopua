/*
LauncherSection.js
Launcher section module, handles start environment.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        effects = main.effects = main.effects || {},
		sections = game.sections = game.sections || {},
        launcher = sections.launcher = sections.launcher || {},
        ready = false,
        camera,
        scene,
		sceneBG,
		addOnShow = [],
		addBGOnShow = [],
		ambientLight,
		light,
		fogColor = 0x529ad1,
        water,
        sky,
        time,
        envRotationY = -90 * Math.PI / 180,
		camRotationBaseQ,
		camRotationOffset,
		camRotationOffsetQ,
        mouse = { 
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
    
    launcher.init = init;
    launcher.show = show;
    launcher.hide = hide;
    launcher.remove = remove;
    launcher.update = update;
	launcher.resize = resize;
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    game.update_section_list();
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init () {
		
		if ( ready !== true ) {
			
			init_environment();
			
			ready = true;
			
		}
    }
	
	function init_environment () {
		
		var waterEnv, skyEnv;
		
		// camera rotation
		
		camRotationBaseQ = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), -Math.PI * 0.5 );
		
		camRotationOffset = new THREE.Vector3();
		
		camRotationOffsetQ = new THREE.Quaternion();
		
		// lights
		
		ambientLight = new THREE.AmbientLight( 0xeeeeee );
		
		//light = new THREE.DirectionalLight( 0xffffff, 1 );
		//light.position = new THREE.Vector3(-1, 1, -1).normalize();
		
		light = new THREE.PointLight( 0xffffcc, 0.75, 40000 );
		light.position.set( 0, 3000, 2000 );
		
		// skybox
		
		skybox = init_skybox();
		
		// water
		
		water = launcher.water;
		
		water.init( { wavesColor: fogColor } );
		
		waterEnv = water.get_environment();
		
		waterEnv.rotation.x = envRotationY;
		
		// sky
		
		sky = launcher.sky;
		
		sky.init();
		
		// sky mesh
		skyEnv = sky.get_environment();
		
		skyEnv.position.x = 0;
		skyEnv.position.y = 2000;
		
		skyEnv.rotation.y = envRotationY;
		
		// set items to add on show
		
		addOnShow.push( ambientLight, light, waterEnv, skyEnv );
		
		addBGOnShow.push( skybox );
		
	}
	
	function init_skybox () {
		
		var assets = main.utils.loader.assets,
			ap,
			images,
			textureCube,
			shader,
			material,
			mesh;
		
		// images
		ap = "assets/textures/skybox_launcher";
		
		images = [ assets[ap + "_xz.jpg"], assets[ap + "_xz.jpg"],
				 assets[ap + "_posy.jpg"], assets[ap + "_negy.jpg"],
				 assets[ap + "_xz.jpg"], assets[ap + "_xz.jpg"] ];
				 
		// cube texture
		
		textureCube = new THREE.Texture( images );
		textureCube.needsUpdate = true;
		
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
		
	}
    
    /*===================================================
    
    mouse functions
    
    =====================================================*/
    
    function on_mouse_moved ( e ) {
        
        var pctX = ( shared.mice[ e.identifier ].x / shared.screenWidth ),
            pctY = ( shared.mice[ e.identifier ].y / shared.screenHeight );
        
        mouse.x = pctX * mouse.rangeTransMaxX + (1 - pctX) * mouse.rangeTransMinX;
        mouse.y = pctY * mouse.rangeTransMaxY + (1 - pctY) * mouse.rangeTransMinY;
        
        mouse.rx = (pctY)* mouse.rangeRotMaxX + (1 - pctY) * mouse.rangeRotMinX;
        mouse.ry = (1 - pctX) * mouse.rangeRotMaxY + (pctX) * mouse.rangeRotMinY;
        
    }
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function show () {
		
		// camera
        
        camera = game.camera;
        
        // starting position
        camera.position.set(-5800, 0, 0);
		
		// set base quaternion
		
		camera.quaternion.copy( camRotationBaseQ );
		
		// scene
		
		scene = game.scene;
		
		sceneBG = game.sceneBG;
		
		// fog
        scene.fog = new THREE.Fog( fogColor, -100, 10000 );
		
		// add items
		
		game.add_to_scene( addOnShow, scene );
		
		game.add_to_scene( addBGOnShow, sceneBG );
		
		// shared
        
        shared.renderer.sortObjects = false;
        
        shared.signals.mousemoved.add( on_mouse_moved );
        
        shared.signals.update.add( update );
        
    }
    
    function hide () {
        
        shared.signals.mousemoved.remove( on_mouse_moved );
        
        shared.signals.update.remove( update );
		
    }
    
    function remove () {
		
        // enable renderer object sorting
        shared.renderer.sortObjects = true;
		
		// remove added items
		
		game.remove_from_scene( addOnShow, scene );
		
		game.remove_from_scene( addBGOnShow, sceneBG );
        
    }
    
    function update () {
        
        time = new Date().getTime();
        
        camera.position.z += (  mouse.x - camera.position.z ) * mouse.speedTransX;
        camera.position.y += ( -mouse.y - camera.position.y ) * mouse.speedTransY;
        
        camRotationOffset.z += ( mouse.rx - camRotationOffset.z ) * mouse.speedRotX;
        camRotationOffset.y += ( mouse.ry - camRotationOffset.y ) * mouse.speedRotY;
		
		// update rotation
		
		camRotationOffsetQ.setFromEuler( camRotationOffset ).normalize();
        
		camera.quaternion.set( 0, 0, 0, 1 ).multiplySelf( camRotationOffsetQ ).multiplySelf( camRotationBaseQ );
		
        // update environment
        
        sky.wind_blow( time );
        
        water.waves( time );
        
        //water.bob( camera );
        
    }
	
	function resize () {
		
	}
        
    return main; 
    
}(KAIOPUA || {}));