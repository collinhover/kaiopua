/*
Error.js
Handles compatibility checks and user viewable errors.
*/

define([],
function () {
    var shared = require('utils/Shared'),
        domElement = shared.errorContainer,
        errorCurrent,
        errorID = 'error',
        errorHash = 'error=',
        errorTypes = {
            general: {
                header: "Oops! That wasn't supposed to happen!",
                message: "Something broke and we're very sorry about that. No worries though, if you were playing any progress you've made has been saved. All you need to do is reload the page!"
            },
            webgl_browser: {
                header: "Oops! We need WebGL!",
                message: "We are sorry, but it appears that your browser does not support WebGL. For more information visit <a href='http://get.webgl.org' target='_blank'>Get WebGL</a> to upgrade your browser."
            },
            webgl_other: {
                header: "Oops! We need WebGL!",
                message: "We are sorry, but it appears that your computer does not support WebGL. For more information visit the <a href='http://get.webgl.org/troubleshooting/' target='_blank'>WebGL troubleshooting</a> page."
            },
            fourohfour: {
                header: "Oops! Not found!",
                message: "Sorry, but the page you were trying to view does not exist. This is probably the result of either a mistyped address or an out-of-date link."
            },
            forbidden: {
                header: "We're afraid we can't let you do that.",
                message: "Sorry, but the page you were trying to view is locked or hidden for a reason we can't tell you."
            }
        },
        webglNames = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    // check once
    check();
    
    /*===================================================
    
    functions
    
    =====================================================*/
    
    // remove all error dom elements
    function clear () {
        domElement.empty();
    }
    
    // show error to user
    function show ( id ) {
        var header, explanation, article, articleHeight, footerModifier = 0, animSpeed = 300;
        
        // does id not match a specific error
        if (errorTypes.hasOwnProperty(id) === false) {
           id = 'general';
        }
    
        // header
        header = document.createElement('header');
        $(header).html(errorTypes[id].header);
        
        // explanation
        explanation = document.createElement('p');
        $(explanation).addClass("error_explanation");
        $(explanation).html(errorTypes[id].message)
        
        // article
        article = document.createElement('article');
        $(article).addClass("error unselectable");
        $(article).attr('id', id);
        
        // add to display
        $(article).append(header);
        $(article).append(explanation);
        domElement.append(article);
        
        // store
        errorCurrent = {article: article, header: header, explanation: explanation};
        
        // set height and negative margin-top
        // no need to position, css top/left at 50%
        if(typeof errorCurrent !== 'undefined' && typeof domElement !== 'undefined' && $.contains(domElement, errorCurrent.article) === true) {
            article = errorCurrent.article, header = errorCurrent.header, explanation = errorCurrent.explanation;
            articleHeight = $(header).outerHeight() + $(explanation).outerHeight();
            if (typeof $('footer') !== 'undefined') {
                footerModifier = $('footer').outerHeight() * 0.5;   
            }
            
            // fade and slide smoothly to new values
            $(header).fadeOut(0).fadeIn(animSpeed);
            $(explanation).fadeOut(0).fadeIn(animSpeed);
            $(article).animate({'height': articleHeight, 'margin-top': Math.round(-((articleHeight * 0.5) + footerModifier))}, animSpeed);
        }
    }
    
    // check for internal errors
    function check () {
        var canvas, context, i, l;
        
        // clear current errors
        clear();
        
        // webgl browser check
        if (!window.WebGLRenderingContext) {
            window.location.hash = errorHash + 'webgl_browser';
        }
        else {
            canvas = document.createElement( 'canvas' );
            
            // try each browser's webgl type
            for (i = 0, l = webglNames.length; i < l; i += 1) {
                try {
                    context = canvas.getContext(webglNames[i]);
                }
                catch ( e ) {}
                if (typeof context !== 'undefined') {
                    break;
                }
            }
            
            // if none found, there is another problem
            if (typeof context === 'undefined') {
                window.location.hash = errorHash + 'webgl_other';
            }
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
            
            // tell user why shit just got real
            show(errorType);
            
            // set url back to origin link with history states
            // always hide unnecessary information from users
            history.pushState( { "pState": shared.originLink }, '', shared.originLink );
        }
    }
    
    // return something to define module
    return {
        check: check,
        clear: clear,
        domElement: domElement
    };
});