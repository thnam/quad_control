module.exports = {
  apps : [{
    name: 'logger',
    script: 'dataLogger/app.js',
    max_memory_restart : "200M",
    watch: ["./dataLogger/loggers", 
      "./dataLogger/app.js"],
    env: { NODE_ENV: "production" }
  }, {
    name: 'http',
    script: 'httpServer/bin/www',
    max_memory_restart : "200M",
    watch_delay: 1000,
    watch: ["./httpServer/bin", "./httpServer/app.js",
      "./httpServer/routes", "./httpServer/utils", "./httpServer/views"
    ],
    env: { NODE_ENV: "production" }
  }, {
    name: "monitor",
    script: "monitor/bin/www",
    watch: ["./monitor/bin", "./monitor/app.js",
      "./monitor/routes", "./monitor/views", "./monitor/utils"
    ],
    env: {NODE_ENV: "production"}
  }]
};
