module.exports = {
  apps : [{
    name: 'logger',
    script: 'dataLogger/app.js',
    // node_args: "--inspect=127.0.0.1:9230",
    watch: ["./dataLogger/loggers", "hwInterface",
      "./dataLogger/app.js"],
    env: { NODE_ENV: "development" }
  }, {
    name: 'http',
    script: 'httpServer/bin/www',
    // node_args: "--inspect",
    watch: ["./httpServer/bin", "./httpServer/app.js",
      "./httpServer/routes", "./httpServer/utils", "./httpServer/views"
    ],
    // env: { NODE_ENV: "production" }
    env: { NODE_ENV: "development" }
  }
  ]
};
