const {createLogger, format, transports} = require('winston');
const { colorize, combine, timestamp, printf } = format
require('winston-mongodb').MongoDB;
require('winston-daily-rotate-file');

// getting database login info from config/default.js
const config = require('config');
var dbUrl = "mongodb://";
// if (process.env.NODE_ENV == "production") 
  // dbUrl += config.get("mongo.user") + ":" + config.get("mongo.password") + "@";
dbUrl += config.get("mongo.host") + ":" + config.get("mongo.port").toString() +
  "/" + config.get("mongo.db");

// custom timestamp for console
const consoleTimestampFormat = printf(info => {
  var date = new Date();
  dateStr = date.toDateString() + " - " + date.toLocaleTimeString();
  return `${dateStr} - ${info.message}`
});

const logTimestampFormat = consoleTimestampFormat;

// create log directory if not exist
const fs = require('fs');
const logDir = global.appRoot + '/logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
};

// export the logger, with some options
module.exports = function (options){
  // create a place holder logger
  var logger = createLogger({
    exitOnError: false
  });

  // add components according to options
  var loggerOptions = {
    file:{
      name: options.file.name,
      handleExceptions: true,
      filename: logDir + "/" + options.file.outputName + ".log"
    },
    fileDaily: {
      name: options.file.name + "_dailyFile",
      handleExceptions: true,
      format: combine(timestamp(), colorize(), logTimestampFormat),
      // datePattern: "YYYY-MM-DD-HH-mm", // every minute
      // datePattern: "YYYY-MM-DD-HH", // every hour
      datePattern: "YYYY-MM-DD", // daily
      filename: logDir + "/" + options.file.outputName + ".log"
    },

    db: {
      db : dbUrl,
      collection: options.db.name,
      name: options.db.name + "_db",
      handleExceptions: false,
      level: "info",
      options:{ useNewUrlParser: true, useUnifiedTopology: true}
    }
  };

  if (options.file.daily) {
    logger.add(new transports.DailyRotateFile(loggerOptions.fileDaily));  
  } 
  else {
    logger.add(new transports.File(loggerOptions.file));
  };

  logger.add( new transports.MongoDB(loggerOptions.db));

  if (options.console.enable) {
    loggerOptions.console = {
      level: "debug",
      handleExceptions: true,
      json: false,
      format: combine(timestamp(), consoleTimestampFormat),
    };
    logger.add(new transports.Console(loggerOptions.console));
  };

  if (options.dbOnline.enable) {
    loggerOptions.dbOnline = {
      db : dbUrl,
      collection : options.dbOnline.name,
      name: options.dbOnline.name + "_onlineDB",
      level : 'info',
      capped: "true",
      handleExceptions: false,
      cappedMax: options.dbOnline.nPoints,
      options:{ useNewUrlParser: true, useUnifiedTopology: true}
    };
    logger.add(new transports.MongoDB(loggerOptions.dbOnline));
  };

  return logger;
}

