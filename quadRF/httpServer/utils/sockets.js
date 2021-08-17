// Socket io for pushing periodic events.
const io = require('socket.io')(require(`${global.appRoot}/bin/www`), { cookie: false });
const httpLog = require(`${global.appRoot}/loggers/httpLogger`);
const config = require('config');
const net = require('net');

/**
 * Socket communication with the backend server to control and monitor the signal generators.
 */
class BackendServer {
	constructor(host, port) {
		this.host = host;
		this.port = port;
	}

	connect() {
		this.socket = net.connect({
			host: this.host,
			port: this.port
		});

		this.socket.setEncoding('utf-8');

		this.socket.on('connect', ()=>{
			httpLog.info('Connected to the server.');
		});

		this.socket.on('data', data=>{
			io.emit('backendData', JSON.parse(data));
		});

		this.socket.on('close', ()=>{
			httpLog.warn('close');
			io.emit('noBackendConnection');
		});

		this.socket.on('error', err=>{
			httpLog.error(`Failed to connect to the backend server: ${err.code}`);
		});
	}

	disconnect() {
		this.socket.destroy();
		io.emit('noBackendConnection');
	}

	reconnect() {
		this.socket.destroy();
		this.connect();
	}

	checkConnection() {
		if (this.hasOwnProperty('socket')) {
			httpLog.info('ReadyState: ' + this.socket.readyState);
			if (this.socket.readyState === 'closed') {
				this.connect();
			}
			return this.socket.readyState;
		}
	}

	shutdownBackendServer() {
		this.write({cmd: 'shutdownServer'})
	}

	write(data) {
		this.socket.write(JSON.stringify(data));
	}
}

const backendServer = new BackendServer(config.backendServer.ip, config.backendServer.port);

let intervals = []; // Contains timer id for each setInterval.
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
			case 'reconnect':
				backendServer.reconnect();
				break;
			case 'checkConnection':
				backendServer.checkConnection();
				break;
			case 'shutdownBackendServer':
				backendServer.shutdownBackendServer();
				break;
			case 'write':
				backendServer.write(data.data);
				break;
		}
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

	intervals.forEach(clearInterval);
	intervals = [];
	// All the setInterval periodic jobs should be below here!
	
	intervals.push(
		setInterval(()=>{
			const date = new Date();
			const dateStr = `${date.toDateString()} - ${date.toLocaleTimeString()}`;
			socket.emit('timeStamp', { timeStamp: dateStr });
		}, 1000)
	);

	intervals.push(
		setInterval(()=>{
			if (backendServer.checkConnection() === 'open') {
				backendServer.write({cmd: 'updateStatus'});
			}
		}, config.backendServer.updatePeriod)
	);
});

module.exports = io;