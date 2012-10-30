/*
 *
 * UIQueue.js
 * UI queue for displaying elements.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/ui/UIQueue.js",
		_UIQueue = {},
		containers = [],
		elements = [],
		queues = [],
		items = [],
		itemCount = 0;
	
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	init_internal();
	
	main.asset_register( assetPath, { 
		data: _UIQueue/*,
		requirements: "js/kaiopua/ui/UIElement.js",
		callbacksOnReqs: init_internal,
		wait: true*/
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal () {
		console.log('internal UIQueue', _UIQueue);
		
		// public properties
		
		_UIQueue.add = add ;
		_UIQueue.remove = remove;
		_UIQueue.step = step;
		_UIQueue.clear = clear;
		
		// init default queue
		
		containers.push( 'nocontainer' );
		queues.push( new Queue() );
		
	}
	
	/*===================================================
    
    queue
    
    =====================================================*/
	
	function Queue () {
		
		this.priority = [];
		
	}
	
	/*===================================================
    
    add
    
    =====================================================*/
	
	function add ( parameters ) {
		
		var element = main.dom_extract( parameters.element || parameters ),
			$element = $( element ),
			item,
			container,
			priority,
			index,
			itemIsNew;
		
		if ( $element.length > 0 ) {
			
			item = element === parameters ? {} : $.extend( {}, parameters );
			item.id = itemCount++;
			item.element = element;
			item.$element = $element;
			
			container = item.container = main.dom_extract( item.container );
			priority = item.priority;
			
			// init queue for container if needed
			
			item.$container = $( container );
			
			if ( item.$container.length > 0 ) {
				
				index = main.index_of_value( containers, container );
				
				if ( index === -1 ) {
					
					containers.push( container );
					index = containers.length - 1;
					queues[ index ] = new Queue();
					
				}
				
			}
			// no container, use default queue
			else {
				
				index = 0;
				
			}
			
			item.queue = queues[ index ];
			
			// store by priority
			// priority can stack
			// general can only have 1 at a time
			// do not allow duplicates
			
			if ( priority === true ) {
				
				if ( item.queue.priority.length === 0 || !items_identical( item, item.queue.priority[ item.queue.priority.length - 1 ] ) ) {
					
					item.queue.priority.push( item );
					
					itemIsNew = true;
					
				}
				
			}
			else if ( !items_identical( item, item.queue.general ) ) {
				
				item.queue.general = item;
				
				itemIsNew = true;
				
			}
			
			// store and step
			
			if ( itemIsNew === true ) {
				
				elements.push( element );
				items.push( item );
				
				step( item.queue );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    remove
    
    =====================================================*/
	
	function remove ( parameters ) {
		
		var element,
			item,
			priority,
			queue,
			container,
			index = -1,
			active;
		
		index = find_item_index( parameters );
		item = items[ index ];
		
		if ( typeof item !== 'undefined' ) {
			
			element = item.element;
			container = item.container;
			priority = item.priority;
			queue = item.queue;
			active = queue.active;
			
			// clear from storage
			
			elements.splice( index, 1 );
			items.splice( index, 1 );
			
			// remove queues and container
			
			if ( priority === true ) {
				
				index = main.index_of_value( queue.priority, item );
				
				if ( index !== -1 ) {
					
					queue.priority.splice( index, 1 );
					
				}
				
			}
			else if ( queue.general === item ) {
				
				queue.general = undefined;
				
			}
			
			// if element is container, clear its queue first
			
			index = main.index_of_value( containers, element );
			
			if ( index !== -1 ) {
				
				clear( queues[ index ] );
				
			}
			
			// if active, and next element is not the same as item element, deactivate
			
			if ( item === active && typeof item.deactivate === 'function' && ( queue.priority.length === 0 || !items_identical( item, queue.priority[ 0 ] ) ) && !items_identical( item, queue.general ) ) {
				
				item.deactivate();
				
			}
			
			// if last in queue
			
			if ( queue.priority.length === 0 && typeof queue.general === 'undefined' ) {
			
				index = main.index_of_value( queues, queue );
				
				if ( index !== -1 ) {
					
					queues.splice( index, 1 );
					
					// also remove container if not default
					
					if ( index > 0 && index < containers.length ) {
						
						containers.splice( index, 1 );
						
					}
					
				}
				
				if ( typeof item.last === 'function' ) {
					
					item.last();
					
				}
				
			}
			
		}
	
	}
	
	/*===================================================
    
    step
    
    =====================================================*/
	
	function step ( parameters ) {
		
		var queue = find_queue( parameters ),
			$container,
			active,
			activeLast,
			activePriority;
		
		if ( queue instanceof Queue ) {
			
			activeLast = queue.active;
			activePriority = item_priority( activeLast );
			
			// step queue
			
			if ( parameters.force === true || activePriority !== true ) {
				
				remove( activeLast );
				
				// if items remain in queue
				
				if ( queue.priority.length > 0 ) {
					
					active = queue.active = queue.priority[ 0 ];
					
				}
				else if ( typeof queue.general !== 'undefined'  ) {
					
					active = queue.active = queue.general;
					
				}
				
				if ( typeof active !== 'undefined' ) {
					
					// if active is first
					
					if ( typeof activeLast === 'undefined' && typeof active.first === 'function' ) {
						
						active.first();
						
					}
					
					// ensure container is visible
					
					$container = active.$container;
					
					if ( $container.length > 0 && $container.is( ':visible' ) !== true ) {
						
						main.dom_fade( {
							element: $container,
							opacity: 1
						} );
						
						$container.trigger( 'open' );
						
					}
					
					if ( typeof active.activate === 'function' && !items_identical( active, activeLast ) ) {
						
						active.activate();
						
					}
					
				}
				
			}
			
		}
		
	}
	
	/*===================================================
    
    clear
    
    =====================================================*/
	
	function clear ( parameters ) {
		
		var i, l,
			queue = find_queue( parameters );
		
		if ( queue instanceof Queue ) {
			
			// general, then priority, then active
			
			if ( typeof queue.general !== 'undefined' && queue.general !== queue.active ) {
				
				remove( queue.general );
				
			}
			
			for ( i = 0, l = queue.priority.length; i < l; i++ ) {
				
				if ( queue.priority[ i ] !== queue.active ) {
					
					remove( queue.priority[ i ] );
					
				}
				
			}
			
			if ( typeof queue.active !== 'undefined' ) {
				
				remove( queue.active );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    utility
    
    =====================================================*/
	
	function items_identical ( itemA, itemB ) {
		
		return typeof itemA !== 'undefined' && typeof itemB !== 'undefined' && itemA.element === itemB.element && itemA.activate === itemB.activate && itemA.deactivate === itemB.deactivate;
		
	}
	
	function item_priority ( item ) {
		
		var priority = false,
			index;
		
		if ( typeof item !== 'undefined' ) {
			
			if ( item.priority === true ) {
				
				priority = item.priority;
				
			}
			// check if item is container and if active in that queue is priority
			else  {
				
				index = main.index_of_value( containers, item.element );
				
				if ( index !== -1 ) {
					
					return item_priority( queues[ index ].active );
					
				}
				
			}
			
		}
		
		return priority;
		
	}
	
	function find_item_index ( parameters ) {
		
		var element,
			item,
			index = -1;
		
		if ( typeof parameters !== 'undefined' ) {
			
			// try element
			
			element = main.dom_extract( parameters.element || parameters );
			
			if ( typeof element !== 'undefined' ) {
				
				index = main.index_of_value( elements, element );
				
			}
			
			// try item
			
			if ( index === -1 ) {
				
				item = parameters.item || parameters;

				if ( typeof item !== 'undefined' ) {
					
					index = main.index_of_value( items, item );
					
				}
				
			}
			
		}
		
		return index;
		
	}
	
	function find_queue ( parameters ) {
		
		if ( typeof parameters !== 'undefined' ) {
			
			var queue = parameters.queue || parameters,
				item,
				container,
				index;
			
			// find queue
			
			if ( queue instanceof Queue ) {
				
				return queue;
				
			}
				
			// try item
			
			item = items[ find_item_index( parameters ) ];
			
			if ( typeof item !== 'undefined' ) {
				
				return item.queue;
				
			}
			
			// try container
			
			container = main.dom_extract( parameters.container || parameters );
			
			if (  typeof container !== 'undefined' ) {
				
				index = main.index_of_value( containers, container );
				
				if ( index !== -1 ) {
					
					return queues[ index ];
					
				}
				
			}
		
		}
		
	}
	
} (KAIOPUA) );