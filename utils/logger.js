/**
 * Log wrapper
 */

class Logger {

    static debug(msg){
        console.debug(msg);
    }

    static error(msg, error){
        console.error(msg, error);
    }

}

module.exports.logger = Logger;