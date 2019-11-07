var pulseModeOptions = {
  file:{
    daily: false,
    name: "pulseMode",
    outputName: "pulseMode"
  },
  console: {
    enable: true
  },
  db: {
    name: "pulseModeAll",
  },
  dbOnline:{ 
    enable: true,
    name: "pulseMode",
    nPoints: 1
  }
};

var pulseModeLog = require(global.appRoot + "/loggers/baseLogger.js")(pulseModeOptions);
// stream.write is needed for streaming morgan log to winston outputs
pulseModeLog.stream = {
  write: function (message, encoding) {
    pulseModeLog.info(message.trim());
  }
};
module.exports = pulseModeLog;
