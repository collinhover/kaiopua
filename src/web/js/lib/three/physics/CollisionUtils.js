/**
 * @author bartek drozdz / http://everyday3d.com/
 */

THREE.CollisionUtils = {};

// @params m THREE.Mesh
// @returns CBox dynamic Object Bounding Box

THREE.CollisionUtils.MeshOBB = function( m ) {

	m.geometry.computeBoundingBox();
	var b = m.geometry.boundingBox;
	var min = b.min.clone();
	var max = b.max.clone();
	var box = new THREE.BoxCollider( min, max );
	box.mesh = m;
	return box;

}

// @params m THREE.Mesh
// @returns CBox static Axis-Aligned Bounding Box
//
// The AABB is calculated based on current
// position of the object (assumes it won't move)

THREE.CollisionUtils.MeshAABB = function( m ) {

	var box = THREE.CollisionUtils.MeshOBB( m );
	box.min.addSelf( m.position );
	box.max.addSelf( m.position );
	box.dynamic = false;
	return box;

};

// @params m THREE.Mesh
// @returns CMesh with aOOB attached (that speeds up intersection tests)

THREE.CollisionUtils.MeshColliderWBox = function( m ) {

	var mc = new THREE.MeshCollider( m, THREE.CollisionUtils.MeshOBB( m ) );

	return mc;

};
