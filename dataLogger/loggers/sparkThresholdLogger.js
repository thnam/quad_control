var thrOptions = {
  file:{
    daily: true,
    name: "sparkThreshold",
    outputName: "sparkThreshold"
  },
  db: {
    name: "sparkThreshold",
  },
  console: {
    enable: true
  },
  dbOnline: {
    enable: false,
  }
};

module.exports = require(global.appRoot + "/loggers/baseLogger.js")(thrOptions);
