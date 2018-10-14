async function getVoltage() {
  const ret = await $.ajax({
    type: 'GET',
    url: baseUrl + '/lastcv',
    success: function(data) { },
    error: (xhr)=>{
      alert("Error", xhr);
    },
  })
  return ret.message;
};

function setVoltage(vSet) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: "POST",
      url: baseUrl + "/cv",
      data: vSet,
      success: (res) => {
        console.log(res + ", voltage set to " + JSON.stringify(vSet));
        resolve(true);
      },
      error: (err, stat) =>{
        resolve(false);
        alert("Could not set voltage, error message: " + err.responseText);
      }});
  });
}

function zeroVoltage() {
  changePulseMode("Stop");
  window.vSet = {"fs": 0., "ss": 0., "os": 0.};
  $("#vSetpoint").val('0.0, 0.0').trigger("change");
  setVoltage(window.vSet);
};

function increaseVoltages(deltaV){
  if (window.vRead === undefined) {
    getVoltage().then((val) =>{
      window.vRead = JSON.parse(val);
    })
  }

  let vFS = (window.vRead.fs.pv + Math.abs(window.vRead.fs.nv)) / 2;
  let vSS = (window.vRead.ss.pv + Math.abs(window.vRead.ss.nv)) / 2;
  let vOS = (window.vRead.os.pv + Math.abs(window.vRead.os.nv)) / 2;

  if (window.vSet === undefined) window.vSet = {};

  window.vSet.fs = vFS + deltaV;
  window.vSet.ss = vSS + deltaV;
  window.vSet.os = vSS + deltaV;

  if (window.vSet.fs < 0.0) window.vSet.fs = 0.0;
  if (window.vSet.ss < 0.0) window.vSet.ss = 0.0;
  if (window.vSet.os < 0.0) window.vSet.os = 0.0;

  console.log(window.vRead.fs, window.vRead.os, window.vRead.ss);
  console.log(window.vSet);

  str = window.vSet.fs.toFixed(1) + ", " + window.vSet.ss.toFixed(1);
  console.log(str);

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

  // do the work
  getPulseMode()
    .then((currentMode) =>{
      if (currentMode === "Stop") 
        setVoltage(window.vSet);
      else 
        setPulseMode("Stop").then(()=>{
          setVoltage(window.vSet).then(()=>{
            setPulseMode(currentMode);
          })
        })
    })
};

function changeVoltage() {
  getVoltageSettings();

  getPulseMode()
    .then((currentMode) =>{
      if (currentMode === "Stop") 
        setVoltage(window.vSet);
      else 
        setPulseMode("Stop").then(()=>{
          setVoltage(window.vSet).then(()=>{
            setPulseMode(currentMode);
          })
        })
    })
};

function getVoltageSettings() {
  window.vMode = $('input[name=vMode]:checked').val();

  if (window.vSet === undefined) 
    window.vSet = {};

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

  window.vStep = Number.parseFloat($("#vStep").val());
  window.vInterval = Number.parseFloat($("#vInterval").val());
  console.log("Voltage setpoint: " + JSON.stringify(window.vSet) + ", step: " 
    + window.vStep + ", interval: " + window.vInterval);
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

