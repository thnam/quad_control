module.exports = {
  apps : [{
    name: 'logger',
    script: 'dataLogger/app.js',
    watch: ["./dataLogger/loggers", "hwInterface",
      "./dataLogger/app.js"],
    env: { NODE_ENV: "development" }
  }, {
    name: 'http',
    script: 'httpServer/bin/www',
    watch: ["./httpServer/bin", "./httpServer/app.js",
      "./httpServer/routes", "./httpServer/utils", "./httpServer/views"
    ],
    env: { NODE_ENV: "production" }
    // env: { NODE_ENV: "development" }
  }
  ]
};
