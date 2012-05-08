/*
 *
 * Octree.js
 * 3D spatial representation structure for fast searches.
 * 
 * based on Octree by Marek Pawlowski @ pawlowski.it and Dynamic Octree by Piko3D @ http://www.piko3d.com/
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Octree.js",
		_Octree = {},
		octreeCount = 0,
		depthMax = -1,
		objectsMax = 1,
		objectsMin = 1;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	init_internal();
	
	main.asset_register( assetPath, { 
		data: _Octree/*,
		requirements: [
			"assets/modules/core/Octant.js"
		],
		callbacksOnReqs: init_internal,
		wait: true*/
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal () {
		console.log('internal octree', _Octree);
		
		_Octree.Instance = Octree;
		
		_Octree.Instance.prototype.reset = reset;
		_Octree.Instance.prototype.add = add;
		_Octree.Instance.prototype.remove = remove;
		_Octree.Instance.prototype.search = search;
		_Octree.Instance.prototype.object_count_end = object_count_end;
		_Octree.Instance.prototype.object_count_limited = object_count_limited;
		_Octree.Instance.prototype.object_count_start = object_count_start;
		
		_Octree.Instance.prototype.to_string = function ( space ) {
			
			var i, l,
				node,
				spaceAddition = '   ';
			
			space = typeof space === 'string' ? space : spaceAddition;
			
			console.log( ( this.parent ? space + ' octree NODE > ' : ' octree ROOT > ' ), this, ' // id: ', this.id, ' // octantIndex: ', this.octantIndex, ' // position: ', this.position.x, this.position.y, this.position.z, ' // radius: ', this.radius, ' // depth: ', this.depth );
			console.log( ( this.parent ? space + ' ' : ' ' ), '+ objects ( ', this.objects.length, ' ) ', this.objects );
			console.log( ( this.parent ? space + ' ' : ' ' ), '+ children ( ', this.nodesIndices.length, ' )', this.nodesIndices, this.nodesByIndex );
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				node = this.nodesByIndex[ this.nodesIndices[ i ] ];
				
				node.to_string( space + spaceAddition );
				
			}
			
		};
		
		Object.defineProperty( _Octree.Instance.prototype, 'parent', { 
			get : function () { return this._parent; },
			set : function ( parent ) {
				
				var parentPrev = this._parent;
				
				// store new parent
				
				this._parent = parent;
				
				// update properties
				
				if ( this._parent instanceof _Octree.Instance ) {
					
					this.depth = this._parent.depth + 1;
					
					parent.visual.add( this.visual );
					
				}
				else {
					
					this.depth = 0;
					
					if ( parentPrev instanceof _Octree.Instance ) {
						
						parentPrev.visual.remove( this.visual );
						
					}
					
				}
				
			}
			
		} );
		
		Object.defineProperty( _Octree.Instance.prototype, 'empty', { 
			get : function () { return this.nodesIndices.length === 0 && this.objects.length === 0; }
		} );
		
	}
	
	/*===================================================
    
    octree
    
    =====================================================*/
	
	function Octree ( parameters ) {
		
		octreeCount++;
		
		// utility
		
		this.utilVec31Branch = new THREE.Vector3();
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.id = octreeCount;
		
		this.position = parameters.position instanceof THREE.Vector3 ? parameters.position : new THREE.Vector3();
		this.radius = main.is_number( parameters.radius ) ? parameters.radius : 0;
		this.octantIndex = parameters.octantIndex;
		
		// TEST
		this.visual = new THREE.Mesh( new THREE.CubeGeometry( this.radius * 2, this.radius * 2, this.radius * 2 ), new THREE.MeshLambertMaterial( { color: 0xFF0000, wireframe: true, wireframeLinewidth: 10 } ) );
		this.visual.position.copy( this.position );
		if ( parameters.parent ) {
			this.visual.position.subSelf( parameters.parent.position );
		}
		// TEST
		
		this.parent = parameters.parent;
		
		this.depthMax = main.is_number( parameters.depthMax ) ? parameters.depthMax : depthMax;
		this.objectsMax = main.is_number( parameters.objectsMax ) ? parameters.objectsMax : objectsMax;
		this.objectsMin = main.is_number( parameters.objectsMin ) ? parameters.objectsMin : objectsMin;
		
		this.reset();
		
	}
	
	function reset ( cascade ) {
		
		var i, l,
			node,
			nodesIndices = this.nodesIndices || [],
			nodesByIndex = this.nodesByIndex;
		
		this.objects = [];
		this.nodesIndices = [];
		this.nodesByIndex = {};
		
		// unset parent in nodes
		
		for ( i = 0, l = nodesIndices.length; i < l; i++ ) {
			
			node = nodesByIndex[ nodesIndices[ i ] ];
			
			node.parent = undefined;
			
			if ( cascade === true ) {
				
				node.reset( cascade );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    add / remove external
    
    =====================================================*/
	
	function add ( elements ) {
		
		var i, l,
			element;
		
		// handle elements
		
		elements = main.ensure_array( elements );
		
		// for each element
		
		for ( i = 0, l = elements.length; i < l; i++ ) {
			
			element = elements[ i ];
			
			// if is octree
			
			if ( element instanceof _Octree.Instance ) {
					
				add_octree.call( this, element );
				
			}
			// all other considered objects
			else {
				
				add_object.call( this, element );
				
			}
			
		}
		
	}
	
	function remove ( elements ) {
		
		var i, l,
			element;
		
		// handle elements
		
		elements = main.ensure_array( elements );
		
		// for each argument
		
		for ( i = 0, l = elements.length; i < l; i++ ) {
			
			element = elements[ i ];
			
			// is octree
			
			if ( element instanceof _Octree.Instance ) {
				
				remove_octree.call( this, element );
				
			}
			// all other considered objects
			else {
				
				remove_object.call( this, element );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    octree add / remove
    
    =====================================================*/
	
	function add_octree ( octree ) {
		
		var octantIndex = octree.octantIndex || octant_index.call( this, octree );
		
		if ( this.nodesIndices.indexOf( octantIndex ) === -1 ) {
			
			this.nodesIndices.push( octantIndex );
			
		}
		
		this.nodesByIndex[ octantIndex ] = octree;
		
		if ( octree.parent !== this ) {
			
			octree.parent = this;
			
		}
		
	}
	
	function remove_octree ( identifier ) {
		
		var index = -1,
			octree,
			nodeIndex;
		
		// if identifier is octree
		if ( identifier instanceof _Octree.Instance && this.nodesByIndex[ identifier.octantIndex ] === identifier ) {
			
			octree = identifier;
			index = octree.octantIndex;
			
		}
		// if identifier is number
		if ( main.is_number( identifier ) ) {
			
			index = identifier;
			
		}
		// else search all nodes for identifier (slow)
		else {
			
			for ( nodeIndex in this.nodesByIndex ) {
				
				octree = this.nodesByIndex[ nodeIndex ];
				
				if ( octree === identifier ) {
					
					index = nodeIndex;
					
					break;
					
				}
				
			}
			
		}
		
		// if index found
		
		if ( index !== -1 ) {
			
			remove_octree_by_index.call( this, index, octree );
			
		}
		
	}
	
	function remove_octree_by_index ( octantIndex, octree ) {
		
		var index = this.nodesIndices.indexOf( octantIndex );
		
		if ( index !== -1 ) {
			
			this.nodesIndices.splice( index, 1 );
			
		}
		
		octree = octree || this.nodesByIndex[ octantIndex ];
		
		delete this.nodesByIndex[ octantIndex ];
		
		if ( octree.parent === this ) {
			
			octree.parent = undefined;
			
		}
		
	}
	
	/*===================================================
    
    objects add / remove
    
    =====================================================*/
	
	function add_object ( object ) {
		
		var octantIndex,
			node;
		
		// get object octant index
		
		octantIndex = octant_index.call( this, object );
		
		// if object fully contained by an octant, add to subtree
		if ( octantIndex > -1 && this.nodesIndices.length > 0 ) {
			
			node = branch.call( this, octantIndex );
			
			add_object.call( node, object );
			
		}
		// if object lies outside bounds, add to parent node
		else if ( octantIndex === -1 && this.parent instanceof _Octree.Instance ) {
			
			add_object.call( this.parent, object );
			
		}
		// else add to self
		else {
			
			if ( this.objects.indexOf( object ) === -1 ) {
				
				this.objects.push( object );
				
			}
			
			// check if need to grow, split, or both
			
			morph_check.call( this );
			
		}
		
	}
	
	function remove_object ( object ) {
		
		var nodeRemovedFrom;
		
		// cascade through tree to find and remove object
		
		nodeRemovedFrom = remove_object_end.call( this, object );
		
		// if object removed, try to merge the node it was removed from
		
		if ( nodeRemovedFrom instanceof _Octree.Instance ) {
			
			merge_check.call( nodeRemovedFrom );
			
		}
		
	}
	
	function remove_object_end ( object ) {
		
		var i, l,
			index,
			node,
			nodeRemovedFrom;
		
		// if is part of this objects
		
		index = this.objects.indexOf( object );
		
		if ( index !== -1 ) {
			
			this.objects.splice( index, 1 );
			
			nodeRemovedFrom = this;
			
		}
		// if not found, search nodes
		else {
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				node = this.nodesByIndex[ this.nodesIndices[ i ] ];
				
				nodeRemovedFrom = remove_object_end.call( node, object );
				
				// try removing object from node
				
				if ( nodeRemovedFrom instanceof _Octree.Instance ) {
					
					break;
					
				}
				
			}
			
		}
		
		return nodeRemovedFrom;
		
	}
	
	/*===================================================
    
    morph
    
    =====================================================*/
	
	function morph_check () {
		
		// if object count above max
		
		if ( this.objects.length > this.objectsMax && this.objectsMax > 0 ) {
			
			morph.call( this );
			
		}
		
	}
	
	function morph () {
		
		var objectsGrow = [],
			objectsSplit = [],
			objectsRemaining = [];
		
		// for each object
		
		for ( i = 0, l = this.objects.length; i < l; i++ ) {
			
			object = this.objects[ i ];
			
			// get object octant index
			
			octantIndex = octant_index.call( this, object );
			
			// if lies within octant
			if ( octantIndex > -1 ) {
				
				objectsSplit.push( object );
			
			}
			// if lies outside radius
			else if ( octantIndex === -1 ) {
				
				objectsGrow.push( object );
				
			}
			// else if lies across bounds between octants
			else {
				
				objectsRemaining.push( object );
				
			}
			
		}
		
		// if has objects to split
		
		if ( objectsSplit.length > 0) {
			
			objectsRemaining = objectsRemaining.concat( split.call( this, objectsSplit ) );
			
		}
		
		//
		//
		// TODO: if has objects to grow
		
		if ( objectsGrow.length > 0) {
			
			objectsRemaining = objectsRemaining.concat( objectsGrow );
			
		}
		
		// store remaining
		
		this.objects = objectsRemaining;
		
	}
	
	/*===================================================
    
    split
    
    =====================================================*/
	
	function split ( objects ) {
		
		var i, l,
			octantIndex,
			object,
			node,
			objectsRemaining;
		
		// if not at max depth
		
		if ( this.depthMax < 0 || this.depth < this.depthMax ) {
			
			objects = objects || this.objects;
			
			objectsRemaining = [];
			
			// for each object
			
			for ( i = 0, l = objects.length; i < l; i++ ) {
				
				object = objects[ i ];
				
				// get object octant index
				
				octantIndex = octant_index.call( this, object );
				
				// if object contained by octant, branch this tree
				
				if ( octantIndex > -1 ) {
					
					node = branch.call( this, octantIndex );
					
					add_object.call( node, object );
					
				}
				// else add to remaining
				else {
					
					objectsRemaining.push( object );
					
				}
				
			}
			
			// if split all objects, set remaining as new objects
			
			if ( objects === this.objects ) {
				
				this.objects = objectsRemaining;
				
			}
			
		}
		else {
			
			objectsRemaining = this.objects;
			
		}
		
		return objectsRemaining;
		
	}
	
	function branch ( octantIndex ) {
		
		var node,
			offset,
			radius,
			position;
		
		// node exists
		
		if ( this.nodesByIndex[ octantIndex ] instanceof _Octree.Instance ) {
			
			node = this.nodesByIndex[ octantIndex ];
			
		}
		// create new
		else {
			
			// properties
			
			radius = this.radius * 0.5;
			offset = this.utilVec31Branch.set( octantIndex & 1 ? radius : -radius, octantIndex & 2 ? radius : -radius, octantIndex & 4 ? radius : -radius );
			position = new THREE.Vector3().add( this.position, offset );
			
			// node
			
			node = new _Octree.Instance( {
				parent: this,
				position: position,
				radius: radius,
				octantIndex: octantIndex,
				depthMax: this.depthMax,
				objectsMax: this.objectsMax,
				objectsMin: this.objectsMin
			} );
			
			// store
			
			add_octree.call( this, node, octantIndex );
		
		}
		
		return node;
		
	}
	
	/*===================================================
    
    merge
    
    =====================================================*/
	
	function merge_check () {
		
		var nodeParent = this,
			nodeMerge;
		
		// traverse up tree as long as node + entire subtree's object count is under minimum
		
		while ( nodeParent.parent instanceof _Octree.Instance && nodeParent.object_count_end() < nodeParent.objectsMin ) {
			
			nodeMerge = nodeParent;
			nodeParent = nodeParent.parent;
			
		}
		
		// if parent node is not this, merge entire subtree into merge node
		
		if ( nodeParent !== this ) {
			
			merge.call( nodeMerge );
			
		}
		
	}
	
	function merge () {
		
		var objects = [];
		
		// gather self + entire subtree's objects
		
		objects = objects_end.call( this );
		
		// reset self + entire subtree
		
		this.reset( true );
		
		// if gathered at least 1 object, set as own 
		
		if ( objects.length > 0 ) {
			
			this.objects = objects;
			
		}
		// else remove from parent
		else if ( this.parent instanceof _Octree.Instance ) {
			
			remove_octree_by_index.call( this.parent, this.octantIndex, this );
			
		}
		
	}
	
	/*===================================================
    
    grow
    
    =====================================================*/
	
	function grow () {
		
		
		
	}
	
	/*===================================================
    
    shrink
    
    =====================================================*/
	
	function shrink () {
		
		
		
	}
	
	/*===================================================
    
    traversal
    
    =====================================================*/
	
	function objects_end ( depth, objects ) {
		
		var i, l,
			node;
		
		objects = ( objects || [] ).concat( this.objects );
		
		depth = main.is_number( depth ) ? depth : -1;
		
		if ( depth !== 0 ) {
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				node = this.nodesByIndex[ this.nodesIndices[ i ] ];
				
				objects = objects_end.call( node, depth - 1, objects );
				
			}
			
		}
		
		return objects;
		
	}
	
	function object_count_end () {
		
		var i, l,
			count = this.objects.length;
		
		for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
			
			count += this.nodesByIndex[ this.nodesIndices[ i ] ].object_count_end();
			
		}
		
		return count;
		
	}
	
	function object_count_limited ( depth, excludeSelf ) {
		
		var i, l,
			count = excludeSelf === true ? 0 : this.objects.length;
		
		if ( depth > 0 ) {
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				count += this.nodesByIndex[ this.nodesIndices[ i ] ].object_count_limited( depth - 1 );
				
			}
			
		}
		
		return count;
		
	}
	
	function object_count_start () {
		
		var count = this.objects.length,
			parent = this.parent;
		
		while( parent instanceof _Octree.Instance ) {
			
			count += parent.objects.length;
			parent = parent.parent;
			
		}
		
		return count;
		
	}
	
	/*===================================================
    
    octant
    
    =====================================================*/
	
	function octant_index ( object ) {
		
		var i, l,
			position,
			scale,
			radius,
			deltaX, deltaY, deltaZ,
			distX, distY, distZ,
			index = 0;
		
		// handle object type
		
		if ( object instanceof THREE.Object3D ) {
			
			position = object.position;
			scale = object.scale;
			radius = object.geometry.boundingSphere.radius * Math.max( scale.x, scale.y, scale.z );
			
		}
		else if ( object instanceof _Octree.Instance ) {
			
			position = object.position;
			radius = 0;//object.radius;
			
		}
		
		// find delta and distance
		
		deltaX = position.x - this.position.x;
		deltaY = position.y - this.position.y;
		deltaZ = position.z - this.position.z;
		
		distX = Math.abs( deltaX );
		distY = Math.abs( deltaY );
		distZ = Math.abs( deltaZ );
		
		// x
		
		// outside
		if ( distX + radius > this.radius ) {
			
			return -1;
			
		}
		// across
		else if ( distZ < radius ) {
			
			return -2;
			
		}
		// in octant
		else if ( deltaX > 0 ) {
			
			index = index | 1;
			
		}
		
		// y
		
		// outside
		if ( distY + radius > this.radius ) {
			
			return -1;
			
		}
		// across
		else if ( distX < radius ) {
			
			return -2;
			
		}
		// in octant
		else if ( deltaY > 0 ) {
			
			index = index | 2;
			
		}
		
		// z
		
		// outside
		if ( distZ + radius > this.radius ) {
			
			return -1;
			
		}
		// across
		else if ( distY < radius ) {
			
			return -2;
			
		}
		// in octant
		else if ( deltaZ > 0 ) {
			
			index = index | 4;
			
		}
		
		return index;
		
	}
	
	/*===================================================
    
    search
    
    =====================================================*/
	
	function search ( position, radius ) {
		
		
		
	}
	
} (KAIOPUA) );