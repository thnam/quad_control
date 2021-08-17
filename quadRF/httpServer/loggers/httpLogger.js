let mainOptions = {
	file: {
		daily: true,
		name: 'httpLog',
		outputName: 'http'
	},
	console: { enable: true },
	db: { name: 'http' },
	dbOnline: { enable: false }
};

let httpLog = require(`${global.appRoot}/loggers/baseLogger`)(mainOptions);

// Stream.write is needed for streaming morgan log to winston outputs
httpLog.stream = {
	write: function (message, encoding) {
		httpLog.info(message.trim());
	}
};

module.exports = httpLog;