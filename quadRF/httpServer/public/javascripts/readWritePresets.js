function onChooseFile(event, onLoadFileHandler) {
    if (typeof window.FileReader !== 'function')
        throw ("The file API isn't supported on this browser.");
    let input = event.target;
    if (!input)
        throw ("The browser does not properly implement the event object");
    if (!input.files)
        throw ("This browser does not support the `files` property of the file input.");
    if (!input.files[0])
        return undefined;
    let file = input.files[0];
    let fr = new FileReader();
    fr.onload = onLoadFileHandler;
    fr.readAsText(file);
}

function readPreset(event){
    let lines = event.target.result.trim().split('\n');
    let i = 0;
    for (let quad of window.quads){
		for (let row of window.rows){
            let presets = lines[i++].split('\t');
            if (presets.includes(null) || presets.includes(NaN) || presets.includes(undefined)){
                return raisePresetFileError();
            }
			getWaveParamElement('On', quad, row).checked = Number.parseFloat(presets[0]);
            getWaveParamElement('Mode', quad, row).value = isFinite(presets[1]) ? ['HD', 'VD', 'Q'][Number.parseFloat(presets[1])] : presets[1];
			getWaveParamElement('Freq', quad, row).value = presets[2];
			getWaveParamElement('StartTime', quad, row).value = presets[3];
			getWaveParamElement('NPeriods', quad, row).value = presets[4];
            getWaveParamElement('Amplitude', quad, row).value = presets[5];
			getWaveParamElement('DelayPhase', quad, row).value = presets[6];
            calculateWaveParams(quad, row);
		}
        updateWaveformPlots(quad);
	}
    alert(`Successfully loaded the preset file: ${document.querySelector('#loadPreset').value.split('\\').reverse()[0]}`);
}

function raisePresetFileError(){
    alert('Error while processing the preset file. Please check the file.');
    document.querySelector('#loadPreset').value = '';
    return;
}

function readCurrentWaveParam(){
    let data = '';
    for (let quad of window.quads){
		for (let row of window.rows){
            data += Number(getWaveParamElement('On', quad, row).checked) + '\t';
            data += getWaveParamElement('Mode', quad, row).value ? getWaveParamElement('Mode', quad, row).value + '\t' : '0\t';
			data += getWaveParamElement('Freq', quad, row).value ? getWaveParamElement('Freq', quad, row).value + '\t' : '0\t';
			data += getWaveParamElement('StartTime', quad, row).value ? getWaveParamElement('StartTime', quad, row).value + '\t' : '0\t';
			data += getWaveParamElement('NPeriods', quad, row).value ? getWaveParamElement('NPeriods', quad, row).value + '\t' : '0\t';
            data += getWaveParamElement('Amplitude', quad, row).value ? getWaveParamElement('Amplitude', quad, row).value + '\t' : '0\t';
			data += getWaveParamElement('DelayPhase', quad, row).value ? getWaveParamElement('DelayPhase', quad, row).value + '\n' : '0\n';
		}
	}
    return data;
}

function writePreset(){
    const blob = new Blob([readCurrentWaveParam()]);
    const saveFile = async (blob) => {
        try {
            const handle = await window.showSaveFilePicker({
                types: [{
                accept: {
                    // Omitted
                },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return handle;
        } catch (err) {
            console.error(err.name, err.message);
        }
    };
    
    saveFile(blob);
    return;
}
