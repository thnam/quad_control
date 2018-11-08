var sparkHistOptions = {
  file:{
    daily: true,
    name: "sparkHistory",
    outputName: "sparkHistory"
  },
  db: {
    name: "sparkHistory",
    enable: true
  },
  console: {
    enable: true
  },
  dbOnline: {
    enable: false,
  }
};

module.exports = require(global.appRoot + "/loggers/baseLogger.js")(sparkHistOptions);
