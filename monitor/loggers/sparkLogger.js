var sparkOptions = {
  file:{
    daily: true,
    name: "sparkHistory",
    outputName: "sparkHistory"
  },
  db: {
    name: "sparkHistory",
    enable: false
  },
  console: {
    enable: true
  },
  dbOnline: {
    enable: false
  }
};

var thisLogger = require(global.appRoot + "/loggers/baseLogger.js")(sparkOptions);
// stream.write is needed for streaming morgan log to winston outputs
thisLogger.stream = {
  write: function (message, encoding) {
    thisLogger.info(message.trim());
  }
};
module.exports = thisLogger;

