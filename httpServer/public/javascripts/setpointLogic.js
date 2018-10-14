function findPreset(newPreset) {
  sel = document.getElementById('vSetpoint');
  opts = sel.options;
  for (var i = 0, len = opts.length; i < len; i++) 
    if (opts[i].value == newPreset) 
      return true;
  return false;
}

function setupVoltageGroup() {
  // Toggling manual/preset mode
  if($('input[name=vMode]:checked').val() == "vPreset"){
    document.getElementById("manualVFS").disabled = true;
    document.getElementById("manualVSS").disabled = true;
    document.getElementById("manualVOS").disabled = true;
    document.getElementById("cbForceAsym").disabled = true;
    document.getElementById("vSetpoint").disabled = false;
  }
  else if($('input[name=vMode]:checked').val() == "vManual"){
    document.getElementById("manualVFS").disabled = false;
    document.getElementById("manualVSS").disabled = false;
    document.getElementById("cbForceAsym").disabled = false;
    document.getElementById("vSetpoint").disabled = true;
    if (document.getElementById('cbForceAsym').checked)
      document.getElementById("manualVOS").disabled = false;
    else
      document.getElementById("manualVOS").disabled = true;
  };
  $('input[type=radio][name=vMode]').change(function() {
    if (this.value == 'vPreset') {
      document.getElementById("manualVFS").disabled = true;
      document.getElementById("manualVSS").disabled = true;
      document.getElementById("manualVOS").disabled = true;
      document.getElementById("cbForceAsym").disabled = true;
      document.getElementById("vSetpoint").disabled = false;
    }
    else if (this.value == 'vManual') {
      document.getElementById("manualVFS").disabled = false;
      document.getElementById("manualVSS").disabled = false;
      document.getElementById("cbForceAsym").disabled = false;
      document.getElementById("vSetpoint").disabled = true;
      if (document.getElementById('cbForceAsym').checked)
        document.getElementById("manualVOS").disabled = false;
      else
        document.getElementById("manualVOS").disabled = true;
    }
  });
}

function reflectVPreset() {
  let vSet = {};
  let str = $("#vSetpoint").val().split(",");
  vSet["fs"] =  Number.parseFloat(str[0]);
  vSet["ss"] =  Number.parseFloat(str[1]);
  vSet["os"] =  Number.parseFloat(str[1]);
  vSet["step"] = Number.parseFloat($("#vStep").val());
  vSet["interval"] = Number.parseFloat($("#vInterval").val());
  // console.log(vSet);

  $("#manualVFS").val(vSet["fs"]);
  $("#manualVSS").val(vSet["ss"]);
  $("#manualVOS").val(vSet["os"]);
}

function reflectVManual() {
  let vSet = {};
  vSet["fs"] = Number.parseFloat($("#manualVFS").val());
  vSet["ss"] = Number.parseFloat($("#manualVSS").val());
  vSet["os"] = Number.parseFloat($("#manualVOS").val());
  vSet["step"] = Number.parseFloat($("#vStep").val());
  vSet["interval"] = Number.parseFloat($("#vInterval").val());
  let str = Number.parseFloat($("#manualVFS").val()).toFixed(1) + ", ";
  str += Number.parseFloat($("#manualVSS").val()).toFixed(1);

  let newOpt = document.createElement("option");
  newOpt.value = str;
  newOpt.innerHTML = str;
  sel = document.getElementById('vSetpoint')
  sel.appendChild(newOpt);

  opts = sel.options;
  for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == str) {
      sel.selectedIndex = j;
      break;
    }
  }
}

function checkFlattopLock() {
  let checkbox = document.getElementById('cbForceAsym');
  if (checkbox.checked)
    document.getElementById("manualVOS").disabled = false;
  else
    document.getElementById("manualVOS").disabled = true;
}

function lockFlattop() {
  if (!document.getElementById("cbForceAsym").checked) 
  {
    $("#manualVOS").val($("#manualVSS").val());
  }
  reflectVManual();
}
