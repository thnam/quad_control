var cvOptions = {
  file:{
    daily: true,
    name: "cv",
    outputName: "Voltages"
  },
  console:{
    enable: true
  },
  db: {
    name: "cv",
    enable: true
  },
  dbOnline: {
    enable: true,
    name: "cvOnline",
    nPoints: require("config").logger.onlineDataPoints
  }
};

module.exports = require(global.appRoot + "/loggers/baseLogger.js")(cvOptions);
