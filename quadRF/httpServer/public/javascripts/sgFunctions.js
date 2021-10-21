/**
 * @function turnOutput
 * Send a command to turn the signal generator outputs On or Off.
 *
 * @function sendWaveform
 * Send a waveform to the signal generator.
 * 
 * @function updateStatus
 * Receive signal generator status data and reflect it to the HTML.
 * 
 */


function connectBackendServer(event) {
    socket.emit('backendServer', {cmd: 'connect'});
}

function disconnectBackendServer(event) {
    socket.emit('backendServer', {cmd: 'disconnect'});
}

function updateServer(state) {
    if (state === 'open') {
        document.querySelector('#btnConnect').disabled = true;
        document.querySelector('#btnDisconnect').disabled = false;
    }
    else {
        document.querySelector('#btnConnect').disabled = false;
        document.querySelector('#btnDisconnect').disabled = true;

        if (state === 'closed') {
            document.querySelector('#btnWaveform') .disabled = true;
            document.querySelector('#btnOutputOn') .disabled = true;
            document.querySelector('#btnOutputOff').disabled = true;
        
            for (let quadPlate of window.quadPlates) {
                setDisconnected(quadPlate);
            }
        }
    }
}

function getWaveform(quadPlate) {
    let waveform;
    if (quadPlate === 'QB') {
        // For the case of QB, average Q1B, Q2B, Q3B and Q4B.
        waveform = sumArrays(window.waveformPlotly.Q1[1].y, window.waveformPlotly.Q2[1].y, window.waveformPlotly.Q3[1].y, window.waveformPlotly.Q4[1].y).map(v=>v/4);
    } else {
        const quad = quadPlate.slice(0, 2);
        const plate = quadPlate.slice(2);
        const ind = ['T', 'B', 'I', 'O'].indexOf(plate);
        waveform = window.waveformPlotly[quad][ind].y
    }
    return waveform;
}

function isWaveformEmpty(waveform) {
    if (Math.max(...waveform.map(Math.abs)) === 0) return true;
    return false;
}

function turnOutput(event) {
    const quadPlate = event.target.quadPlate;
    if (quadPlate === 'All') {
        // Turn on/off only to those whose waveforms are updated.
        for (let qp of window.quadPlates) {
            let waveform = getWaveform(qp);
            if (document.querySelector(`#btnWaveform${qp}`).className === 'btn btn-outline-success') {
                data = {cmd:'turnOutput', target:qp, state:event.target.state};
                socket.emit('backendServer', {cmd: 'write', data});
                document.querySelector(`#radioGroup${qp}`).className = 'radio radio-warning';
            }
        }
    } else {
        state = event.target.value === 'OFF' ? 'ON' : 'OFF';
        const data = {cmd:'turnOutput', target:quadPlate, state};
        socket.emit('backendServer', {cmd:'write', data});
        document.querySelector(`#radioGroup${quadPlate}`).className = 'radio radio-warning';
    }
}

function clickWaveform(event) {
    const quadPlate = event.target.quadPlate;
    if (quadPlate === 'All') {
        for (let qp of window.quadPlates) {
            document.querySelector(`#btnWaveform${qp}`).click();
        }
    } else {
        sendWaveform(quadPlate);
        document.querySelector(`#radioGroup${quadPlate}`).className = 'radio radio-warning';

        event.target.className = 'btn btn-warning';
        event.target.innerHTML = 'Acquiring...';
        event.target.style.fontSize = '1.0em';
        if (event.target.getAttribute('mouseoverout') === 'true') {
            event.target.removeEventListener('mouseover', mouseoverWaveform);
            event.target.removeEventListener('mouseout', mouseoutWaveform);
        }
    }
}

function sendWaveform(quadPlate) {
    const waveform = getWaveform(quadPlate);
    // Send waveform only to those who have non-zero waveforms.
    if (!isWaveformEmpty(waveform)) {
        data = {
            cmd: 'sendWaveform',
            target: quadPlate,
            waveformSpan: window.waveformConfig.waveformSpan,
            waveformData: waveform.map(val => val === 0 ? val : val.toFixed(4)).join() // Keep only to 4 decimal places (except 0).
        }
        socket.emit('backendServer', {cmd:'write', data});
    }
}

function mouseoverWaveform(event) {
    const quadPlate = event.target.quadPlate;
    const width  = event.target.offsetWidth;
    const height = event.target.offsetHeight;
    window.waveformButtonProperties[quadPlate] = {className: event.target.className, innerHTML: event.target.innerHTML};

    // Chaning the btn class would cause a change in size, so we force it to be the same. 
    event.target.className = 'btn btn-info';
    event.target.innerHTML = `Hit to update ${quadPlate}`;
    event.target.style.fontSize = '0.8em';
    event.target.style.width  = `${width}px`;
    event.target.style.height = `${height}px`;
    event.target.setAttribute('mouseoverout', 'true');
}

function mouseoutWaveform(event) {
    const quadPlate = event.target.quadPlate;
    event.target.className = window.waveformButtonProperties[quadPlate].className;
    event.target.innerHTML = window.waveformButtonProperties[quadPlate].innerHTML;
    event.target.style.fontSize = '1.0em';
    event.target.style.width  = '80%'; // Needs to be the same with the original style width (defined in HTML)
    event.target.setAttribute('mouseoverout', 'true');
}


function updateStatus(sgData) {
    const {type, ch1, ch2, data} = sgData;
  // console.log(type, ch1, ch2, data);

    document.querySelector('#btnConnect')   .disabled = true;
    document.querySelector('#btnDisconnect').disabled = false;
    document.querySelector('#btnWaveform')  .disabled = false;
    document.querySelector('#btnOutputOn')  .disabled = false;
    document.querySelector('#btnOutputOff') .disabled = false;

    for (let quadPlate of [ch1, ch2]) {
        if (quadPlate === '-') continue;
        document.querySelector(`#radioStatus${quadPlate}`).disabled = false;
        document.querySelector(`#radioGroup${quadPlate}`).className = 'radio radio-success';
    }

    if (data.includes('ROSC')) {
        const rosc = data.trim().split(' ')[1];
        if (rosc !== 'EXT') {
            alert(`Signal generator with channels ${ch1} and ${ch2} has wrong reference clock. It must set to EXT (external).`);
            document.querySelector(`#radioGroup${ch1}`).className = 'radio radio-danger';
            document.querySelector(`#radioGroup${ch2}`).className = 'radio radio-danger';
        }
    }
    else if (data.includes('OUTP')) {
        const sp = data.trim().split(/,| |:/);
        const chIndex = sp[0][1] - 1;
        const quadPlate = [ch1, ch2][chIndex];
        const outp = sp[2];
        const load = sp[4];
        
        const btnClass = outp === 'ON' ? 'btn-outline-success' : 'btn-outline-danger';
        setElementProperties(`#btnOutput${quadPlate}`, {
            className: `btn ${btnClass}`,
            value: outp,
            innerHTML: `Output: ${outp}`,
            disabled: false
        });
        document.querySelector(`#radioGroup${quadPlate}`).className = 'radio radio-success';
    }
    else if (data.includes('ARWV')) {
        const sp = data.trim().split(/,| |:/);
        const chIndex = sp[0][1] - 1;
        const quadPlate = [ch1, ch2][chIndex];
        const wvSlot = sp[3];
        const wvName = sp[5];
        const wvFullName = `M${wvSlot}:${wvName}`;

        const btnClass = ['50', '51'].includes(wvSlot) ? 'btn-outline-success' : 'btn-outline-danger';
		const timeFormat = ['50', '51'].includes(wvSlot) ? `${wvName.slice(0, 2)}:${wvName.slice(2, 4)}:${wvName.slice(4, 6)}` : '-';
        setElementProperties(`#btnWaveform${quadPlate}`, {
            className: `btn ${btnClass}`,
            value: wvFullName,
            innerHTML: `Last updated: ${timeFormat}`,
            disabled: false
        });

        if (btnWaveform.getAttribute('mouseoverout') !== 'true') {
            btnWaveform.addEventListener('mouseover', mouseoverWaveform);
            btnWaveform.addEventListener('mouseout', mouseoutWaveform);
        }

        document.querySelector(`#radioGroup${quadPlate}`).className = 'radio radio-success';
    }
    else if (data.includes('DISCONNECTED')) {
        for (let quadPlate of [ch1, ch2]) {
            if (quadPlate === '-') continue;
            setDisconnected(quadPlate);
        }
    }
}

function setElementProperties(name, properties) {
    const element = document.querySelector(name);
    if (element) {
        for (let p in properties) {
            element[p] = properties[p];
        }
    } else {
        console.log(`No element with the name ${name} found!`);
        return;
    }
}

function setDisconnected(quadPlate) {
    document.querySelector(`#radioGroup${quadPlate}`).className = 'radio radio-danger';
    document.querySelector(`#radioStatus${quadPlate}`).disabled = true;

    setElementProperties(`#btnWaveform${quadPlate}`, {
        className: 'btn btn-outline-dark',
        value: '',
        innerHTML: 'Disconnected',
        disabled: true
    });

    setElementProperties(`#btnOutput${quadPlate}`, {
        className: 'btn btn-outline-dark',
        value: '',
        innerHTML: 'Disconnected',
        disabled: true
    });
}
