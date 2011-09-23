/*
EffectLinearGradient.js
Draws a linear gradient into background.
*/

define(['utils/Shared'],
function () {
    var shared = require('utils/Shared'),
        camera,
        scene,
        renderer, 
        renderTarget,
        geometry,
        materials,
        quad,
        width,
        height,
        colors,
        stops,
        startBottom,
        threeColors;
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init ( parameters ) {
        
        renderer = shared.renderer;
        
        renderTarget = shared.renderTarget;
        
        camera = new THREE.OrthoCamera( shared.screenWidth / - 2, shared.screenWidth / 2,  shared.screenHeight / 2, shared.screenHeight / - 2, -10000, 10000 );
        camera.position.z = 100;
        
        scene = new THREE.Scene();
        
        materials = [
            new THREE.MeshLambertMaterial({
		        color: 0xffffff,
		        shading: THREE.FlatShading,
		        vertexColors: THREE.VertexColors,
                depthTest: false
		    }), /*
            new THREE.MeshBasicMaterial({
		        color: 0x000000,
		        shading: THREE.FlatShading,
		        wireframe: true
		    })*/
        ];
        
        set_options( parameters );
    }
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function set_options ( parameters ) {
        
        var i, 
            numColors,
            faceVertexIndices = ['a', 'b', 'c', 'd'],
            colorIndex,
            face,
            vertices,
            vertA,
            vertD,
            stopA,
            colorA,
            colorB;
        
        // remove previous quad if exists
        
        if (typeof quad !== 'undefined') {
            scene.removeObject( quad );
        }
        
        // handle parameters
        
        parameters = parameters || {};
        
        width = parameters.width || shared.screenWidth;
        height = parameters.height || shared.screenHeight;
        colors = parameters.colors || [0xFFFFFF, 0x000000];
        stops = parameters.stops || [];
        startBottom = parameters.startBottom || false;
        threeColors = [];
        
        numColors = colors.length;
        numFaces = numColors - 1;
        
        // if gradient stops was not passed or passed incorrectly
        
        if (stops.length !== colors.length) {
            for ( i = 0; i < numColors; i += 1) {
                stops[i] = i / (numColors - 1);
            }
        }
        
        // init three colors
        
        for ( i = 0; i < numColors; i += 1) {
            if (startBottom) {
                colorIndex = numColors - 1 - i;
            } 
            else {
                colorIndex = i;
            }
            threeColors[colorIndex] = new THREE.Color(colors[i]);
        }
        
        // init geometry
        
        geometry = new THREE.PlaneGeometry(width, height, 1, numFaces);
        
        // scale faces based on stops and assign vertex colors
        
	    for (i = 0; i < numFaces; i += 1) {
	        face = geometry.faces[i];
            vertices = geometry.vertices;
            
            vertA = vertices[face[faceVertexIndices[0]]];
            vertD = vertices[face[faceVertexIndices[3]]];
            
            stopA = stops[i];
            
            // adjust height of vertices to stops
            
            vertA.position.y = height * 0.5 - height * stopA;
            vertD.position.y = height * 0.5 - height * stopA;
            
            colorA = threeColors[i];
            colorB = threeColors[i + 1];
            
            // set vertex colors
                
	        face.vertexColors[0] = colorA;
            face.vertexColors[3] = colorA;
            face.vertexColors[1] = colorB;
            face.vertexColors[2] = colorB;
	    }
        
        quad = new THREE.Mesh( geometry, materials );
        quad.position.z = -100;
        
		scene.addObject( quad );
    }

    function apply () {
        
        // gradient material depth test disabled so that it stays in bg
        
        renderer.render( scene, camera, renderTarget, true );
        
    }
    
    // return something to define module
    return {
        init: init,
        set_options: set_options,
        get_gradient: function () { return quad; },
        apply: apply,
        width: function () { return width; },
        height: function () { return height; },
        colors: function () { return colors; },
        stops: function () { return stops; },
        startBottom: function () { return startBottom; },
        threeColors: function () { return threeColors; }
    };
});