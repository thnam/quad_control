/**
 * @function turnOutput
 * Send a command to turn the signal generator outputs On or Off.
 * @function sendWaveform
 * Send a waveform to the signal generator.
 * 
 * @function updateStatus
 * Receive signal generator status data and reflect it to the HTML.
 * @function noBackendConnection
 * Alert users that there is no socket connection with the backend server.
 * 
 */

function turnOutput(quadPlate, state) {
    if (quadPlate !== 'All') {
        state = document.querySelector(`#btnOutput${quadPlate}`).value === 'OFF' ? 'ON' : 'OFF';
    }
    data = {
        cmd: 'turnOutput',
        target: quadPlate,
        state: state
    };
    socket.emit('backendServer', {cmd: 'write', data});
}

function sendWaveform(quadPlate) {
    if (quadPlate === 'All') {
        // Not embodied yet.
        return;
    } else if (quadPlate === 'QB') {
        // Not embodied yet.
        return;
    } else {
        const quad = quadPlate.slice(0, 2);
        const plate = quadPlate.slice(2);
        const ind = ['T', 'B', 'I', 'O'].indexOf(plate);
        const waveform = window.waveformPlotly[quad][ind].y;
        const formatted = waveform.map(val => val === 0 ? val : val.toFixed(4)).join(); // Keep only to 4 decimal places (except 0).
        data = {
            cmd: 'sendWaveform',
            target: quadPlate,
            waveformSpan: window.waveformConfig.waveformSpan,
            waveformData: formatted
        }
        socket.emit('backendServer', {cmd: 'write', data});
    }
    
}

function updateStatus(sgData) {
    const {type, ch1, ch2, data} = sgData;
    // console.log(type, ch1, ch2, data);

    document.querySelector('#btnWaveform') .disabled = false;
    document.querySelector('#btnOutputOn') .disabled = false;
    document.querySelector('#btnOutputOff').disabled = false;

    for (let quadPlate of window.quadPlates) {
        document.querySelector(`#radioStatus${quadPlate}`).disabled = false;
    }

    for (let quadPlate of [ch1, ch2]) {
        if (quadPlate === '-') continue;
        document.querySelector(`#radioGroup${quadPlate}`).className = document.querySelector(`#radioGroup${quadPlate}`).className.replace('radio-danger', 'radio-success');
    }

    if (data.includes('ROSC')) {
        const rosc = data.trim().split(' ')[1];
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
    }
    else if (data.includes('ARWV')) {
        const sp = data.trim().split(/,| |:/);
        const chIndex = sp[0][1] - 1;
        const quadPlate = [ch1, ch2][chIndex];
        const wvSlot = sp[3];
        const wvName = sp[5];
        const wvFullName = `M${wvSlot}:${wvName}`;

        const btnClass = ['50', '51'].includes(wvSlot) ? 'btn-outline-success' : 'btn-outline-danger';
        setElementProperties(`#btnWaveform${quadPlate}`, {
            className: `btn ${btnClass}`,
            value: wvFullName,
            innerHTML: wvFullName,
            disabled: false
        });
    }
    else if (data.includes('DISCONNECTED')) {
        for (let quadPlate of [ch1, ch2]) {
            if (quadPlate === '-') continue;
            document.querySelector(`#radioGroup${quadPlate}`).className = document.querySelector(`#radioGroup${quadPlate}`).className.replace('radio-success', 'radio-danger');

            setElementProperties(`#btnWaveform${quadPlate}`, {
                className: 'btn btn-outline-dark',
                value: '',
                innerHTML: 'Waveform',
                disabled: true
            });

            setElementProperties(`#btnOutput${quadPlate}`, {
                className: 'btn btn-outline-dark',
                value: '',
                innerHTML: 'Output',
                disabled: true
            });
        }
    }
}

function noBackendConnection() {
    // console.info("No connection with the backend server!");
    document.querySelector('#btnWaveform') .disabled = true;
    document.querySelector('#btnOutputOn') .disabled = true;
    document.querySelector('#btnOutputOff').disabled = true;

    for (let quadPlate of window.quadPlates) {
        document.querySelector(`#radioGroup${quadPlate}`).className = document.querySelector(`#radioGroup${quadPlate}`).className.replace('radio-success', 'radio-danger');
        document.querySelector(`#radioStatus${quadPlate}`).disabled = true;

        setElementProperties(`#btnWaveform${quadPlate}`, {
            className: 'btn btn-outline-dark',
            value: '',
            innerHTML: 'Waveform',
            disabled: true
        });

        setElementProperties(`#btnOutput${quadPlate}`, {
            className: 'btn btn-outline-dark',
            value: '',
            innerHTML: 'Output',
            disabled: true
        });
    }
}

function setElementProperties(name, properties) {
    const element = document.querySelector(name);
    if (element) {
        for (p in properties) {
            element[p] = properties[p];
        }
    } else {
        console.log(`No element with the name ${name} found!`);
        return;
    }
}
