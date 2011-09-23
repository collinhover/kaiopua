/*
EffectBlurredVignette.js
Blurs render increasingly as moves away from center.

Based on ro.me's original PaintEffect implementation
*/

define(['utils/Shared'],
function () {
    var shared = require('utils/Shared'),
        camera, 
        scene,
        renderer,
        renderSeq,
        material, 
        shader, 
        uniforms;
        
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    camera = new THREE.OrthoCamera( shared.screenWidth / - 2, shared.screenWidth / 2,  shared.screenHeight / 2, shared.screenHeight / - 2, -10000, 10000 );
    camera.position.z = 100;
    
    scene = new THREE.Scene();
    
    uniforms = {
        
        "map": { type: "t", value:0, texture: undefined },
        "screenWidth": { type: "f", value:shared.screenWidth },
        "screenHeight": { type: "f", value:shared.screenHeight },
        "vingenettingOffset": { type: "f", value: 1.2 },
        "vingenettingDarkening": { type: "f", value: 0.64 },
        "colorOffset": { type: "f", value: 0 },
        "colorFactor": { type: "f", value: 0 },
        "colorBrightness": { type: "f", value: 0 },
        "sampleDistance": { type: "f", value: 0.4 },
        "waveFactor": { type: "f", value: 0.00756 },
        "colorA": { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
        "colorB": { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
        "colorC": { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }
        
    };
    
    material = new THREE.MeshShaderMaterial( {
        
        uniforms: uniforms,
        vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

            "vUv = vec2( uv.x, 1.0 - uv.y );",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

        ].join("\n"),

        fragmentShader: [

            "uniform float screenWidth;",
            "uniform float screenHeight;",
            "uniform float vingenettingOffset;",
            "uniform float vingenettingDarkening;",
            "uniform float colorOffset;",
            "uniform float colorFactor;",
            "uniform float sampleDistance;",
            "uniform float colorBrightness;",
            "uniform float waveFactor;",
            "uniform vec3 colorA;",
            
            
            "uniform sampler2D map;",
            "varying vec2 vUv;",

            "void main() {",
                
                "vec4 color, org, tmp, add;",
                "float sample_dist, f;",
                "vec2 vin;",                            
                "vec2 uv = vUv;",
                
                "add += color = org = texture2D( map, uv );",

                "vin = (uv - vec2(0.5)) * vec2(4.0);",
                "sample_dist =(dot( vin, vin ) * 2.0);",
                
                "f = (1.86 + sample_dist) * sampleDistance * 0.5;",

                "vec2 sampleSize = vec2(  1.0 / screenWidth, 1.0 / screenHeight ) * vec2(f);",

                "add += tmp = texture2D( map, uv + vec2(0.111964, 0.993712) * sampleSize);", 
                "if( tmp.b < color.b ) color = tmp;",

                "add += tmp = texture2D( map, uv + vec2(0.846724, 0.532032) * sampleSize);",
                "if( tmp.b < color.b ) color = tmp;",

                "add += tmp = texture2D( map, uv + vec2(0.943883, -0.330279) * sampleSize);",
                "if( tmp.b < color.b ) color = tmp;",

                "add += tmp = texture2D( map, uv + vec2(0.330279, -0.943883) * sampleSize);",
                "if( tmp.b < color.b ) color = tmp;",

                "add += tmp = texture2D( map, uv + vec2(-0.532032, -0.846724) * sampleSize);",
                "if( tmp.b < color.b ) color = tmp;",

                "add += tmp = texture2D( map, uv + vec2(-0.993712, -0.111964) * sampleSize);",
                "if( tmp.b < color.b ) color = tmp;",

                "add += tmp = texture2D( map, uv + vec2(-0.707107, 0.707107) * sampleSize);",
                "if( tmp.b < color.b ) color = tmp;",


                "uv = (uv - vec2(0.5)) * vec2( 0.94/* vingenettingOffset*/ );",
        //      "color = color + (add / vec4(8.0) - color) * (vec4(1.0) - vec4(sample_dist * 0.1));",
                "color = (add / vec4(8.0));",
                "gl_FragColor = vec4( mix(color.rgb, color.ggg * colorFactor /* - vec3( vingenettingDarkening )*/, vec3( dot( uv, uv ))), 1.0 );",
                "gl_FragColor = vec4(1.0) - (vec4(1.0) - gl_FragColor) * (vec4(1.0) - gl_FragColor);",
            "}"

            ].join("\n")
        
    } );


    var quad = new THREE.Mesh( new THREE.PlaneGeometry( shared.screenWidth, shared.screenHeight ), material );
    quad.position.z = 100;
    scene.addObject( quad );
    
    renderSeq = { 
        scene:scene, 
        camera:camera
    };
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function enable ( effectTarget ) {
        
        renderer = shared.renderer;
        
        uniforms.map.texture = effectTarget;
        
        // add listener for resize signal
        shared.signals.windowresized.add(resize);
        
    }
    
    function disable () {
        
        // remove listener for resize signal
        shared.signals.windowresized.remove(resize);
        
    }

    function apply ( renderTarget, forceClear ) {
        
        renderer.render( scene, camera, renderTarget, forceClear );
            
    }
    
    function resize ( W, H ) {
        
        uniforms.screenWidth.value = W;
        uniforms.screenHeight.value = H;
        
        camera.left = W / - 2;
        camera.right = W / 2;
        camera.top = H / 2;
        camera.bottom = H / - 2;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        
    }
    
    // return something to define module
    return {
        enable: enable,
        disable: disable,
        apply: apply,
        resize: resize,
        get_render_sequence: function () { return renderSeq; }
    };
});