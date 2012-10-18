/*!
 *
 * Placehold Me: placeholding for when elements need to be moved around dom and back to original spot
 * @author Collin Hover / http://collinhover.com/
 *
*/

( function( $ ) {
	
    var $window = $(window),
        $document = $(document),
		count = 0,
		idBase = 'placeholder',
		dataName = 'placeholdme',
		defaults = {
			after: false,
			clone: false,
			show: false
        },
		methods = {
			
			init: function( options ) {
				
                return this.each( function() {
					
					var $element = $( this ),
						data = $element.data( dataName ),
						$placeholder;
					
					// placehold only one at a time, revert if already placeholding
					
					if ( typeof data !== 'undefined' ) {
						
						$element.placeholdme( 'revert' );
						
					}
					
					// handle data
					
					data = $.extend( {}, defaults, options );
					
					data.id = data.id || idBase + '_' + count++ + '_' + $element.attr( 'id' );
					data.$parent = $element.parent();
					data.$placeholder = $placeholder = data.clone === true ? $element.clone() : $( '<div></div>' );
					
					$element.data( dataName, data );
					
					// placeholder properties
					
					$placeholder.attr( 'id', data.id )
						.attr( 'class', data.classes );
					
					if ( data.show !== true ) {
						
						$placeholder.css( 'display', 'none' );
						
					}
					
					// insert placeholder
					
					$element[ data.after === true ? "after" : "before" ]( $placeholder );
					
				} );
				
			},
			revert: function () {
				
				return this.each( function() {
					
					var $element = $(this),
						data = $element.data( dataName ),
						$placeholder,
						$parent;
					
					if ( typeof data !== 'undefined' ) {
						
						$placeholder = data.$placeholder && data.$placeholder.length > 0 ? data.$placeholder : $( "#" + data.id );
						$parent = data.$parent;
						
						// if has valid placeholder
						
						if ( $placeholder.length > 0 && $placeholder.parent().length > 0 ) {
							
							// insert element in reverse
							
							$placeholder[ data.after === true ?  "before" : "after" ]( $element );
							
							// clear placeholder
							
							$placeholder.remove();
							
						}
						// fallback to adding back into original parent
						else if ( $parent && $parent.length > 0 ) {
							
							$parent.append( $element );
							
						}
						
						// clear data
						
						$element.removeData( dataName );
						
					}
					
				} );
				
			},
			active: function () {
				
				var active = false;
				
				this.each( function() {
					
					var $element = $(this),
						data = $element.data( dataName );
					
					if ( typeof data !== 'undefined' && typeof data.$placeholder !== 'undefined' ) {
						
						active = data.$placeholder.parent().is( data.$parent ) || !$element.parent().is( data.$parent );
						
					}
					
					// break each loop if active
					
					return !active;
					
				} );
				
				return active;
				
			}
			
		};
	
	// integrate into jQuery
	
    $.fn.placeholdme = function( method ) {
		
        if ( methods[method] ) {
			
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
			
        } else if ( typeof method === 'object' || !method ) {
			
            return methods.init.apply( this, arguments );
			
        } else {
			
            $.error( 'Method ' + method + ' does not exist on jQuery.placeholdme' );
			
        }
		
    };
	
})( jQuery );