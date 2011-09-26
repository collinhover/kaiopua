/*
Loader.js
Loader module, handles loading game assets.
*/
define([],
function () {
    var shared = require('utils/Shared'),
        useCached = true,
        listMap = ['setup', 'playable', 'complete'],
        listsToLoad = [],
        locations = {
            setup: ['js/game/workers/TestLoadWorker1.js'],
            playable: [],
            complete: []
        },
        loaded = {},
        assets = {},
        listCurrent;
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    init_load_lists();
    
    function init_load_lists() {
        var i, l, listName, locationsList;
        
        // for each list name in map
        
        for (i = 0, l = listMap.length; i < l; i += 1) {
            
            listName = listMap[i];
            
            // init new loaded arrays
            
            loaded[listName] = [];
            
            // add list name to lists to load
            
            listsToLoad.push(listName);
            
        }
        
    }
    
    // shared signals
    shared.signals.loadItemCompleted = new signals.Signal();
    shared.signals.loadListCompleted = new signals.Signal();
    shared.signals.loadAllCompleted = new signals.Signal();
    
    // shared assets
    shared.assets = assets;
    
    // load all
    load_all();
    
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function load_all () {
        
        load_next_list();
        
    }
    
    function load_next_list () {
        var i, l, listName, locationsList, location;
        
        // if any lists to load
        
        if ( listsToLoad.length > 0 ) {
            
            // get next list 
            
            listName = listsToLoad.shift();
            
            // next list should not be current
            
            if ( listName !== listCurrent ) {
                
                listCurrent = listName;
            
                locationsList = locations[listName];
                
                // for each item location
                
                for (i = 0, l = locationsList.length; i < l; i += 1) {
                    
                    location = locationsList[i];
                    
                    // load it
                    
                    load_single( location );
                    
                }
            }
        }
    }
    
    function load_single ( location ) {
        var file_ext;
        
        // load from location based on file extension
        // use RequireJS for all script (.js or no extension)
        // use jQuery for anything else
        
        if ( typeof location !== 'undefined' ) {
            
            file_ext = get_file_ext( location );
            
            /*
            // requirejs
            if ( file_ext === 'js' ) {
                
                require([ location ], load_single_completed);
                
            }
            // jQuery
            else {
                
                
                
            }
            */
            
            jQuery.ajax( {
                url: location,
                success: load_single_completed,
                error: load_single_failed,
                cache: useCached 
            });
        }
        
    }
    
    function load_single_completed ( data ) {
        
        alert('data loaded ' + data.id);
        
        shared.signals.loadItemCompleted.dispatch();
        
    }
    
    function load_single_failed ( jqXHR, textStatus, errorThrown ) {
        alert(textStatus);
    }
    
    function get_file_ext ( location ) {
        var dotIndex, ext = '';
        
        dotIndex = location.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            ext = location.substr( dotIndex + 1 );
        }
        
        return ext;
    }
    
    
    // return something to define module
    return {
        load: load_all,
        assets: assets
    };
});