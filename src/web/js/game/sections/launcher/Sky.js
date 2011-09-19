/*
Sky.js
Launcher section sky handler.
*/

define([],
function () {
    var cloudsMesh, cloudsGeometry, cloudMaterial,
        cloudPlane, cloudTexture, sceneFog,
        numClouds, cloudRotations, cloudSpaceWidth, 
        cloudSpaceHeightStart, cloudSpaceHeightEnd,
        cloudSpaceDepth, cloudScaleStart, cloudScaleEnd;
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init ( parameters ) {
        var pct, currScale, currSpaceHeightMax, currSpaceHeightMin, i;
        
        // handle parameters
        
        parameters = parameters || {};
        
        cloudTexture = typeof parameters.cloudTexture !== 'undefined' ? parameters.cloudTexture : undefined;
        
        sceneFog = typeof parameters.fog !== 'undefined' ? parameters.fog : new THREE.Fog( 0xffffff, -100, 1000 );
        
        numClouds = typeof parameters.numClouds !== 'undefined' ? parameters.numClouds : 1000;
        
        cloudRotations = typeof parameters.cloudRotations !== 'undefined' ? parameters.cloudRotations : new THREE.Vector3(0, 0, 0);
        
        cloudScaleStart = typeof parameters.cloudScaleStart !== 'undefined' ? parameters.cloudScaleStart : 1;
        
        cloudScaleEnd = typeof parameters.cloudScaleEnd !== 'undefined' ? parameters.cloudScaleEnd : 1;
        
        cloudSpaceWidth = typeof parameters.cloudSpaceWidth !== 'undefined' ? parameters.cloudSpaceWidth : 1000;
        
        cloudSpaceHeightStart = typeof parameters.cloudSpaceHeightStart !== 'undefined' ? parameters.cloudSpaceHeightStart : {min: 0, max: 100};
        
        cloudSpaceHeightEnd = typeof parameters.cloudSpaceHeightEnd !== 'undefined' ? parameters.cloudSpaceHeightEnd : {min: 0, max: 100};
        
        cloudSpaceDepth = typeof parameters.cloudSpaceDepth !== 'undefined' ? parameters.cloudSpaceDepth : 1000;
        
        /*
        // material and shader logic (c) ro.me
        cloudTexture.magFilter = THREE.LinearMipMapLinearFilter;
        cloudTexture.minFilter = THREE.LinearMipMapLinearFilter;
        
    	cloudMaterial = new THREE.MeshShaderMaterial( {
            
    		uniforms: {
                
    			"map": { type: "t", value:2, texture: cloudTexture },
    			"fogColor" : { type: "c", value: sceneFog.color },
    			"fogNear" : { type: "f", value: sceneFog.near },
    			"fogFar" : { type: "f", value: sceneFog.far }
                
    		},
    		vertexShader: [
                
    			"varying vec2 vUv;",
    
    			"void main() {",
    
    				"vUv = uv;",
    				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    
    			"}"
    
    		].join("\n"),
    
    		fragmentShader: [
    
    			"uniform sampler2D map;",
    
    			"uniform vec3 fogColor;",
    			"uniform float fogNear;",
    			"uniform float fogFar;",
    
    			"varying vec2 vUv;",
    
    			"void main() {",
    
    				"float depth = gl_FragCoord.z / gl_FragCoord.w;",
    				"float fogFactor = smoothstep( fogNear, fogFar, depth );",
    
    				"gl_FragColor = texture2D( map, vUv );",
    				"gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );",
    				"gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );",
    
    			"}"
    
    		].join("\n"),
    
    		depthTest: false
    
    	} );
        */
        
        cloudTexture.minFilter = cloudTexture.magFilter = THREE.LinearFilter;
        
        cloudMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, map: cloudTexture } );
        
        // init geometry
        
        cloudsGeometry = new THREE.Geometry();
        
    	cloudPlane = new THREE.Mesh( new THREE.PlaneGeometry( 256, 256 ) );
        
        // position each cloud plane and merge into cloud geometry
    	for ( i = 0; i < numClouds; i += 1 ) {
            
            pct = ((numClouds - i + 1) / numClouds);
            
            currScale = cloudScaleStart * (1 - pct) + (cloudScaleEnd * pct);
            
            currSpaceHeightMax = cloudSpaceHeightStart.max + (cloudSpaceHeightEnd.max - cloudSpaceHeightStart.max) * pct;
            
            currSpaceHeightMin = cloudSpaceHeightStart.min + (cloudSpaceHeightEnd.min - cloudSpaceHeightStart.min) * pct;
            
            require('utils/Dev').log('i = ' + i + ', % = ' + pct + ', cs = ' + currScale + ', ha = ' + currSpaceHeightMax + ', hi: ' + currSpaceHeightMin);
            
    		cloudPlane.position.x = Math.random() * (cloudSpaceWidth * 2) - cloudSpaceWidth;
    		cloudPlane.position.y = Math.random() * (currSpaceHeightMax - currSpaceHeightMin) + currSpaceHeightMin;
    		cloudPlane.position.z = i * (cloudSpaceDepth / numClouds) - cloudSpaceDepth * 0.5;
    		cloudPlane.rotation.z = Math.random() * Math.PI;
    		cloudPlane.scale.x = cloudPlane.scale.y = Math.random() * Math.random() * currScale + (currScale * 0.3);
    
    		THREE.GeometryUtils.merge( cloudsGeometry, cloudPlane );
    
    	}
        
        cloudsMesh = new THREE.Mesh( cloudsGeometry, cloudMaterial );
        
    }
    
    // return something to define module
    return {
        init: init,
        get_mesh: function () { return cloudsMesh; }
    };
});