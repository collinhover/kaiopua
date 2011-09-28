/*
EffectLinearGradient.js
Draws a linear gradient into background.
*/

var KAIOPUA = (function (main) {
    
    var effects = main.effects = main.effects || {},
        LinearGradient = effects.LinearGradient = effects.LinearGradient || {};
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function generate ( parameters ) {
        
        var camera,
            scene,
            renderer,
            geometry,
            materials,
            quad,
            width,
            height,
            colors,
            stops,
            startBottom,
            threeColors,
            i, 
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
        
        // handle parameters
        
        parameters = parameters || {};
        
        width = 1;
        height = 1;
        colors = parameters.colors || [0xFFFFFF, 0x000000];
        stops = parameters.stops || [];
        startBottom = parameters.startBottom || false;
        threeColors = [];
        
        numColors = colors.length;
        numFaces = numColors - 1;
        
        // camera and scene
        
        camera = new THREE.OrthoCamera( width / - 2, width / 2,  height / 2, height / - 2, -10000, 10000 );
        camera.position.z = 100;
        
        scene = new THREE.Scene();
        
        // gradient material depth test disabled so that it stays in bg
        
        materials = [
            new THREE.MeshLambertMaterial({
                color: parameters.baseColor || 0xffffff,
		        shading: THREE.FlatShading,
		        vertexColors: THREE.VertexColors,
                depthTest: false
		    })
        ];
        
        if ( parameters.showWireframe === true ) {
            materials[materials.length] = new THREE.MeshBasicMaterial({
                color: parameters.wireColor || 0x000000,
		        shading: THREE.FlatShading,
		        wireframe: true
		    });
        }
        
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
        
        return { 
            scene: scene,
            camera: camera,
            resize: function ( W, H ) {
                
                camera.left = W / - 2;
                camera.right = W / 2;
                camera.top = H / 2;
                camera.bottom = H / - 2;
                
                camera.updateProjectionMatrix();
                
                quad.scale.set( W, H, 1 );
            }
        };
    }
    
    LinearGradient.generate = generate;
    
    return main; 
    
}(KAIOPUA || {}));