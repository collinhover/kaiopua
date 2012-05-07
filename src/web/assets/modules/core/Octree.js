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
		objectsMin = 0;
	
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
		_Octree.Instance.prototype.object_count_start = object_count_start;
		
		_Octree.Instance.prototype.to_string = function ( space ) {
			
			var i, l,
				node,
				spaceAddition = '   ';
			
			space = typeof space === 'string' ? space : spaceAddition;
			
			console.log( ( this.parent ? space + ' octree NODE > ' : ' octree ROOT > ' ), this, ' // position: ', this.position.x, this.position.y, this.position.z, ' // radius: ', this.radius, ' // depth: ', this.depth );
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
			element,
			index;
		
		// handle elements
		
		elements = main.ensure_array( elements );
		
		// for each element
		
		for ( i = 0, l = elements.length; i < l; i++ ) {
			
			element = elements[ i ];
			
			// if is octree, assume next is index
			
			if ( element instanceof _Octree.Instance ) {
				
				index = elements[ i + 1 ] || 0;
				
				if ( main.is_number( index ) ) {
					
					add_octree.call( this, element, index );
				
				}
				
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
	
	function add_octree ( octree, index ) {
		
		if ( this.nodesIndices.indexOf( index ) === -1 ) {
			
			this.nodesIndices.push( index );
			
		}
		
		this.nodesByIndex[ index ] = octree;
		
		if ( octree.parent !== this ) {
			
			octree.parent = this;
			
		}
		
	}
	
	function remove_octree ( identifier, octree ) {
		
		var index = -1,
			nodeIndex;
		
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
	
	function remove_octree_by_index ( index, octree ) {
		
		octree = octree || this.nodesByIndex[ index ];
		
		this.nodesIndices.slice( index, 1 );
		
		delete this.nodesByIndex[ index ];
		
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
		
		// if no nodes, add to self
		
		if ( this.nodesIndices.length === 0 ) {
			
			if ( this.objects.indexOf( object ) === -1 ) {
			
				this.objects.push( object );
				
			}
			
			// is object count at max
			
			if ( this.objects.length > this.objectsMax && this.objectsMax > 0 ) {
				
				split.call( this );
				
			}
			
		}
		// else try to add to nodes
		else {
			
			// get object octant index
			
			octantIndex = octant.call( this, object );
			
			// if object contained by octant, add to node at octant
			
			if ( octantIndex !== -1 ) {
				
				node = branch.call( this, octantIndex );
				
				add_object.call( node, object );
				
			}
			// else add to self
			else {
				
				if ( this.objects.indexOf( object ) === -1 ) {
				
					this.objects.push( object );
					
				}
				
			}
			
		}
		
	}
	
	function remove_object ( object ) {
		
		var i, l,
			index,
			node,
			removed = false;
		
		// if is part of this objects
		
		index = this.objects.indexOf( object );
		
		if ( index !== -1 ) {
		
			this.objects.slice( index, 1 );
			
			removed = true;
			
			merge_check.call( this );
			
		}
		// if not removed, search nodes
		else {
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				node = this.nodesByIndex[ this.nodesIndices[ i ] ];
				
				if ( node.remove_object( object ) ) {
					
					removed = true;
					
					break;
					
				}
				
			}
			
		}
		
		return removed;
		
	}
	
	/*===================================================
    
    split
    
    =====================================================*/
	
	function split () {
		
		var i, l,
			octantIndex,
			object,
			node,
			remainder = [];
		
		// if not at max depth
		
		if ( this.depthMax < 0 || this.depth < this.depthMax ) {
			
			// for each object
			
			for ( i = 0, l = this.objects.length; i < l; i++ ) {
				
				object = this.objects[ i ];
				
				// get object octant index
				
				octantIndex = octant.call( this, object );
				
				// if object contained by octant, branch this tree
				
				if ( octantIndex !== -1 ) {
					
					node = branch.call( this, octantIndex );
					
					add_object.call( node, object );
					
				}
				// else add to remainder
				else {
					
					remainder.push( object );
					
				}
				
			}
			
			// set remainder as new objects
			
			this.objects = remainder;
			
		}
		
	}
	
	function branch ( index ) {
		
		var node,
			offset,
			radius,
			position;
		
		// node exists
		
		if ( this.nodesByIndex[ index ] instanceof _Octree.Instance ) {
			
			node = this.nodesByIndex[ index ];
			
		}
		// create new
		else {
			
			// properties
			
			radius = this.radius * 0.5;
			offset = this.utilVec31Branch.set( index & 1 ? radius : -radius, index & 2 ? radius : -radius, index & 4 ? radius : -radius );
			position = new THREE.Vector3().add( this.position, offset );
			
			// node
			
			node = new _Octree.Instance( {
				parent: this,
				position: position,
				radius: radius,
				depthMax: this.depthMax,
				objectsMax: this.objectsMax,
				objectsMin: this.objectsMin
			} );
			
			// store
			
			add_octree.call( this, node, index );
		
		}
		
		return node;
		
	}
	
	/*===================================================
    
    merge
    
    =====================================================*/
	
	function merge_check () {
		
		var nodeEnd = this;
		
		// check node + entire subtree's object count
		
		while ( this.parent instanceof _Octree.Instance && nodeEnd.object_count_end() < this.objectsMin ) {
			
			nodeEnd = this.parent;
			
		}
		
		// if end node is not this, merge up to end node
		
		if ( nodeEnd !== this ) {
			
			merge.call( nodeEnd );
			
		}
		
	}
	
	function merge () {
		
		var i, l,
			node,
			initiator = false;
		
		// handle objects
		
		if ( typeof objects === 'undefined' ) {
			
			objects = [];
			
		}
		
		// gather own + entire subtree's objects
		
		objects = objects_end.call( this );
		
		// reset self + entire subtree
		
		this.reset( true );
		
		// restore objects
		
		this.objects = objects;
		
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
				
				objects = node.objects_end( depth--, objects );
				
			}
			
		}
		
		return objects;
		
	}
	
	function object_count_end ( depth ) {
		
		var i, l,
			count = this.objects.length;
		
		depth = main.is_number( depth ) ? depth : -1;
		
		if ( depth !== 0 ) {
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				count += this.nodesByIndex[ this.nodesIndices[ i ] ].object_count_end( depth-- );
				
			}
			
		}
		
		return count;
		
	}
	
	function object_count_start ( depth ) {
		
		var count = this.objects.length,
			parent = this.parent;
		
		depth = main.is_number( depth ) ? depth : -1;
		
		while( parent instanceof _Octree.Instance && depth !== 0 ) {
			
			count += parent.objects.length;
			
			depth--;
			
		}
		
		return count;
		
	}
	
	/*===================================================
    
    octant
    
    =====================================================*/
	
	function octant ( object ) {
		
		var i, l,
			position,
			scale,
			radius,
			delta,
			distance,
			index = 0;
		
		// handle object type
		
		if ( object instanceof THREE.Object3D ) {
			
			position = object.position;
			scale = object.scale;
			radius = object.geometry.boundingSphere.radius * Math.max( scale.x, scale.y, scale.z );
			
		}
		
		// x
		
		delta = position.x - this.position.x;
		distance = Math.abs( delta );
		
		// lies across
		if ( distance <= radius ) {
			
			return -1;
			
		}
		// in octant
		else if ( delta > 0 ) {
			
			index = index | 1;
			
		}
		
		// y
		
		delta = position.y - this.position.y;
		distance = Math.abs( delta );
		
		// lies across
		if ( distance <= radius ) {
			
			return -1;
			
		}
		// in octant
		else if ( delta > 0 ) {
			
			index = index | 2;
			
		}
		
		// z
		
		delta = position.z - this.position.z;
		distance = Math.abs( delta );
		
		// lies across
		if ( distance <= radius ) {
			
			return -1;
			
		}
		// in octant
		else if ( delta > 0 ) {
			
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