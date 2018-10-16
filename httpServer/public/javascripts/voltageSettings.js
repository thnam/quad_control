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
      success: (res) => { // confirm the voltage first, then done
        var done = setInterval(()=>{
          if (confirmVoltage(0.1)) clearInterval(done); }, 1000);

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
  validateSetpoint();

  if (!window.ramping) 
    setVoltage(window.vSet);

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

function getSetpoint() {
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

function confirmVoltage(tolerance) {
  try {
    let goodPOS = Math.abs(window.vSet["os"] - window.vRead.os.pv) <= tolerance;
    let goodNOS = Math.abs(window.vSet["os"] + window.vRead.os.nv) <= tolerance;
    let goodPSS = Math.abs(window.vSet["ss"] - window.vRead.ss.pv) <= tolerance;
    let goodNSS = Math.abs(window.vSet["ss"] + window.vRead.ss.nv) <= tolerance;
    let goodPFS = Math.abs(window.vSet["fs"] - window.vRead.fs.pv) <= tolerance;
    let goodNFS = Math.abs(window.vSet["fs"] + window.vRead.fs.nv) <= tolerance;

    // console.log(JSON.stringify(window.vSet));
    // console.log(JSON.stringify(window.vRead));
    return goodPOS && goodNOS && goodPSS && goodNSS && goodPFS && goodNFS;
  } catch (e) {
    return false;
  }
}

function validateSetpoint() {
  getSetpoint();
  let zero = window.vSet["os"] == 0.0 && window.vSet["fs"] == 0.0 && window.vSet["ss"] == 0.0;
  let goodOS = window.vSet["os"] >= 0.0 && window.vSet["os"] <= 27.0;
  let goodSS = window.vSet["ss"] >= 0.0 && window.vSet["ss"] <= 27.0;
  let goodFS = window.vSet["fs"] >= 0.0 && window.vSet["fs"] <= 21.0;

  let gap = window.vSet["ss"] - window.vSet["fs"];
  let goodGap = gap >= 0.3 && gap <= 7.0;

  if (window.vSet["fs"] >= 10.0) 
    goodGap = goodGap && gap >= 3.0

  let allGood = zero || (goodOS && goodSS && goodFS && goodGap);

  if (window.vRead === undefined) 
    getVoltage().then((val) =>{ window.vRead = JSON.parse(val); })
  let vStep = {};
  vStep.fs = window.vSet["fs"] - (window.vRead.fs.pv - window.vRead.fs.nv)/2;
  vStep.os = window.vSet["os"] - (window.vRead.os.pv - window.vRead.os.nv)/2;
  vStep.ss = window.vSet["ss"] - (window.vRead.ss.pv - window.vRead.ss.nv)/2;
  console.log(vStep);

  if (vStep.fs >= 0.2 && vStep.ss >= 0.2 && vStep.os >= 0.2)
    window.ramping = true;
  else
    window.ramping = false;

  if (!goodOS) {
    let msg = "Bad setting: one step voltage should be \n"
    msg += "in range from 0 to 27 kV"
    alert(msg);
    return false;
  } else if (!goodSS) {
    let msg = "Bad setting: second step voltage should be \n"
    msg += "in range from 0 to 27 kV"
    alert(msg);
    return false;
  } else if (!goodFS) {
    let msg = "Bad setting: first step voltage should be \n"
    msg += "in range from 0 to 21 kV"
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

  return allGood;
}

