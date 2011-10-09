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
        renderer, 
        renderTarget,
        composerScene,
        renderPasses,
        camera,
        cameraControls,
        scene,
        ambientLight,
        pointLight,
        lightVis;
    
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
            
            objectmaker = main.game.workers.objectmaker;
            
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
        
        camera = new THREE.PerspectiveCamera(60, shared.screenWidth / shared.screenHeight, 1, 10000);
        
        camera.position.set(0, 0, 800);
        camera.lookAt( new THREE.Vector3(0, 0, 0) );
        
        cameraControls = new THREE.FlyControls( camera );
        cameraControls.rollSpeed = 0.5;
        cameraControls.movementSpeed = 400;
        cameraControls.update();
        
        // scene
        
        scene = new THREE.Scene();
        
        // lights
        
        ambientLight = new THREE.AmbientLight( 0x444444 );
        
        scene.add( ambientLight );
        
        pointLight = new THREE.SpotLight( 0xffffff );
        pointLight.position = new THREE.Vector3(-1, 0, 1).normalize();
        
        scene.add( pointLight );
        
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
        
        // light visual
        
        lightVis = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
        
        lightVis.useQuaternion = true;
        
        scene.add( lightVis );
        
        // kaiopua
        
        var geometry = assets["assets/models/rome_tree_anim.js"];
        
        var model = objectmaker.make_model({
            geometry: geometry,
            vertexColors: THREE.VertexColors,
            shading: THREE.FlatShading
        });
        
        model.morphs.play('animation', 2000, true);
        
        scene.add( model.mesh );
    }
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
        
        shared.signals.windowresized.add( resize );
        
        shared.signals.update.add( update );
        
    }
    
    function hide () {
        
        shared.signals.windowresized.remove( resize );
        
        shared.signals.update.remove( update );
        
    }
    
    function remove () {
        
    }
    
    function update () {
        
        // update camera controls
        cameraControls.update();
        
        // position point light to always be 
        // above and infront of camera
        // camera.matrixWorld
        // quaternion
        // Vector3.setPositionFromMatrix( m );
        // Vector3.setRotationFromMatrix( m );
        var camP = camera.position.clone();
        var newP = new THREE.Vector3( 0, 200, -500);
        
        camera.quaternion.multiplyVector3( newP );
        
        newP.addSelf( camera.position );
        //camera.matrixWorld.multiplyVector3( cubeP );
        
        lightVis.position = newP;
        pointLight.position = newP;//.clone().normalize();
        
        //lightVis.quaternion.setFromRotationMatrix( camera.matrixWorld );
        lightVis.quaternion.copy( camera.quaternion );
        
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