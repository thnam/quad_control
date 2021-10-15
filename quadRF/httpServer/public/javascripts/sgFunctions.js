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

function turnOutput(quadPlate, state) {
    if (quadPlate === 'All') {
        // Turn on/off only to those who have non-zero waveforms.
        for (let qp of window.quadPlates) {
            let waveform = getWaveform(qp);
            if (!isWaveformEmpty(waveform)) {
                data = {cmd:'turnOutput', target:qp, state};
                socket.emit('backendServer', {cmd: 'write', data});
                document.querySelector(`#radioGroup${qp}`).className = 'radio radio-warning';
            }
        }
    } else {
        state = document.querySelector(`#btnOutput${quadPlate}`).value === 'OFF' ? 'ON' : 'OFF';
        const data = {cmd:'turnOutput', target:quadPlate, state};
        socket.emit('backendServer', {cmd:'write', data});
        document.querySelector(`#radioGroup${quadPlate}`).className = 'radio radio-warning';
    }
}

function sendWaveform(quadPlate) {
    if (quadPlate === 'All') {
        // Send waveform only to those who have non-zero waveforms.
        for (let qp of window.quadPlates) {
            let waveform = getWaveform(qp);
            if (!isWaveformEmpty(waveform)) {
                data = {
                    cmd: 'sendWaveform',
                    target: qp,
                    waveformSpan: window.waveformConfig.waveformSpan,
                    waveformData: waveform.map(val => val === 0 ? val : val.toFixed(4)).join() // Keep only to 4 decimal places (except 0).
                }
                socket.emit('backendServer', {cmd:'write', data});
                document.querySelector(`#radioGroup${qp}`).className = 'radio radio-warning';
            }
        }
    } else {
        const waveform = getWaveform(quadPlate);
        data = {
            cmd: 'sendWaveform',
            target: quadPlate,
            waveformSpan: window.waveformConfig.waveformSpan,
            waveformData: waveform.map(val => val === 0 ? val : val.toFixed(4)).join() // Keep only to 4 decimal places (except 0).
        }
        socket.emit('backendServer', {cmd:'write', data});
        document.querySelector(`#radioGroup${quadPlate}`).className = 'radio radio-warning';
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
        document.querySelector(`#radioGroup${quadPlate}`).className = 'radio radio-success';
    }

    if (data.includes('ROSC')) {
        const rosc = data.trim().split(' ')[1];
		/**
		 *  ALERT USER IF THIS IS NOT DESIRED VALUE
		 */
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
        setElementProperties(`#btnWaveform${quadPlate}`, {
            className: `btn ${btnClass}`,
            value: wvFullName,
            innerHTML: wvFullName,
            disabled: false
        });
        document.querySelector(`#radioGroup${quadPlate}`).className = 'radio radio-success';
    }
    else if (data.includes('DISCONNECTED')) {
        for (let quadPlate of [ch1, ch2]) {
            if (quadPlate === '-') continue;
            document.querySelector(`#radioGroup${quadPlate}`).className = 'radio radio-danger';

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
        document.querySelector(`#radioGroup${quadPlate}`).className = 'radio radio-danger';
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
