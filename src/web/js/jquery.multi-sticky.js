/*!
 * Multi-element-scroll Sticky Plugin
 * @author Collin Hover / http://collinhover.com/
 * 
 * based on Sticky Plugin by Anthony Garand / http://labs.anthonygarand.com/sticky
 *
*/

(function($) {
	
    var $window = $(window),
        $document = $(document),
		defaults = {
			scrollTarget: $window,
            topSpacing: 0,
            bottomSpacing: 0,
            className: 'is-sticky',
			classNameNav: 'navbar-fixed-',
            wrapperClassName: 'sticky-wrapper',
			handlePosition: true,
            maxScroll: Number.MAX_VALUE,
            maxScrollStart: 0
        },
		scrollTargets = [],
		scrollTargetsElements = [],
        sticked = [],
        stickedElements = [],
		ThrottledUpdate = $.throttle ? $.throttle( 250, OnScrolled ) : OnScrolled,
		methods = {
            init: function(options) {
				
                return this.each(function() {
					
                    var data = $.extend( {}, defaults, options ),
						$element = $(this),
						$scrollTarget = $( data.scrollTarget ),
						scrollTarget = $scrollTarget[ 0 ] ,
						scrollTargetIndex,
						scrollTargetElements,
                        id = $element.attr('id'),
                        $wrapper = $('<div></div>')
                            .attr('id', id + '-sticky-wrapper')
                            .addClass(data.wrapperClassName);
					
					// if this element not already sticked
                    
                    if ( stickedElements.indexOf( this ) === -1 ) {
                        
                        stickedElements.push( this );
                        
                        $element.wrapAll( $wrapper );
						$wrapper = $element.parent();
						
						// update data
						
						$element.data( 'sticky', data );
						
						data.$element = $element;
						data.$wrapper = $wrapper;
						data.$scrollTarget = $scrollTarget;
						data.currentTop = null;
						data.classNameNav += ( ( typeof data.bottomSpacing === 'function' ? data.bottomSpacing() : data.bottomSpacing ) > ( typeof data.topSpacing === 'function' ? data.topSpacing() : data.topSpacing ) ? 'bottom' : 'top' );
						
						// store scroll target only if not new
						
						scrollTargetIndex = scrollTargets.indexOf( scrollTarget );
						
						if ( scrollTargetIndex === -1 ) {
							
							scrollTargets.push( scrollTarget );
							scrollTargetIndex = scrollTargets.length - 1;
							
							// event listeners
							// attempt to use throttle
							
							$scrollTarget.on( 'scroll.sticky scrollstop.sticky', ThrottledUpdate );
							
						}
						
						// store element in scroll target's elements
						
						scrollTargetElements = scrollTargetsElements[ scrollTargetIndex ];
						
						if ( typeof scrollTargetElements === 'undefined' ) {
							
							scrollTargetElements = scrollTargetsElements[ scrollTargetIndex ] = [];
							
						}
						
						scrollTargetElements.push( this );
                        
                    }
                    
                });
            },
            update: OnScrolled,
            stop: function () {
				
                return this.each(function() {
                    
                    var $element = $(this),
						data = $element.data( 'sticky' ),
						$scrollTarget = data.$scrollTarget && data.$scrollTarget.length > 0 ? data.$scrollTarget : $( data.scrollTarget ),
						scrollTarget = $scrollTarget[ 0 ],
						scrollTargetIndex = scrollTargets.indexOf( scrollTarget ),
						scrollTargetElements = scrollTargetsElements[ scrollTargetIndex ],
						index;
                    
					// general list
					
					index = stickedElements.indexOf( this );
					
                    if ( index !== -1 ) {
                        
                        stickedElements.splice( index, 1 );
						
					}
					
					// scroll target elements
					
					index = scrollTargetElements.indexOf( this );
					
					if ( index !== -1 ) {
						
						scrollTargetElements.splice( index, 1 );
						
						// when scroll target has no more elements
						
						if ( scrollTargetElements.length === 0 ) {
							
							// event listeners
							
							$scrollTarget.off( '.sticky' );
							
							scrollTargetsElements.splice( scrollTargetIndex );
							scrollTargets.splice( scrollTargetIndex );
							
						}
                        
                    }
                        
                } );
                
            }
        };
	
	// internal functions
	
	function OnScrolled ( e ) {
		
		var i, l,
			scrollTarget = e && e.target ? e.target : undefined,
			$scrollTarget,
			scrollTargetIndex = scrollTargets.indexOf( scrollTarget ),
			scrollTargetElements,
			element,
			parameters = {};
		
		// only go through scroll target's elements
		
		if ( scrollTarget && scrollTargetIndex !== -1 ) {
			
			scrollTargetElements = scrollTargetsElements[ scrollTargetIndex ];
			
			$scrollTarget = $( scrollTarget );
			
			parameters.windowHeight = $window.height(),
			parameters.scrollTop = $scrollTarget.scrollTop();
			parameters.scrollTargetHeight = $scrollTarget.height();
			parameters.scrollTargetTop = $scrollTarget.offset().top;
			parameters.scrollTargetWindowHeightDiff = ( parameters.scrollTargetTop + parameters.scrollTargetHeight ) - parameters.windowHeight;
			parameters.heightScrollPositionDiff = ( parameters.scrollTop > parameters.scrollTargetWindowHeightDiff ) ? parameters.scrollTargetWindowHeightDiff - parameters.scrollTop : 0;
			
			for ( i = 0, l = scrollTargetElements.length; i < l; i++) {
				
				element = scrollTargetElements[ i ];
				
				stickyCheck( element, parameters );
				
			}
			
		}
		// no scroll target, go through all sticky elements
		else {
			
			for ( i = 0, l = stickedElements.length; i < l; i++) {
				
				element = stickedElements[ i ];
				
				stickyCheck( element, parameters );
				
			}
			
		}
		
	}
	
	function stickyCheck ( element, parameters ) {
		
		var $element = $( element ),
			data = $element.data( 'sticky' ),
			$wrapper,
			$scrollTarget,
			elementTop,
			elementHeight,
			topSpacing,
			maxScrollStart,
			maxScroll,
			windowHeight,
			scrollTop,
			scrollTargetHeight,
			scrollTargetTop,
			scrollTargetWindowHeightDiff,
			heightScrollPositionDiff,
			threshold,
			bottomSpacing,
			newTop;
		
		if ( $element.length > 0 && data && $element.not(":hidden").length > 0 ) {
			
			// handle parameters
			
			parameters = parameters || {};
			
			// wrapper and element
			
			$wrapper = data.$wrapper;
			elementTop = $wrapper.offset().top;
			elementHeight = $wrapper.height();
			topSpacing = ( typeof data.topSpacing === 'function' ? data.topSpacing() : data.topSpacing ) || 0;
			
			// scroll range
			
			maxScrollStart = ( typeof data.maxScrollStart === 'function' ? data.maxScrollStart() : data.maxScrollStart );
			maxScroll = maxScrollStart + ( typeof data.maxScroll === 'function' ? data.maxScroll() : data.maxScroll );
			
			// scroll position
			
			windowHeight = typeof parameters.windowHeight !== 'undefined' ? parameters.windowHeight : $window.height();
			$scrollTarget = data.$scrollTarget && data.$scrollTarget.length > 0 ? data.$scrollTarget : $document;
			scrollTop = typeof parameters.scrollTop !== 'undefined' ? parameters.scrollTop : $scrollTarget.scrollTop();
			scrollTargetHeight = typeof parameters.scrollTargetHeight !== 'undefined' ? parameters.scrollTargetHeight : $scrollTarget.height();
			scrollTargetTop = typeof parameters.scrollTargetTop !== 'undefined' ? parameters.scrollTargetTop : $scrollTarget.offset().top;
			scrollTargetWindowHeightDiff = typeof parameters.scrollTargetWindowHeightDiff !== 'undefined' ? parameters.scrollTargetWindowHeightDiff : ( scrollTargetTop + scrollTargetHeight ) - windowHeight;
			heightScrollPositionDiff = typeof parameters.heightScrollPositionDiff !== 'undefined' ? parameters.heightScrollPositionDiff : ( scrollTop > scrollTargetWindowHeightDiff ? scrollTargetWindowHeightDiff - scrollTop : 0 );
			threshold = elementTop - topSpacing - heightScrollPositionDiff;
			
			// unsticky
			if (scrollTop <= threshold || scrollTop > maxScroll) {
				
				if (data.currentTop !== null) {
					
					$element
						.css('top', '')
						.css('position', '')
						.removeClass(data.className + " " + data.classNameNav);
					
					$wrapper
						.css('height', '' );
					
					data.currentTop = null;
					
				}
				
			}
			// sticky
			else {
				
				bottomSpacing = ( typeof data.bottomSpacing === 'function' ? data.bottomSpacing() : data.bottomSpacing ) || 0;
				newTop = scrollTargetHeight - $element.outerHeight() - topSpacing - bottomSpacing - scrollTop - heightScrollPositionDiff;
				
				if (newTop < 0) {
					
					newTop = newTop + topSpacing;
					
				} else {
					
					newTop = topSpacing;
					
				}
				
				if (data.currentTop != newTop) {
					
					$element.addClass(data.className + ( $element.is(".navbar, .subnavbar") ? " " + data.classNameNav : "" ) );
					
					if ( data.handlePosition === true ) {
						
						$element.css( 'position', 'fixed' );
						
					}
					
					if ( topSpacing !== 0 || bottomSpacing !== 0 ) {
						
						$element.css( 'top', newTop );
						
					}
					
					$wrapper
						.css('height', elementHeight );
					
					data.currentTop = newTop;
					
				}
				
			}
			
		}
		
	}
	
	// integrate into jQuery
	
    $.fn.sticky = function(method) {
		
        if ( methods[method] ) {
			
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
			
        } else if ( typeof method === 'object' || !method ) {
			
            return methods.init.apply( this, arguments );
			
        } else {
			
            $.error( 'Method ' + method + ' does not exist on jQuery.sticky' );
			
        }
		
    };
	
    $( function() {
		
		$window.on( 'resize.sticky', ThrottledUpdate );
		
		ThrottledUpdate();
		
    } );
	
})(jQuery);
