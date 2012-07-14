/*!
 * Bootstrap Scroll Modal
 * Version: 1.0
 * Made for your convenience by @theericanderson
 * collinhover: updated to add correction for auto centering and scrolling on both x and y
 * A variaton of but a small piece of the insanely awesome Twitter Bootstrap (http://twitter.github.com/bootstrap)
 */

/* =========================================================
 * bootstrap-modal.js v2.0.2
 * http://twitter.github.com/bootstrap/javascript.html#modals
 * =========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */


!function( $ ){

  "use strict"

 /* MODAL CLASS DEFINITION
  * ====================== */

  var Modal = function ( content, options ) {
    this.options = options
    this.$element = $(content)
  }

  Modal.prototype = {

		constructor: Modal,

		toggle: function () {
			return this[!this.isShown ? 'show' : 'hide']()
		},

		show: function () {
			var that = this

			if (!this.isShown) {
				
				this.isShown = true;
				clearTransition.call( this );

				$('body').addClass('modal-open');
				
				this.$element.trigger('show');
				
				escape.call(this);
				backdrop.call(this, function () {

					!that.$element.parent().length && that.$element.appendTo(document.body); //don't move modals dom position

					that.$element.removeClass( 'hidden' );//.addClass('in');//.show()
					
					if ( that.options.dynamic ) {
						that.$element.css( { 'min-width': that.$element.width() } );
						that.resize();
					}
					
					if ( that.$element.hasClass('fade') ) {
						
						showWithTransition( that.$element, that.options.fadeTime, $.proxy( showModal, that ) );
						
					}
					else {
						
						showModal.call( that );
						
					}

				})
			
			}
		},

		hide: function ( e ) {
			
			var that = this;
			
			e && e.preventDefault();

			if (this.isShown) {
				
				this.isShown = false;
				
				clearTransition.call( this );
				
				$('body').removeClass('modal-open');
				escape.call(this);

				this.$element.trigger('hide');//.removeClass('in');
				  
				if ( this.$element.hasClass('fade') ) {
					
					hideWithTransition( this.$element, this.options.fadeTime, $.proxy( hideModal, this ) );

				}
				else {
					
					hideModal.call(this);
				   
				}
				
			}
			
		},
	  
		resize: function ( e ) {
			this.$elementWrapper.css( { 
				'margin-left': Math.max( -$( window ).width() * 0.5, -this.$element.outerWidth( true ) * 0.5 ), 
				'margin-top': Math.max( -$( window ).height() * 0.5, -this.$element.outerHeight( true ) * 0.5 ) 
			} );
		}

  }


 /* MODAL PRIVATE METHODS
  * ===================== */

	function clearTransition () {

		if ( false ) {//$.support.transition ) {
			
			this.$element.off( $.support.transition.end );
			if ( this.$backdrop ) { 
				this.$backdrop.off( $.support.transition.end );
			}
			
		}
		else {
			
			this.$element.stop( true );
			if ( this.$backdrop ) { 
				this.$backdrop.stop( true );
			}
			
		}

	}
  
	function showWithTransition ( $element, fadeTime, callback ) {

		// css transitions

		if ( false ) {//$.support.transition ) {
			
			$element[0].offsetWidth; // force reflow
			$element.one( $.support.transition.end, callback );
			
		}
		// fallback to jquery animation
		else {
			console.log( 'FADE IN : ', $element );
			$element.fadeTo( fadeTime, 1, callback );
			
		}

	}

	function hideWithTransition( $element, fadeTime, callback ) {

		// supports css transitions

		if ( false ) {//$.support.transition ) {
			
			$element.one( $.support.transition.end, callback );
			
		}
		// else fallback to jquery animation
		else {
			console.log( 'FADE OUT : ', $element );
			$element.fadeTo( fadeTime, 0, callback );
			
		}

	}
  
	function showModal () {

		this.$element.trigger('shown');

	}

	function hideModal() {
		
		this.$element.addClass( 'hidden' ).trigger('hidden');//.hide()
		
		this.$element.off( 'shown.resizemodal contentchanged.resizemodal' );
		
		$(window).off( 'resize.modal' );
		
		backdrop.call(this);

	}

	function backdrop( callback ) {
		var that = this, 
			animate = this.$element.hasClass('fade') ? 'fade' : '';

		if (this.isShown && this.options.backdrop) {

			this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').insertBefore(this.$element);

			if (this.options.dynamic) {
				
				this.$elementWrapper = $('<div class="modal-wrapper" />')
				  .prependTo(this.$backdrop)
				  .delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))

				this.$element.prependTo(this.$elementWrapper)

				// on shown and if has content changed plugin
				this.$element.on( 'shown.resizemodal contentchanged.resizemodal', $.proxy(this.resize, this));

				// if has images loaded plugin
				if ( this.$element.imagesLoaded ) {
					this.$element.imagesLoaded($.proxy(this.resize, this));
				}

				$(window).on('resize.modal', $.proxy(this.resize, this));
			} 
			else {

				this.$element.prependTo(this.$backdrop).delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))

			}

			//$('html').css({ 'overflow' : 'hidden'  })

			if (this.options.backdrop != 'static') {
				this.$backdrop.on('click', function(e){
					if (e.target == e.delegateTarget) {
						that.hide(e)
					}
				})
			}

			//this.$backdrop.addClass('in');
		  
			if ( this.$element.hasClass('fade') ) {
				console.log( 'fade IN backdrop');
				showWithTransition( this.$backdrop, this.options.fadeTime, callback );

			}
			else {
				console.log( 'show backdrop');
				callback();
			   
			}

		} else if (!this.isShown && this.$backdrop) {
			//this.$backdrop.removeClass('in');
			
			console.log( "time A", new Date().getTime() );
		
			if ( this.$element.hasClass('fade') ) {
				console.log( 'fade OUT backdrop');
				hideWithTransition( this.$backdrop, this.options.fadeTime, $.proxy( removeBackdrop, this ) );

			}
			else {
				console.log( 'hide backdrop');
				removeBackdrop.call(this);
			   
			}

		} else if (callback) {
		  callback()
		}
	}

  function removeBackdrop() {
	console.log( "time B", new Date().getTime() );
    this.$element.insertAfter(this.$backdrop)
    this.$backdrop.remove()
    this.$backdrop = null
    $('html').css({ 'overflow' : 'auto'  })
  }

  function escape() {
    var that = this
    if (this.isShown && this.options.keyboard) {
      $(document).on('keyup.dismiss.modal', function ( e ) {
        e.which == 27 && that.hide()
      })
    } else if (!this.isShown) {
      $(document).off('keyup.dismiss.modal')
    }
  }


 /* MODAL PLUGIN DEFINITION
  * ======================= */

  $.fn.modal = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('modal')
        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option]()
      else if (options.show) data.show()
    })
  }

  $.fn.modal.defaults = {
      backdrop: true,
	  keyboard: true,
	  show: true,
	  fadeTime: 500
  }

  $.fn.modal.Constructor = Modal


 /* MODAL DATA-API
  * ============== */

  $(function () {
    $('body').on('click.modal.data-api', '[data-toggle="modal"]', function ( e ) {
      var $this = $(this), href
        , $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
        , option = $target.data('modal') ? 'toggle' : $.extend({}, $target.data(), $this.data())

      e.preventDefault()
      $target.modal(option)
    })
  })

}( window.jQuery );