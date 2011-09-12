/* 
Dev Commands
Call using require('utils/DevCommands').functionName()
*/
define([], function () {
    var commands = [], callbacks = {}, current = "", entered = [];
    
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
        var i, l, cmdParts, cmdPiece, reResult, command, args = [], callback;
        if ( typeof cmd === 'string' ) {
            // parse cmd
            cmdParts = cmd.split(",");
            
            for (i = 0, l = cmdParts.length; i < l; i += 1) {
                cmdPiece = cmdParts[i];
                
                // remove all white space chars until first valid char
                reResult = cmdPiece.search(/\S/);
                if (reResult > 0) {
                    cmdPiece = cmdPiece.slice(reResult, cmdPiece.length);
                }
                
                // remove all white space chars after last valid char
                reResult = cmdPiece.search(/(\S)(?!\S)/);
                alert(reResult);
                if (reResult !== -1 && reResult < cmdPiece.length - 1) {
                    cmdPiece = cmdPiece.slice(0, reResult + 1);
                }
                
                // store new cmd piece
                cmdParts[i] = cmdPiece;
            }
            
            // store command
            command = cmdParts[0];
            
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
    
    // return something to define module
    return {
        current: current,
        add: add,
        execute: execute
    };

});