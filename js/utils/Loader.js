/*
Loader.js
Loader module, handles loading assets.

load base message (c) MIT
*/
var KAIOPUA = (function ( main ) {
    
    var shared = main.shared = main.shared || {},
        utils = main.utils = main.utils || {},
        loader = utils.loader = utils.loader || {},
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
        assets = {},
        listCurrent,
        barWidth = 260,
        barHeight = 12,
        barFillSpace = 2,
        barColor = '#FFFFFF',
        fillColor = '#FFFFFF',
        bar,
        fill,
        header,
        message,
        domElement;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	loader.init_ui = init_ui;
    loader.clear_ui_progress = clear_ui_progress;
    loader.load = load_list;
    loader.assets = assets;
	
	Object.defineProperty(loader, 'loadingHeader', { 
		get : function () { return loadingHeaderBase; },
		set: function ( newHeader ) {
			loadingHeaderBase = newHeader;
		}
	});
	
	Object.defineProperty(loader, 'loadingTips', { 
		get : function () { return loadingTips; },
		set: function ( newTips ) {
			loadingTips = newTips.slice( 1 );
		}
	});
    
    /*===================================================
    
    load bar functions
    
    =====================================================*/
    
    function init_ui () {
        
        var uihelper = utils.uihelper;
        
        loader = uihelper.make_ui_element({
            elementType: 'section',
            classes: 'info_panel',
            cssmap: {
                'padding' : '20px'
            }
        }, loader);
        
        domElement = loader.domElement;
        
        // bar

        bar = uihelper.make_ui_element({
            classes: 'load_bar',
            cssmap: {
                'border-style' : 'solid',
                'border-color' : barColor,
                'border-width' : '1px',
                'border-radius' : '5px'
            },
            staticPosition: true,
            width: barWidth,
            height: barHeight
        });
        
        // fill
    
        fill = uihelper.make_ui_element({
            cssmap: {
                'margin-left' : barFillSpace + 'px',
                'margin-top' : barFillSpace + 'px',
                'background' : fillColor,
                'border-radius' : '5px'
            },
            staticPosition: true,
            width: 0,
            height: barHeight - barFillSpace * 2
        });
        
        
        
        // header
        header = uihelper.make_ui_element({
            elementType: 'header',
            staticPosition: true,
            width: barWidth,
            text: loadingHeaderBase
        });
        
        // message
        message = uihelper.make_ui_element({
            elementType: 'p',
            staticPosition: true,
            width: barWidth,
            text: loadingTips[0]
        });
        
        // display
        
        $(bar.domElement).append( fill.domElement );
        
        $(domElement).append( header.domElement );
        $(domElement).append( bar.domElement );
        $(domElement).append( message.domElement );
        
        // center
        
        loader.ui_keep_centered();
        
    }
    
    function update_ui_progress () {
        var locationsList, 
            loadedList,
            total,
            pct = 1;
        
        if ( typeof listCurrent !== 'undefined' ) {
            
            locationsList = locations[listCurrent];
            loadedList = loaded[listCurrent];
            total = locationsList.length + loadedList.length;
            
            if ( isNaN( total ) === false ) {
                pct = loadedList.length / total;
            }
            
            $(fill.domElement).width( (barWidth - barFillSpace * 2) *  pct );
            
        }
        else {
            clear_ui_progress();
        }
    }
    
    function clear_ui_progress () {
        $(fill.domElement).width(0);
    }
    
    /*===================================================
    
    loading functions
    
    =====================================================*/
    
    function load_list ( locationsList, callback, listID, loadingMessage ) {
        
        if ( typeof locationsList !== 'undefined' ) {
            
            // get if list is not array
            
            if ( locationsList.hasOwnProperty(length) === false ) {
                locationsList = [locationsList];
            }
            
            if ( typeof listID !== 'string' ||  locations.hasOwnProperty( listID )) {
                
                listID = listIDBase + listNumber;
                
                listNumber += 1;
                
            }
            
            // store locations
            
            locations[listID] = locationsList;
            
            // store callbacks
            
            callbacks[listID] = callback;
            
            // store load message
            
            if ( typeof loadingMessage !== 'string' ) {
                
                loadingMessage = loadingTips[Math.max(0, Math.min(loadingTips.length - 1, Math.round(Math.random() * loadingTips.length) - 1))];
            }
            
            loadingMessages[listID] = loadingMessage;
            
            // init new loaded array
            
            loaded[listID] = [];
            
            // add list ID to lists to load
            
            listsToLoad.push(listID);
            
            // start loading
            
            load_next_list();
            
        }
        
        return listID;
    }
    
    function load_next_list () {
        var i, l, locationsList, location;
        
        // if any lists to load
        
        if ( loading === false && listsToLoad.length > 0 ) {
            
            loading = true;
            
            // update ui to reset fill
            
            update_ui_progress();
            
            // get next list 
            
            listCurrent = listsToLoad.shift();
            
            // set loading message
            
            $(message.domElement).html( loadingMessages[listCurrent] );
            
            // get locations
            
            locationsList = locations[listCurrent];
            
            // for each item location
            
            for (i = 0, l = locationsList.length; i < l; i += 1) {
                
                location = locationsList[i];
                
                // load it
                
                load_single( location );
                
            }
        }
        else {
            
            shared.signals.loadAllCompleted.dispatch();
            
        }
    }
    
    function load_single ( location ) {
        var loader,
            path, 
            ext, 
            loadType = 'script', 
            data = 'script',
            defaultCallback = function ( ) {
                load_single_completed( data, location );
            },
            modelCallback = function ( geometry ) {
                load_single_completed( geometry, location );
            };
        
        if ( typeof location !== 'undefined' ) {
            
            // load based on type of location and file extension
            
            // LAB handles scripts (js)
            // THREE handles models (ascii/bin js) and images (jpg/png/gif/bmp)
            
            // get type
            
            loadType = location.type || 'script';
            
            // get location path
            
            path = location.path || location;
            
            // get extension
            
            ext = get_file_ext( path );
            
            // type and/or extension check
            
            if ( ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp' ) {
                
                data = new Image();
                data.onload = defaultCallback;
                data.crossOrigin = '';
                data.src = path;
                
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
            else if ( loadType === 'model_bin' ) {
                
                if ( typeof THREE === 'undefined' ) {
                    main.utils.error.generate( threeLoaderErrorMessage, 'Loader' );
                }
                else {
                    
                    // init loader if needed
                    
                    if ( typeof threeLoaderBIN === 'undefined' ) {
                        threeLoaderBIN = new THREE.BinaryLoader( true );
                    }
                    
                    threeLoaderBIN.load( path, modelCallback );
                    
                }
            }
            // default to script loading
            else {
                $LAB.script( path ).wait( defaultCallback );
            }
        }
        
    }
    
    function load_single_completed ( data, location ) {
        var locationsList, index, path;
        
        // get location path
            
        path = location.path || location;
        
        // store data in assets
        
        assets[path] = data;
        
        // get current locations list
        
        locationsList = locations[listCurrent];
        
        // get index in locations list
        
        index = locationsList.indexOf(location);
        
        // remove location from locations list
        
        locationsList.splice(index, index !== -1 ? 1 : 0);
        
        // add location to loaded list
        
        loaded[listCurrent].push(location);
        
        // shared signal
        
        if (typeof shared !== 'undefined') {
            
            shared.signals.loadItemCompleted.dispatch();
            
        }
        
        // update ui
        
        update_ui_progress();
        
        // if current list is complete
        
        if ( locationsList.length === 0 ) {
            
            current_list_completed();
            
        }
        
    }
    
    function current_list_completed () {
        var callback = callbacks[listCurrent];
        
        // do callback before clear
        if ( typeof callback !== 'undefined' ) {
            
            callback.call();
            
        }
        
        // clear
        
        delete locations[listCurrent];
        
        delete callbacks[listCurrent];
        
        delete loadingMessages[listCurrent];
        
        delete loaded[listCurrent];
        
        listCurrent = undefined;
        
        // shared signal
        
        if (typeof shared !== 'undefined') {
            
            shared.signals.loadListCompleted.dispatch();
            
        }
        
        // no longer loading
        
        loading = false;
        
        // start next list
        
        load_next_list();
    }
    
    function get_file_ext ( location ) {
        var dotIndex, ext = '';
        
        dotIndex = location.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            ext = location.substr( dotIndex + 1 ).toLowerCase();
        }
        
        return ext;
    }
    
    return main; 
    
}(KAIOPUA || {}));