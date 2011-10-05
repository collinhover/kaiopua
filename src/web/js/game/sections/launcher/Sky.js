/*
Sky.js
Launcher section sky handler.

cloud texture (c) ro.me
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        sections = game.sections = game.sections || {},
        launcher = sections.launcher = sections.launcher || {},
        sky = launcher.sky = launcher.sky || {},
        skyWidth = 20000,
        skyHeight = 2000, 
        skyDepth = 10000,
        numClouds = 40, 
        lightAngle = (-Math.PI * 0.25), 
        lightAngleVariation = (Math.PI * 0.25),
        timePrev,
        windDirection = -1,
        windSpeedMax = 4,
        windSpeedMin = 1,
        cloudWidth = 1000,
        cloudDepth = 500,
        cloudHeightStart = {min: 400, max: 600}, 
        cloudHeightEnd = {min: 0, max: 1000},
        cloudScaleVariation = {w: 1, h: 0.5, d:0},
        numPlanesPerCloud = 100,
        cloudPlaneScaleStart = 6, 
        cloudPlaneScaleEnd = 4,
        cloudPlaneTextureLoading = false,
        cloudPlaneTexturePath = "assets/textures/cloud256.png",
        cloudPlaneTexture,
        clouds = [],
        environment;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    sky.init = init;
    sky.wind_blow = wind_blow;
    sky.get_environment = function () {
        return environment;    
    };
    
    /*===================================================
    
    external init
    
    =====================================================*/
    
    function init ( parameters ) {
        var i, cloud, pct;
        
        // handle parameters
        
        parameters = parameters || {};
        
        skyWidth = parameters.skyWidth || skyWidth;
        
        skyHeight = parameters.skyHeight || skyHeight;
        
        skyDepth = parameters.skyDepth || skyDepth;
        
        numClouds = parameters.numClouds || numClouds;
        
        lightAngle = parameters.lightAngle || lightAngle;
        
        lightAngleVariation = parameters.lightAngleVariation || lightAngleVariation;
        
        windDirection = parameters.windDirection || windDirection;
        
        windSpeedMax = parameters.windSpeedMax || windSpeedMax;
        
        windSpeedMin = parameters.windSpeedMin || windSpeedMin;
        
        cloudWidth = parameters.cloudWidth || cloudWidth;
        
        cloudDepth = parameters.cloudDepth || cloudDepth;
        
        cloudHeightStart = parameters.cloudHeightStart || cloudHeightStart;
        
        cloudHeightEnd = parameters.cloudHeightEnd || cloudHeightEnd;
        
        cloudScaleVariation = parameters.cloudScaleVariation || cloudScaleVariation;
        
        numPlanesPerCloud = parameters.numPlanesPerCloud || numPlanesPerCloud;
        
        cloudPlaneScaleStart = parameters.cloudPlaneScaleStart || cloudPlaneScaleStart;
        
        cloudPlaneScaleEnd = parameters.cloudPlaneScaleEnd || cloudPlaneScaleEnd;
        
        // environment
        
        environment = new THREE.Object3D();
        
        // generate clouds
        
        // cloud texture
        
        cloudPlaneTexture = new THREE.Texture( main.utils.loader.assets[cloudPlaneTexturePath] );
        
        cloudPlaneTexture.needsUpdate = true;
        
        // cloud meshes
        
        for ( i = 0; i < numClouds; i += 1) {
            
            pct = ((numClouds - i) / numClouds);
            
            cloud = generate_cloud();
            
            cloud.position.x = Math.random() * (skyWidth) - skyWidth * 0.5;
            cloud.position.y = Math.random() * (skyHeight) - skyHeight * 0.5;
            cloud.position.z = (skyDepth * pct) - skyDepth * 0.5; 
            
            clouds[clouds.length] = cloud;
            
            // add to environment
            environment.addChild(cloud);
        }
        
    }
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function generate_cloud( parameters ) {
        var cloudMesh, cloudGeometry, cloudMaterial,
            cloudPlane, numPlanes, width, depth, heightStart, heightEnd,
            planeScaleStart, planeScaleEnd, scaleVariation,
            pct, currScale, currPlaneHeightMax, currPlaneHeightMin, i;
        
        // handle parameters
        
        parameters = parameters || {};
        
        numPlanes = parameters.numPlanes || numPlanesPerCloud;
        
        planeScaleStart = parameters.planeScaleStart || cloudPlaneScaleStart;
        
        planeScaleEnd = parameters.planeScaleEnd || cloudPlaneScaleEnd;
        
        scaleVariation = parameters.scaleVariation || cloudScaleVariation;
        
        width = parameters.width || cloudWidth;
        
        heightStart = parameters.heightStart || cloudHeightStart;
        
        heightEnd = parameters.heightEnd || cloudHeightEnd;
        
        depth = parameters.depth || cloudDepth;
        
        
        // scale variation
        width = width + (Math.random() * width * scaleVariation.w - width * scaleVariation.w * 0.5);
        heightStart.max = heightStart.max + (Math.random() * heightStart.max * scaleVariation.h - heightStart.max * scaleVariation.h * 0.5);
        heightStart.min = heightStart.min + (Math.random() * heightStart.min * scaleVariation.h - heightStart.min * scaleVariation.h * 0.5);
        heightEnd.max = heightEnd.max + (Math.random() * heightEnd.max * scaleVariation.h - heightEnd.max * scaleVariation.h * 0.5);
        heightEnd.min = heightEnd.min + (Math.random() * heightEnd.min * scaleVariation.h - heightEnd.min * scaleVariation.h * 0.5);
        depth = depth + (Math.random() * depth * scaleVariation.d - depth * scaleVariation.d * 0.5);
        
        // material
        
        cloudMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, depthTest: false, map: cloudPlaneTexture } );
        
        // geometry
        
        cloudGeometry = new THREE.Geometry();
        
        // planes
        
        cloudPlane = new THREE.Mesh( new THREE.PlaneGeometry( 256, 256 ) );
        
        // position each cloud plane and merge into cloud geometry
        for ( i = 0; i < numPlanes; i += 1 ) {
            
            pct = ((numPlanes - i) / numPlanes);
            
            currScale = planeScaleStart * (1 - pct) + (planeScaleEnd * pct);
            
            currPlaneHeightMax = heightStart.max + (heightEnd.max - heightStart.max) * pct;
            
            currPlaneHeightMin = heightStart.min + (heightEnd.min - heightStart.min) * pct;
            
            cloudPlane.position.x = Math.random() * Math.random() * (width * 2) - width;
            cloudPlane.position.y = Math.random() * Math.random() * (currPlaneHeightMax - currPlaneHeightMin) + currPlaneHeightMin;
            cloudPlane.position.z = i * (depth / numPlanes) - depth * 0.5;
            cloudPlane.rotation.z = lightAngle + (Math.random() * (lightAngleVariation * 2) - lightAngleVariation);
            cloudPlane.scale.x = cloudPlane.scale.y = Math.random() * Math.random() * currScale + (currScale * 0.3);
            
            THREE.GeometryUtils.merge( cloudGeometry, cloudPlane );
            
        }
        
        // mesh
        
        cloudMesh = new THREE.Mesh( cloudGeometry, cloudMaterial );
        
        return cloudMesh;
    }
    
    function wind_blow ( time, direction, speedMax, speedMin ) {
        var i, timeDiff, pct, boundXNeg, boundXPos;
        
        // handle time change
        
        timePrev = timePrev || time;
        
        timeDiff = 1 - (time - timePrev) / 60;
        
        timePrev = time;
        
        // set wind direction and speed
        
        windDirection = direction || windDirection;
        
        windSpeedMax = speedMax || windSpeedMax;
        
        windSpeedMin = speedMin || windSpeedMin;
        
        boundXPos = skyWidth * 0.5;
        boundXNeg = -boundXPos;
        
        // push each cloud
        
        for ( i = 0; i < numClouds; i += 1) {
            cloud = clouds[i];
            
            pct = ((numClouds - i) / numClouds);
            
            cloud.position.x += timeDiff * windDirection * (windSpeedMax * pct + windSpeedMin * (1 - pct));
            
            // cloud bounds
            
            if (cloud.position.x > boundXPos) {
                cloud.position.x = boundXNeg;
            }
            else if (cloud.position.x < boundXNeg) {
                cloud.position.x = boundXPos;
            }
        }
    }
        
    return main; 
    
}(KAIOPUA || {}));