/*
UIHelper.js
UI helper module, handles property setup of ui elements.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        utils = main.utils = main.utils || {},
        uihelper = utils.uihelper = utils.uihelper || {},
        uiElementIDBase = 'ui_element',
        uiElementShowTime = 500,
        uiElementHideTime = 250;
        
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function make_ui_element ( parameters, el ) {
        var elementType,
            id,
            classes,
            autoPosition,
            text,
            cssmap,
            domElement;
            
        el = el || {};
        
        // handle parameters
        
        parameters = parameters || {};
        
        elementType = parameters.elementType || 'div';
        
        id = parameters.id || uiElementIDBase;
        
        classes = parameters.classes || '';
        
        staticPosition = parameters.staticPosition || false;
        
        text = parameters.text || '';
        
        cssmap = parameters.cssmap || {};
        
        cssmap.position = cssmap.position || (staticPosition === true) ? 'static' : 'absolute';
        
        // init dom element
        
        el.domElement = document.createElement( elementType );
        
        $(el.domElement).html( text );
        
        el.staticPosition = staticPosition;
        
        el.keepCentered = parameters.keepCentered || false;
        
        // id
        
        el.id = id;
        
        $(el.domElement).attr( 'id', id );
        
        // classes
        
        $(el.domElement).addClass( classes );
        
        // css
        
        $(el.domElement).css( cssmap );
        
        // dimensions
        
        if ( parameters.hasOwnProperty('width') ) {
            $(el.domElement).width( parameters.width );
        }
        
        if ( parameters.hasOwnProperty('height') ) {
            $(el.domElement).height( parameters.height );
        }
        
        // functions
        
        el.ui_reposition = function ( x, y ) {
            var tempadded = false;
            
            if ( el.staticPosition === false ) {
            
                if ( $(el.domElement).innerHeight() === 0 ) {
                    tempadded = true;
                    $(document.body).append( el.domElement );
                }
                
                $(el.domElement).css({
                    'left' : x + 'px',
                    'top' : y + 'px',
                    'margin-top' : (-$(el.domElement).outerHeight() * 0.5) + 'px',
                    'margin-left' : (-$(el.domElement).outerWidth() * 0.5) + 'px'
                });
                
                if ( tempadded ) {
                    $(el.domElement).detach();
                }
                
            }
        };
        
        el.ui_keep_centered = function () {
            
            el.keepCentered = true;
            
            if ( el.staticPosition === true ) {
                el.staticPosition = false;
                $(el.domElement).css({'position' : 'absolute'});
            }
            
            shared.signals.windowresized.add( el.ui_centerme );
            el.ui_centerme( shared.screenWidth, shared.screenHeight );
        };
        
        el.ui_not_centered = function () {
            
            el.keepCentered = false;
            
            shared.signals.windowresized.remove( el.ui_centerme );
            
        };
        
        el.ui_centerme = function ( W, H ) {
            el.ui_reposition( W * 0.5, H * 0.5 );
        };
        
        el.ui_show = function ( container, time, callback ) {
			
			var on_show_callback = function () {
                
				if ( typeof callback !== 'undefined' ) {
                    callback.call();
                }
                
            };
			
            if ( typeof container !== 'undefined' ) {
                $( container ).append( el.domElement );
            }
            
            if ( el.keepCentered === true ) {
                el.ui_centerme( shared.screenWidth, shared.screenHeight );
            }
            
            if ( time === 0 || uiElementShowTime === 0 ) {
				
                $( el.domElement ).stop( true ).show();
				
				on_show_callback();
				
            } 
            else {
				
                $( el.domElement ).stop( true ).fadeTo( time || uiElementShowTime, 1, on_show_callback );
				
            }
			
        };
        
        el.ui_hide = function ( remove, time, callback ) {
			
			var on_hide_callback = function () {
                
                if ( typeof callback !== 'undefined' ) {
                    callback.call();
                }
                
                if ( remove === true ) {
                    $( el.domElement ).detach();
                }
                
            };
			
            if ( time === 0 || uiElementHideTime === 0 ) {
				
                $( el.domElement ).stop( true ).hide();
				
				on_hide_callback();
				
            } 
            else {
				
                $( el.domElement ).stop( true ).fadeTo(time || uiElementHideTime, 0, on_hide_callback);
				
            }
			
        };
        
        return el;
    }
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    uihelper.make_ui_element = make_ui_element;
    
    return main; 
    
}(KAIOPUA || {}));