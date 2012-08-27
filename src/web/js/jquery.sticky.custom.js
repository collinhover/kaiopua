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
    var defaults = {
            topSpacing: 0,
            bottomSpacing: 0,
            className: 'is-sticky',
			classNameNav: 'navbar-fixed-',
            wrapperClassName: 'sticky-wrapper',
            maxScroll: Number.MAX_VALUE,
            maxScrollStart: 0
        },
        $window = $(window),
        $document = $(document),
        sticked = [],
        stickedElements = [],
        windowHeight = $window.height(),
        scroller = function() {
            var i, l, s
                scrollTop = $window.scrollTop(),
                documentHeight = $document.height(),
                dwh = documentHeight - windowHeight,
                extra = (scrollTop > dwh) ? dwh - scrollTop : 0;
		    
            for ( i = 0, l = sticked.length; i < l; i++) {
                
                s = sticked[i];
				
				if ( s.stickyElement.not(":hidden").length > 0 ) {
					
					var elementTop = s.stickyWrapper.offset().top,
                        elementHeight = s.stickyWrapper.outerHeight( true ),
                        maxScrollStart = ( typeof s.maxScrollStart === 'function' ? s.maxScrollStart() : s.maxScrollStart ),
                        maxScroll = maxScrollStart + ( typeof s.maxScroll === 'function' ? s.maxScroll() : s.maxScroll ),
						topSpacing = ( typeof s.topSpacing === 'function' ? s.topSpacing() : s.topSpacing ),
						etse = elementTop - topSpacing - extra;
					
					if (scrollTop <= etse || scrollTop > maxScroll) {
						if (s.currentTop !== null) {
							s.stickyElement
								.css('top', '')
                                .css('position', '')
								.removeClass(s.className + " " + s.classNameNav);
							s.stickyWrapper
								.css('height', '' );
							s.currentTop = null;
						}
					}
					else {
						var bottomSpacing = ( typeof s.bottomSpacing === 'function' ? s.bottomSpacing() : s.bottomSpacing ),
							newTop = documentHeight - s.stickyElement.outerHeight() - topSpacing - bottomSpacing - scrollTop - extra;
						
						if (newTop < 0) {
							newTop = newTop + topSpacing;
						} else {
							newTop = topSpacing;
						}
						if (s.currentTop != newTop) {
							s.stickyElement
								.addClass(s.className + ( s.stickyElement.is(".navbar,.subnavbar") ? " " + s.classNameNav : "" ) )
                                .css('top', newTop)
                                .css('position', 'fixed');
                            
							s.stickyWrapper
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
                var o = $.extend(defaults, options);
                return this.each(function() {
                    var stickyElement = $(this),
                        stickyId = stickyElement.attr('id'),
                        wrapper = $('<div></div>')
                            .attr('id', stickyId + '-sticky-wrapper')
                            .addClass(o.wrapperClassName);
                    
                    if ( stickedElements.indexOf( this ) === -1 ) {
                        
                        stickedElements.push( this );
                        
                        stickyElement.wrapAll(wrapper);
                        
                        sticked.push({
                            topSpacing: o.topSpacing,
                            bottomSpacing: o.bottomSpacing,
                            maxScroll: o.maxScroll,
                            maxScrollStart: o.maxScrollStart,
                            stickyElement: stickyElement,
                            currentTop: null,
                            stickyWrapper: stickyElement.parent(),
                            className: o.className,
    						classNameNav: o.classNameNav + ( ( typeof o.bottomSpacing === 'function' ? o.bottomSpacing() : o.bottomSpacing ) > ( typeof o.topSpacing === 'function' ? o.topSpacing() : o.topSpacing ) ? 'bottom' : 'top' )
                        });
                        
                    }
                    
                });
            },
            update: scroller,
            stop: function () {
                
                return this.each(function() {
                    
                    var index = stickedElements.indexOf( this );
                    
                    if ( index !== -1 ) {
                        
                        stickedElements.splice( index, 1 );
                        sticked.splice( index, 1 );
                        
                    }
                        
                } );
                
            }
        };
    
    // event listeners
    // attempt to use throttle
    
    if ( $.throttle ) {
        
        $window.scroll( $.throttle( 250, scroller ) );
        $window.resize( $.throttle( 250, resizer ) );
        
    }
    else {
        
        // should be more efficient than using $window.scroll(scroller) and $window.resize(resizer):
        
        if (window.addEventListener) {
            window.addEventListener('scroll', scroller, false);
            window.addEventListener('resize', resizer, false);
        } else if (window.attachEvent) {
            window.attachEvent('onscroll', scroller);
            window.attachEvent('onresize', resizer);
        }
        
    }

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
