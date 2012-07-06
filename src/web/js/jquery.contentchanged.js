(function( $ ){
	'use strict';

	$.fn.contentchanged = function(fn) {
		return this.bind('contentchanged', fn);
	};

	$.event.special.contentchanged = {
		setup: function(data, namespaces) {
			var self = this,
				$this = $(this),
				$originalContent = $this.text();
			$this.data( 'interval', setInterval(function(){
				if($originalContent != $this.text()) {
						$originalContent = $this.text();
						$.event.special.contentchanged.handler.call(self);
				}
			},500) );
		},
		teardown: function(namespaces){
			clearInterval( $(this).data( 'interval' ) );
		},
		handler: function(event) {
			$.event.handle.call(this, {type:'contentchanged'})
		}
	};

})( window.jQuery );