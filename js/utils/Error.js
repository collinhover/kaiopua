/*
Error.js
Handles compatibility checks and user viewable errors.
*/

var KAIOPUA = (function (main) {
    
    var error = main.error = main.error || {},
        shared = main.shared = main.shared || {},
        errorState = false,
        errorCurrent = {},
        errorHash = 'error=',
        errorTypes = {
            general: {
                header: "Oops! That wasn't supposed to happen!",
                explanation: "Something broke and we're very sorry about that. No worries though, if you were playing any progress you've made has been saved. All you need to do is reload the page!"
            },
            webgl_browser: {
                header: "Oops! We need WebGL!",
                explanation: "We are sorry, but it appears that your browser does not support WebGL. For more information visit <a href='http://get.webgl.org' target='_blank'>Get WebGL</a> or try upgrading to one of these friendly browsers:",
                browser_extra: true
            },
            webgl_other: {
                header: "Oops! We need WebGL!",
                explanation: "Although your browser seems to support WebGL, it appears as if your computer does not. For more information visit the <a href='http://get.webgl.org/troubleshooting/' target='_blank'>WebGL troubleshooting</a> page."
            },
            fourohfour: {
                header: "Oops! Not found!",
                explanation: "Sorry, but the page you were trying to view does not exist. This is probably the result of either a mistyped address or an out-of-date link."
            },
            forbidden: {
                header: "We're afraid we can't let you do that.",
                explanation: "Sorry, but the page you were trying to view is locked or hidden for a reason we can't tell you."
            }
        },
        webglNames = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"],
        browser_html = "<div class='browsers_each chrome'><a href='http://www.google.com/chrome/' target='_blank'>Chrome</a></div><div class='browsers_each firefox'><a href='http://www.mozilla.org/firefox/' target='_blank'>Firefox</a></div><div class='browsers_each safari'><a href='http://www.apple.com/safari/' target='_blank'>Safari</a></div>";
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    // clear current errors
    clear();
    
    // check internal
    check_internal();
    
    function check_internal () {
        var canvas, context, errorType, i, l;
        
        // webgl browser check
        if (!window.WebGLRenderingContext) {
            errorType = 'webgl_browser';
        }
        else {
            canvas = document.createElement( 'canvas' );
            
            // try each browser's webgl type
            for (i = 0, l = webglNames.length; i < l; i += 1) {
                try {
                    context = canvas.getContext(webglNames[i]);
                }
                catch ( e ) {
                }
                if (context !== null && typeof context !== 'undefined') {
                    break;
                }
            }
            
            // if none found, there is another problem
            if (context === null || typeof context === 'undefined') {
                errorType = 'webgl_other';
            }
        }
        
        // if error found, flag
        if (typeof errorType !== 'undefined') {
            flag(errorType);
        }
    }
    
    /*===================================================
    
    functions
    
    =====================================================*/
    
    // remove error state
    function clear () {
        shared.html.errorContainer.empty();
        errorCurrent = {};
        errorState = false;
    }
    
    // flag error
    function flag ( errorType ) {
        if (typeof errorType !== 'undefined') {
            window.location.hash = errorHash + errorType;
        }
    }
    
    // read flagged error
    function read () {
        var hashError, hashErrorIndex;
        
        // check url hash for error message
        hashError = window.location.hash.toString().replace(/#/, '');
        hashErrorIndex = hashError.indexOf(errorHash);
        if (hashErrorIndex != -1) {
            // get error type
            errorCurrent.type = hashError.replace(/error=/i, '');
            
            // set error state
            errorState = true;
        }
    }
    
    // check for errors
    function check () {
        // clear current errors
        clear();
        
        // read flagged errors
        read();
        
        return errorState;
    }
    
    // process error state
    function process ( origin ) {
        if (errorState === true) {
            // show current
            show(errorCurrent.type);
            
            // set url back to origin link with history states
            // always hide unnecessary information from users
            history.pushState( { "pState": shared.originLink }, '', shared.originLink );
            
            // trigger shared error signal
            shared.signals.error.dispatch(errorCurrent.type, origin || 'Unknown Origin', 'N/A');
        }
    }
    
    // generate error
    function generate ( errorType, origin ) {
        if (typeof errorType !== 'undefined') {
            // flag error
            flag(errorType);
            
            // check for flagged errors
            check();
            
            // process errors
            process(origin);
        }
    }
    
    // show error to user
    function show ( errorType ) {
        var header, explanation, extra, article, articleHeight, footerModifier = 0, animSpeed = 500;
        
        // does id not match a specific error
        if (errorTypes.hasOwnProperty(errorType) === false) {
           errorType = 'general';
        }
    
        // header
        header = document.createElement('header');
        $(header).html(errorTypes[errorType].header);
        
        // explanation
        explanation = document.createElement('p');
        $(explanation).addClass("error_explanation");
        $(explanation).html(errorTypes[errorType].explanation);
        
        // extra
        if (errorTypes[errorType].browser_extra === true) {
            extra = document.createElement('div');
            $(extra).addClass("browsers");
            $(extra).html(browser_html);
        }
        
        // article
        article = document.createElement('article');
        $(article).addClass("error unselectable");
        $(article).attr('id', errorType);
        
        // add to display
        $(article).append(header);
        $(article).append(explanation);
        shared.html.errorContainer.append(article);
        
        // set height and negative margin-top
        // no need to position, css top/left at 50%
        articleHeight = $(header).outerHeight() + $(explanation).outerHeight();
        if (typeof shared.html.staticMenu !== 'undefined') {
            footerModifier = shared.html.staticMenu.outerHeight() * 0.5;   
        }
        
        // append extra if needed
        if(typeof extra !== 'undefined') {
            $(article).append(extra);
            articleHeight = articleHeight + $(extra).outerHeight();
            $(extra).fadeOut(0).fadeIn(animSpeed);
        }
        
        // fade and slide smoothly to new values
        $(header).fadeOut(0).fadeIn(animSpeed);
        $(explanation).fadeOut(0).fadeIn(animSpeed);
        $(article).animate({
            'height': articleHeight, 
            'margin-top': Math.round(-((articleHeight * 0.5) + footerModifier))
        }, animSpeed);
        
        // store
        errorCurrent.domElements = {
            article: article, 
            header: header, 
            explanation: explanation,
            extra: extra
        };
    }
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    error.check = check;
    error.generate = generate;
    error.process = process;
    error.clear = clear;
    
    return main; 
    
}(KAIOPUA || {}));