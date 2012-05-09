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
		objectsMin = 1,
		indexInsideCross = -1,
		indexOutsideOffset = 2,
		posX = 0, negX = 1,
		posY = 2, negY = 3,
		posZ = 4, negZ = 5,
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
		
		var ca = shared.cardinalAxes,
			right = ca.right,
			up = ca.up,
			forward = ca.forward;
		
		// properties
		
		indexOutsideMap = [];
		indexOutsideMap[ posX ] = { index: posX, count: 0, x: right.x, y: right.y, z: right.z };
		indexOutsideMap[ negX ] = { index: negX, count: 0, x: -right.x, y: -right.y, z: -right.z };
		indexOutsideMap[ posY ] = { index: posY, count: 0, x: up.x, y: up.y, z: up.z };
		indexOutsideMap[ negY ] = { index: negY, count: 0, x: -up.x, y: -up.y, z: -up.z };
		indexOutsideMap[ posZ ] = { index: posZ, count: 0, x: forward.x, y: forward.y, z: forward.z };
		indexOutsideMap[ negZ ] = { index: negZ, count: 0, x: -forward.x, y: -forward.y, z: -forward.z };
		
		// instance
		
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
			
			console.log( ( this.parent ? space + ' octree NODE > ' : ' octree ROOT > ' ), this, ' // id: ', this.id, ' // indexOctant: ', this.indexOctant, ' // position: ', this.position.x, this.position.y, this.position.z, ' // radius: ', this.radius, ' // depth: ', this.depth );
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
		this.utilVec31Grow = new THREE.Vector3();
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.id = octreeCount;
		
		this.position = parameters.position instanceof THREE.Vector3 ? parameters.position : new THREE.Vector3();
		this.radius = main.is_number( parameters.radius ) ? parameters.radius : 0;
		this.indexOctant = parameters.indexOctant;
		
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
		
		var indexOctant = octree.indexOctant || octant_index.call( this, octree );
		
		if ( this.nodesIndices.indexOf( indexOctant ) === -1 ) {
			
			this.nodesIndices.push( indexOctant );
			
		}
		
		this.nodesByIndex[ indexOctant ] = octree;
		
		if ( octree.parent !== this ) {
			
			octree.parent = this;
			
		}
		
	}
	
	function remove_octree ( identifier ) {
		
		var index = -1,
			octree,
			nodeIndex;
		
		// if identifier is octree
		if ( identifier instanceof _Octree.Instance && this.nodesByIndex[ identifier.indexOctant ] === identifier ) {
			
			octree = identifier;
			index = octree.indexOctant;
			
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
	
	function remove_octree_by_index ( indexOctant, octree ) {
		
		var index = this.nodesIndices.indexOf( indexOctant );
		
		if ( index !== -1 ) {
			
			this.nodesIndices.splice( index, 1 );
			
		}
		
		octree = octree || this.nodesByIndex[ indexOctant ];
		
		delete this.nodesByIndex[ indexOctant ];
		
		if ( octree.parent === this ) {
			
			octree.parent = undefined;
			
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
			
			add_object.call( node, object );
			
		}
		// if object lies outside bounds, add to parent node
		else if ( indexOctant < -1 && this.parent instanceof _Octree.Instance ) {
			
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
			objectsGrowOctants = [],
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
				
				objectsGrow.push( object );
				objectsGrowOctants.push( indexOctant );
				
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
		
		// if has objects to grow
		
		if ( objectsGrow.length > 0) {
			
			objectsRemaining = objectsRemaining.concat( grow.call( this, objectsGrow, objectsGrowOctants ) );
			
		}
		
		console.log( this.id, 'MORPH! Objects # ', this.objects.length, ' + Split #', objectsSplit.length, ' + Grow # ', objectsGrow.length, ' + remaining # ', objectsRemaining.length );
		
		// store remaining
		
		this.objects = objectsRemaining;
		
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
				parent: this,
				position: position,
				radius: radius,
				indexOctant: indexOctant,
				depthMax: this.depthMax,
				objectsMax: this.objectsMax,
				objectsMin: this.objectsMin
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
			
			remove_octree_by_index.call( this.parent, this.indexOctant, this );
			
		}
		
	}
	
	/*===================================================
    
    grow
    
    =====================================================*/
	
	function grow ( objects, octants ) {
		
		var i, l,
			object,
			objectsRemaining,
			objectsGrow,
			indexOctant,
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
			offset = this.utilVec31Grow,
			position,
			parent;
		
		// TODO: handle max depth down tree
		//if ( this.depthMax < 0 || this.depth < this.depthMax ) {
			
			objects = objects || this.objects;
			octants = octants || [];
			
			objectsRemaining = [];
			objectsGrow = [];
			
			iom[ posX ].count = iom[ negX ].count = iom[ posY ].count = iom[ negY ].count = iom[ posZ ].count = iom[ negZ ].count = 0;
			
			// for all outside objects, find outside octants containing most objects
			
			for ( i = 0, l = objects.length; i < l; i++ ) {
				
				object = objects[ i ];
				
				// get object octant index
				
				indexOctant = main.is_number( octants[ i ] ) ? octants[ i ] : octant_index.call( this, object );
				
				// if object outside this, include in calculations
				
				if ( indexOctant < -1 ) {
					
					// convert octant index to outside index
					
					indexOutside = -indexOctant - indexOutsideOffset;
					
					iom[ indexOutside ].count++;
					
					// store in grow list
					
					objectsGrow.push( object );
					
				}
				// else add to remaining
				else {
					
					objectsRemaining.push( object );
					
				}
				
			}
			
			// if objects to grow
			
			if ( objectsGrow.length > 0 ) {
				
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
				
				/*
				console.log( '& 1 >> ', 0 & 1, 1 & 1, 2 & 1, 3 & 1, 4 & 1, 5 & 1 );
				console.log( '& 2 >> ', 0 & 2, 1 & 2, 2 & 2, 3 & 2, 4 & 2, 5 & 2 );
                console.log( '& 3 >> ', 0 & 3, 1 & 3, 2 & 3, 3 & 3, 4 & 3, 5 & 3 );
                console.log( '& 4 >> ', 0 & 4, 1 & 4, 2 & 4, 3 & 4, 4 & 4, 5 & 4 );
                console.log( '& 5 >> ', 0 & 5, 1 & 5, 2 & 5, 3 & 5, 4 & 5, 5 & 5 );
                
                console.log( '| 1 >> ', 0 | 1, 1 | 1, 2 | 1, 3 | 1, 4 | 1, 5 | 1 );
                console.log( '| 2 >> ', 0 | 2, 1 | 2, 2 | 2, 3 | 2, 4 | 2, 5 | 2 );
                console.log( '| 3 >> ', 0 | 3, 1 | 3, 2 | 3, 3 | 3, 4 | 3, 5 | 3 );
                console.log( '| 4 >> ', 0 | 4, 1 | 4, 2 | 4, 3 | 4, 4 | 4, 5 | 4 );
                console.log( '| 5 >> ', 0 | 5, 1 | 5, 2 | 5, 3 | 5, 4 | 5, 5 | 5 );
				*/
				
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
					position: position,
					radius: this.radius * 2,
					depthMax: this.depthMax,
					objectsMax: this.objectsMax,
					objectsMin: this.objectsMin
				} );
				/*
				// set self as node of parent
				
				add_octree.call( parent, this, indexOctantInverse );
				
				// add all grow objects to parent
				
				parent.add( objectsGrow );
				*/
				console.log( '------------------------------------------------------' );
				console.log( this.id, this, ' GROW' );
				console.log(  '     >  objects ', objects, ' + octants ', octants, ' >>>> growobjects ', objectsGrow );
				console.log(  '     >  iom: ', iom, ' > SORT > indexOutsideCounts: ', indexOutsideCounts, ' ----> i1 = ', infoIndexOutside1.index, ', i2 = ', infoIndexOutside2.index, ', i3 = ', infoIndexOutside3.index );
				console.log(  '     >  indexOctant ', indexOctant, ' + indexOctantInverse ', indexOctantInverse, ' + offset = ', offset.x, offset.y, offset.z );
				console.log(  '     >  parent ', parent );
				console.log( '------------------------------------------------------' );
				
			}
			
			// if all objects, set remaining as new objects
			
			if ( objects === this.objects ) {
				
				this.objects = objectsRemaining;
				
			}
		//}
		
		return objectsRemaining;
		
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
			distX, distY, distZ, distMax,
			indexOutside;
		
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
		distMax = Math.max( distX, distY, distZ );
		
		// if outside
		
		if ( distMax + radius > this.radius ) {
			
			if ( distMax === distX ) {
				
				indexOutside = ( deltaX > 0 ) ? posX : negX;
				
			}
			else if ( distMax === distY ) {
				
				indexOutside = ( deltaY > 0 ) ? posY : negY;
				
			}
			else {
				
				indexOutside = ( deltaZ > 0 ) ? posZ : negZ;
				
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
    
    search
    
    =====================================================*/
	
	function search ( position, radius ) {
		
		
		
	}
	
} (KAIOPUA) );