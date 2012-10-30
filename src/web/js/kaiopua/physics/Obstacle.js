/*
 *
 * Obstacle.js
 * General collision based obstacle.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/physics/Obstacle.js",
		_Obstacle = {},
		_Model;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Obstacle,
		requirements: [
			"js/kaiopua/core/Model.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m ) {
		console.log('internal Obstacle', _Obstacle);
		// modules
		
		_Model = m;
		
		// instance
		
		_Obstacle.Instance = Obstacle;
		_Obstacle.Instance.prototype = new _Model.Instance();
		_Obstacle.Instance.prototype.constructor = _Obstacle.Instance;
		
		_Obstacle.Instance.prototype.affect = affect;
		_Obstacle.Instance.prototype.unaffect = unaffect;
		
	}
	
	/*===================================================
    
    obstacle
    
    =====================================================*/
	
	function Obstacle ( parameters ) {
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// properties
		
		this.affecting = [];
		
	}
	
	/*===================================================
    
    affect
    
    =====================================================*/
	
	function affect ( object ) {
		
		var affected,
			index;
		
		index = main.index_of_property( this.affecting, 'object', object );
		
		if ( index === -1 ) {
			
			affected = {
				object: object
			};
			
			this.affecting.push( affected );
			
		}
		else {
			
			affected = this.affecting[ index ];
			
		}
		
		return affected;
		
	}
	
	function unaffect ( object ) {
		
		var index;
		
		index = main.index_of_property( this.affecting, 'object', object );
		
		if ( index !== -1 ) {
			
			return this.affecting.splice( index, 1 )[ 0 ];
			
		}
		
	}
	
} ( KAIOPUA ) );