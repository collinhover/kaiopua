/*
Main.js
Main module, handles browser events.
*/

var KAIOPUA = (function (main, $) {
    
    $().ajaxStop(function () {
        alert('success');
    });
    
    $.get("js/lib/RequestAnimationFrame.js")
    $.get("js/lib/signals.min.js")
    //.get("js/lib/utils/Shared.js") 
    //.get("js/lib/utils/Dev")
    //.get("js/lib/utils/Error")
    
    
    
    function init () {
        alert('success');
    }
    
    return main; 
}(KAIOPUA || {}, jQuery));