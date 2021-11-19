const baseUrl = `http://${document.location.hostname}:${document.location.port}`;
console.log('baseUrl is: ' + baseUrl);
let socket = io.connect(baseUrl);

socket.on('greeting', function (data) {
    window.controller = data.controller;
    window.role = data.role;
    console.info(data.message);
    console.info(`Controller in use is: ${window.controller}`);
    console.info(`Role of this GUI is: ${data.role}`);
    window.waveformConfig = data.waveformConfig;
});

socket.on('user:join', function (data) {
    console.info(`New user ${data.name} joined.`);
    console.info(`Total number of users joined: ${data.users}`);
});

socket.on('user:left', function (data) {
    console.info(`The user ${data.name} left.`);
    console.info(`Total number of users joined: ${data.users}`);
});

socket.on('reload', ()=>{
    console.info('Forced reload message received.');
    window.location.reload();
});

socket.on('timeStamp', data=>{
    document.querySelector('#clock').innerHTML = `<h4> Server time: ${data.timeStamp} </h4>`;

	let btnCheckRF = document.querySelector('#checkRFOutputs');
	if (btnCheckRF.timer > 0) {
		btnCheckRF.timer -= 1;
		btnCheckRF.innerHTML = `Check RF outputs in ${btnCheckRF.timer} sec...`;
	}
});

socket.on('backendData', data=>{
    if (data.type === 'message') {
        // Users can check messages in the browser conosle (for debugging).
        console.info(data.content);
    } else if (data.type === 'server') {
        // Update status of the backend server connection.
        updateServer(data.state);
    } else if (data.type === 'data') {
        // Update the signal generator status (mainly connection, waveform and output).
        updateStatus(data);
    }
});

socket.on('synchronize', data=>{
	setElementProperties(data.target, data.properties);
});

socket.on('returnFileSystem', data=>{
	switch (data.cmd){
		case 'refresh':
			refreshDialog(data.data);
			break;
		case 'load':
			loadPreset(data.name, data.content);
			break;
		case 'save':
			savePreset();
			break;
	}
});

socket.on('reload_imageRFOutputs', data=>{
	// Refresh the imageRFOutputs
	document.querySelector('#imageRFOutputs').src = `${baseUrl}/images/tektronics.png?${Date.now()}`;
	setElementProperties('#checkRFOutputs', {
		className: 'btn btn-primary',
		timer: data,
		innerHTML: `Check RF outputs in ${data} sec...`,
		disabled: false
	});
});

function forceReload(){
	socket.emit('reloadReq');
}
