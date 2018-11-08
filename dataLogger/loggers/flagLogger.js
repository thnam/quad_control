var flagOptions = {
  file:{
    daily: false,
    name: "flag",
    outputName: "flag"
  },
  db: {
    enable: false
  },
  console: {
    enable: true
  },
  dbOnline: {
    enable: true,
    name: "flag",
    nPoints: 1
  }
};

module.exports = require(global.appRoot + "/loggers/baseLogger.js")(flagOptions);
