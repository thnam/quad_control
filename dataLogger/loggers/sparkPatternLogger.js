var sparkOptions = {
  file:{
    daily: true,
    name: "spark",
    outputName: "spark"
  },
  db: {
    enable: false
  },
  console: {
    enable: true
  },
  dbOnline: {
    enable: true,
    name: "sparkPattern",
    nPoints: 1
  }
};

module.exports = require(global.appRoot + "/loggers/baseLogger.js")(sparkOptions);
