/* 
Dev Commands
Call using require('utils/DevCommands').functionName()
*/
var KAIOPUA = (function (main) {
    
    main.dev = main.dev || {};
    
    main.dev.commands = main.dev.commands || {};
    
    var commands = [], callbacks = {}, current = "", history = [];
    
    // add list of commands
    // cmds can be an object with any number of name + callback pairs
    // or an array of above
    function add ( cmds ) {
        var i, l, key;
        
        if ( typeof cmds !== 'undefined' ) {
            // is array?
            if ( cmds.hasOwnProperty('length') === true ) {
                // parse each recursively
                for (i = 0, l = cmds.length; i < l; i += 1) {
                    add(cmds[i]);
                }
            }
            // else assume object
            else {
                for (key in cmds) {
                    if ( cmds.hasOwnProperty(key) === true ) {
                        // check if already exists in commands
                        for (i = 0, l = commands.length; i < l; i += 1) {
                            if (commands[i] === key) {
                                throw('Duplicate dev command: ' + key);
                            }
                        }
                        
                        // add name to commands
                        commands.push(key);
                        
                        // add callback to callbacks
                        callbacks[key] = cmds[key];
                    }
                }
            }
        }
    }
    
    // execute a dev command
    // assumes cmd is a single string of comma separated values
    // anything before first comma is command, all following are arguments
    function execute ( cmd ) {
        var i, l, cmdParts, cmdPiece, command, args = [], callback;
        if ( typeof cmd === 'string' ) {
            // parse cmd
            cmdParts = cmd.split(",");
            
            // remove all non-essential white spaces in each part of cmd
            for (i = 0, l = cmdParts.length; i < l; i += 1) {
                cmdParts[i] = cmdParts[i].replace(/(^\s*)|(\s*$)/gi,"");
            }
            
            // store command
            history[history.length] = command = cmdParts[0];
            
            // store args
            args = cmdParts.slice(1);
            
            // search
            for (i = 0, l = commands.length; i < l; i += 1) {
                if (commands[i] === command) {
                    // store callback
                    callback = callbacks[command];
                    break;
                }
            }
            
            // execute
            if (typeof callback !== 'undefined') {
                callback.apply(this, args);
            }
        }
    }
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    main.dev.commands.current = current;
    main.dev.commands.add = add;
    main.dev.commands.execute = execute;
    main.dev.commands.get_history = function () {return history.slice(0);};
    main.dev.commands.clear_history = function () {history = [];};
    
    return main; 
    
}(KAIOPUA || {}));