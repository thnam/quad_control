function initWaveformPlots() {
    let layout = {
        grid: {
            rows: 2,
            columns: 2,
            pattern: 'independent'
        },
        margin: {
            t: 15,
            b: 45,
            pad: 0,
            autoexpand: true
        },
        showlegend: false,
        // xaxis : { title: 'Time [us]' },
        // xaxis2: { title: 'Time [us]' },
        xaxis3: { title: 'Time [us]' },
        xaxis4: { title: 'Time [us]' },
        yaxis : { title: 'Top' },
        yaxis2: { title: 'Inner' },
        yaxis3: { title: 'Bottom' },
        yaxis4: { title: 'Outer' }
    };
    
    const zeros = new Array(window.timeRange.length).fill(0);
    let top    = { x: window.timeRange, y: zeros, mode: 'lines', name: 'Top'};
    let bottom = { x: window.timeRange, y: zeros, mode: 'lines', name: 'Bottom', xaxis: 'x3', yaxis: 'y3' };
    let inner  = { x: window.timeRange, y: zeros, mode: 'lines', name: 'Inner' , xaxis: 'x2', yaxis: 'y2' };
    let outer  = { x: window.timeRange, y: zeros, mode: 'lines', name: 'Outer' , xaxis: 'x4', yaxis: 'y4' };

    window.waveformPlotly = {};
    window.quads.forEach(quad=>{
        window.waveformPlotly[quad] = [ new Object(top), new Object(bottom), new Object(inner), new Object(outer) ];

        Plotly.newPlot(
            document.querySelector(`#waveformPlots${quad}`),
            window.waveformPlotly[quad],
            layout,
            { responsive: true }
        );
    });
}

function updateWaveformPlots(quad) {
    const zeros = new Array(window.timeRange.length).fill(0);
    let waveform = {
		top   : zeros,
		bottom: zeros,
		inner : zeros,
		outer : zeros
	};
	for (let row of window.rows) {
		if (getWaveParamElement('On', quad, row).checked === true) {
			['Mode', 'Freq', 'StartTime', 'NPeriods', 'Amplitude', 'DelayPhase'].forEach((val)=>{
				getWaveParamElement(val, quad, row).disabled = true;
			});
			
			const mode = getWaveParamElement('Mode', quad, row).value;
			const freq = Number.parseFloat(getWaveParamElement('Freq', quad, row).value)/1e3;
			const start = getWaveParamElement('ActualTime', quad, row).startTime;
			const end = getWaveParamElement('ActualTime', quad, row).endTime;
			const amplitude = getWaveParamElement('Amplitude', quad, row).value;
			updateWaveform(waveform, mode, freq, start, end, amplitude);
		} else {
			['Mode', 'Freq', 'StartTime', 'NPeriods', 'Amplitude', 'DelayPhase'].forEach((val)=>{
				getWaveParamElement(val, quad, row).disabled = false;
			});
		}
	}
	
	['top', 'bottom', 'inner', 'outer'].forEach((plate, ind)=>{
		window.waveformPlotly[quad][ind].y = waveform[plate];
	});
	
	Plotly.redraw(document.querySelector(`#waveformPlots${quad}`));
}

function updateWaveform(waveform, mode, freq, actualStartTime, actualEndTime, amplitude) {
	// Units: freq (MHz), time (us)
	const omega = 2*Math.PI*freq; // in Mrad/s
	const period = 1/freq; // in us
	let amps = amplitude.split("/").map(val=>Number.parseFloat(val));
	while (amps.length < 4) amps = amps.concat(amps);
	
	const sin_main = window.timeRange.map(t => (t > actualStartTime && t < actualEndTime) ? Math.sin(omega*(t - actualStartTime)) : 0);
	const sin_with_tail = sin_main.sumArray( window.timeRange.map(t => 
        (t > actualEndTime && t < actualEndTime + period/2) ? 0.5*Math.exp(-5*(t - actualEndTime)/(period/2))*Math.sin(omega*(t - actualStartTime)) : 0) );
	
	switch (mode){
		case 'HD':
			waveform.inner  = waveform.inner .sumArray( sin_with_tail.scaleArray( amps[0]) );
			waveform.outer  = waveform.outer .sumArray( sin_with_tail.scaleArray(-amps[1]) );
			break;
		case 'VD':
			waveform.top    = waveform.top   .sumArray( sin_with_tail.scaleArray( amps[0]) );
			waveform.bottom = waveform.bottom.sumArray( sin_with_tail.scaleArray(-amps[1]) );
			break;
		case 'Q':
			waveform.top    = waveform.top   .sumArray( sin_with_tail.scaleArray( amps[0]) );
			waveform.bottom = waveform.bottom.sumArray( sin_with_tail.scaleArray( amps[1]) );
			waveform.inner  = waveform.inner .sumArray( sin_with_tail.scaleArray(-amps[2]) );
			waveform.outer  = waveform.outer .sumArray( sin_with_tail.scaleArray(-amps[3]) );
			break;
	}
}

function calculateWaveParams(quad, row) {
	let freq 		= Number.parseFloat( getWaveParamElement('Freq', quad, row).value )/1e3; // in MHz
	let startTime 	= Number.parseFloat( getWaveParamElement('StartTime', quad, row).value ); // in us
	let nPeriods 	= Number.parseFloat( getWaveParamElement('NPeriods', quad, row).value );
	let delayPhase 	= Number.parseFloat( getWaveParamElement('DelayPhase', quad, row).value )*Math.PI/180; // in rad

	// Duration
	let duration = nPeriods/freq; // in us
	getWaveParamElement('Duration', quad, row).innerHTML = isNaN(duration) ? '-' : duration.toFixed(3);

	// ActualTime
	let omega = 2*Math.PI*freq; // in Mrad/s
	let period = 1/freq; // in us
	let actualStartTime = startTime + delayPhase/omega; // in us
	let actualEndTime = actualStartTime + nPeriods*period; // in us
	let actualTimeElement = getWaveParamElement('ActualTime', quad, row);
	actualTimeElement.startTime = actualStartTime;
	actualTimeElement.endTime = actualEndTime;
	actualTimeElement.innerHTML = isNaN(actualStartTime) ? '- / -' : `${actualStartTime.toFixed(2)} / ${actualEndTime.toFixed(2)}`;

	// RefPhase
	let refPhase = mod(-actualStartTime/period*360, 360); // in deg
	getWaveParamElement('RefPhase', quad, row).innerHTML = isNaN(refPhase) ? '-' : refPhase.toFixed(3);
}




Array.prototype.sumArray = function (arr) {
	return this.map((val, ind) => val + arr[ind]);
};

Array.prototype.scaleArray = function (scalar) {
	return this.map(val => scalar*val);
};


function mod(n, m) {
	// To always return a positive value.
	return ((n % m) + m) % m;
}

function arange(start, stop, step=1){
	step = step || 1;
	let arr = [];
	for (let i=start; i<stop; i+=step){
		arr.push(i);
	}
	return arr;
}