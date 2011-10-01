/*
MenuMaker.js
Menu maker module, handles menu creation and interaction.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
        workers = game.workers = game.workers || {},
        menumaker = workers.menumaker = workers.menumaker || {},
        menuIDBase = 'game_menu',
        menuShowTime = 500,
        menuHideTime = 250;
    
    /*===================================================
    
    custom functions
    
    =====================================================*/
    
    function menu ( parameters ) {
        var menu = {}, id, domElement;
        
        // handle parameters
        
        parameters = parameters || {};
        
        id = parameters.id || menuIDBase;
        
        // dom element
        
        domElement = document.createElement( 'section' );
        $(domElement).attr('id', id);
        $(domElement).addClass('menu info_panel');
        $(domElement).css({
            'position': 'absolute'
        });
        
        if ( parameters.hasOwnProperty('width') ) {
            $(domElement).width( parameters.width );
        }
        
        if ( parameters.hasOwnProperty('height') ) {
            $(domElement).height( parameters.height );
        }
        
        // public properties
        
        menu.id = id;
        menu.domElement = domElement;
        menu.items = [];
        menu.add_items = function ( items ) {
            var i, l;
            
            for ( i = 0, l = items.length; i < l; i += 1) {
                menu.addItem( items[i] );
            }
            
        };
        menu.add_item = function ( item ) {
            
            if ( menu.items.indexOf(item) === -1 ) {
                
                menu.items.push( item );
                
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
                
                menu.items.splice( index, 1 );
                
                $(item.domElement).detach();
                
            }
            
            return item;
        };
        menu.reposition = function ( x, y ) {
            var tempadded = false;
            
            if ( $(menu.domElement).innerHeight() === 0 ) {
                tempadded = true;
                $(document.body).append(menu.domElement);
            }
            
            $(menu.domElement).css({
                'left' : x + 'px',
                'top' : y + 'px',
                'margin-top' : (-$(menu.domElement).height() * 0.5) + 'px',
                'margin-left' : (-$(menu.domElement).width() * 0.5) + 'px'
            });
            
            if ( tempadded ) {
                $(menu.domElement).detach();
            }
        };
        menu.keep_centered = function () {
            shared.signals.windowresized.add(menu.centerme);
            menu.centerme( shared.screenWidth, shared.screenHeight );
        };
        menu.not_centered = function () {
            shared.signals.windowresized.remove(menu.centerme);
        };
        menu.centerme = function ( W, H ) {
            menu.reposition( W * 0.5, H * 0.5 );
        };
        menu.show = function () {
            $(menu.domElement).fadeTo(menuShowTime, 1);
        };
        menu.hide = function () {
            $(menu.domElement).fadeTo(menuHideTime, 0);
        };
        
        return menu;
    }
    
    function button ( id, callback, disabled, extraClasses ) {
        var button = {}, domElement;
        
        domElement = document.createElement( 'div' );
        $(domElement).html( id );
        $(domElement).addClass( 'item ' + extraClasses || '' );
        
        button.id = id;
        button.domElement = domElement;
        button.callback = callback;
        button.enable = function () {
            button.enabled = true;
            $(domElement).removeClass( 'item_disabled' );
            $(domElement).addClass( 'item_enabled' );
        };
        button.disable = function () {
            button.enabled = false;
            $(domElement).removeClass( 'item_enabled' );
            $(domElement).addClass( 'item_disabled' );
        };
        button.trigger = function () {
            if ( button.enabled ) {
                button.callback.call();
            }
        };
        
        // enable / disable
        
        if ( disabled ) {
            button.disable();
        }
        else {
            button.enable();
        }
        
        // listen for clicks
        
        $(domElement).bind('click', button.trigger);
        
        return button;
    }
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    menumaker.menu = menu;
    menumaker.button = button;
    
    return main; 
    
}(KAIOPUA || {}));