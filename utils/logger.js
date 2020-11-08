/**
 * Log wrapper
 */

class Logger {

    static debug(msg){
        console.debug(msg);
    }

    static error(msg){
        console.error(msg);
    }

}

module.exports.logger = Logger;