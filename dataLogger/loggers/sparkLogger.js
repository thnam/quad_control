var sparkOptions = {
  file:{
    daily: true,
    name: "spark",
    outputName: "spark"
  },
  db: {
    name: "spark",
    enable: true
  },
  console: {
    enable: true
  },
  dbOnline: {
    enable: false,
  }
};

module.exports = require(global.appRoot + "/loggers/baseLogger.js")(sparkOptions);
