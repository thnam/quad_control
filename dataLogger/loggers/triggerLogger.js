var triggerOptions = {
  file:{
    daily: false,
    name: "triggerState",
    outputName: "triggerState"
  },
  console: {
    enable: true
  },
  db: {
    name: "mainLog",
    enable: true
  },
  dbOnline:{
    enable: true,
    name: "triggerState",
    nPoints: 1
  }
};

module.exports = require(global.appRoot + "/loggers/baseLogger.js")(triggerOptions)
