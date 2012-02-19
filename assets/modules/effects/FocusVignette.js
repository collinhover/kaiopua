/*
FocusVignette.js
Blurs render increasingly as moves away from center.

Based on ro.me's original PaintEffect implementation
*/

(function (main) {
    
    var assetPath = "assets/modules/effects/FocusVignette.js",
		fv = {

        uniforms: {
            
            "tDiffuse": { type: "t", value: 0, texture: null },
            "screenWidth": { type: "f", value: 1024 },
            "screenHeight": { type: "f", value: 1024 },
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
            
        },
        
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
            
            
            "uniform sampler2D tDiffuse;",
            "varying vec2 vUv;",

            "void main() {",
                
                "vec4 color, org, tmp, add;",
                "float sample_dist, f;",
                "vec2 vin;",                            
                "vec2 uv = vUv;",
                
                "add += color = org = texture2D( tDiffuse, uv );",

                "vin = (uv - vec2(0.5)) * vec2(4.0);",
                "sample_dist =(dot( vin, vin ) * 2.0);",
                
                "f = ( waveFactor + sample_dist ) * sampleDistance * 4.0;",

                "vec2 sampleSize = vec2(  1.0 / screenWidth, 1.0 / screenHeight ) * vec2(f);",

                "add += tmp = texture2D( tDiffuse, uv + vec2(0.111964, 0.993712) * sampleSize);", 
                "if( tmp.b < color.b ) color = tmp;",

                "add += tmp = texture2D( tDiffuse, uv + vec2(0.846724, 0.532032) * sampleSize);",
                "if( tmp.b < color.b ) color = tmp;",

                "add += tmp = texture2D( tDiffuse, uv + vec2(0.943883, -0.330279) * sampleSize);",
                "if( tmp.b < color.b ) color = tmp;",

                "add += tmp = texture2D( tDiffuse, uv + vec2(0.330279, -0.943883) * sampleSize);",
                "if( tmp.b < color.b ) color = tmp;",

                "add += tmp = texture2D( tDiffuse, uv + vec2(-0.532032, -0.846724) * sampleSize);",
                "if( tmp.b < color.b ) color = tmp;",

                "add += tmp = texture2D( tDiffuse, uv + vec2(-0.993712, -0.111964) * sampleSize);",
                "if( tmp.b < color.b ) color = tmp;",

                "add += tmp = texture2D( tDiffuse, uv + vec2(-0.707107, 0.707107) * sampleSize);",
                "if( tmp.b < color.b ) color = tmp;",


                "uv = (uv - vec2(0.5)) * vec2( vingenettingOffset );",
        //      "color = color + (add / vec4(8.0) - color) * (vec4(1.0) - vec4(sample_dist * 0.1));",
                "color = (add / vec4(8.0));",
                "gl_FragColor = vec4( mix(color.rgb, color.ggg * colorFactor - vec3( vingenettingDarkening ), vec3( dot( uv, uv ))), 1.0 );",
                "gl_FragColor = vec4(1.0) - (vec4(1.0) - gl_FragColor) * (vec4(1.0) - gl_FragColor);",
            "}"

            ].join("\n")

	};
	
	main.asset_register( assetPath, { data: fv } );
    
} ( KAIOPUA ) );