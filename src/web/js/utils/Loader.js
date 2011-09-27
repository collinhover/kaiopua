/*
Loader.js
Loader module, handles loading assets.
*/
var KAIOPUA = (function ( main ) {
    
    var shared = main.shared = main.shared || {},
        listNameBase = 'loadList',
        listNumber = 0,
        loading = false,
        listsToLoad = [],
        locations = {},
        callbacks = {},
        loaded = {},
        assets = {},
        listCurrent;
    
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function load_list ( locationsList, callback ) {
        var listName;
        
        if ( typeof locationsList !== 'undefined' ) {
            
            // get if list is not array
            
            if ( locationsList.hasOwnProperty(length) === false ) {
                locationsList = [locationsList];
            }
            
            listName = listNameBase + listNumber;
            
            listNumber += 1;
            
            // store locations
            
            locations[listName] = locationsList;
            
            // store callbacks
            
            callbacks[listName] = callback;
            
            // init new loaded array
            
            loaded[listName] = [];
            
            // add list name to lists to load
            
            listsToLoad.push(listName);
            
            // start loading
            
            load_next_list();
            
        }
    }
    
    function load_next_list () {
        var i, l, locationsList, location;
        
        // if any lists to load
        
        if ( loading === false && listsToLoad.length > 0 ) {
            
            loading = true;
            
            // get next list 
            
            listCurrent = listsToLoad.shift();
            
            locationsList = locations[listCurrent];
            
            // for each item location
            
            for (i = 0, l = locationsList.length; i < l; i += 1) {
                
                location = locationsList[i];
                
                // load it
                
                load_single( location );
                
            }
        }
    }
    
    function load_single ( location ) {
        var ext;
        
        if ( typeof location !== 'undefined' ) {
            console.log('load ' + location);
            
            // load based on file extension
            // LAB handles all scripts
            // THREE handles images
            
            ext = get_file_ext( location );
            
            if ( ext === 'js' ) {
                $LAB.script( location ).wait( function (  ) {
                    load_single_completed( 'script', location );
                });
            }
            else {
                
            }
        }
        
    }
    
    function load_single_completed ( data, location ) {
        var locationsList, index;
        console.log('completed load: ' + location);
        // store data in assets
        
        assets[location] = data;
        
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
        
        // if current list is complete
        
        if ( locationsList.length === 0 ) {
            
            current_list_completed();
            
        }
        
    }
    
    function current_list_completed () {
        var callback = callbacks[listCurrent];
        console.log('list ' + listCurrent + ' completed');
        // clear
        
        delete locations[listCurrent];
        
        delete callbacks[listCurrent];
        
        delete loaded[listCurrent];
        
        listCurrent = undefined;
        
        // do callback
        
        if ( typeof callback !== 'undefined' ) {
            
            callback.call();
            
        }
        
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
            ext = location.substr( dotIndex + 1 );
        }
        
        return ext;
    }
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    main.loader = {
        load: load_list,
        assets: assets
    };
    
    return main; 
    
}(KAIOPUA || {}));