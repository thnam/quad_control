var timingOptions = {
  file:{
    daily: false,
    name: "timing",
    outputName: "timing"
  },
  console: {
    enable: true
  },
  db: {
    name: "timing",
  },
  dbOnline:{ 
    enable: true,
    name: "currentTiming",
    nPoints: 1
  }
};

var timingLog = require(global.appRoot + "/loggers/baseLogger.js")(timingOptions);
// stream.write is needed for streaming morgan log to winston outputs
timingLog.stream = {
  write: function (message, encoding) {
    timingLog.info(message.trim());
  }
};
module.exports = timingLog;
