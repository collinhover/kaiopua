/*
Player.js
Player module, handles player in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		player = core.player = core.player || {},
		camera,
		cameraControls;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	player.init = init;
	player.get_camera = function () { return camera; };
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init () {
		
		// initialization
		
		init_camera();
		
		// update handler
		
		shared.signals.update.add( update );
		
	}
	
	function init_camera () {
		
		// camera
        
        camera = new THREE.PerspectiveCamera(60, shared.screenWidth / shared.screenHeight, 1, 10000);
        
        camera.position.set(0, 0, 4000);
        camera.lookAt( new THREE.Vector3(0, 0, 0) );
        
        cameraControls = new THREE.FlyControls( camera );
        cameraControls.rollSpeed = 0.5;
        cameraControls.movementSpeed = 800;
        cameraControls.update();
		
	}
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
	function update () {
		
		// update camera controls
        cameraControls.update();
	
	}
	
	return main;
	
}(KAIOPUA || {}));