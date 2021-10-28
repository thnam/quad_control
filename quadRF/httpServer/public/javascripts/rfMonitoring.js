function checkRFOutputs(event) {
	socket.emit('runPyScript');
	const syncData = {
		target: event.target.id,
		properties: {className:'btn btn-warning', innerHTML:'Fetching...'}
	}
	socket.emit('synchronize', syncData);

}
