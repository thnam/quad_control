function checkRFOutputs(event) {
	const syncData = {
		target: event.target.id,
		properties: {className:'btn btn-warning', innerHTML:'Fetching...', timer:0, disabled:true}
	}
	socket.emit('synchronize', syncData);
	socket.emit('runPyScript');
}
