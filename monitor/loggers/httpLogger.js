var mainOptions = {
  file:{
    daily: true,
    name: "httpLog",
    outputName: "http"
  },
  console: {
    enable: true
  },
  db: {
    name: "http",
  },
  dbOnline:{ enable: false }
};

var httpLog = require(global.appRoot + "/loggers/baseLogger.js")(mainOptions);
// stream.write is needed for streaming morgan log to winston outputs
httpLog.stream = {
  write: function (message, encoding) {
    httpLog.info(message.trim());
  }
};
module.exports = httpLog;
