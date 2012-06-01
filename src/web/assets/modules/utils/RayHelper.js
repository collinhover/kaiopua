/*
 *
 * RayHelper.js
 * Contains utility functionality for basic type checking.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/utils/RayHelper.js",
		_RayHelper = {},
		_SceneHelper,
		utilRay1Casting,
		utilProjector1Casting,
		utilVec31Casting;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _RayHelper,
		requirements: [
			"assets/modules/utils/SceneHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( sh ) {
		console.log('internal ray helper', _RayHelper);
		
		// reqs
		
		_SceneHelper = sh;
		
		// utility
		
		utilRay1Casting = new THREE.Ray();
		utilProjector1Casting = new THREE.Projector();
		utilVec31Casting = new THREE.Vector3();
		
		// functions
		
		_RayHelper.raycast = raycast;
		_RayHelper.raycast_physics = raycast_physics;
		_RayHelper.raycast_from_mouse = raycast_from_mouse;
		_RayHelper.raycast_objects = raycast_objects;
		
	}
	
	/*===================================================
    
    raycasting
    
    =====================================================*/
	
	function raycast ( parameters ) {
		
		var i, l,
			ray,
			origin,
			direction,
			ignore,
			intersections = [],
			intersectionPotential,
			intersectedObject,
			intersectionDistance = Number.MAX_VALUE,
			intersection;
		
		// parameters
		
		if ( parameters.ray instanceof THREE.Ray !== true ) {
			
			ray = parameters.ray = utilRay1Casting;
			
			// origin
			
			if ( parameters.origin instanceof THREE.Vector3 ) {
				
				ray.origin.copy( parameters.origin );
				
			}
			
			// direction
			
			if ( parameters.direction instanceof THREE.Vector3 ) {
				
				ray.direction.copy( parameters.direction );
				
			}
			
			// offset
			
			if ( parameters.offset instanceof THREE.Vector3 ) {
				
				ray.origin.addSelf( parameters.offset );
				
			}
			
		}
		
		// cast through physics
		
		if ( typeof parameters.physics !== 'undefined' ) {
			
			intersections = intersections.concat( raycast_physics( parameters ) );
			
		}
		
		// cast through objects
		
		if ( typeof parameters.mouse !== 'undefined' ) {
			
			intersections = intersections.concat( raycast_from_mouse( parameters ) );
			
		}
		else if ( typeof parameters.objects !== 'undefined' ) {
			
			intersections = intersections.concat( raycast_objects( parameters ) );
			
		}
		
		// if all required
		
		if ( parameters.allIntersections === true ) {
			
			return intersections;
			
		}
		// else return nearest
		else {
			
			ignore = main.ensure_array( parameters.ignore );
			
			for ( i = 0, l = intersections.length; i < l; i++ ) {
				
				intersectionPotential = intersections[ i ];
				
				intersectedObject = intersectionPotential.mesh || intersectionPotential.object;
				
				if ( intersectionPotential.distance < intersectionDistance && ignore.indexOf( intersectedObject ) === -1 ) {
					
					intersection = intersectionPotential;
					intersectionDistance = intersectionPotential.distance;
					
				}
				
			}
			
			return intersection;
		
		}
		
	}
	
	function raycast_physics ( parameters ) {
		
		var i, l,
			ray = parameters.ray,
			physics = parameters.physics,
			octree = parameters.octree,
			distance = parameters.distance,
			system = physics.system,
			colliders = parameters.colliders,
			intersections;
		
		// if using octree
		
		if ( typeof octree !== 'undefined' && distance > 0 ) {
			
			// search for potential colliders
			
			colliders = main.ensure_array( colliders ).concat( octree.search( ray.origin, distance, true ) );
			console.log( ' RAYCAST, octree search results from position ', ray.origin.x, ray.origin.y, ray.origin.z, ' + dist ', distance, ' = # ', colliders.length, ' + colliders', colliders );
			
		}
		
		// ray cast colliders
		// defaults to all in system
		
		intersections = system.rayCastColliders( ray, colliders );
		//console.log( ' RAYCAST, intersections ', intersections );
		return intersections;
		
	}
	
	function raycast_from_mouse ( parameters ) {
		
		var ray = parameters.ray,
			camera = parameters.camera,
			mouse = parameters.mouse,
			mousePosition = utilVec31Casting,
			projector = utilProjector1Casting;
		
		// get corrected mouse position
		
		mousePosition.x = ( mouse.x / shared.screenWidth ) * 2 - 1;
		mousePosition.y = -( mouse.y / shared.screenHeight ) * 2 + 1;
		mousePosition.z = 0.5;
		
		// unproject mouse position
		
		projector.unprojectVector( mousePosition, camera );
		
		// set ray

		ray.origin.copy( camera.position );
		ray.direction.copy( mousePosition.subSelf( camera.position ) ).normalize();
		
		return raycast_objects( parameters );
		
	}
	
	function raycast_objects ( parameters ) {
		
		var ray = parameters.ray,
			objects = parameters.objects,
			hierarchical = parameters.hierarchical;
		
		// account for hierarchy and extract all children
		
		if ( hierarchical !== false ) {
			
			objects = _SceneHelper.extract_children_from_objects( objects, objects );
			
		}
		
		// find intersections
		
		return ray.intersectObjects( objects );
		
	}
	
} (KAIOPUA) );