var mainOptions = {
  file:{
    daily: true,
    name: "mainLog",
    outputName: "quad"
  },
  console: {
    enable: true
  },
  db: {
    name: "mainLog",
  },
  dbOnline:{ enable: false }
};

var mainLog = require(global.appRoot + "/loggers/baseLogger.js")(mainOptions);
// stream.write is needed for streaming morgan log to winston outputs
mainLog.stream = {
  write: function (message, encoding) {
    mainLog.info(message);
  }
};
module.exports = mainLog;
