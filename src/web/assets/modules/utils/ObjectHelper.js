/*
 *
 * ObjectHelper.js
 * Contains utility functionality for basic models.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/utils/ObjectHelper.js",
		_ObjectHelper = {},
		utilVec31Follow,
		utilQ1Follow;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
    _ObjectHelper.object_follow_object = object_follow_object;
	
	main.asset_register( assetPath, { data: _ObjectHelper } );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	init_internal();
	
	function init_internal () {
		console.log('internal object helper');
		// utility
		
		utilVec31Follow = new THREE.Vector3();
		utilQ1Follow = new THREE.Quaternion();
		
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
    
} ( KAIOPUA ) );