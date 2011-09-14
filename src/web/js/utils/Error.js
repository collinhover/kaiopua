/*
Error.js
Handles compatibility checks and user viewable errors.
*/

define(["lib/jquery-1.6.3.min",
        "utils/Shared"],
    function () {
        var shared = require('utils/Shared'),
            errorContainer = $('#error_container'),
            errorID = 'error',
            errorHash = 'error=',
            errorMessages = {
                general: {
                    header: "Oops! That wasn't supposed to happen!",
                    message: "Something broke and we're very sorry about that. No worries though, any progress you've made has been saved. All you need to do is reload the page!"
                },
                webgl: {
                    header: "Oops! We need WebGL!",
                    message: "We are sorry, but it appears that your browser does not support WebGL. This could be due to a number of different reasons. For more information visit the <a href='http://get.webgl.org/troubleshooting/' target='_blank'>WebGL troubleshooting</a> page."
                },
                fourohfour: {
                    header: "Oops! Not found!",
                    message: "Sorry, but the page you were trying to view does not exist. This is probably the result of either a mistyped address or an out-of-date link."
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
        
        // check for internal errors
        function check () {
            var webgl;
            
            // webgl check
            webgl = has_webgl();
            if (webgl === true) {
                window.location.hash = errorHash + 'webgl';
            }
            
            // check url
            check_url();
        }
        
        // check url for errors
        function check_url () {
            var hashError, hashErrorIndex, errorType;
            
            // check url hash for error message
            hashError = window.location.hash.toString().replace(/#/, '');
            hashErrorIndex = hashError.indexOf(errorHash);
            if (hashErrorIndex != -1) {
                // get error type
                errorType = hashError.replace(/error=/i, '');
                
                // does error type match a specific errors?
                if (errorMessages.hasOwnProperty(errorType)) {
                    alert(errorMessages[errorType].message);
                }
                // else trigger general error
                else {
                    alert(errorMessages.general.message);
                }
                
                // clear hash out with history states
                history.pushState( { "pState": shared.originLink }, '', shared.originLink );
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
        
        // check once
        check();
        
        // return something to define module
        return {
            check: check,
            clear: clear
        };
    }
);