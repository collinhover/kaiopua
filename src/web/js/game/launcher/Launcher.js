/*
Launcher.js
Launcher module, handles start environment.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        effects = main.effects = main.effects || {},
        launcher = game.launcher = game.launcher || {},
        readyAll = false,
        camera,
        scene,
		addOnShow = [],
		ambientLight,
		directional,
		fogColor = 0x529ad1,
        water,
        sky,
        time,
        cameraRotY = -90 * Math.PI / 180,
        camLookTarget,
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
            rangeRotMaxX: 1000,
            rangeRotMinX: -1000,
            rangeRotMaxY: 1000,
            rangeRotMinY: 0,
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
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    game.update_section_list();
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init () {
		
        var waterEnv, skyEnv;
		
		// lights
		
		ambientLight = new THREE.AmbientLight( 0xCCCCCC );
        
        directional = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        directional.position = new THREE.Vector3(-1, 1, -1).normalize();
		
        // water
        
        water = launcher.water;
		
        water.init( { wavesColor: fogColor } );
        
        waterEnv = water.get_environment();
        
        waterEnv.rotation.x = cameraRotY;
        
        // sky
        
        sky = launcher.sky;
        
        sky.init();
        
        // sky mesh
        skyEnv = sky.get_environment();
        
        skyEnv.position.x = 0;
        skyEnv.position.y = 2000;
        
        skyEnv.rotation.y = cameraRotY;
		
		// set items to add on show
		
		addOnShow.push( ambientLight, directional, waterEnv, skyEnv );
		
    }
    
    /*===================================================
    
    mouse functions
    
    =====================================================*/
    
    function on_mouse_moved () {
        
        var pctX = ( shared.mouse.x / shared.screenWidth ),
            pctY = ( shared.mouse.y / shared.screenHeight );
        
        mouse.x = pctX * mouse.rangeTransMaxX + (1 - pctX) * mouse.rangeTransMinX;
        mouse.y = pctY * mouse.rangeTransMaxY + (1 - pctY) * mouse.rangeTransMinY;
        
        mouse.rx = (pctX) * mouse.rangeRotMaxX + (1 - pctX) * mouse.rangeRotMinX;
        mouse.ry = (1 - pctY) * mouse.rangeRotMaxY + (pctY) * mouse.rangeRotMinY;
        
    }
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function show () {
		
		var i, l;
		
		// camera
        
        camera = game.camera;
        
        // starting position
        camera.position.set(-5800, 0, 0);
        
        // camera look target
        
        camLookTarget = new THREE.Vector3(0, 0, 0);
        
        camera.lookAt( camLookTarget );
		
		// scene
		
		scene = game.scene;
		
		// fog
        scene.fog = new THREE.Fog( fogColor, -100, 10000 );
		
		// add items
		
		for ( i = 0, l = addOnShow.length; i < l; i += 1 ) {
			
			scene.add( addOnShow[ i ] );
			
        }
		
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
        
		var i, l;
		
        // enable renderer object sorting
        shared.renderer.sortObjects = true;
		
		// remove added items
		
		for ( i = 0, l = addOnShow.length; i < l; i += 1 ) {
		
			scene.remove( addOnShow[ i ] );
			
        }
        
    }
    
    function update () {
        
        time = new Date().getTime();
        
        camera.position.z += (  mouse.x - camera.position.z ) * mouse.speedTransX;
        camera.position.y += ( -mouse.y - camera.position.y ) * mouse.speedTransY;
        
        // needs persistant tracking to add to
        camLookTarget.z += ( mouse.rx - camLookTarget.z ) * mouse.speedRotX;
        camLookTarget.y += ( mouse.ry - camLookTarget.y ) * mouse.speedRotY;
        
        camera.lookAt( camLookTarget );
        
        // update environment
        
        sky.wind_blow( time );
        
        water.waves( time );
        
        //water.bob( camera );
        
    }
        
    return main; 
    
}(KAIOPUA || {}));