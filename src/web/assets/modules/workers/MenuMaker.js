/*
MenuMaker.js
Menu maker module, handles menu creation and interaction.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/workers/MenuMaker",
		menumaker = {},
        uihelper,
        menuIDBase = 'game_menu',
        buttonIDBase = 'a button';
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
    menumaker.make_menu = make_menu;
    menumaker.make_button = make_button;
	
	menumaker = main.asset_register( assetPath, menumaker );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	main.assets_require( [
		"assets/modules/workers/UIHelper"
	], init_internal, true );
	
	function init_internal ( uh ) {
		
		// assets
		
		uihelper = uh;
		
	}
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function make_menu ( parameters ) {
        var menu;
       
        // handle parameters
        
        parameters = parameters || {};
        
        parameters.id = parameters.id || menuIDBase;
        
        parameters.elementType = parameters.elementType || 'section';
        
        parameters.classes = parameters.classes || '';
		
		// default classes
		
		parameters.classes += ' menu info_panel clearfix';
		
		if ( parameters.transparent === true ) {
			parameters.classes += ' info_panel_nobg';
		}
		
        // ui element ify
        
        menu = uihelper.make_ui_element( parameters );
        
        // public properties
        
        menu.enabled = true;
        menu.items = [];
        menu.itemsByID = {};
        menu.add_items = function ( items ) {
            var i, l;
            
            for ( i = 0, l = items.length; i < l; i ++) {
                menu.addItem( items[i] );
            }
            
        };
        menu.add_item = function ( item ) {
            
            if ( menu.items.indexOf(item) === -1 ) {
                
                item.menu = menu;
                
                menu.items.push( item );
                
                menu.itemsByID[item.id] = item;
                
                $(menu.domElement).append( item.domElement );
                
            }
            
        };
        menu.remove_all = function () {
            var items = [], i, l;
            
            for ( i = 0, l = menu.items.length; i < l; i ++) {
                items.push( menu.removeItem( menu.items[i] ) );
            }
            
            return items;
        };
        menu.remove_item = function ( item ) {
            var index = menu.items.indexOf(item);
            
            if ( index !== -1 ) {
                
                item.menu = undefined;
                
                menu.items.splice( index, 1 );
                
                delete menu.itemsByID[item.id];
                
                $(item.domElement).detach();
                
            }
            
            return item;
        };
        menu.enable = function () {
            var item, i, l;
            
            menu.enabled = true;
            
            for ( i = 0, l = menu.items.length; i < l; i ++) {
                item = menu.items[i];
                if ( item.enabled === true ) {
                    item.enable_visual();
                }
            }
        };
        menu.disable = function () {
            var item, i, l;
            
            menu.enabled = false;
            
            for ( i = 0, l = menu.items.length; i < l; i ++) {
                item = menu.items[i];
                item.disable_visual();
            }
        };
		
        return menu;
    }
    
    function make_button ( parameters ) {
        var button, text;
        
        // handle parameters
        
        parameters = parameters || {};
        
        parameters.id = parameters.id || buttonIDBase;
        
        parameters.classes = parameters.classes || '';
        
        parameters.classes = 'item ' + parameters.classes;
		
		if ( parameters.circleButton === true ) {
			
			parameters.classes += ' item_circle';
			
		}
		else {
			
			parameters.classes += ' item_box';
			
		}
        
		if ( parameters.hasOwnProperty('disabled') !== true ) {
			
			parameters.disabled = false;
			
		}
		
		// add text sub element
		
		parameters.subElements = [ {
			classes: 'item_text_container',
			text: parameters.id
		} ];
        
        button = uihelper.make_ui_element( parameters );
        
        button.callback = parameters.callback;
        button.menu = undefined;
        button.enable = function () {
            button.enabled = true;
            button.enable_visual();
        };
        button.enable_visual = function () {
            $(button.domElement).removeClass( 'item_disabled' );
            $(button.domElement).addClass( 'item_enabled' );
        };
        button.disable = function () {
            button.enabled = false;
            button.disable_visual();
        };
        button.disable_visual = function () {
            $(button.domElement).removeClass( 'item_enabled' );
            $(button.domElement).addClass( 'item_disabled' );
        };
        button.trigger = function () {
            if ( button.enabled && ( typeof button.menu === 'undefined' || (typeof button.menu !== 'undefined' && button.menu.enabled === true ) ) ) {
                button.callback.call();
            }
        };
        
        // enable / disable
        
        if ( parameters.disabled === true ) {
            button.disable();
        }
        else {
            button.enable();
        }
        
        // listen for clicks
        
        $(button.domElement).bind('click', button.trigger);
        
        return button;
    }
    
    return main; 
    
}(KAIOPUA || {}));