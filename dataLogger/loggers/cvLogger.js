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

const cvLog = require(global.appRoot + "/loggers/baseLogger.js")(cvOptions);


module.exports = cvLog;
