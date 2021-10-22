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

function savePreset(){
	const dialog = document.querySelector('#presetDialog');
	const selected = dialog.selectedIndex >= 0 ? dialog.options[dialog.selectedIndex].innerText : '';
	const name = window.prompt('Save current parameters as:', selected);
	if (!name) return;
	Array.prototype.forEach.call(dialog, option=>{
		if (option.innerText === name){
			if (!window.confirm('There exists a file with the same name. Overwrite?')) return;
		}
	});

	const content = readCurrentWaveParam();
	socket.emit('accessFileSystem', {cmd:'save', name, content});
	document.querySelector('#loadedPresetName').innerText = name;
}

function emitLoadPreset(){
	const dialog = document.querySelector('#presetDialog');
	if (dialog.selectedIndex < 0){
		alert('Please select a preset that you want to load.');
		return;
	}
	const name = dialog.options[dialog.selectedIndex].innerText;
	socket.emit('accessFileSystem', {cmd:'load', name});
}

function loadPreset(name, content){
    const lines = content.trim().split('\n');
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
    alert(`Successfully loaded the preset file: ${name}`);
	document.querySelector('#loadedPresetName').innerText = name;
}

function refreshDialog(fsData){
	const dialog = document.querySelector('#presetDialog');
	const length = dialog.options.length;
	for (let i=0; i<length; i++){
		dialog.remove(0);
	}

	fsData.forEach(file=>{
		let opt = document.createElement('option');
		opt.text = file;
    	opt.addEventListener('dblclick', ()=>emitLoadPreset());
		dialog.add(opt);
	});
}

function renamePreset(){
	const dialog = document.querySelector('#presetDialog');
	if (dialog.selectedIndex < 0){
		alert('Please select a preset that you want to rename.');
		return;
	}
	const name = dialog.options[dialog.selectedIndex].innerText;
	const rename = window.prompt(`Rename the preset "${name}" to?`, name);
  if (!rename) return;
	socket.emit('accessFileSystem', {cmd:'rename', name, rename});
}

function removePreset(){
	const dialog = document.querySelector('#presetDialog');
	if (dialog.selectedIndex < 0){
		alert('Please select a preset that you want to remove.');
		return;
	}
	const name = dialog.options[dialog.selectedIndex].innerText;
	if (window.confirm(`Remove the preset "${name}"?`)){
		socket.emit('accessFileSystem', {cmd:'remove', name});
	}
}





















