module.exports = {
  apps : [{
    name: 'logger',
    script: 'dataLogger/app.js',
    watch: ["./dataLogger/loggers", "./dataLogger/drivers/",
      "./dataLogger/app.js"],
  }
  ]
};
