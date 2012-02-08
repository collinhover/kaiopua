/*
ObjectMaker.js
Object generator module, handles generation of misc things.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/utils/ObjectHelper",
		objecthelper = {},
		model,
		utilVec31Follow,
		utilQ1Follow;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
    objecthelper.object_follow_object = object_follow_object;
	
	objecthelper = main.asset_register( assetPath, objecthelper );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	main.asset_require( [], init_internal, true );
	
	function init_internal () {
		console.log('internal object helper');
		// utility
		
		utilVec31Follow = new THREE.Vector3();
		utilQ1Follow = new THREE.Quaternion();
		
		main.asset_ready( assetPath );
		
	}
	
	/*===================================================
    
    helper functions
    
    =====================================================*/
	
	function object_follow_object ( leader, follower, rotationBase, rotationOffset, positionOffset ) {
		
		var leaderScale = leader.scale,
			leaderScaleMax = Math.max( leaderScale.x, leaderScale.y, leaderScale.z ), 
			leaderQ = leader.quaternion,
			followerP = follower.position,
			followerQ = follower.quaternion,
			followerOffsetPos = utilVec31Follow,
			followerOffsetRot = utilQ1Follow;
		
		// set offset base position
		
		followerOffsetPos.set( positionOffset.x, positionOffset.y, positionOffset.z ).multiplyScalar( leaderScaleMax );
		
		// set offset rotation
		
		followerOffsetRot.setFromEuler( rotationOffset ).normalize();
		
		// create new camera offset position
		
		rotationBase.multiplyVector3( followerOffsetPos );
		
		followerOffsetRot.multiplyVector3( followerOffsetPos );
		
		leaderQ.multiplyVector3( followerOffsetPos );
		
		// set new camera position
		
		followerP.copy( leader.position ).addSelf( followerOffsetPos );
		
		// set new camera rotation
		
		followerQ.copy( leaderQ ).multiplySelf( followerOffsetRot ).multiplySelf( rotationBase );
		
	}
	
    return main; 
    
} ( KAIOPUA ) );