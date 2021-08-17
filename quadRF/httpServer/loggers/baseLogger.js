const { createLogger, format, transports } = require('winston');
const { colorize, combine, timestamp, printf } = format
require('winston-mongodb').MongoDB;
require('winston-daily-rotate-file');

// Get database login info from config.
const config = require('config');

const dbUrl = `mongodb://${config.get('mongo.host')}:${config.get('mongo.port').toString()}/${config.get('mongo.db')}`;

// Custom timestamp for console.
const consoleTimestampFormat = printf(info => {
    let date = new Date();
    dateStr = date.toDateString() + " - " + date.toLocaleTimeString();
    return `${dateStr} - ${info.message}`
});

// Create log directory if not exist.
const fs = require('fs');
const logDir = `${global.appRoot}/logs`;
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// Export the logger, with some options.
module.exports = function (options){
	// Create a place holder logger.
	let logger = createLogger({
		exitOnError: false
	});

	// Add components according to options.
	let loggerOptions = {
		file: {
			name: options.file.name,
			handleExceptions: true,
			filename: `${logDir}/${options.file.outputName}.log`
		},
		fileDaily: {
			name: `${options.file.name}_dailyFile`,
			handleExceptions: true,
			format: combine(timestamp(), colorize(), consoleTimestampFormat),
			// datePattern: "YYYY-MM-DD-HH-mm", // every minute
			// datePattern: "YYYY-MM-DD-HH", // every hour
			datePattern: "YYYY-MM-DD", // daily
			filename: `${logDir}/${options.file.outputName}.log`
		},
		db: {
			db : dbUrl,
			collection: options.db.name,
			name: `${options.db.name}_db`,
			handleExceptions: false,
			level: 'info',
			options: { useNewUrlParser: true, useUnifiedTopology: true }
		}
	};

	if (options.file.daily) {
		logger.add(new transports.DailyRotateFile(loggerOptions.fileDaily));
	} 
	else {
		logger.add(new transports.File(loggerOptions.file));
	}

	logger.add(new transports.MongoDB(loggerOptions.db));

	if (options.console.enable) {
		loggerOptions.console = {
			level: 'debug',
			handleExceptions: true,
			json: false,
			format: combine(timestamp(), consoleTimestampFormat),
		};
		logger.add(new transports.Console(loggerOptions.console));
	}

	if (options.dbOnline.enable) {
		loggerOptions.dbOnline = {
			db : dbUrl,
			collection : options.dbOnline.name,
			name: `${options.dbOnline.name}_onlineDB`,
			level : 'info',
			capped: 'true',
			handleExceptions: false,
			cappedMax: options.dbOnline.nPoints,
			options: { useNewUrlParser: true, useUnifiedTopology: true }
		};
		logger.add(new transports.MongoDB(loggerOptions.dbOnline));
	};

	return logger;
}

