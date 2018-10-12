function setVoltages() {
  // if (getVoltageSettings()) {
  getVoltageSettings();
    $.ajax({
      type: "POST",
      url: baseUrl + "/cv",
      data: window.vSet,
      success: (res) => {
        console.log(res + ", voltage set to " + vSet);
      },
      error: (err, stat) =>{
        alert("Could not set voltage, error message: " + err.responseText);
      }
    });
  // }
  // else {
    // alert("Could not read voltage settings");
  // }
};

function zeroVoltages() {
  vSet = {"fs": 0., "ss": 0., "os": 0.};
  $("#vSetpoint").val('0.0, 0.0').trigger("change");
  vSet["ramp"] = false;
  setVoltages();
};

async function changeVoltages(deltaV){
  if (Number.isNaN(vCurrent["fs"]) ||
    Number.isNaN(vCurrent["ss"]) ||
    Number.isNaN(vCurrent["os"])){
    alert("Aborted: cannot read current voltage values,\n");
    return;
  }
  else{

  vSet["fs"] = vCurrent["fs"] + deltaV;
  vSet["ss"] = vCurrent["ss"] + deltaV;
  vSet["os"] = vCurrent["os"] + deltaV;
  vSet["ramp"] = false;
  ["fs", "ss", "os"].forEach((ps)=>{if (vSet[ps] < 0.0) vSet[ps] = 0.0;})

  str = Number.parseFloat(vSet["fs"]).toFixed(1) + ", " +
    Number.parseFloat(vSet["ss"]).toFixed(1);

  if (!findPreset(str)) {
    let newOpt = document.createElement("option");
    newOpt.value = str;
    newOpt.innerHTML = str;
    sel = document.getElementById('vSetpoint')
    opts = sel.options;
    opts.forEach
    sel.appendChild(newOpt);
  }

  $("#vSetpoint").val(str).trigger("change");

  var currentMode = document.getElementById("lblPulsingState").innerText;
  console.log(currentMode);
  if (currentMode !="Stop") 
    await setPulseMode("Stop");
  setVoltages();
  console.log(currentMode);
  if (currentMode != "Stop") 
    await setPulseMode(currentMode);
  }
}

function getVoltageSettings() {
  window.vMode = $('input[name=vMode]:checked').val();

  if (window.vMode == "vPreset") {
    let str = $("#vSetpoint").val().split(",");
    window.vSet["fs"] =  Number.parseFloat(str[0]);
    window.vSet["ss"] =  Number.parseFloat(str[1]);
    window.vSet["os"] =  Number.parseFloat(str[1]);
  }
  else if (window.vMode == "vManual") {
    window.vSet["fs"] = Number.parseFloat($("#manualVFS").val());
    window.vSet["ss"] = Number.parseFloat($("#manualVSS").val());

    let checkbox = document.getElementById('cbForceAsym');

    if (checkbox.checked)
      window.vSet["os"] = Number.parseFloat($("#manualVOS").val());
    else
      window.vSet["os"] = vSet["ss"];
  }

  window.vSet["step"] = Number.parseFloat($("#vStep").val());
  window.vSet["interval"] = Number.parseFloat($("#vInterval").val());

  console.log(window.vSet);
}

function validateVoltageSettings() {
  let zero = vSet["os"] == 0.0 && vSet["fs"] == 0.0 && vSet["ss"] == 0.0;
  let goodOS = vSet["os"] >= 0.0 && vSet["os"] <= 25.0;
  let goodSS = vSet["ss"] >= 0.0 && vSet["ss"] <= 25.0;
  let goodFS = vSet["fs"] >= 0.0 && vSet["fs"] <= 20.0;
  let gap = vSet["ss"] - vSet["fs"];
  let goodGap = gap >= 0.3 && gap <= 7.0;
  if (vSet["fs"] >= 10.0) 
    goodGap = goodGap && gap >= 3.0

  let allGood = zero || (goodOS && goodSS && goodFS && goodGap);

  if (vSet["os"] >= vCurrent["os"] && vSet["fs"] >= vSet["fs"]
    && vSet["ss"] >= vSet["ss"])
    vSet["ramp"] = true;

  if (zero) 
    return true;

  if (!goodOS) {
    let msg = "Bad setting: one step voltage should be \n"
    msg += "in range from 0 to 25 kV"
    alert(msg);
    return false;
  } else if (!goodSS) {
    let msg = "Bad setting: second step voltage should be \n"
    msg += "in range from 0 to 25 kV"
    alert(msg);
    return false;
  } else if (!goodFS) {
    let msg = "Bad setting: first step voltage should be \n"
    msg += "in range from 0 to 20 kV"
    alert(msg);
    return false;
  } else if (!goodGap){
    let msg = "Bad setting: the gap between first and second steps\n"
    msg += "should be in range from 0.3 to 7.0 kV; and larger\n"
    msg += "than 3 kV when first step is above 10 kV."
    alert(msg);
    return false;
  } else
    return true;
}

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
