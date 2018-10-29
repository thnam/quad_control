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
        window.inTransition = true;
        var done = setInterval(()=>{
          if (confirmVoltage(0.1))
            clearInterval(done); 
        }, 1000);

        console.info(res + ", voltage set to " + JSON.stringify(vSet));
        resolve(true);
        window.inTransition = false;
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
  console.info("Increase all voltages by ", deltaV, "kV");

  normVoltage = normVRead();
  console.info("Current voltages: [FS, OS, SS] =", normVoltage);

  if (window.vSet === undefined) window.vSet = {};

  window.vSet.fs = normVoltage[0] + deltaV;
  window.vSet.ss = normVoltage[1] + deltaV;
  window.vSet.os = normVoltage[2] + deltaV;

  if (window.vSet.fs < 0.0) window.vSet.fs = 0.0;
  if (window.vSet.ss < 0.0) window.vSet.ss = 0.0;
  if (window.vSet.os < 0.0) window.vSet.os = 0.0;

  str = window.vSet.fs.toFixed(1) + ", " + window.vSet.ss.toFixed(1);
  console.info("Target voltages:", str);

  // add this setpoint into the preset list
  if (!presetFound(str)) {
    let newOpt = document.createElement("option");
    newOpt.value = str;
    newOpt.innerHTML = str;
    sel = document.getElementById('vSetpoint')
    opts = sel.options;
    opts.forEach
    sel.appendChild(newOpt);
  }

  // and change the manual entries also
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
  if (!validateSetpoint()){ // return upon bad request 
    console.error("Bad setpoint, abort changeVoltage function");
    return;
  }

  if (!window.ramping) { // window.ramping should be determined correctly in setpoint validation
    console.warn("window.ramping =", window.ramping, ", voltage is set directly");
    setVoltage(window.vSet);
    return;
  }

  let normVoltage = normVRead();
  // handle the start from 0 -> 0.8/1.6
  if (normVoltage[0] < 0.1 && normVoltage[1] < 0.1 && normVoltage[2] < 0.1){
    alert("Starting from zero, will only go to 0.8/1.6 kV, then the pulsers will be put in Burst mode.");
    window.vSet = {fs: 0.8, ss: 1.6, os: 1.6};
    (async function startFromZero() {
      await setVoltage(window.vSet).then(async() => {
        await setPulseMode("Burst");
      });
    })();
    return;
  }

  console.info("Ramping in progress ...");
  // precompute the steps needed
  let nStep = {"fs": Math.ceil(window.vGap.fs / window.vStep),
    "ss": Math.ceil(window.vGap.ss / window.vStep),
    "os": Math.ceil(window.vGap.os / window.vStep)};

  let nStepMin = nStep.fs;
  let nStepMax = nStep.fs;
  if (nStepMin > nStep.ss) nStepMin = nStep.ss;
  if (nStepMax < nStep.ss) nStepMax = nStep.ss;
  console.info("Steps needed: ", nStep, ", min:", nStepMin, ", max:", nStepMax);

  let steps = [];
  if (nStepMin === 0 || nStepMax === nStepMin) { // easy, raise all every time
    for (var i = 0, len = nStepMax; i < len; i++) {
      let targetFS = normVoltage[0] + (i + 1) * window.vStep;
      let targetSS = normVoltage[1] + (i + 1) * window.vStep;
      let targetOS = normVoltage[2] + (i + 1) * window.vStep;
      if (targetSS - targetFS >= 7.) { targetFS = targetSS - 7.; }
      if (targetFS > window.vSet.fs) targetFS = window.vSet.fs;
      if (targetSS > window.vSet.ss) targetSS = window.vSet.ss;
      if (targetOS > window.vSet.os) targetOS = window.vSet.os;
      steps.push({ "fs": targetFS, "ss": targetSS, "os": targetOS});
    }
  }
  else{ // raise second step before working on first step
    for (var i = 0, len = nStepMax - nStepMin; i < len; i++) {
      let targetFS = normVoltage[0];
      let targetSS = normVoltage[1] + (i + 1) * window.vStep;
      let targetOS = normVoltage[2] + (i + 1) * window.vStep;
      if (targetSS - targetFS >= 7.) { targetFS = targetSS - 7.; }
      if (targetFS > window.vSet.fs) targetFS = window.vSet.fs;
      if (targetSS > window.vSet.ss) targetSS = window.vSet.ss;
      if (targetOS > window.vSet.os) targetOS = window.vSet.os;
      steps.push({ "fs": targetFS, "ss": targetSS, "os": targetOS});
    }

    lastStep = steps[steps.length - 1];
    for (var i = 0; i < nStepMin; i++) {
      let targetFS = lastStep.fs + (i + 1) * window.vStep;
      let targetSS = lastStep.ss + (i + 1) * window.vStep;
      let targetOS = lastStep.os + (i + 1) * window.vStep;
      if (targetSS - targetFS >= 7.) { targetFS = targetSS - 7.; }
      if (targetFS > window.vSet.fs) targetFS = window.vSet.fs;
      if (targetSS > window.vSet.ss) targetSS = window.vSet.ss;
      if (targetOS > window.vSet.os) targetOS = window.vSet.os;
      steps.push({ "fs": targetFS, "ss": targetSS, "os": targetOS});
    }
  }

  console.log(steps);

  // Do voltage steps while ramping is true
  getPulseMode()
    .then((currentMode) =>{
          if (currentMode === "Stop"){
            setVoltage(steps[i]);
          } 

          else {
            if (window.vStep > 0.2) { // stop -> start
              (async function loop() {
                for (let i = 0; i < steps.length; i++) {
                  console.info("Step", i, ":", steps[i]);
                  if (!window.ramping) {
                    console.warn("Abort ramping");
                    break;
                  } 
                  await setPulseMode("Stop").then(async ()=>{
                    await setVoltage(steps[i]).then(async ()=>{
                      await setPulseMode(currentMode).then(async() =>{
                        await delay(Math.floor(window.vInterval) * 1000);
                        console.info("Done step", i);
                      });
                    })
                  })
                }
                // all done
                window.ramping = false;
                alert("Ramping completed!");
              })();
            }
            else { // dont stop if the step is lower than 0.2
              (async function loop() {
                for (let i = 0; i < steps.length; i++) {
                  console.info("Step", i, ":", steps[i]);
                  if (!window.ramping) {
                    console.warn("Abort ramping");
                    break;
                  } 
                  await setVoltage(steps[i]).then(async ()=>{
                    await delay(Math.floor(window.vInterval) * 1000);
                    console.info("Done step", i);
                  })
                }
                // all done
                window.ramping = false;
                $.jGrowl("Ramping completed", { life: 10000 });
              })();
            }
          }
    })
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function abortRamping() {
  window.ramping = false;
  alert("Ramping aborted!");
}

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
  console.info("Voltage setpoint: " + JSON.stringify(window.vSet) + ", step: " 
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

    return goodPOS && goodNOS && goodPSS && goodNSS && goodPFS && goodNFS;
  } catch (e) {
    return false;
  }
}

function normVRead() {
  if (window.vRead === undefined) {
    getVoltage().then((val) =>{ window.vRead = JSON.parse(val); })
  }

  let vFS = (window.vRead.fs.pv + Math.abs(window.vRead.fs.nv)) / 2;
  let vSS = (window.vRead.ss.pv + Math.abs(window.vRead.ss.nv)) / 2;
  let vOS = (window.vRead.os.pv + Math.abs(window.vRead.os.nv)) / 2;
  let normFS = parseFloat(vFS.toFixed(1));
  let normSS = parseFloat(vSS.toFixed(1));
  let normOS = parseFloat(vOS.toFixed(1));
  return [normFS, normSS, normOS];
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

  window.vGap = {};
  let normVoltage = normVRead();
  window.vGap.fs = window.vSet["fs"] - normVoltage[0];
  window.vGap.os = window.vSet["os"] - normVoltage[1];
  window.vGap.ss = window.vSet["ss"] - normVoltage[1];
  console.info("Voltage gap:", window.vGap);

  if (window.vGap.fs >= 0.2 || window.vGap.ss >= 0.2 || window.vGap.os >= 0.2)
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
  } 
  else
    return allGood;
}

