// Socket io for pushing periodic events.
const io = require('socket.io')(require(`${global.appRoot}/bin/www`), { cookie: false });
const httpLog = require(`${global.appRoot}/loggers/httpLogger`);
const config = require('config');
const net = require('net');
const fs = require('fs');
const spawn = require('child_process').spawn;

/**
 * Socket communication with the backend server to control and monitor the signal generators.
 */

class BackendServer {
	constructor(host, port) {
		this.host = host;
		this.port = port;
		console.log('BackendServer instance is constructed!');
	}

	connect() {
		if (this.hasOwnProperty('socket')) {
			if (this.socket.readyState === 'open') {
				this.write({cmd:'updateStatus'});
				httpLog.warn('BackendServer is already connected.');
				return;
			} else if (this.socket.readyState === 'opening') {
				httpLog.warn('BackendServer is being connected. Please wait.');
				return;
			}
		}
		this.socket = net.connect({
			host: this.host,
			port: this.port
		});
		// Wait 3 seconds to connect to the server.
		this.socket.setTimeout(3000);

		this.socket.setEncoding('utf-8');

		this.socket.on('connect', ()=>{
			httpLog.info('Connected to the backend server.');
			this.write({cmd:'updateStatus'});
			
			if (this.hasOwnProperty('periodicUpdate')) {
				// clearInterval(this.periodicUpdate);
				this.periodicUpdate.refresh();
			} else {
				this.periodicUpdate = setInterval(()=>{
					if (this.socket.readyState === 'open') {
						this.write({cmd:'updateStatus'});
					}
				}, config.backendServer.updatePeriod);
			}

			this.socket.setTimeout(0);
			io.emit('backendData', {type:'server', state:this.socket.readyState});
		});

		this.socket.on('data', data=>{
			console.log(data);
			// Make sure accidently concatenated JSON strings are separated properly.
			const split = data.split('}{');
			if (split.length === 1) {
				io.emit('backendData', JSON.parse(data));
			} else {
				split.forEach((datum, index)=>{
					if (index === 0) {
						io.emit('backendData', JSON.parse(datum + '}'));
					} else if (index === split.length-1) {
						io.emit('backendData', JSON.parse('{' + datum));
					} else {
						io.emit('backendData', JSON.parse('{' + datum + '}'));
					}
				});
			}
		});

		this.socket.on('close', ()=>{
			httpLog.warn('No connection with the backend server.');
			io.emit('backendData', {type:'server', state:this.socket.readyState});
		});

		this.socket.on('error', err=>{
			httpLog.error(`Failed to connect to the backend server: ${err.code}`);
		});
		
		this.socket.on('timeout', ()=>{
			console.log('Seems like the backend server is not running.');
			this.socket.destroy();
		});
	}

	disconnect() {
		this.socket.destroy();
	}

	shutdownBackendServer() {
		this.write({cmd: 'shutdownServer'})
	}

	write(data) {
	    const str = JSON.stringify(data);
    	this.socket.write(str);
	}
}

function sendFileList(socket){
	fs.readdir('./httpServer/presets/', (err, files)=>{
		socket.emit('returnFileSystem', {
			cmd: 'refresh',
			data: files
		});
	});
}

function accessFileSystem(socket, data){
	switch (data.cmd) {
		case 'refresh':
			sendFileList(socket);
			break;
		case 'load':
			fs.open(`./httpServer/presets/${data.name}`, 'r', (err, fd)=>{
				if (err){
					httpLog.error(err);
				}
				let buffer = new Buffer.alloc(1024);
				fs.read(fd, buffer, 0, buffer.length, 0, (err, bytes)=>{
					if (err){
						httpLog.error(err);
					}
					// Emit to ALL users.
					io.emit('returnFileSystem', {
						cmd: 'load',
						name: data.name,
						content: buffer.toString()
					});
				});
			});
			break;
		case 'save':
			fs.open(`./httpServer/presets/${data.name}`, 'w', (err, fd)=>{
				if (err){
					httpLog.error(err);
				}
				fs.write(fd, data.content, (err, bytes)=>{
					if (err){
						httpLog.error(err);
					}
					// Refresh the dialog after save.
					sendFileList(socket);
				});
			});
			break;
		case 'rename':
			fs.rename(`./httpServer/presets/${data.name}`, `./httpServer/presets/${data.rename}`, err=>{
				if (err) httpLog.error(err);
			});
			// Refresh the dialog after rename.
			sendFileList(socket);
			break;
		case 'remove':
			fs.unlink(`./httpServer/presets/${data.name}`, err=>{
				if (err) httpLog.error(err);
			});
			// Refresh the dialog after removal.
			sendFileList(socket);
			break;
	}
}

const backendServer = new BackendServer(config.backendServer.ip, config.backendServer.port);

let interval = [];
let users = []; // Contains the connected clients (socket id).

/**
 * Use io.emit for broadcasting to all clients.
 * socket (as a function argument) is for the client who sends a socket emit.
 */
io.on('connection', function (socket) {
	if (!users.includes(socket.id)) users.push(socket.id);

	io.emit('user:join', {
		name: socket.id,
		users: users.length
	});

	socket.emit('greeting', {
		message: 'Greeting from RF controller.',
		controller: config.controller,
		role: process.env.role,
		waveformConfig: config.waveformConfig
	});

	socket.on('reloadReq', ()=>{
		httpLog.info('reloadReq received, will broadcast reload to all clients.');
		io.emit('reload');
	});

	socket.on('message', data=>{
		httpLog.info(`Msg received: ${data}`);
	});

	socket.on('backendServer', data=>{
		httpLog.info('Request to commuincate with the backend server.');
		switch (data.cmd) {
			case 'connect':
				backendServer.connect();
				break;
			case 'disconnect':
				backendServer.disconnect();
				break;
			case 'shutdownBackendServer':
				backendServer.shutdownBackendServer();
				break;
			case 'write':
				backendServer.write(data.data);
				break;
		}
	});

	socket.on('synchronize', data=>{
		console.log('SYNC: ', data);
		io.emit('synchronize', data);
	});

	socket.on('accessFileSystem', data=>{
		httpLog.info('Request to access the file system in the server.');
		accessFileSystem(socket, data);
	});

	socket.on('runPyScript', ()=>{
		interval.forEach(clearInterval);

		const pyProcess = spawn('python', [`${global.appRoot}/../fetchScopeData/tektronics-lb.py`]);
		pyProcess.stdout.on('data', data=>{
			// httpLog.info(`Stdout from the pyProcess: ${data}`);
			io.emit('reload_imageRFOutputs');

			interval.push(setInterval(()=>{
				io.emit('checkRFOutputs');
			}, 60000));
		});
		pyProcess.stderr.on('data', data=>{
			httpLog.info(`Stdout from the pyProcess: ${data}`);
		});
	});

	socket.on('debug', data=>{
		eval(data);
	});

	socket.on('disconnect', ()=>{
		users.splice(users.indexOf(socket.id), 1);
		io.emit('user:left', {
			name: socket.id,
			users: users.length
		});
	});
});

// Timestamp
setInterval(()=>{
	const date = new Date();
	const dateStr = `${date.toDateString()} - ${date.toLocaleTimeString()}`;
	io.emit('timeStamp', { timeStamp: dateStr });
}, 1000);

// Fetch RF output status (oscilloscope data)
interval.push(setInterval(()=>{
	io.emit('checkRFOutputs');
}, 5000));

module.exports = io;
