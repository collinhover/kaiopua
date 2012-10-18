/*
 *
 * SceneHelper.js
 * Contains utility functionality for basic hierarchy support.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/utils/SceneHelper.js",
		_SceneHelper = {};
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	init_internal();
	
	main.asset_register( assetPath, {
		data: _SceneHelper
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal () {
		console.log('internal scene helper', _SceneHelper);
		
		// functions
		
		_SceneHelper.extract_children_from_objects = extract_children_from_objects;
		_SceneHelper.extract_parents_from_objects = extract_parents_from_objects;
		_SceneHelper.extract_parent_root = extract_parent_root;
		_SceneHelper.has_parent = has_parent;
		
	}
	
	/*===================================================
    
    hierarchy support
    
    =====================================================*/
	
	function extract_children_from_objects ( objects, cascade, ignore ) {
		
		var i, l,
			object;
		
		objects = main.to_array( objects );
		cascade = main.to_array( cascade );
		
		for ( i = 0, l = objects.length; i < l; i++ ) {
			
			extract_child_cascade( objects[ i ], cascade, ignore );
			
		}
		
		return cascade;
		
	}
	
	function extract_child_cascade ( object, cascade, ignore ) {
		
		var i, l,
			children;
			
		if ( typeof ignore === 'undefined' || main.index_of_value( ignore, object ) === -1 ) {
			
			children = object.children;
			
			Array.prototype.push.apply( cascade, children );
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				extract_child_cascade( children[ i ], cascade, ignore );
				
			}
			
		}
		
	}
	
	function extract_parents_from_objects ( objects, cascade ) {
		
		var i, l;
		
		objects = main.to_array( objects );
		cascade = main.to_array( cascade );
		
		for ( i = 0, l = objects.length; i < l; i++ ) {
			
			extract_parent_cascade( objects[ i ], cascade );
			
		}
		
		return cascade;
		
	}
	
	function extract_parent_cascade ( object, cascade ) {
		
		while( object.parent ) {
			
			cascade.push( object.parent );
			
			object = object.parent;
			
		}
		
	}
	
	function extract_parent_root ( object ) {
		
		while( object.parent ) {
			
			object = object.parent;
			
		}
		
		return object;
		
	}
	
	function has_parent ( object, parent ) {
		
		while( object ) {
			
			if ( object === parent ) {
				
				return true;
				
			}
			
			object = object.parent;
			
		}
		
		return false;
		
	}
	
} (KAIOPUA) );