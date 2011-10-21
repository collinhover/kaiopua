/*
IntroSection.js
Intro module, handles introduction to story and teaching user basic game mechanics.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        sections = game.sections = game.sections || {},
        intro = sections.intro = sections.intro || {},
        readyInternal = false,
        readyAll = false,
        assets,
        objectmaker,
		world,
		player,
		camera,
        scene,
		addOnShow = [],
		light,
		lightSource;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    intro.init = init;
    intro.show = show;
    intro.hide = hide;
    intro.remove = remove;
    intro.update = update;
    intro.resize = resize;
    intro.ready = ready;
    intro.domElement = function () {};
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    game.update_section_list();
	
	function init_internal () {
        
        if ( readyInternal !== true ) {
            
            init_basics();
            
            readyInternal = true;
            
        }
        
    }
    
    function init_basics () {
		
		// core
		
		world = game.core.world;
		player = game.core.player;
        
    }
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function ready () { 
        return readyInternal && readyAll; 
    }
    
    function init () {
        
        if ( !ready() ) {
			
            init_internal();
            
            init_environment();
            
            readyAll = true;
            
        }
    }
    
    function init_environment () {
		
		// light
		
		light = new THREE.SpotLight( 0xffffff );
        light.position = new THREE.Vector3(-1, 0, 1).normalize();
        
        // light visual
        
        lightSource = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
        
        lightSource.useQuaternion = true;
		
		// add on show items
		
		addOnShow.push( light, lightSource );
		
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
		
		var i, l;
		
		// camera
        
        camera = game.camera;
		
		camera.position.set(0, 0, 4000);
		
		camera.lookAt( new THREE.Vector3(0, 0, 0) );
		
		// scene
		
		scene = game.scene;
		
		// add world
		
		world.show();
		
		// add items
		
		for ( i = 0, l = addOnShow.length; i < l; i += 1 ) {
			
			scene.add( addOnShow[ i ] );
			
        }
		
		// start player
		
		player.show();
		
		player.enable();
		
		//player.cameraMode = 'freelook';
		
		//setTimeout( game.pause, 1000 );
		
		// signals
        
        shared.signals.windowresized.add( resize );
        
        shared.signals.update.add( update );
        
    }
    
    function hide () {
        
        shared.signals.windowresized.remove( resize );
        
        shared.signals.update.remove( update );
        
    }
    
    function remove () {
        
		var i, l;
		
		// stop player
		
		player.hide();
		
		player.disable();
		
		// hide world
		
		world.hide();
		
		// remove added items
		
		for ( i = 0, l = addOnShow.length; i < l; i += 1 ) {
		
			scene.remove( addOnShow[ i ] );
			
        }
		
    }
    
    function update () {
		
		// position point light to always be 
        // above and infront of camera
		
        var camP = camera.position.clone();
        var newP = new THREE.Vector3( 0, 200, -500);
		
        camera.quaternion.multiplyVector3( newP );
        
        newP.addSelf( camera.position );
        
		light.position = newP;
        lightSource.position = newP;
		
        lightSource.quaternion.copy( camera.quaternion );
        
    }
    
    function resize ( W, H ) {
        
    }
    
    return main; 
    
}(KAIOPUA || {}));