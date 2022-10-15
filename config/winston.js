const path = require('path');
const winston = require('winston');
var logger = {};

///////////////////////////////////
// HTTP REQUEST LOGGER
var http_log_options = {
    file: {
        level: 'info',
        filename: path.join(__dirname, '../logs/access.log'),
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

logger.httplogger = winston.createLogger({
    transports: [
        new winston.transports.File(http_log_options.file),
     
    ],
    exitOnError: false, // do not exit on handled exceptions
});

logger.httplogger.stream = {
    write: function (message, encoding) {
        logger.httplogger.info(message);
    },
};

///////////////////////////////////
// ERROR LOGGER
var error_log_options = {
    file: {
        level: 'error',
        filename: path.join(__dirname, '../logs/error.log'),
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    }
};

logger.errorlogger = winston.createLogger({
    transports: [
        new winston.transports.File(error_log_options.file),
      
        new winston.transports.Console()   
          
    ],
    exitOnError: false, // do not exit on handled exceptions
});

logger.logError = function (err) {
    let message = { date: new Date().toISOString(), error: err };
    logger.errorlogger.error(message);
};




///////////////////////////////////
// APP EVENT LOGGER
var app_log_options = {
    file: {
        level: 'info',
        filename: path.join(__dirname, '../logs/app.log'),
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    }
};

logger.applogger = winston.createLogger({
    transports: [
        new winston.transports.File(app_log_options.file),
     
    ],
    exitOnError: false, // do not exit on handled exceptions
});

logger.logAppEvent = function (message) {
    if (process.env.NODE_ENV == "PROD"){
        message = { date: new Date().toISOString(), info: message };
        logger.applogger.info(message);
    }
};

module.exports = logger;