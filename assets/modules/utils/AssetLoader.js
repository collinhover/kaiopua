/*
 *
 * AssetLoader.js
 * Handles loading all assets, including images, scripts, and models.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function ( main ) {
	
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/utils/AssetLoader.js",
		_AssetLoader = {},
		_UIElement,
		threeLoaderJSON,
		threeLoaderBIN,
		threeLoaderErrorMessage = 'Attempted to load model before THREE',
		listIDBase = 'loadList',
		loadingHeaderBase = 'Loading...',
		loadingTips = [
			'Please wait.'
		],
		listNumber = 0,
		loading = false,
		listsToLoad = [],
		loadingMessages = {},
		locations = {},
		callbacks = {},
		loaded = {},
		allLoading = [],
		allLoadingListIDs = [],
		allStarted = [],
		allLoaded = [],
		allLoadingOrLoaded = [],
		listCurrent,
		loadTypeDefault = 'script',
		containerWidth = 260,
		barWidth = containerWidth - 40,
		barHeight = 10,
		barRadius = 5,
		barToFillSpace = 2,
		barMargin = 15,
		container,
		bar,
		fill,
		header,
		message,
		domElement;
	
	/*===================================================
	
	public properties
	
	=====================================================*/
	
	_AssetLoader.load = load_list;
	
	_AssetLoader.add_loaded_locations = add_loaded_locations;
	_AssetLoader.get_is_loaded = get_is_loaded;
	_AssetLoader.get_is_loading = get_is_loading;
	_AssetLoader.get_is_loading_or_loaded = get_is_loading_or_loaded;
	
	Object.defineProperty(_AssetLoader, 'loadingHeader', { 
		get : function () { return loadingHeaderBase; },
		set: function ( newHeader ) {
			loadingHeaderBase = newHeader;
		}
	});
	
	Object.defineProperty(_AssetLoader, 'loadingTips', { 
		get : function () { return loadingTips; },
		set: function ( newTips ) {
			loadingTips = newTips.slice( 0 );
		}
	});
	
	main.asset_register( assetPath, { 
		data: _AssetLoader,
		requirements: "assets/modules/ui/UIElement.js",
		callbacksOnReqs: init_ui,
		wait: true
	} );
	
	/*===================================================
	
	helper functions
	
	=====================================================*/
	
	function add_loaded_locations ( locationsList ) {
		
		var i, l,
			location,
			path,
			indexLoaded,
			indexLoading,
			locationAdded = false;
		
		if ( typeof locationsList !== 'undefined' ) {
			
			// get if list is not array
			
			if ( typeof locationsList === 'string' || locationsList.hasOwnProperty( 'length' ) === false ) {
				locationsList = [locationsList];
			}
			
			// for each location
			
			for ( i = 0, l = locationsList.length; i < l; i++ ) {
				
				location = locationsList[ i ];
				
				path = main.get_asset_path( location );
				
				// update all loading
				
				indexLoading = allLoading.indexOf( path );
				
				if ( indexLoading !== -1 ) {
					
					allLoadingListIDs.splice( indexLoading, 1 );
					
					allLoading.splice( indexLoading, 1 );
					
				}
				
				// update all loaded
				
				indexLoaded = allLoaded.indexOf( path );
				
				if ( indexLoaded === -1 ) {
					
					allLoaded.push( path );
					
					locationAdded = true;
					
				}
				
			}
			
			if ( locationAdded === true ) {
				
				allLoadingOrLoaded = allLoaded.concat( allLoading );
				
			}
		}
		
	}
	
	function get_is_path_in_list ( location, list ) {
		
		var path,
			index;
		
		path = main.get_asset_path( location );
		
		index = list.indexOf( path );
		
		if ( index !== -1 ) {
			
			return true;
			
		}
		else {
			
			return false;
			
		}
		
	}
	
	function get_is_loading_or_loaded ( location ) {
		
		return get_is_path_in_list( location, allLoadingOrLoaded );
		
	}
	
	function get_is_loaded ( location ) {
		
		return get_is_path_in_list( location, allLoaded );
		
	}
	
	function get_is_loading ( location ) {
		
		return get_is_path_in_list( location, allLoading );
		
	}
	
	function get_load_type ( location ) {
		
		return location.type || loadTypeDefault;
		
	}
	
	/*===================================================
	
	ui functions
	
	=====================================================*/
	
	function init_ui ( uie ) {
		
		_UIElement = uie;
		
		container = new _UIElement.Instance({
			id: 'asset_loader',
			elementType: 'section',
			classes: 'info_panel',
			width: containerWidth
		});
		
		// bar
		
		bar = new _UIElement.Instance({
			width: barWidth,
			cssmap: {
				'position' : 'relative',
				'border-style' : 'solid',
				'border-color' : '#FFFFFF',
				'border-width' : '1px',
				'border-radius' : barRadius + 'px',
				'padding' : barToFillSpace + 'px',
				'margin-top' : barMargin + 'px',
				'margin-bottom' : barMargin + 'px',
				'margin-left' : 'auto',
				'margin-right' : 'auto'
			}
		});
		
		// fill
		
		fill = new _UIElement.Instance({
			width: 0,
			height: barHeight,
			cssmap: {
				'position' : 'relative',
				'background' : '#FFFFFF',
				'border-radius' : barRadius + 'px'
			}
		});
		
		// header
		header = new _UIElement.Instance({
			elementType: 'header',
			classes: 'text_large title_alt',
			width: barWidth,
			html: loadingHeaderBase,
			cssmap: {
				'position' : 'relative',
				'margin-top' : barMargin + 'px',
				'margin-left' : 'auto',
				'margin-right' : 'auto'
			}
		});
		
		// message
		message = new _UIElement.Instance({
			elementType: 'p',
			width: barWidth,
			html: loadingTips[0],
			cssmap: {
				'position' : 'relative',
				'margin-bottom' : barMargin + 'px',
				'margin-left' : 'auto',
				'margin-right' : 'auto'
			}
		});
		
		// display
		
		fill.parent = bar;
		
		header.parent = container;
		bar.parent = container;
		message.parent = container;
		
		// center
		
		container.alignment = 'center';
		
		// hide
		
		container.hide( { remove: false, time: 0 } );
		
		// ui functions
		
		_AssetLoader.hide_ui = hide_ui;
		_AssetLoader.show_ui = show_ui;
		_AssetLoader.clear_ui_progress = clear_ui_progress;
		
	}
	
	function hide_ui () {
		
		container.hide.apply( container, arguments );
		
	}
	
	function show_ui () {
		
		container.show.apply( container, arguments );
		
	}
	
	function update_ui_progress ( message ) {
		var locationsList, 
			loadedList,
			total,
			pct = 1;
		
		if ( typeof fill !== 'undefined' ) {
			
			// set loading message
			
			if ( typeof message !== 'undefined' ) {
				
				$(message.domElement).html( message );
				
			}
		
			if ( typeof listCurrent !== 'undefined' ) {
				
				locationsList = locations[listCurrent];
				loadedList = loaded[listCurrent];
				total = locationsList.length + loadedList.length;
				
				if ( isNaN( total ) === false ) {
					pct = loadedList.length / total;
				}
				
				fill.width = fill.parent.width * pct;
				
			}
			else {
				clear_ui_progress();
			}
			
		}
		
	}
	
	function clear_ui_progress () {
		if ( typeof fill !== 'undefined' ) {
			
			fill.width = 0;
			
		}
	}
	
	/*===================================================
	
	loading functions
	
	=====================================================*/
	
	function load_list ( locationsList, callbackList, listID, loadingMessage ) {
		
		var i, l,
			location,
			path,
			indexLoading,
			indexLoaded,
			allLocationsLoaded = true,
			assetData;
		
		if ( typeof locationsList !== 'undefined' ) {
			
			// get if list is not array
			
			if ( typeof locationsList === 'string' || locationsList.hasOwnProperty( 'length' ) === false ) {
				locationsList = [locationsList];
			}
			
			// make a copy of locations list
			
			locationsList = locationsList.slice( 0 );
			
			// handle list id
			
			if ( typeof listID !== 'string' ||  locations.hasOwnProperty( listID )) {
				
				listID = listIDBase + listNumber;
				
			}
			
			// permanent store of all loading
			
			for ( i = 0, l = locationsList.length; i < l; i++ ) {
				
				location = locationsList[ i ];
				
				path = main.get_asset_path( location );
				
				indexLoading = allLoading.indexOf( path );
				indexLoaded = allLoaded.indexOf( path );
				
				// if not already loading or loaded item
				// load new location
				if ( indexLoading === -1 && indexLoaded == -1 ) {
					
					allLoading.push( path );
					
					allLoadingListIDs.push( listID );
					
					newLocations = true;
					
				}
				
				// if not yet loaded, mark list for loading
				
				if ( indexLoaded === -1 ) {
					
					allLocationsLoaded = false;
					
				}
				
			}
			
			allLoadingOrLoaded = allLoaded.concat( allLoading );
			
			// increase list number
			
			listNumber += 1;
			
			// temporary store locations
			
			locations[listID] = locationsList;
			
			// temporary store callback list
			
			if ( typeof callbackList === 'undefined' ) {
				callbackList = [];
			}
			else if ( typeof callbackList === 'function' || callbackList.hasOwnProperty( 'length' ) === false ) {
				callbackList = [callbackList];
			}
			
			callbacks[listID] = callbackList;
			
			// store load message
			
			if ( typeof loadingMessage !== 'string' ) {
				
				loadingMessage = loadingTips[Math.max(0, Math.min(loadingTips.length - 1, Math.round(Math.random() * loadingTips.length) - 1))];
			}
			
			loadingMessages[listID] = loadingMessage;
			
			// init new loaded array
			
			loaded[listID] = [];
			
			// add list ID to lists to load
				
			listsToLoad.push(listID);
			
			// if all locations in list are already loaded, skip loading process
			
			if ( allLocationsLoaded === true ) {
				
				list_completed( listID );
				
			}
			else {
				
				// start loading
				
				load_next_list();
				
			}
			
		}
		
	}
	
	function load_next_list () {
		var i, l,
			locationsList,
			location,
			path;
		
		// if any lists to load
		
		if ( loading === false && listsToLoad.length > 0 ) {
			
			loading = true;
			
			// get next list 
			
			listCurrent = listsToLoad[ 0 ];
			
			// update ui to reset fill
			
			update_ui_progress( loadingMessages[listCurrent] );
			
			// get locations, make copy because already loaded items will be removed from list immediately
			
			locationsList = locations[listCurrent].slice( 0 );
			
			// for each item location
			
			for (i = 0, l = locationsList.length; i < l; i += 1) {
				
				location = locationsList[ i ];
				
				path = main.get_asset_path( location );
				
				// if already loaded
				
				if ( allLoaded.indexOf( path ) !== -1 ) {
					
					// make duplicate complete event
					
					load_single_completed( location );
					
				}
				// if not started loading yet
				else if ( allStarted.indexOf( path ) === -1 ) {
					
					// load it
					
					allStarted.push( path );
					
					load_single( location );
					
				}
				
			}
			
		}
		else {
			
			// no longer loading
			
			listCurrent = undefined;
			
			shared.signals.loadAllCompleted.dispatch();
			
		}
		
	}
	
	function load_single ( location ) {
		var path, 
			ext, 
			loadType, 
			data,
			defaultCallback = function ( ) {
				load_single_completed( location, data );
			},
			modelCallback = function ( geometry ) {
				load_single_completed( location, geometry );
			};
		
		if ( typeof location !== 'undefined' ) {
			
			// load based on type of location and file extension
			
			// LAB handles scripts (js)
			// THREE handles models (ascii/bin js) and images (jpg/png/gif/bmp)
			
			// get type
			
			loadType = location.type || loadTypeDefault;
			
			// get location path
			
			path = main.get_asset_path( location );
			
			// get extension
			
			ext = main.get_ext( path );
			
			// ensure path has extension
			
			if ( ext === '' ) {
				
				path = main.add_default_ext( path );
				
			}
			
			// type and/or extension check
			
			if ( loadType === 'image' || main.is_image_ext( ext ) ) {
				
				// load
				
				data = main.generate_dom_image( path, defaultCallback );
				
				// store empty image data in assets immediately
				
				main.asset_register( path, { data: data } );
				
			}
			else if ( loadType === 'model' || loadType === 'model_ascii' ) {
				
				if ( typeof THREE === 'undefined' ) {
					main.utils.error.generate( threeLoaderErrorMessage, 'Loader' );
				}
				else {
					
					// init loader if needed
					
					if ( typeof threeLoaderJSON === 'undefined' ) {
						threeLoaderJSON = new THREE.JSONLoader( true );
					}
					
					threeLoaderJSON.load( path, modelCallback );
				}
			}
			// default to script loading
			else {
				
				$LAB.script( path ).wait( defaultCallback );
				
			}
			
		}
		
	}
	
	function load_single_completed ( location, data ) {
		var i, l,
			listID,
			locationsList,
			locationInCurrentList = false,
			index,
			path,
			loadType,
			listsCompleted;
		
		// get location path and type
		
		path = main.get_asset_path( location );
		
		loadType = get_load_type( location );
		
		// register asset
		
		main.asset_register( path, { data: data } );
		
		// add as loaded
		
		add_loaded_locations( path );
		
		// shared signal
		
		if (typeof shared !== 'undefined') {
			
			shared.signals.loadItemCompleted.dispatch( path );
			
		}
		
		// for each list loading
		
		for ( i = 0, l = listsToLoad.length; i < l; i++ ) {
			
			listID = listsToLoad[ i ];
			
			locationsList = locations[ listID ];
			
			// get index in locations list
			
			index = locationsList.indexOf(location);
			
			// if is in list
			
			if ( index !== -1 ) {
				
				// remove location from locations list
				
				locationsList.splice(index, index !== -1 ? 1 : 0);
				
				// add location to loaded list
				
				loaded[ listID ].push( location );
				
				// if is current list
				
				if ( listID === listCurrent ) {
					
					// update ui
		
					update_ui_progress();
					
				}
				
				// if current list is complete, defer until all checked
				
				if ( locationsList.length === 0 ) {
					
					listsCompleted = listsCompleted || [];
					
					listsCompleted.push( listID );
					
				}
				
			}
			
		}
		
		// complete any completed lists
		if ( typeof listsCompleted !== 'undefined' ) {
			
			for ( i = 0, l = listsCompleted.length; i < l; i++ ) {
				
				list_completed( listsCompleted[ i ] );
				
			}
			
		}
		
	}
	
	function list_completed( listID ) {
		var i, l, 
			callbackList, 
			callback,
			listIndex;
		
		// remove list from all lists to load
		
		listIndex = listsToLoad.indexOf( listID );
		
		if ( listIndex !== -1 ) {
			
			listsToLoad.splice( listIndex, 1 );
			
		}
		
		// do callbacks before clear
		
		callbackList = callbacks[ listID ];
		
		for ( i = 0, l = callbackList.length; i < l; i++ ) {
			
			callback = callbackList[ i ];
			
			if ( typeof callback !== 'undefined' ) {
				
				callback.call( this );
				
			}
			
		}
		
		// shared signal
		
		if (typeof shared !== 'undefined') {
			
			shared.signals.loadListCompleted.dispatch( listID );
			
		}
		
		// clear
		
		delete locations[ listID ];
		
		delete callbacks[ listID ];
		
		delete loadingMessages[ listID ];
		
		delete loaded[ listID ];
		
		loading = false;
		
		// start next list
		
		load_next_list();
		
	}
    
} ( KAIOPUA ) );