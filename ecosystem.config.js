module.exports = {
  apps : [{
    name: 'logger',
    script: 'dataLogger/app.js',
    watch: ["./dataLogger/loggers", "hwInterface",
      "./dataLogger/app.js"],
  }, {
    name: 'http',
    script: 'httpServer/bin/www',
    watch: ["./httpServer/bin", "./httpServer/app.js",
      "./httpServer/routes", "./httpServer/utils" ],
  }
  ]
};
