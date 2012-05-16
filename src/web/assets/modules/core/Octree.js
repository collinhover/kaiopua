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
		objectsThreshold = 8,
		indexInsideCross = -1,
		indexOutsideOffset = 2,
		posX = 0, negX = 1,
		posY = 2, negY = 3,
		posZ = 4, negZ = 5,
		FLAG_POS_X = 1 << 1,
		FLAG_NEG_X = 1 << 2,
		FLAG_POS_Y = 1 << 3,
		FLAG_NEG_Y = 1 << 4,
		FLAG_POS_Z = 1 << 5,
		FLAG_NEG_Z = 1 << 6,
		indexOutsideMap;
	
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
		
		// properties
		
		indexOutsideMap = [];
		indexOutsideMap[ posX ] = { index: posX, count: 0, x: 1, y: 0, z: 0 };
		indexOutsideMap[ negX ] = { index: negX, count: 0, x: -1, y: 0, z: 0 };
		indexOutsideMap[ posY ] = { index: posY, count: 0, x: 0, y: 1, z: 0 };
		indexOutsideMap[ negY ] = { index: negY, count: 0, x: 0, y: -1, z: 0 };
		indexOutsideMap[ posZ ] = { index: posZ, count: 0, x: 0, y: 0, z: 1 };
		indexOutsideMap[ negZ ] = { index: negZ, count: 0, x: 0, y: 0, z: -1 };
		
		// instance
		
		_Octree.Instance = Octree;
		
		_Octree.Instance.prototype.reset = reset;
		_Octree.Instance.prototype.add = add;
		_Octree.Instance.prototype.remove = remove;
		_Octree.Instance.prototype.search = search;
		_Octree.Instance.prototype.depth_end = depth_end;
		_Octree.Instance.prototype.octree_count_end = octree_count_end;
		_Octree.Instance.prototype.object_count_end = object_count_end;
		_Octree.Instance.prototype.object_count_limited = object_count_limited;
		_Octree.Instance.prototype.object_count_start = object_count_start;
		
		_Octree.Instance.prototype.to_string = function ( space ) {
			
			var i, l,
				node,
				spaceAddition = '   ';
			
			space = typeof space === 'string' ? space : spaceAddition;
			
			console.log( ( this.parent ? space + ' octree NODE > ' : ' octree ROOT > ' ), this, ' // id: ', this.id, ' // indexOctant: ', this.indexOctant, ' // position: ', this.position.x, this.position.y, this.position.z, ' // radius: ', this.radius, ' // depth: ', this.depth );
			console.log( ( this.parent ? space + ' ' : ' ' ), '+ objects ( ', this.objects.length, ' ) ', this.objects );
			console.log( ( this.parent ? space + ' ' : ' ' ), '+ children ( ', this.nodesIndices.length, ' )', this.nodesIndices, this.nodesByIndex );
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				node = this.nodesByIndex[ this.nodesIndices[ i ] ];
				
				node.to_string( space + spaceAddition );
				
			}
			
		};
		
		Object.defineProperty( _Octree.Instance.prototype, 'root', { 
			get : function () { return this._root; },
			set : function ( root ) {
				
				var i, l,
					node,
					rootPrev = this._root;
				
				// store new root
				
				this._root = root instanceof _Octree.Instance ? root : this;
				
				// update properties
				
				if ( this._parent instanceof _Octree.Instance ) {
					
					this.depth = this._parent.depth + 1;
					
				}
				else {
					
					this.depth = 0;
					
				}
				
				// update children
				
				for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
					
					node = this.nodesByIndex[ this.nodesIndices[ i ] ];
					
					node.root = this._root;
					
				}
				
			}
		} );
		
		Object.defineProperty( _Octree.Instance.prototype, 'parent', { 
			get : function () { return this._parent; },
			set : function ( parent ) {
				
				var rootPrev = this.root;
				
				// store new parent
				
				if ( parent !== this ) {
					
					this._parent = parent;
					
				}
				
				// update properties
				
				if ( this._parent instanceof _Octree.Instance ) {
					
					if ( this.root !== this._parent.root ) {
						
						this.root = this._parent.root;
					
					}
					
				}
				else if ( this.root !== this ) {
					
					this.root = this;
					
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
		this.utilVec31Expand = new THREE.Vector3();
		this.utilVec31Search = new THREE.Vector3();
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.id = octreeCount;
		
		this.position = parameters.position instanceof THREE.Vector3 ? parameters.position : new THREE.Vector3();
		this.radius = main.is_number( parameters.radius ) ? parameters.radius : 0;
		this.indexOctant = parameters.indexOctant;
		
		// TEST
		this.scene = parameters.scene;
		this.visual = new THREE.Mesh( new THREE.CubeGeometry( this.radius * 2, this.radius * 2, this.radius * 2 ), new THREE.MeshLambertMaterial( { color: 0xFF0000, wireframe: true, wireframeLinewidth: 10 } ) );
		this.visual.position.copy( this.position );
		if ( this.scene ) {
			this.scene.add( this.visual );
		}
		// TEST
		
		this.depthMax = main.is_number( parameters.depthMax ) ? parameters.depthMax : depthMax;
		this.objectsThreshold = main.is_number( parameters.objectsThreshold ) ? parameters.objectsThreshold : objectsThreshold;
		
		this.reset();
		
		this.parent = parameters.parent;
		
	}
	
	function reset ( cascade, removeVisual ) {
		
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
				
				node.reset( cascade, removeVisual );
				
			}
			
		}
		
		// TEST
		if ( removeVisual === true && this.scene ) {
			this.scene.remove( this.visual );
		}
		// TEST
	}
	
	/*===================================================
    
    add / remove external
    
    =====================================================*/
	
	function add ( elements ) {
		
		var i, l,
			element,
			root;
		
		// if is root
		
		if ( this.root === this ) {
			
			root = this;
			
			// handle elements
			
			elements = main.ensure_array( elements );
			
			// for each element
			
			for ( i = 0, l = elements.length; i < l; i++ ) {
				
				element = elements[ i ];
				
				// if is octree
				
				if ( element instanceof _Octree.Instance ) {
						
					add_octree.call( root, element );
					
				}
				// all other considered objects
				else {
					
					root = add_object.call( root, element ) || root;
					
				}
				
			}
			
			// return root in case of expand/contract
			
			return root;
			
		}
		// else pass elements to root
		else {
			
			return this.root.add( elements );
			
		}
		
	}
	
	function remove ( elements ) {
		
		var i, l,
			element,
			root;
		
		// if is root
		
		if ( this.root === this ) {
			
			root = this;
		
			// handle elements
			
			elements = main.ensure_array( elements );
			
			// for each argument
			
			for ( i = 0, l = elements.length; i < l; i++ ) {
				
				element = elements[ i ];
				
				// is octree
				
				if ( element instanceof _Octree.Instance ) {
					
					remove_octree.call( root, element );
					
				}
				// all other considered objects
				else {
					
					root = remove_object.call( root, element ) || root;
					
				}
				
			}
			
			// return root in case of expand/contract
			
			return root;
			
		}
		// else pass elements to root
		else {
			
			return this.root.remove( elements );
			
		}
		
	}
	
	/*===================================================
    
    octree add / remove
    
    =====================================================*/
	
	function add_octree ( octree, indexOctant ) {
		
		indexOctant = octree.indexOctant = main.is_number( indexOctant ) ? indexOctant : main.is_number( octree.indexOctant ) ? octree.indexOctant : octant_index.call( this, octree );
		
		if ( this.nodesIndices.indexOf( indexOctant ) === -1 ) {
			
			this.nodesIndices.push( indexOctant );
			
		}
		
		this.nodesByIndex[ indexOctant ] = octree;
		
		if ( octree.parent !== this ) {
			
			octree.parent = this;
			
		}
		
	}
	
	function remove_octree ( identifier ) {
		
		var indexOctant = -1,
			index,
			octree;
		
		// if identifier is octree
		if ( identifier instanceof _Octree.Instance && this.nodesByIndex[ identifier.indexOctant ] === identifier ) {
			
			octree = identifier;
			indexOctant = octree.indexOctant;
			
		}
		// if identifier is number
		else if ( main.is_number( identifier ) ) {
			
			indexOctant = identifier;
			
		}
		// else search all nodes for identifier (slow)
		else {
			
			for ( index in this.nodesByIndex ) {
				
				octree = this.nodesByIndex[ index ];
				
				if ( octree === identifier ) {
					
					indexOctant = index;
					
					break;
					
				}
				
			}
			
		}
		
		// if indexOctant found
		
		if ( indexOctant !== -1 ) {
			
			index = this.nodesIndices.indexOf( indexOctant );
			
			this.nodesIndices.splice( index, 1 );
			
			octree = octree || this.nodesByIndex[ indexOctant ];
			
			delete this.nodesByIndex[ indexOctant ];
			
			if ( octree.parent === this ) {
				
				octree.parent = undefined;
				
			}
			
		}
		
	}
	
	/*===================================================
    
    objects add / remove
    
    =====================================================*/
	
	function add_object ( object ) {
		
		var indexOctant,
			node;
		
		// get object octant index
		
		indexOctant = octant_index.call( this, object );
		
		// if object fully contained by an octant, add to subtree
		if ( indexOctant > -1 && this.nodesIndices.length > 0 ) {
			
			node = branch.call( this, indexOctant );
			
			return add_object.call( node, object );
			
		}
		// if object lies outside bounds, add to parent node
		else if ( indexOctant < -1 && this.parent instanceof _Octree.Instance ) {
			
			return add_object.call( this.parent, object );
			
		}
		// else add to self
		else {
			
			if ( this.objects.indexOf( object ) === -1 ) {
				
				this.objects.push( object );
				
			}
			
			// check if need to expand, split, or both
			
			return grow_check.call( this );
			
		}
		
	}
	
	function remove_object ( object ) {
		
		var nodeRemovedFrom;
		
		// cascade through tree to find and remove object
		
		nodeRemovedFrom = remove_object_end.call( this, object );
		
		// if object removed, try to shrink the node it was removed from
		
		if ( nodeRemovedFrom instanceof _Octree.Instance ) {
			
			return shrink.call( nodeRemovedFrom );
			//return merge_check.call( nodeRemovedFrom );
			
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
    
    grow
    
    =====================================================*/
	
	function grow_check () {
		
		// if object count above max
		
		if ( this.objects.length > this.objectsThreshold && this.objectsThreshold > 0 ) {
			
			return grow.call( this );
			
		}
		
	}
	
	function grow () {
		
		var objectsExpand = [],
			objectsExpandOctants = [],
			objectsSplit = [],
			objectsSplitOctants = [],
			objectsRemaining = [];
		
		// for each object
		
		for ( i = 0, l = this.objects.length; i < l; i++ ) {
			
			object = this.objects[ i ];
			
			// get object octant index
			
			indexOctant = octant_index.call( this, object );
			
			// if lies within octant
			if ( indexOctant > -1 ) {
				
				objectsSplit.push( object );
				objectsSplitOctants.push( indexOctant );
			
			}
			// if lies outside radius
			else if ( indexOctant < -1 ) {
				
				objectsExpand.push( object );
				objectsExpandOctants.push( indexOctant );
				
			}
			// else if lies across bounds between octants
			else {
				
				objectsRemaining.push( object );
				
			}
			
		}
		
		// if has objects to split
		
		if ( objectsSplit.length > 0) {
			
			objectsRemaining = objectsRemaining.concat( split.call( this, objectsSplit, objectsSplitOctants ) );
			
		}
		
		// if has objects to expand
		
		if ( objectsExpand.length > 0) {
			
			objectsRemaining = objectsRemaining.concat( expand.call( this, objectsExpand, objectsExpandOctants ) );
			
		}
		
		// store remaining
		
		this.objects = objectsRemaining;
		
		// merge check
		
		return merge_check.call( this );
		
	}
	
	/*===================================================
    
    shrink
    
    =====================================================*/
	
	function shrink () {
		
		var root;
		
		// merge check
		
		root = merge_check.call( this );
		
		// contract check
		
		return contract_check.call( root || this.root );
		
	}
	
	/*===================================================
    
    split
    
    =====================================================*/
	
	function split ( objects, octants ) {
		
		var i, l,
			indexOctant,
			object,
			node,
			objectsRemaining;
		
		// if not at max depth
		
		if ( this.depthMax < 0 || this.depth < this.depthMax ) {
			
			objects = objects || this.objects;
			
			octants = octants || [];
			
			objectsRemaining = [];
			
			// for each object
			
			for ( i = 0, l = objects.length; i < l; i++ ) {
				
				object = objects[ i ];
				
				// get object octant index
				
				indexOctant = main.is_number( octants[ i ] ) ? octants[ i ] : octant_index.call( this, object );
				
				// if object contained by octant, branch this tree
				
				if ( indexOctant > -1 ) {
					
					node = branch.call( this, indexOctant );
					
					add_object.call( node, object );
					
				}
				// else add to remaining
				else {
					
					objectsRemaining.push( object );
					
				}
				
			}
			
			// if all objects, set remaining as new objects
			
			if ( objects === this.objects ) {
				
				this.objects = objectsRemaining;
				
			}
			
		}
		else {
			
			objectsRemaining = this.objects;
			
		}
		
		return objectsRemaining;
		
	}
	
	function branch ( indexOctant ) {
		
		var node,
			offset,
			radius,
			position;
		
		// node exists
		
		if ( this.nodesByIndex[ indexOctant ] instanceof _Octree.Instance ) {
			
			node = this.nodesByIndex[ indexOctant ];
			
		}
		// create new
		else {
			
			// properties
			
			radius = this.radius * 0.5;
			offset = this.utilVec31Branch.set( indexOctant & 1 ? radius : -radius, indexOctant & 2 ? radius : -radius, indexOctant & 4 ? radius : -radius );
			position = new THREE.Vector3().add( this.position, offset );
			
			// node
			
			node = new _Octree.Instance( {
				scene: this.scene,
				parent: this,
				position: position,
				radius: radius,
				indexOctant: indexOctant,
				depthMax: this.depthMax,
				objectsThreshold: this.objectsThreshold
			} );
			
			// store
			
			add_octree.call( this, node, indexOctant );
		
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
		
		while ( nodeParent.parent instanceof _Octree.Instance && nodeParent.object_count_end() <= nodeParent.objectsThreshold ) {
			
			nodeMerge = nodeParent;
			nodeParent = nodeParent.parent;
			
		}
		
		// if parent node is not this, merge entire subtree into merge node
		
		if ( nodeParent !== this ) {
			
			return merge.call( nodeParent, nodeMerge );
			
		}
		else {
			
			return this.root;
			
		}
		
	}
	
	function merge ( nodes ) {
		
		var i, l,
			node;
		
		// handle nodes
		
		nodes = main.ensure_array( nodes );
		
		for ( i = 0, l = nodes.length; i < l; i++ ) {
			
			node = nodes[ i ];
			
			// gather node + all subtree objects
			
			this.objects = this.objects.concat( objects_end.call( node ) );
			
			// reset node + entire subtree
			
			node.reset( true, true );
			
			// remove node
			
			remove_octree.call( this, node.indexOctant, node );
			
		}
		
		// merge check
		
		return merge_check.call( this );
		
	}
	
	/*===================================================
    
    expand
    
    =====================================================*/
	
	function expand ( objects, octants ) {
		
		var i, l,
			object,
			objectsRemaining,
			objectsExpand,
			indexOctant,
			flagsOutside,
			indexOutside,
			indexOctantInverse,
			iom = indexOutsideMap,
			indexOutsideCounts,
			infoIndexOutside1,
			infoIndexOutside2,
			infoIndexOutside3,
			indexOutsideBitwise1,
			indexOutsideBitwise2,
			infoPotential1,
			infoPotential2,
			infoPotential3,
			indexPotentialBitwise1,
			indexPotentialBitwise2,
			octantX, octantY, octantZ,
			radius,
			offset = this.utilVec31Expand,
			position,
			parent;
		
		// handle max depth down tree
		
		if ( this.depthMax < 0 || this.depth_end() < this.depthMax ) {
			
			objects = objects || this.objects;
			octants = octants || [];
			
			objectsRemaining = [];
			objectsExpand = [];
			
			iom[ posX ].count = iom[ negX ].count = iom[ posY ].count = iom[ negY ].count = iom[ posZ ].count = iom[ negZ ].count = 0;
			
			// for all outside objects, find outside octants containing most objects
			
			for ( i = 0, l = objects.length; i < l; i++ ) {
				
				object = objects[ i ];
				
				// get object octant index
				
				indexOctant = main.is_number( octants[ i ] ) ? octants[ i ] : octant_index.call( this, object );
				
				// if object outside this, include in calculations
				
				if ( indexOctant < -1 ) {
					
					// convert octant index to outside flags
					
					flagsOutside = -indexOctant - indexOutsideOffset;
					
					// check against bitwise flags
					
					// x
					
					if ( flagsOutside & FLAG_POS_X ) {
						
						iom[ posX ].count++;
						
					}
					else if ( flagsOutside & FLAG_NEG_X ) {
						
						iom[ negX ].count++;
						
					}
					
					// y
					
					if ( flagsOutside & FLAG_POS_Y ) {
						
						iom[ posY ].count++;
						
					}
					else if ( flagsOutside & FLAG_NEG_Y ) {
						
						iom[ negY ].count++;
						
					}
					
					// z
					
					if ( flagsOutside & FLAG_POS_Z ) {
						
						iom[ posZ ].count++;
						
					}
					else if ( flagsOutside & FLAG_NEG_Z ) {
						
						iom[ negZ ].count++;
						
					}
					
					// store in expand list
					
					objectsExpand.push( object );
					
				}
				// else add to remaining
				else {
					
					objectsRemaining.push( object );
					
				}
				
			}
			
			// if objects to expand
			
			if ( objectsExpand.length > 0 ) {
				
				// shallow copy index outside map
				
				indexOutsideCounts = iom.slice( 0 );
				
				// sort outside index count so highest is first
				
				indexOutsideCounts.sort( function ( a, b ) {
					
					return b.count - a.count;
					
				} );
				
				// get highest outside indices
				
				// first is first
				infoIndexOutside1 = indexOutsideCounts[ 0 ];
				indexOutsideBitwise1 = infoIndexOutside1.index | 1;
				
				// second is ( one of next two bitwise OR 1 ) that is not opposite of ( first bitwise OR 1 )
				
				infoPotential1 = indexOutsideCounts[ 1 ];
				infoPotential2 = indexOutsideCounts[ 2 ];
				
				infoIndexOutside2 = ( infoPotential1.index | 1 ) !== indexOutsideBitwise1 ? infoPotential1 : infoPotential2;
				indexOutsideBitwise2 = infoIndexOutside2.index | 1;
				
				// third is ( one of next three bitwise OR 1 ) that is not opposite of ( first or second bitwise OR 1 )
				
				infoPotential1 = indexOutsideCounts[ 2 ];
				infoPotential2 = indexOutsideCounts[ 3 ];
				infoPotential3 = indexOutsideCounts[ 4 ];
				
				indexPotentialBitwise1 = infoPotential1.index | 1;
				indexPotentialBitwise2 = infoPotential2.index | 1;
				
				infoIndexOutside3 = indexPotentialBitwise1 !== indexOutsideBitwise1 && indexPotentialBitwise1 !== indexOutsideBitwise2 ? infoPotential1 : indexPotentialBitwise2 !== indexOutsideBitwise1 && indexPotentialBitwise2 !== indexOutsideBitwise2 ? infoPotential2 : infoPotential3;
				
				// get this octant normal based on outside octant indices
				
				octantX = infoIndexOutside1.x + infoIndexOutside2.x + infoIndexOutside3.x;
				octantY = infoIndexOutside1.y + infoIndexOutside2.y + infoIndexOutside3.y;
				octantZ = infoIndexOutside1.z + infoIndexOutside2.z + infoIndexOutside3.z;
				
				// get this octant indices based on octant normal
				
				indexOctant = octant_index_from_xyz( octantX, octantY, octantZ );
				indexOctantInverse = octant_index_from_xyz( -octantX, -octantY, -octantZ );
				
				// properties
				
				radius = this.radius;
				offset.set( indexOctant & 1 ? radius : -radius, indexOctant & 2 ? radius : -radius, indexOctant & 4 ? radius : -radius );
				position = new THREE.Vector3().add( this.position, offset );
				
				// parent
				
				parent = new _Octree.Instance( {
					scene: this.scene,
					position: position,
					radius: this.radius * 2,
					depthMax: this.depthMax,
					objectsThreshold: this.objectsThreshold
				} );
				
				// set self as node of parent
				
				add_octree.call( parent, this, indexOctantInverse );
				
				// add all expand objects to parent
				
				parent.add( objectsExpand );
				
			}
			
			// if all objects, set remaining as new objects
			
			if ( objects === this.objects ) {
				
				this.objects = objectsRemaining;
				
			}
			
		}
		else {
			
			objectsRemaining = objects;
			
		}
		
		return objectsRemaining;
		
	}
	
	/*===================================================
    
    contract
    
    =====================================================*/
	
	function contract_check () {
		
		var i, l,
			node,
			nodeObjectsCount,
			nodeHeaviest,
			nodeHeaviestObjectsCount,
			outsideHeaviestObjectsCount;
		
		// if is root
		
		if ( this.root === this ) {
			
			// find node with highest object count
			
			if ( this.nodesIndices.length > 0 ) {
				
				nodeHeaviestObjectsCount = 0;
				outsideHeaviestObjectsCount = this.objects.length;
				
				for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
					
					node = this.nodesByIndex[ this.nodesIndices[ i ] ];
					
					nodeObjectsCount = node.object_count_end();
					outsideHeaviestObjectsCount += nodeObjectsCount;
					
					if ( nodeHeaviest instanceof _Octree.Instance === false || nodeObjectsCount > nodeHeaviestObjectsCount ) {
						
						nodeHeaviest = node;
						nodeHeaviestObjectsCount = nodeObjectsCount;
						
					}
					
				}
				
				// subtract heaviest count from outside count
				
				outsideHeaviestObjectsCount -= nodeHeaviestObjectsCount;
				//console.log( this, this.id, ' CONTRACT? nodeHeaviestObjectsCount = ', nodeHeaviestObjectsCount, ' // outsideHeaviestObjectsCount = ', outsideHeaviestObjectsCount );
				// if should contract
				
				if ( outsideHeaviestObjectsCount <= this.objectsThreshold && nodeHeaviest instanceof _Octree.Instance ) {
					
					return contract.call( this, nodeHeaviest );
					
				}
				
			}
			//console.log( this, this.id, ' contract checked and not needed' );
			return this;
			
		}
		// else start check at root
		else {
			
			return contract_check.call( this.root );
			
		}
		
	}
	
	function contract ( nodeRoot ) {
		//console.log( this, this.id, ' CONTRACT into ', nodeRoot.id, nodeRoot );
		var i, l,
			node;
		
		// handle all nodes
		
		for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
			
			node = this.nodesByIndex[ this.nodesIndices[ i ] ];
			
			// if node is not new root
			
			if ( node !== nodeRoot ) {
				
				// gather node + all subtree objects
				
				nodeRoot.objects = nodeRoot.objects.concat( objects_end.call( node ) );
				
				// reset node + entire subtree
				
				node.reset( true, true );
				
			}
			
		}
		
		// gather own objects
		
		nodeRoot.objects = nodeRoot.objects.concat( this.objects );
		
		// reset self
		
		this.reset( false, true );
		
		// contract check on new root
		
		return contract_check.call( nodeRoot );
		
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
			distance,
			indexOutside = 0;
		
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
		distance = Math.max( distX, distY, distZ );
		
		// if outside, use bitwise flags to indicate on which sides object is outside of
		
		if ( distance + radius > this.radius ) {
			
			// x
			
			if ( distX + radius > this.radius ) {
				
				indexOutside = indexOutside ^ ( deltaX > 0 ? FLAG_POS_X : FLAG_NEG_X );
				
			}
			
			// y
			
			if ( distY + radius > this.radius ) {
				
				indexOutside = indexOutside ^ ( deltaY > 0 ? FLAG_POS_Y : FLAG_NEG_Y );
				
			}
			
			// z
			
			if ( distZ + radius > this.radius ) {
				
				indexOutside = indexOutside ^ ( deltaZ > 0 ? FLAG_POS_Z : FLAG_NEG_Z );
				
			}
			
			return -indexOutside - indexOutsideOffset;
			
		}
		
		// if across
		
		if ( Math.min( distX, distY, distZ ) < radius ) {
			
			return indexInsideCross;
			
		}
		
		// return octant index from delta xyz
		
		return octant_index_from_xyz( deltaX, deltaY, deltaZ );
		
	}
	
	function octant_index_from_xyz ( x, y, z ) {
		
		var indexOctant = 0;
		
		if ( x > 0 ) {
			
			indexOctant = indexOctant | 1;
			
		}
		
		if ( y > 0 ) {
			
			indexOctant = indexOctant | 2;
			
		}
		
		if ( z > 0 ) {
			
			indexOctant = indexOctant | 4;
			
		}
		
		return indexOctant;
		
	}
	
	/*===================================================
    
    traversal
    
    =====================================================*/
	
	function depth_end ( depth ) {
		
		var i, l,
			node;
		
		if ( this.nodesIndices.length > 0 ) {
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				node = this.nodesByIndex[ this.nodesIndices[ i ] ];
				
				depth = node.depth_end( depth );
				
			}
			
		}
		else {
			
			depth = !depth || this.depth > depth ? this.depth : depth;
			
		}
		
		return depth;
		
	}
	
	function octree_count_end () {
		
		return octree_count_cascade.call( this.root ) + 1;
		
	}
	
	function octree_count_cascade () {
		
		var i, l,
			count = this.nodesIndices.length;
		
		for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
			
			count += octree_count_cascade.call( this.nodesByIndex[ this.nodesIndices[ i ] ] );
			
		}
		
		return count;
		
	}
	
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
    
    search
    
    =====================================================*/
	
	function search ( position, radius ) {
		
		return search_cascade.call( this.root, position, radius, [], true );
		
	}
	
	function search_cascade ( position, radius, objects, override ) {
		
		var i, l,
			node,
			delta,
			distance;
		
		// if is within distance
		
		delta = this.utilVec31Search.sub( position, this.position );
		distance = Math.max( Math.abs( delta.x ), Math.abs( delta.y ), Math.abs( delta.z ) );
		//console.log( this.id, ' > octree SEARCH cascade, this POS ', this.position.x, this.position.y, this.position.z, ' + this.radius ', this.radius, ' + delta ', delta.x, delta.y, delta.z, ' + distance ', distance, ' + is within? ', ( distance - radius <= this.radius ) );
		if ( distance - radius <= this.radius || override === true ) {
			
			// gather objects
			
			objects = ( objects || [] ).concat( this.objects );
			
			// search subtree
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				node = this.nodesByIndex[ this.nodesIndices[ i ] ];
				
				objects = search_cascade.call( node, position, radius, objects );
				
			}
			
		}
		
		return objects;
		
	}
	
} (KAIOPUA) );