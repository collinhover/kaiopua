// Sticky Plugin
// =============
// Author: Anthony Garand
// Improvements by German M. Bravo (Kronuz) and Ruud Kamphuis (ruudk)
// Improvements by Leonardo C. Daronco (daronco)
// Created: 2/14/2011
// Date: 2/12/2012
// Website: http://labs.anthonygarand.com/sticky
// Description: Makes an element on the page stick on the screen as you scroll
//              It will only set the 'top' and 'position' of your element, you
//              might need to adjust the width in some cases.

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
            maxScroll: Number.MAX_VALUE,
            maxScrollStart: 0
        },
		scrollTargets = [],
		scrollTargetsElements = [],
        sticked = [],
        stickedElements = [],
        windowHeight = $window.height(),
        scroller = function( e ) {
			
            var i, l, s,
				documentHeight = $document.height(),
				scrollTarget = e && e.target ? e.target : undefined,
				$scrollTarget,
				scrollTargetIndex,
				scrollTargetElements,
				scrollTop,
				dwh,
				extra;
			
		    console.log(  'scroller ', e, scrollTarget );
			
			// only go through scroll target's elements
			
			if ( scrollTarget ) {
				
				scrollTargetIndex = scrollTargets.indexOf( scrollTarget );
				scrollTargetElements = scrollTargetsElements[ scrollTargetIndex ];
				
				$scrollTarget = $( scrollTarget );
				scrollTop = $scrollTarget .scrollTop(),
                //dwh = documentHeight - windowHeight,
                //extra = (scrollTop > dwh) ? dwh - scrollTop : 0
				
			}
			// no scroll target, go through all stickedElements
			else {
				
				
				
			}
			
			return;
			
            for ( i = 0, l = sticked.length; i < l; i++) {
                
                s = sticked[i];
				
				if ( s.$stickyElement.not(":hidden").length > 0 ) {
					
					var elementTop = s.$stickyWrapper.offset().top,
                        elementHeight = s.$stickyWrapper.outerHeight( true ),
                        maxScrollStart = ( typeof s.maxScrollStart === 'function' ? s.maxScrollStart() : s.maxScrollStart ),
                        maxScroll = maxScrollStart + ( typeof s.maxScroll === 'function' ? s.maxScroll() : s.maxScroll ),
						topSpacing = ( typeof s.topSpacing === 'function' ? s.topSpacing() : s.topSpacing ),
						etse = elementTop - topSpacing - extra;
					console.log( 'check topSpacing', topSpacing, ' scrollTop ', scrollTop );
					if (scrollTop <= etse || scrollTop > maxScroll) {
						if (s.currentTop !== null) {
							s.$stickyElement
								.css('top', '')
                                .css('position', '')
								.removeClass(s.className + " " + s.classNameNav);
							s.$stickyWrapper
								.css('height', '' );
							s.currentTop = null;
						}
					}
					else {
						var bottomSpacing = ( typeof s.bottomSpacing === 'function' ? s.bottomSpacing() : s.bottomSpacing ),
							newTop = documentHeight - s.$stickyElement.outerHeight() - topSpacing - bottomSpacing - scrollTop - extra;
						
						if (newTop < 0) {
							newTop = newTop + topSpacing;
						} else {
							newTop = topSpacing;
						}
						if (s.currentTop != newTop) {
							s.$stickyElement
								.addClass(s.className + ( s.$stickyElement.is(".navbar,.subnavbar") ? " " + s.classNameNav : "" ) )
                                .css('top', newTop)
                                .css('position', 'fixed');
                            
							s.$stickyWrapper
								.css('height', elementHeight );
							s.currentTop = newTop;
						}
					}
					
				}
				
            }
        },
        resizer = function() {
            windowHeight = $window.height();
        },
        methods = {
            init: function(options) {
				
                var stickyData = $.extend(defaults, options);
				
				this.data( 'stickyData', stickyData );
				
                return this.each(function() {
					
                    var $stickyElement = $(this),
						$stickyScrollTarget = $( stickyData.scrollTarget ),
						stickyScrollTarget = $stickyScrollTarget[ 0 ] ,
						stickyScrollTargetIndex,
						stickyScrollTargetElements,
                        stickyId = $stickyElement.attr('id'),
                        $stickyWrapper = $('<div></div>')
                            .attr('id', stickyId + '-sticky-wrapper')
                            .addClass(stickyData.wrapperClassName);
					
					// if this element not already sticked
                    
                    if ( stickedElements.indexOf( this ) === -1 ) {
                        
                        stickedElements.push( this );
                        
                        $stickyElement.wrapAll( $stickyWrapper );
						
						// update data
						
						stickyData.$stickyElement = $stickyElement;
						stickyData.$stickyWrapper = $stickyWrapper;
						stickyData.$scrollTarget = $stickyScrollTarget;
						stickyData.currentTop = null;
						stickyData.classNameNav += ( ( typeof stickyData.bottomSpacing === 'function' ? stickyData.bottomSpacing() : stickyData.bottomSpacing ) > ( typeof stickyData.topSpacing === 'function' ? stickyData.topSpacing() : stickyData.topSpacing ) ? 'bottom' : 'top' );
                        
                        /*sticked.push( stickyData ) ;{
                            topSpacing: stickyData.topSpacing,
                            bottomSpacing: stickyData.bottomSpacing,
                            maxScroll: stickyData.maxScroll,
                            maxScrollStart: stickyData.maxScrollStart,
                            $stickyElement: $stickyElement,
                            currentTop: null,
                            $stickyWrapper: $stickyElement.parent(),
                            className: stickyData.className,
    						classNameNav: stickyData.classNameNav + ( ( typeof stickyData.bottomSpacing === 'function' ? stickyData.bottomSpacing() : stickyData.bottomSpacing ) > ( typeof stickyData.topSpacing === 'function' ? stickyData.topSpacing() : stickyData.topSpacing ) ? 'bottom' : 'top' )
                        });*/
						
						// store scroll target only if not new
						
						stickyScrollTargetIndex = scrollTargets.indexOf( stickyScrollTarget );
						
						if ( stickyScrollTargetIndex === -1 ) {
							
							scrollTargets.push( stickyScrollTarget );
							stickyScrollTargetIndex = scrollTargets.length - 1;
							
							// event listeners
							// attempt to use throttle
							console.log( 'sticky updaters +START+ for', $stickyScrollTarget );
							if ( $.throttle ) {
								
								$stickyScrollTarget.on( 'scroll.sticky scrollstop.sticky', $.throttle( 250, scroller ) );
								$stickyScrollTarget.on( 'resize.sticky', $.throttle( 250, resizer ) );
								
							}
							else {
								
								$stickyScrollTarget.on( 'scroll.sticky scrollstop.sticky', scroller );
								$stickyScrollTarget.on( 'resize.sticky', scroller );
								
							}
							
						}
						
						// store element in scroll target's elements
						
						stickyScrollTargetElements = scrollTargetsElements[ stickyScrollTargetIndex ];
						
						if ( typeof stickyScrollTargetElements === 'undefined' ) {
							
							stickyScrollTargetElements = scrollTargetsElements[ stickyScrollTargetIndex ] = [];
							
						}
						
						stickyScrollTargetElements.push( this );
                        
                    }
                    
                });
            },
            update: scroller,
            stop: function () {
                console.log( 'STICKY stop ', this, ' // BEFORE // num stickedElements ', stickedElements.length, ' num scroll targets ', scrollTargets.length, scrollTargetsElements.length );
                return this.each(function() {
                    
                    var $stickyElement = $(this),
						stickyData = $stickyElement.data( 'stickyData' ),
						$stickyScrollTarget = stickyData.$scrollTarget && stickyData.$scrollTarget.length > 0 ? stickyData.$scrollTarget : $( stickyData.scrollTarget ),
						stickyScrollTarget = $stickyScrollTarget[ 0 ],
						stickyScrollTargetIndex = scrollTargets.indexOf( stickyScrollTarget ),
						stickyScrollTargetElements = scrollTargetsElements[ stickyScrollTargetIndex ],
						index;
                    
					// general list
					
					index = stickedElements.indexOf( this );
					
                    if ( index !== -1 ) {
                        
                        stickedElements.splice( index, 1 );
						
					}
					
					// scroll target elements
					
					index = stickyScrollTargetElements.indexOf( this );
					
					if ( index !== -1 ) {
						
						stickyScrollTargetElements.splice( index, 1 );
						
						// when scroll target has no more elements
						
						if ( stickyScrollTargetElements.length === 0 ) {
							
							// event listeners
							console.log( 'sticky updaters ---STOP---- for', $stickyScrollTarget );
							$stickyScrollTarget.off( '.sticky' );
							
							scrollTargetsElements.splice( stickyScrollTargetIndex );
							scrollTargets.splice( stickyScrollTargetIndex );
							
						}
                        
                    }
					
					console.log( ' >>> // AFTER // num stickedElements ', stickedElements.length, ' num scroll targets ',  scrollTargets.length, scrollTargetsElements.length );
                        
                } );
                
            }
        };

    $.fn.sticky = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.sticky');
        }
    };
    $(function() {
        setTimeout(scroller, 0);
    });
})(jQuery);
