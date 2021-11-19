window.onload = async ()=>{
    window.quads = ['Q1', 'Q2', 'Q3', 'Q4'];
    window.quadPlates = ['Q1T', 'Q1I', 'Q1O', 'Q2T', 'Q2I', 'Q2O', 'Q3T', 'Q3I', 'Q3O', 'Q4T', 'Q4I', 'Q4O', 'QB'];

    // Wait until window retrives the property from the server.
    window.rows = await whenDefined(window, 'waveformConfig', ()=>[ ...Array(window.waveformConfig.numberOfRows+1).keys() ].slice(1));
    window.timeStep = 0.01; // in us
    window.timeRange = arange(0, window.waveformConfig.waveformSpan, window.timeStep);

    connectElementFunctions();
	initWaveformPlots();

    // Let server connect to the backend server.
    socket.emit('backendServer', {cmd: 'connect'});
	socket.emit('accessFileSystem', {cmd:'refresh'});
};

function whenDefined(object, property, callback) {
    return new Promise(resolve=>setTimeout(resolve, 500)).then(()=>{
        if (object.hasOwnProperty(property)) {
            return callback();
        } else {
            return whenDefined(object, property, callback);
        }
    });
}

function connectElementFunctions() {
    document.querySelector('#btnConnect')   .addEventListener('click', connectBackendServer);
    document.querySelector('#btnDisconnect').addEventListener('click', disconnectBackendServer);

    document.querySelector('#btnWaveform')  .quadPlate = 'All';
    document.querySelector('#btnWaveform')  .addEventListener('click', sendWaveform);

    document.querySelector('#btnOutputOn')  .quadPlate = 'All';
    document.querySelector('#btnOutputOn')  .value = 'ON';
    document.querySelector('#btnOutputOn')  .addEventListener('click', turnOutput);

    document.querySelector('#btnOutputOff') .quadPlate = 'All';
    document.querySelector('#btnOutputOff') .value = 'OFF';
    document.querySelector('#btnOutputOff') .addEventListener('click', turnOutput);

    window.waveformButtonProperties = {}; 
    for (let quadPlate of window.quadPlates) {
        document.querySelector(`#btnWaveform${quadPlate}`).quadPlate = quadPlate;
        document.querySelector(`#btnWaveform${quadPlate}`).addEventListener('click', sendWaveform);
        document.querySelector(`#btnWaveform${quadPlate}`).addEventListener('mouseover', mouseoverWaveform);
        document.querySelector(`#btnWaveform${quadPlate}`).addEventListener('mouseout', mouseoutWaveform);
		
        document.querySelector(`#btnOutput${quadPlate}`)  .quadPlate = quadPlate;
        document.querySelector(`#btnOutput${quadPlate}`)  .addEventListener('click', turnOutput);
    }

    for (let quad of window.quads){
		for (let row of window.rows){
			getWaveParamElement('On', quad, row)        .addEventListener('click', ()=>updateWaveformPlots(quad));
			getWaveParamElement('Freq', quad, row)      .addEventListener('input', ()=>calculateWaveParams(quad, row));
			getWaveParamElement('StartTime', quad, row) .addEventListener('input', ()=>calculateWaveParams(quad, row));
			getWaveParamElement('NPeriods', quad, row)  .addEventListener('input', ()=>calculateWaveParams(quad, row));
			getWaveParamElement('DelayPhase', quad, row).addEventListener('input', ()=>calculateWaveParams(quad, row));
		}
	}

    document.querySelector('#refreshDialog').addEventListener('click', ()=>socket.emit('accessFileSystem', {cmd:'refresh'}));
    document.querySelector('#loadPreset').addEventListener('click', ()=>emitLoadPreset());
    document.querySelector('#savePreset').addEventListener('click', ()=>savePreset());
    document.querySelector('#renamePreset').addEventListener('click', ()=>renamePreset());
    document.querySelector('#removePreset').addEventListener('click', ()=>removePreset());

	document.querySelector('#checkRFOutputs').addEventListener('click', checkRFOutputs);
}

function getWaveParamElement(classifier, quad, row) {
    // checkbox - On
	// select 	- Mode
	// input	- Freq, StartTime, NPeriods, Amplitude, DelayPhase
	// label	- Duration, ActualTime, RefPhase

    let elementType;
    if (classifier === 'On') {
        elementType = 'checkbox';
    } else if (classifier === 'Mode') {
        elementType = 'select';
    } else if (['Freq', 'StartTime', 'NPeriods', 'Amplitude', 'DelayPhase'].includes(classifier)) {
		elementType = 'input';
	} else if (['Duration', 'ActualTime', 'RefPhase'].includes(classifier)) {
		elementType = 'label';
	} else {
		throw 'Wrong input name for the function getWaveformParams!';
	}

    return document.querySelector(`#${elementType}${quad}_${classifier}${row}`);
}

function confirmAction(msg) {
	if (document.querySelector('#checkSafetyProtocol').checked === true) {
		return confirm(msg);
	}
	return true;
}
