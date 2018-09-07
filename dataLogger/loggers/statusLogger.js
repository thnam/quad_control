var statusOptions = {
  file:{
    daily: true,
    name: "pulserStatus",
    outputName: "pulserStatus"
  },
  db: {
    name: "pulserStatus",
  },
  console: {
    enable: true
  },
  dbOnline: {
    enable: true,
    name: "pulserStatusOnline",
    nPoints: require("config").logger.onlineStatusDataPoints
  }
};

module.exports = require(global.appRoot + "/loggers/baseLogger.js")(statusOptions);
