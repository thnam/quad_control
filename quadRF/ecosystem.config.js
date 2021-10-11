module.exports = {
	apps : [{
		name       	: "http_RF",
		script     	: "./httpServer/bin/www",
		max_memory_restart: '200M',				// Restart if the memory allocation exceeds this
		watch	   	: ['./httpServer/bin',		// Restart if any of these files has been modified
					   './httpServer/app.js',
					   './httpServer/routes',
					   './httpServer/utils',
					   './httpServer/views' ],
		watch_delay	: 1000,
		env			: {
			NODE_ENV: 'development',
			role	: 'main'
		}
	}]
}
