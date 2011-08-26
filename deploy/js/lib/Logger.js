/*
 * @author mr.doob / http://mrdoob.com/
 */

var Logger = function () {

	this.domElement = document.createElement( 'div' );
	this.domElement.style.fontFamily = 'Helvetica, Arial, sans-serif';
	this.domElement.style.textAlign = 'left';
	this.domElement.style.fontSize = '10px';
	this.domElement.style.padding = '2px 0px 3px 0px';

	this.log = function ( msg, expand ) {

		this.domElement.appendChild( document.createTextNode( msg ) );
		this.domElement.appendChild( document.createElement( 'br' ) );

		if ( expand && msg instanceof Object ) {

			for ( var param in msg ) {

				this.domElement.appendChild( document.createTextNode( '- ' + param + ': ' + msg[ param ] ) );
				this.domElement.appendChild( document.createElement( 'br' ) );

			}

		}

	};

	this.clear = function () {

		while ( this.domElement.childNodes.length > 0 ) {

			this.domElement.removeChild( this.domElement.childNodes[ 0 ] );

		}

	};

};
