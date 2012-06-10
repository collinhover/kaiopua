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
		assetPath = "assets/modules/utils/SceneHelper.js",
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
		
	}
	
	/*===================================================
    
    hierarchy support
    
    =====================================================*/
	
	function extract_children_from_objects ( objects, cascade ) {
		
		var i, l,
			object;
		
		objects = main.ensure_array( objects );
		cascade = main.ensure_array( cascade );
		
		for ( i = 0, l = objects.length; i < l; i++ ) {
			
			cascade = extract_child_cascade( objects[ i ], cascade );
			
		}
		
		return cascade;
		
	}
	
	function extract_child_cascade ( object, cascade ) {
		
		var i, l,
			children;
			
		if ( typeof object !== 'undefined' ) {
			
			children = object.children;
			
			cascade = cascade.concat( children );
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				cascade = extract_child_cascade( children[ i ], cascade );
				
			}
			
		}
		
		return cascade;
		
	}
	
	function extract_parents_from_objects ( objects, cascade ) {
		
		var i, l;
		
		objects = main.ensure_array( objects );
		cascade = main.ensure_array( cascade );
		
		for ( i = 0, l = objects.length; i < l; i++ ) {
			
			cascade = extract_parent_cascade( objects[ i ], cascade );
			
		}
		
		return cascade;
		
	}
	
	function extract_parent_cascade ( object, cascade ) {
		
		while( object.parent ) {
			
			cascade.push( object.parent );
			
			object = object.parent;
			
		}
		
		return cascade;
		
	}
	
	function extract_parent_root ( object ) {
		
		while( object.parent ) {
			
			object = object.parent;
			
		}
		
		return object;
		
	}
	
} (KAIOPUA) );