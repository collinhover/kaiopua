/*
MenuMaker.js
Menu maker module, handles menu creation and interaction.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        utils = main.utils = main.utils || {},
        uihelper = utils.uihelper = utils.uihelper || {},
        game = main.game = main.game || {},
        workers = game.workers = game.workers || {},
        menumaker = workers.menumaker = workers.menumaker || {},
        menuIDBase = 'game_menu',
        buttonIDBase = 'a button';
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    menumaker.make_menu = make_menu;
    menumaker.make_button = make_button;
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function make_menu ( parameters ) {
        var menu;
        
        // handle parameters
        
        parameters = parameters || {};
        
        parameters.id = parameters.id || menuIDBase;
        
        parameters.elementType = parameters.elementType || 'section';
        
        parameters.classes = parameters.classes || 'menu info_panel';
        
        // ui element ify
        
        menu = uihelper.make_ui_element( parameters );
        
        // public properties
        
        menu.enabled = true;
        menu.items = [];
        menu.itemsByID = {};
        menu.add_items = function ( items ) {
            var i, l;
            
            for ( i = 0, l = items.length; i < l; i += 1) {
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
            
            for ( i = 0, l = menu.items.length; i < l; i += 1) {
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
            
            for ( i = 0, l = menu.items.length; i < l; i += 1) {
                item = menu.items[i];
                if ( item.enabled === true ) {
                    item.enable_visual();
                }
            }
        };
        menu.disable = function () {
            var item, i, l;
            
            menu.enabled = false;
            
            for ( i = 0, l = menu.items.length; i < l; i += 1) {
                item = menu.items[i];
                item.disable_visual();
            }
        };
        
        return menu;
    }
    
    function make_button ( parameters ) {
        var button;
        
        // handle parameters
        
        parameters = parameters || {};
        
        parameters.id = parameters.id || buttonIDBase;
        
        parameters.classes = parameters.classes || '';
        
        parameters.classes = 'item ' + parameters.classes;
        
        parameters.text = parameters.id;
        
        parameters.disabled = parameters.disabled || false;
        
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
        
        if ( parameters.disabled ) {
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