/*
Error.js
Handles compatibility checks and user viewable errors.
*/

define(["lib/jquery-1.6.3.min"],
    function () {
        var errorContainer = $('#error_container'),
            errorID = 'error';
            errorMessages = {
                fallback: {
                    header: "Oops! That wasn't supposed to happen!",
                    message: "Something broke and we're very sorry about that. No worries though, any progress you've made has been saved. All you need to do is reload the page!"
                },
                webgl: {
                    header: "Oops! We need WebGL!",
                    message: "We are sorry, but it appears that your browser does not support WebGL. This could be due to a number of different reasons. For more information visit the <a href='http://get.webgl.org/troubleshooting/' target='_blank'>WebGL troubleshooting</a> page."
                }
            };
        
        // remove all error dom elements
        function clear () {
            errorContainer.empty();
        }
        
        // show error to user
        function show ( id ) {
            var section, header, article;
            
            // header
            
            // article
        }
        
        // check for errors
        function check () {
            var webgl;
            
            // webgl check
            webgl = has_webgl();
            if (webgl === false) {
                
            }
        }
        
        // has webgl
        function has_webgl () {
            try { 
                return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' );
            } 
            catch( e ) { 
                return false;
            }
        }
        
        // clear error container
        clear();
        
        // return something to define module
        return {
            check: check,
            clear: clear
        };
    }
);