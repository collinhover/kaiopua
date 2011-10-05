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
        renderer, 
        renderTarget,
        camera,
        scene,
        ambient,
        composerScene,
        renderPasses;
    
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
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function ready () { 
        return readyInternal && readyAll; 
    };
    
    function init () {
        
        if ( !ready() ) {
            
            assets = main.utils.loader.assets;
            
            init_internal();
            
            init_environment();
            
            readyAll = true;
            
        }
    }
    
    function init_internal () {
        
        if ( readyInternal !== true ) {
            
            init_basics();
            
            init_render_processing();
            
            readyInternal = true;
            
        }
        
    }
    
    function init_basics () {
        
        // camera
        
        //camera = new THREE.Camera(60, shared.screenWidth / shared.screenHeight, 1, 10000);
        
        camera = new THREE.FirstPersonCamera( { 
            fov: 60, 
            aspect: shared.screenWidth / shared.screenHeight, 
            near: 1, 
            far: 20000,
            movementSpeed: 1000, 
            lookSpeed: 0.1, 
            noFly: false, 
            lookVertical: true
        } );
        
        camera.position.set(0, 0, 800);
        
        // scene
        
        scene = new THREE.Scene();
        
        // lights
        
        ambient = new THREE.AmbientLight( 0x444444 );
        
        scene.addLight( ambient );
        
        var light1 = new THREE.SpotLight( 0xffffff );
        light1.position = new THREE.Vector3(-1, 0, 1).normalize();
        
        scene.addLight( light1 );
        
        // fog
        
        scene.fog = new THREE.Fog( 0xffffff, -100, 10000 );
        
    }
    
    function init_render_processing () {
        
        var shaderScreen = THREE.ShaderExtras[ "screen" ];
        
        // render passes
        
        renderPasses = {
            env: new THREE.RenderPass( scene, camera ),
            screen: new THREE.ShaderPass( shaderScreen )
        };
        
        renderPasses.screen.renderToScreen = true;
        
        // renderer
        
        renderer = shared.renderer;
        renderTarget = shared.renderTarget;
        
        // composer
        
        composerScene = new THREE.EffectComposer( renderer );
        
        composerScene.addPass( renderPasses.env );
        composerScene.addPass( renderPasses.screen );
        
    }
    
    function init_environment () {
        
        // kaiopua
        
        var geometry = assets["assets/models/kaiopua_head.js"];
        
        geometry.materials[0][0].shading = THREE.FlatShading;

    	var material = new THREE.MeshFaceMaterial();
        
        /*
        morphColorsToFaceColors( geometry );
        
        var material = new THREE.MeshLambertMaterial( { 
            color: 0xffffff,
            morphTargets: true,
            vertexColors: THREE.FaceColors 
        } );
        */
        var mesh = new THREE.Mesh( geometry, material );
        
        var scale = 100;
        
		mesh.scale.set( scale, scale, scale );
        
        scene.addChild( mesh );
    }
    
    function morphColorsToFaceColors( geometry ) {

		if ( geometry.morphColors && geometry.morphColors.length ) {
            
			var colorMap = geometry.morphColors[ 0 ];

			for ( var i = 0; i < colorMap.colors.length; i ++ ) {

				geometry.faces[ i ].color = colorMap.colors[ i ];

			}

		}

	}
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
        
        shared.signals.windowresized.add( resize );
        
    }
    
    function hide () {
        
        shared.signals.windowresized.remove( resize );
        
    }
    
    function remove () {
        
    }
    
    function update () {
        
        // render
        
        renderer.setViewport( 0, 0, shared.screenWidth, shared.screenHeight );

        renderer.clear();
        
		composerScene.render();
        
    }
    
    function resize ( W, H ) {
        
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        
        composerScene.reset();
        
    }
    
    return main; 
    
}(KAIOPUA || {}));