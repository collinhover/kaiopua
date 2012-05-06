/*
 *
 * Octree.js
 * 3D spatial representation structure for fast searches.
 * 
 * based on Octree by Marek Pawlowski @ pawlowski.it
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Octree.js",
		_Octree = {},
		_Octant,
		octreeCount = 0,
		depthMax = 10,
		objectsMax = 16,
		objectsMin = 8;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Octree,
		requirements: [
			"assets/modules/core/Octant.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( o ) {
		console.log('internal octree', _Octree);
		
		_Octant = o;
		
		_Octree.Instance = Octree;
		
		_Octree.Instance.prototype.reset = reset;
		_Octree.Instance.prototype.add = add;
		_Octree.Instance.prototype.remove = remove;
		_Octree.Instance.prototype.search = search;
		_Octree.Instance.prototype.object_count_down = object_count_down;
		_Octree.Instance.prototype.object_count_up = object_count_up;
		
		Object.defineProperty( _Octree.Instance.prototype, 'parent', { 
			get : function () { return this._parent; },
			set : function ( parent ) {
				
				// store new parent
				
				this._parent = parent;
				
				// update properties
				
				if ( this._parent instanceof _Octree.Instance ) {
					
					this.depth = this._parent.depth + 1;
					
				}
				else {
					
					this.depth = 0;
					
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
		this.parent = parameters.parent;
		
		this.center = parameters.center instanceof THREE.Vector3 ? parameters.center : new THREE.Vector3();
		this.radius = main.is_number( parameters.radius ) ? parameters.radius : 0;
		
		this.depthMax = main.is_number( parameters.depthMax ) ? parameters.depthMax : depthMax;
		this.objectsMax = main.is_number( parameters.objectsMax ) ? parameters.objectsMax : objectsMax;
		this.objectsMin = main.is_number( parameters.objectsMin ) ? parameters.objectsMin : objectsMin;
		
		this.reset();
		
	}
	
	function reset ( cascade ) {
		
		var i, l,
			node,
			nodesIndices = this.nodesIndices,
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
	
	function add () {
		
		var i, l,
			argument,
			index;
		
		// for each argument
		
		for ( i = 0, l = arguments.length; i < l; i++ ) {
			
			argument = arguments[ i ];
			
			// if is octree, assume next is index
			
			if ( argument instanceof _Octree.Instance ) {
				
				index = arguments[ i + 1 ];
				
				if ( main.is_number( index ) ) {
					
					add_octree.call( this, argument, index );
				
				}
				
			}
			// all other considered objects
			else {
				
				add_object.call( this, argument );
				
			}
			
		}
		
	}
	
	function remove () {
		
		var i, l,
			argument;
		
		// for each argument
		
		for ( i = 0, l = arguments.length; i < l; i++ ) {
			
			argument = arguments[ i ];
			
			// is octree
			
			if ( argument instanceof _Octree.Instance ) {
				
				remove_octree.call( this, argument );
				
			}
			// all other considered objects
			else {
				
				remove_object.call( this, argument );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    add / remove internal
    
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
	
	function add_object ( object ) {
		
		if ( this.objects.indexOf( object ) === -1 ) {
		
			this.objects.push( object );
			
		}
		
		// is object count at max
		
		if ( this.objects.length >= this.objectsMax ) {
			
			split.call( this );
			
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
		
		// is object count at min
		
		if ( removed === true && this.parent instanceof _Octree.Instance && this.objects.length < this.objectsMin ) {
			
			merge.call( this );
			
		}
		
		return removed;
		
	}
	
	/*===================================================
    
    split
    
    =====================================================*/
	
	function split () {
		
		var i, l,
			octant,
			node;
		
		// for each node
		
		
		
		// get object octant
		
		octant = octant.call( this, object );
		
		// if octant can contain object
		
		if ( octant !== -1 ) {
			
			node = branch.call( this, octant );
			
		}
		
	}
	
	function branch ( index ) {
		
		var node,
			offset,
			radius,
			center;
		
		// node exists
		
		if ( this.nodesByIndex[ index ] instanceof _Octree.Instance ) {
			
			node = this.nodesByIndex[ index ];
			
		}
		// create new
		else if ( this.depth < this.depthMax ) {
			
			// properties
			
			radius = this.radius * 0.5;
			offset = this.utilVec31Branch.set( index & 1 ? radius : -radius, index & 2 ? radius : -radius, index & 4 ? radius : -radius );
			center = new THREE.Vector3().add( this.center, offset );
			
			// node
			
			node = new _Octree.Instance( {
				parent: this,
				center: center,
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
	
	function merge ( objects ) {
		
		objects = objects || this.objects;
		
		// if safe to merge
		
		if ( objects.length + this.parent.objects.length < this.parent.objectsMax ) {
			
			merge.call( this.parent, objects );
			
		}
		else {
			
			
			
		}
		
	}
	
	function object_count_down ( depth ) {
		
		var i, l,
			count = this.objects.length;
		
		depth = main.is_number( depth ) ? depth : -1;
		
		if ( depth !== 0 ) {
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				count += this.nodesByIndex[ this.nodesIndices[ i ] ].object_count_down( depth-- );
				
			}
			
		}
		
		return count;
		
	}
	
	function object_count_up ( depth ) {
		
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
		
		delta = position.x - this.center.x;
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
		
		delta = position.y - this.center.y;
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
		
		delta = position.z - this.center.z;
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
	
	function search ( center, radius ) {
		
		
		
	}
	
} (KAIOPUA) );