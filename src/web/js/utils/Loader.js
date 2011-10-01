/*
Loader.js
Loader module, handles loading assets.

load base message (c) MIT
*/
var KAIOPUA = (function ( main ) {
    
    var loader = main.loader = main.loader || {},
        shared = main.shared = main.shared || {},
        listIDBase = 'loadList',
        loadingHeaderBase = 'Loading &hearts; from Hawaii',
        loadingMessageBase = '"Kali iki" means wait a moment.',
        loadingTips = [
            ///////////////////////////////////////////// = bad sentence size
            '"Aloha kāua" means may there be friendship or love between us.',
            '"Mahalo nui loa" means thanks very much.',
            '"Kali iki" means wait a moment.',
            '"Koʻu hoaloha" means my friend.',
            '"Kāne" means male or man.',
            '"Wahine" means female or woman.',
            '"Aliʻi kāne" means king or chieftan.',
            '"Aliʻi wahine" means queen or chiefess.',
            '"He mea hoʻopāʻani" means to play a game.',
            '"Kai" means sea or ocean.',
            '"ʻōpua" means puffy clouds.',
            '"Kaiʻōpua" means clouds over the ocean.',
            '"Iki" means small or little.',
            '"Nui" means large or huge.'
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
    
    load bar functions
    
    =====================================================*/
    
    init_visuals();
    
    function init_visuals () {
        
        // dom element
        
        domElement = document.createElement( 'section' );
        $(domElement).addClass('info_panel'); 
        $(domElement).css({
            'position': 'absolute',
            'left': '50%',
            'top': '50%',
            'padding' : '20px'
        });
        
        // bar

        bar = document.createElement( 'div' );
        $(bar).addClass('load_bar'); 
        $(bar).css({
            'border-style' : 'solid',
            'border-color' : barColor,
            'border-width' : '1px',
            'border-radius' : '5px'
        }).width(barWidth).height(barHeight);
        
        // fill
    
        fill = document.createElement( 'div' );
        $(fill).css({
            'margin-left' : barFillSpace + 'px',
            'margin-top' : barFillSpace + 'px',
            'background' : fillColor,
            'border-radius' : '5px'
        }).width(0).height(barHeight - barFillSpace * 2);
        $(bar).append( fill );
        
        // header
        header = document.createElement( 'header' );
        $(header).html(loadingHeaderBase);
        $(header).width(barWidth);
        
        // message
        message = document.createElement( 'p' );
        $(message).html(loadingMessageBase);
        $(message).width(barWidth);
        
        // display
        $(domElement).append( header );
        $(domElement).append( bar );
        $(domElement).append( message );
        
    }
    
    function resize_visuals () {
        
        $(domElement).css({
            'margin-top' : (-$(domElement).innerHeight() * 0.5) + 'px',
            'margin-left' : (-$(domElement).innerWidth() * 0.5) + 'px'
        });
        
    } 
    
    function show_visuals ( container ) {
        
        if (typeof container !== 'undefined' ) {
            $( container ).append( domElement );
        }
        else {
            $(document.body).append( domElement );
        }
        
        resize_visuals();
        
    }
    
    function hide_visuals () {
        
        $(domElement).detach();
        
    }
    
    function update_visuals () {
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
            
            $(fill).width( (barWidth - barFillSpace * 2) *  pct );
            
        }
        else {
            $(fill).width(0);
        }
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
            
            // get next list 
            
            listCurrent = listsToLoad.shift();
            
            // set loading message
            
            $(message).html(loadingMessages[listCurrent]);
            
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
        var ext;
        
        if ( typeof location !== 'undefined' ) {
            
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
        
        // update visuals
        
        update_visuals();
        
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
        
        // update visuals to reset fill
        
        update_visuals();
        
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
    
    loader.load = load_list;
    loader.assets = assets;
    loader.show = show_visuals;
    loader.hide = hide_visuals;
    loader.domElement = function () { return domElement; };
    
    return main; 
    
}(KAIOPUA || {}));