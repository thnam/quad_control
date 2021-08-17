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
    document.querySelector('#btnWaveform') .addEventListener('click', ()=>sendWaveform('All'));
    document.querySelector('#btnOutputOn') .addEventListener('click', ()=>turnOutput('All', 'On'));
    document.querySelector('#btnOutputOff').addEventListener('click', ()=>turnOutput('All', 'Off'));

    for (let quadPlate of window.quadPlates) {
        document.querySelector(`#btnWaveform${quadPlate}`).addEventListener('click', ()=>sendWaveform(quadPlate));
        document.querySelector(`#btnOutput${quadPlate}`)  .addEventListener('click', ()=>turnOutput(quadPlate));
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