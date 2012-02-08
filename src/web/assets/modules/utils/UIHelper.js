/*
UIHelper.js
UI helper module, handles property setup of ui elements.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/utils/UIHelper",
        uihelper = {},
        uiElementIDBase = 'ui_element',
        uiElementShowTime = 500,
        uiElementHideTime = 250;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
    
    uihelper.make_ui_element = make_ui_element;
	
	uihelper = main.asset_register( assetPath, uihelper );
        
    /*===================================================
    
    helper functions
    
    =====================================================*/
    
    function make_ui_element ( parameters, el ) {
        var i, l,
			elementType,
            id,
            classes,
            autoPosition,
            text,
            cssmap,
			subElementParameters,
			subElement,
            domElement;
        
        el = el || {};
        
        // handle parameters
        
        parameters = parameters || {};
        
        elementType = parameters.elementType || 'div';
        
        id = parameters.id || uiElementIDBase;
        
        classes = parameters.classes || '';
        
        text = parameters.text || '';
        
        cssmap = parameters.cssmap || {};
        
        // init dom element
        
        el.domElement = document.createElement( elementType );
        
        $(el.domElement).html( text );
        
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
		
		// children ui elements
		
		if ( parameters.hasOwnProperty('subElements') && parameters.subElements.length > 0 ) {
			
			for ( i = 0, l = parameters.subElements.length; i < l; i++ ) {
				
				subElementParameters = parameters.subElements[ i ];
				
				subElement = make_ui_element( subElementParameters );
				
				$(el.domElement).append( subElement.domElement );
				
			}
			
		}
        
        // functions
        
        el.ui_reposition = function ( x, y ) {
            var tempadded = false;
			
            if ( $(el.domElement).css('position') === 'absolute' ) {
            
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
            
            if ( $(el.domElement).css('position') !== 'absolute' ) {
                $(el.domElement).css('position', 'absolute');
            }
            
            shared.signals.windowresized.add( el.ui_centerme );
            el.ui_centerme( shared.screenWidth, shared.screenHeight );
        };
        
        el.ui_not_centered = function () {
            
            el.keepCentered = false;
            
            shared.signals.windowresized.remove( el.ui_centerme );
            
        };
        
        el.ui_centerme = function ( W, H ) {
			var p = $(el.domElement).parent(),	
				pW = ( p ) ? p.outerWidth() : W,
				pH = ( p ) ? p.outerHeight() : H;
			
            el.ui_reposition( pW * 0.5, pH * 0.5 );
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
		
		// check if should keep centered
		
		if ( parameters.keepCentered === true ) {
			
			el.ui_keep_centered();
			
		}
        
        return el;
    }
    
    return main; 
    
} ( KAIOPUA ) );